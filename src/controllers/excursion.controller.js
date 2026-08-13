// src/controllers/excursion.controller.js
const Excursion = require('../models/excursion.model');
const { uploadFile, deleteFile } = require('../services/cloudinary.service');
const deleteLocalFiles = require('../utils/fileCleanup.util');

/**
 * CREATE - Crear una nueva excursión
 * POST /api/excursions
 */
exports.createExcursion = async (req, res) => {
    try {
        // 1. Extraer los datos del body (ya validados por Joi)
        const excursionData = req.body;

        // 2. Validar que se hayan subido archivos (mínimo la imagen principal)
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'BadRequest',
                message: 'At least one image (main image) is required'
            });
        }

        // 3. Subir archivos a Cloudinary
        const uploadPromises = req.files.map(file =>
            uploadFile(file.path, 'excursions')
        );
        const uploadResults = await Promise.all(uploadPromises);

        console.log('📦 Upload results:', uploadResults);

        // 4. Construir el array de imágenes (main + gallery)
        // La primera imagen será la principal (main)
        const mainImage = {
            public_id: uploadResults[0].public_id,
            url: uploadResults[0].url,
            thumbnailUrl: uploadResults[0].url, // Podrías generar una miniatura con Cloudinary
            alt: excursionData.name || 'Excursion main image',
            mediaType: uploadResults[0].resource_type || 'image',
            width: uploadResults[0].width || 0,
            height: uploadResults[0].height || 0,
            format: uploadResults[0].format || 'jpg',
            order: 0,
            duration: uploadResults[0].duration || null
        };

        // Las siguientes imágenes van a la galería (si existen)
        const galleryImages = uploadResults.slice(1).map((result, index) => ({
            public_id: result.public_id,
            url: result.url,
            thumbnailUrl: result.url,
            alt: `${excursionData.name} - Gallery ${index + 1}`,
            mediaType: result.resource_type || 'image',
            width: result.width || 0,
            height: result.height || 0,
            format: result.format || 'jpg',
            order: index + 1,
            duration: result.duration || null
        }));

        // 5. Construir el objeto images para el modelo
        const images = {
            main: mainImage,
            gallery: galleryImages
        };

        const lastExcursion = await Excursion.findOne().sort({ order: -1 });
        const nextOrder = lastExcursion ? lastExcursion.order + 1 : 1;

        // 6. Construir el documento final
        const excursionDocument = {
            ...excursionData,
            images: images,
            order: nextOrder
        };

        // 7. Crear en la base de datos
        const newExcursion = await Excursion.create(excursionDocument);

        // 8. Respuesta exitosa
        res.status(201).json({
            ok: true,
            data: newExcursion,
            message: 'Excursion created successfully'
        });

    } catch (error) {
        console.error('--- CREATE EXCURSION ERROR ---', error);

        // Error de duplicado (nombre o slug duplicado)
        if (error.code === 11000) {
            return res.status(400).json({
                ok: false,
                type: 'DuplicateError',
                message: 'An excursion with this name already exists. Please use another name.'
            });
        }

        // Error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: messages
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Internal Server Error'
        });

    } finally {
        // 9. Limpiar archivos temporales
        if (req.files && req.files.length > 0) {
            const filesObject = { excursion: req.files };
            await deleteLocalFiles(filesObject);
        }
    }
};

/**
 * UPDATE - Actualizar una excursión
 * PATCH /api/excursions/:id
 */
