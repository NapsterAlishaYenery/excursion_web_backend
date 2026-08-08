const fs = require('fs').promises;
const path = require('path');

/**
 * Borra archivos del servidor local de forma segura
 * @param {Object|Array|String} files - Puede ser req.file, req.files o una ruta string
 */
const deleteLocalFiles = async (files) => {
    if (!files) return;

    try {
        const pathsToDelete = [];

        // CASO 1: Es un string (una ruta directa)
        if (typeof files === 'string') {
            pathsToDelete.push(files);
        }
        
        // CASO 2: Es req.file (un solo archivo de Multer)
        else if (files.path) {
            pathsToDelete.push(files.path);
        }

        // CASO 3: Es req.files (objeto con múltiples campos de Multer)
        else if (typeof files === 'object') {
            Object.values(files).forEach(fileArray => {
                // Multer pone los archivos en arrays aunque sea solo uno
                if (Array.isArray(fileArray)) {
                    fileArray.forEach(file => pathsToDelete.push(file.path));
                }
            });
        }

        // Ejecutamos todos los borrados en paralelo
        await Promise.all(
            pathsToDelete.map(async (filePath) => {
                try {
                    const absolutePath = path.resolve(filePath);
                    await fs.unlink(absolutePath);
                    console.log(`✅ Temporarily deleted: ${path.basename(absolutePath)}`);
                } catch (err) {
                    // Si el archivo no existe o ya se borró, no queremos que rompa el flujo
                    console.warn(`⚠️ Could not be deleted: ${filePath}`);
                }
            })
        );

    } catch (error) {
        console.error("❌ Error in the cleaning utility:", error.message);
    }
};

module.exports = deleteLocalFiles;