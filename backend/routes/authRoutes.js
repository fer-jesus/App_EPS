const express = require('express');
const router = express.Router();
const { login, recuperarContrasena } = require('../controllers/authController');

router.post('/login', login);
router.post("/recoverpass", recuperarContrasena);

module.exports = router;