exports.updateExcursion = async (req, res) => {

    console.log('✅ Executing: updateExcursion');
    console.log('Params:', req.params);
    console.log('Body:', req.body);


    try {
        const { id } = req.params;
        const updateData = req.body;

        // ✅ Buscar la excursión
        const excursion = await Excursion.findById(id);
        if (!excursion) {
            return res.status(404).json({
                ok: false,
                type: 'NotFound',
                message: 'Excursion not found'
            });
        }

        // ✅ Si Joi ya validó, podemos asignar directamente
        // Los campos que lleguen en req.body ya están validados
        Object.keys(updateData).forEach(key => {
            // ✅ Si es un objeto (pricing, location, etc.) lo fusionamos
            if (typeof updateData[key] === 'object' &&
                !Array.isArray(updateData[key]) &&
                updateData[key] !== null) {
                // Para objetos anidados (pricing, location, pickupInfo, seo)
                excursion[key] = {
                    ...excursion[key]?.toObject ? excursion[key].toObject() : excursion[key] || {},
                    ...updateData[key]
                };
            } else {
                // Para valores simples y arrays
                excursion[key] = updateData[key];
            }
        });

        await excursion.save();

        res.json({
            ok: true,
            data: excursion,
            message: 'Excursion updated successfully'
        });

    } catch (error) {
        console.error('--- UPDATE EXCURSION ERROR ---', error);

        if (error.code === 11000) {
            return res.status(400).json({
                ok: false,
                type: 'DuplicateError',
                message: 'An excursion with this name already exists'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: messages
            });
        }

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Internal Server Error'
        });
    }
};


/**
 * ADD GALLERY IMAGES - Agregar imágenes a la galería de una excursión
 * POST /api/excursions/:id/gallery
 * Body: FormData con archivos (campo 'images')
 */
exports.addGalleryImages = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Buscar la excursión
        const excursion = await Excursion.findById(id);
        if (!excursion) {
            return res.status(404).json({
                ok: false,
                type: 'NotFound',
                message: 'Excursion not found'
            });
        }

        // ✅ Validar que se hayan subido archivos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'BadRequest',
                message: 'At least one image or video is required'
            });
        }

        // ✅ Subir archivos a Cloudinary
        const uploadPromises = req.files.map(file =>
            uploadFile(file.path, 'excursions')
        );
        const uploadResults = await Promise.all(uploadPromises);

        console.log('📦 Gallery upload results:', uploadResults);

        // ✅ Crear nuevos items de galería
        const currentGalleryLength = excursion.images.gallery?.length || 0;

        const newGalleryItems = uploadResults.map((result, index) => {
            const order = currentGalleryLength + index;
            const mediaType = result.resource_type || 'image';

            return {
                public_id: result.public_id,
                url: result.url,
                thumbnailUrl: result.url,
                alt: `${excursion.name} - Gallery ${order + 1}`,
                mediaType: mediaType,
                width: result.width || 0,
                height: result.height || 0,
                format: result.format || 'jpg',
                order: order,
                duration: result.duration || null
            };
        });

        excursion.images.gallery.push(...newGalleryItems);

        await excursion.save();

        res.status(200).json({
            ok: true,
            data: excursion,
            message: `${newGalleryItems.length} image(s) added to gallery successfully`
        });

    } catch (error) {
        console.error('--- ADD GALLERY IMAGES ERROR ---', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: messages
            });
        }

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Internal Server Error'
        });

    } finally {
        if (req.files && req.files.length > 0) {
            const filesObject = { excursion: req.files };
            await deleteLocalFiles(filesObject);
        }
    }
};


/**
 * SWAP MAIN IMAGE - Intercambiar imagen principal con una de la galería
 * PATCH /api/excursions/:id/main
 * Body: { index: number }
 */
exports.swapMainImage = async (req, res) => {

    console.log('✅ Executing: swapMainImage');
    console.log('Params:', req.params);
    console.log('Body:', req.body);

    try {
        const { id } = req.params;
        const { index } = req.body;

        // ✅ Validar que el índice exista
        if (index === undefined || index === null) {
            return res.status(400).json({
                ok: false,
                type: 'BadRequest',
                message: 'Index is required'
            });
        }

        // ✅ Buscar la excursión
        const excursion = await Excursion.findById(id);
        if (!excursion) {
            return res.status(404).json({
                ok: false,
                type: 'NotFound',
                message: 'Excursion not found'
            });
        }

        // ✅ Validar que la galería tenga imágenes
        if (!excursion.images.gallery || excursion.images.gallery.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'BadRequest',
                message: 'Gallery is empty. No images to swap with.'
            });
        }

        // ✅ Validar que el índice exista en la galería
        if (index < 0 || index >= excursion.images.gallery.length) {
            return res.status(400).json({
                ok: false,
                type: 'BadRequest',
                message: `Index ${index} does not exist. Gallery has ${excursion.images.gallery.length} images.`
            });
        }

        // ✅ Copiar los objetos (crear copias) para no modificar los originales
        const oldMain = excursion.images.main.toObject();
        const selectedImage = excursion.images.gallery[index].toObject();

        // ✅ Asignar orders
        oldMain.order = index + 1;
        oldMain.alt = `${excursion.name} - Gallery ${index + 1}`;
        selectedImage.order = 0;
        selectedImage.alt = `${excursion.name} - main 0 ` || 'Excursion main image';


        // ✅ Intercambiar
        excursion.images.main = selectedImage;
        excursion.images.gallery[index] = oldMain;

        // para oblicar a verificar el objeto prinsioal de imagenes en excursion
        excursion.markModified('images');
        await excursion.save();

        res.json({
            ok: true,
            data: excursion,
            message: `Main image swapped with gallery image at index ${index}`
        });

    } catch (error) {
        console.error('--- SWAP MAIN IMAGE ERROR ---', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: messages
            });
        }

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Internal Server Error'
        });
    }
};


