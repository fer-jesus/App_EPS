require('dotenv').config(); // Carga las variables de entorno primero
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const rolRoutes = require('./routes/rolRoutes');


// Configuración de middlewares
app.use(cors({
  origin: 'http://localhost:5173', // Ajusta según la URL de tu frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos (solo para verificación al iniciar)
const pool = require('./config/database');

// Verificar conexión a la BD al iniciar
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log(' Conexión a MySQL establecida correctamente');
  } catch (error) {
    console.error(' Error al conectar con MySQL:', error.message);
    process.exit(1); // Salir si no hay conexión a la BD
  }
})();

// Rutas principales
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/rol', rolRoutes);

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