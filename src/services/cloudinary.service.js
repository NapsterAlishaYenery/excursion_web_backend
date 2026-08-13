// src/services/cloudinary.service.js
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises; // Para eliminar archivos temporales

/**
 * Sube un archivo (imagen o video) a Cloudinary
 * @param {string} filePath - Ruta temporal del archivo
 * @param {string} folder - Carpeta en Cloudinary (ej: 'members', 'proposals')
 */
exports.uploadFile = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `Excuriones-aneury-web/${folder}`,
            use_filename: true,
            unique_filename: true,
            overwrite: true,
        });

        return {
            public_id: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type, // 'image' o 'video'
            duration: result.duration || null
        };

    } catch (error) {
        console.error(' Cloudinary Service Error:', error.message);
        throw new Error('Error uploading the file to the cloud');
    }
};

/**
 * Elimina un archivo de Cloudinary
 * @param {string} public_id - El ID público del archivo
 */
exports.deleteFile = async (public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id);
        console.log(` File deleted from Cloudinary: ${public_id}`);
        return result;
    } catch (error) {
        console.error(' Error deleting from Cloudinary:', error.message);
        throw new Error('Error deleting the file from the cloud');
    }
};