/**
 * DELETE GALLERY IMAGE - Eliminar una imagen de la galería
 * DELETE /api/excursions/:id/gallery/:index
 */
exports.deleteGalleryImage = async (req, res) => {
    try {
        const { id, index } = req.params;
        const galleryIndex = parseInt(index);

        // ✅ Buscar la excursión
        const excursion = await Excursion.findById(id);
        if (!excursion) {
            return res.status(404).json({
                ok: false,
                type: 'NotFound',
                message: 'Excursion not found'
            });
        }

        // ✅ Validar que la galería tenga imágenes
        if (!excursion.images.gallery || excursion.images.gallery.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'BadRequest',
                message: 'Gallery is empty. No images to delete.'
            });
        }

        // ✅ Validar que el índice exista
        if (galleryIndex < 0 || galleryIndex >= excursion.images.gallery.length) {
            return res.status(400).json({
                ok: false,
                type: 'BadRequest',
                message: `Index ${galleryIndex} does not exist. Gallery has ${excursion.images.gallery.length} images.`
            });
        }

        // ✅ Obtener la imagen a eliminar
        const imageToDelete = excursion.images.gallery[galleryIndex];

        // ✅ Eliminar de Cloudinary
        await deleteFile(imageToDelete.public_id);

        // ✅ Eliminar del array
        excursion.images.gallery.splice(galleryIndex, 1);

        // ✅ Reordenar la galería
        excursion.images.gallery = excursion.images.gallery.map((img, idx) => ({
            ...img,
            order: idx + 1,
            alt: `${excursion.name} - Gallery ${idx + 1}`
        }));

        // ✅ Forzar que Mongoose detecte el cambio
        excursion.markModified('images');

        await excursion.save();

        res.json({
            ok: true,
            data: excursion,
            message: `Gallery image at index ${galleryIndex} deleted successfully`
        });

    } catch (error) {
        console.error('--- DELETE GALLERY IMAGE ERROR ---', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: messages
            });
        }

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Internal Server Error'
        });
    }
};



/**
 * DELETE EXCURSION - Eliminar una excursión completa (con todas sus imágenes)
 * DELETE /api/excursions/admin/:id
 */
exports.deleteExcursion = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Buscar la excursión
        const excursion = await Excursion.findById(id);
        if (!excursion) {
            return res.status(404).json({
                ok: false,
                type: 'NotFound',
                message: 'Excursion not found'
            });
        }

        // ✅ Recopilar TODOS los public_id de Cloudinary
        const publicIdsToDelete = [];

        // 1. Agregar main image
        if (excursion.images?.main?.public_id) {
            publicIdsToDelete.push(excursion.images.main.public_id);
        }

        // 2. Agregar todas las imágenes de la galería
        if (excursion.images?.gallery && excursion.images.gallery.length > 0) {
            excursion.images.gallery.forEach(img => {
                if (img.public_id) {
                    publicIdsToDelete.push(img.public_id);
                }
            });
        }

        // ✅ Eliminar TODAS las imágenes de Cloudinary (en paralelo)
        if (publicIdsToDelete.length > 0) {
            console.log(`🗑️ Eliminando ${publicIdsToDelete.length} imágenes de Cloudinary...`);
            const deletePromises = publicIdsToDelete.map(public_id => deleteFile(public_id));
            await Promise.all(deletePromises);
            console.log(`✅ ${publicIdsToDelete.length} imágenes eliminadas de Cloudinary`);
        }

        // ✅ Eliminar el documento de la base de datos
        await excursion.deleteOne();

        res.json({
            ok: true,
            message: `Excursion "${excursion.name}" deleted successfully`,
            data: null
        });

    } catch (error) {
        console.error('--- DELETE EXCURSION ERROR ---', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'Invalid ID format'
            });
        }

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Internal Server Error'
        });
    }
};


