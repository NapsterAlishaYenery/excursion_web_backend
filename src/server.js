// Dependencias principales y de seguridad
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Importar la cookei
const cookieParser = require("cookie-parser");

// Importar el path para archivos staticos
const path = require('path');

// Importar middleware de limitacion global
const globalLimiter = require('./middlewares/globalLimiter.middleware');
const setupAutoPing = require('./utils/auto-ping.util');

// Importar la conexion
const conectarMongoDBAltas = require('./config/db');

// Importar las rutas
const userRoutes = require('./routes/user.routes');


// Crear el server
const app = express();

// Configurar el Limiter global
app.use(globalLimiter);

// Configurar el proxy
app.set('trust proxy', 1);


// Configuarar CORS 
const allowedOrigins = [
    "http://localhost:4200",
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_2,
]

app.use(cors({
    origin: (origin, callback) => {
        // Permitir Postman y herramientas sin origin
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuara Middlewares globales
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cookieParser());

// Conectar a Mongo
conectarMongoDBAltas();


// Ruta simple para mantener el servidor despierto
app.get('/keep-alive', (req, res) => {
    res.status(200).send('Servidor activo');
});


// ======================================================
// RUTAS DE LA API
// ======================================================
app.use('/api/users', userRoutes); // Rutas de usuarios (administradores del sistema)


// Configurar Middleware global de errores
app.use((err, req, res, next) => {
    console.error("Global Server Error:", err.message);
    res.status(500).json({ error: "Internal server error caught by the global error middleware in server.js." });
})

// Configurar CORS para imageneso o archivos estaticos de la app
const corsStaticOptions = {
    origin: allowedOrigins,
    credentials: true
};

app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
},
    express.static(path.join(__dirname, '../uploads'))
);

// configurar el puesto del servidor
const port = process.env.PORT || 4003;

// Iniciar el sistema de auto-ping
setupAutoPing();

// Iniciar el server
app.listen(port, () => {
    console.log(`Server running on port ${port} Aneury Web Excursions`);
});

