require('dotenv').config(); // Carga las variables de entorno primero
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const rolRoutes = require('./routes/rolRoutes');
const tarifaRoutes = require ('./routes/tarifaRoutes');
const tasaRoutes = require("./routes/tasaRoutes");
const propietarioRoutes = require('./routes/propietarioRoutes');
const licenciaRoutes = require('./routes/licenciaRoutes');
const nomenclaturaRoutes = require('./routes/nomenclaturaRoutes');
const tasadocRoute = require("./routes/tasadocRoutes");
const licenciadocRoute = require("./routes/licenciadocRoutes");
const nomenclaturadocRoute = require("./routes/nomenclaturadocRoutes");

const allowedOrigins = [
  'http://localhost:5173',
  'http://frontend:5173', // nombre del servicio en docker-compose
  'https://applic.dotmunijalapa.org' // dominio del frontend para el entorno de producción
];

// Configuración de middlewares
app.use(cors({
    origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

const path = require('path');
app.use('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known', 'acme-challenge')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos (solo para verificación al iniciar)
const sequelize = require('./config/sequelize');

// Verificar conexión a la BD al iniciar
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL (Sequelize) establecida correctamente');
  } catch (error) {
    console.error('Error al conectar con MySQL (Sequelize):', error.message);
    process.exit(1);
  }
})();

// Rutas principales
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/rol', rolRoutes);
app.use('/api/tarifas', tarifaRoutes);
app.use("/api/tasas", tasaRoutes);
app.use('/api/propietarios', propietarioRoutes);
app.use('/api/licencias', licenciaRoutes);
app.use('/api/nomenclaturas', nomenclaturaRoutes);
app.use("/api/tasa-documento", tasadocRoute);
app.use("/api/licencia-documento", licenciadocRoute);
app.use("/api/nomenclatura-documento", nomenclaturadocRoute);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API de la Dirección de Ordenamiento Territorial',
    status: 'Operativa',
    version: '1.0.0'
  });
});

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Configuración del puerto
const PORT = process.env.PORT || 3001;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en ${PORT}`);
});