/**
 * GET BY ID - Obtener una excursión por su ID
 * GET /api/excursions/:id
 */
exports.getExcursionById = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Buscar la excursión por ID
        const excursion = await Excursion.findById(id);

        if (!excursion) {
            return res.status(404).json({
                ok: false,
                type: 'NotFound',
                message: 'Excursion not found'
            });
        }

        res.json({
            ok: true,
            data: excursion,
            message: 'Excursion retrieved successfully'
        });

    } catch (error) {
        console.error('--- GET EXCURSION BY ID ERROR ---', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'Invalid ID format'
            });
        }

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Internal Server Error'
        });
    }
};


/**
 * GET BY SLUG - Obtener una excursión por su slug
 * GET /api/excursions/public/:slug
 * @access  Público
 */
exports.getExcursionBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        // ✅ Buscar la excursión por slug (solo las publicadas)
        const excursion = await Excursion.findOne({
            slug: slug,
            isPublished: true
        });

        if (!excursion) {
            return res.status(404).json({
                ok: false,
                type: 'NotFound',
                message: 'Excursion not found'
            });
        }

        res.json({
            ok: true,
            data: excursion,
            message: 'Excursion retrieved successfully'
        });

    } catch (error) {
        console.error('--- GET EXCURSION BY SLUG ERROR ---', error);

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Internal Server Error'
        });
    }
};

/**
 * GET ALL - Listar todas las excursiones (público)
 * GET /api/excursions
 * @query   {string} search - Buscar por nombre (case-insensitive)
 * @query   {string} category - Filtrar por categoría
 * @query   {string} day - Filtrar por día disponible (monday, tuesday, etc.)
 * @query   {string} featured - Filtrar por destacadas (true/false)
 * @query   {number} page - Número de página (default: 1)
 * @query   {number} limit - Límite por página (default: 12)
 */
exports.getAllExcursions = async (req, res) => {
    try {
        // 1. Extraer variables de req.query
        const { search, category, day, featured } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

        // 2. Construir el query
        const query = { isPublished: true };

        // ✅ Búsqueda por nombre (case-insensitive)
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // ✅ Filtrar por categoría (array)
        if (category) {
            query.categories = { $in: [category.toLowerCase()] };
        }

        // ✅ Filtrar por día disponible
        if (day) {
            // ✅ Asegurar que day sea un string
            const dayStr = Array.isArray(day) ? day[0] : day;

            if (dayStr && typeof dayStr === 'string') {
                const dayLower = dayStr.toLowerCase();
                if (dayLower === 'week') {
                    query.$or = [
                        { availableDays: { $in: ['week'] } },
                        {
                            availableDays: {
                                $all: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                            }
                        }
                    ];
                } else {
                    query.availableDays = { $in: [dayLower] };
                }
            }
        }

        // ✅ Filtrar por destacadas
        if (featured === 'true') {
            query.isFeatured = true;
        }

        // 3. Paginación
        const skip = (page - 1) * limit;

        // 4. Ejecutar consultas en paralelo
        const [allExcursions, totalItems] = await Promise.all([
            Excursion.find(query)
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Excursion.countDocuments(query)
        ]);

        // 5. Calcular paginación
        const totalPages = Math.ceil(totalItems / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            ok: true,
            data: allExcursions,
            message: totalItems > 0 ? 'Excursions retrieved successfully' : 'No excursions found',
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        console.error('--- GET ALL EXCURSIONS ERROR ---', error);
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Internal Server Error'
        });
    }
};