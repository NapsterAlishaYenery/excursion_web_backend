# Excursion Web - Backend

API REST para la gestión de excursiones turísticas en Punta Cana. Este proyecto servirá como backend para una plataforma web de reserva de excursiones, con un frontend desarrollado en Angular.

## 📋 Descripción del Proyecto

Este backend está diseñado para gestionar el catálogo de excursiones, usuarios, reservas y contenido de una agencia de turismo en Punta Cana. El sistema permite administrar excursiones con información detallada como precios, itinerarios, imágenes, disponibilidad y mucho más.

### Características Principales (En desarrollo)

- ✅ CRUD completo de excursiones
- ✅ Autenticación JWT (Admin)
- ✅ Subida de imágenes a Cloudinary
- ✅ Caché de respuestas (node-cache)
- ✅ Rate Limiting (Protección contra ataques)
- ✅ Validaciones de datos
- ✅ SEO-friendly (Slugs automáticos)
- ⏳ Sistema de reservas (Próximamente)
- ⏳ Gestión de usuarios (Próximamente)
- ⏳ Panel de administración (Próximamente)

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Cloudinary** - Almacenamiento de imágenes
- **Node-Cache** - Sistema de caché
- **Express-Rate-Limit** - Limitación de peticiones
- **Helmet** - Seguridad
- **Compression** - Compresión de respuestas
- **Sanitize-HTML** - Limpieza de datos
- **Slugify** - Generación de URLs amigables

### Frontend (Próximamente)
- **Angular** - Framework frontend

## 📁 Estructura del Proyecto
excursion_web_backend/
├── src/
│ ├── config/ # Configuraciones (DB, Cloudinary, etc.)
│ ├── controllers/ # Controladores de la API
│ ├── middlewares/ # Middlewares (auth, limiter, upload)
│ ├── models/ # Modelos de MongoDB
│ │ └── schemas/ # Sub-schemas reutilizables
│ ├── routes/ # Definición de rutas
│ ├── services/ # Servicios (cache, cloudinary)
│ ├── utils/ # Utilidades (validadores)
│ └── server.js # Punto de entrada
├── uploads/ # Archivos temporales (ignorados por git)
├── .env # Variables de entorno (ignorado)
├── .gitignore # Archivos ignorados por git
├── README.md # Documentación
└── package.json # Dependencias y scripts

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- MongoDB Atlas (o local)
- Cuenta de Cloudinary

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd excursion_web_backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Iniciar el servidor en modo desarrollo
npm run dev

# 5. Verificar que funciona
curl http://localhost:4003/ping
# Respuesta esperada: {"ok":true,"message":"Server is running"}