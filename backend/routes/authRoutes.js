const express = require('express');
const router = express.Router();
const { login, recuperarContrasena, actualizarContrasena } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/auth/login', login);
router.post("/auth/recoverpass", recuperarContrasena);
router.post('/auth/actualizar-contrasena', authMiddleware.authenticate, actualizarContrasena);


module.exports = router;
