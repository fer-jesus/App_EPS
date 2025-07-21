const jwtMiddleware = require('./jwtMiddleware');
const { Usuario } = require('../models/usuario');

const authMiddleware = {
  authenticate: async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token no proporcionado' });
    }

    const decoded = jwtMiddleware.verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ success: false, error: 'Token inválido o expirado' });
    }

    try {
      const usuario = await Usuario.findByPk(decoded.id_usuario);
      if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      // Rutas permitidas para usuarios con contraseña temporal
      const rutasPermitidas = [
        "/api/auth/actualizar-contrasena",
        "/api/auth/login",
        "/api/auth/recoverpass",
      ];

      // Quitar query string para comparar solo ruta
      const rutaSinQuery = req.originalUrl.split("?")[0];

      if (usuario.es_contrasena_temporal && !rutasPermitidas.includes(rutaSinQuery)) {
        return res.status(403).json({
          success: false,
          error: "Debes cambiar tu contraseña temporal antes de continuar.",
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error("Error al autenticar usuario:", error);
      return res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  },

  requireRole: (rolesPermitidos) => {
    return async (req, res, next) => {
      try {
        // Primero autenticamos con JWT
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
          return res.status(401).json({ success: false, error: 'Token no proporcionado' });
        }

        const decoded = jwtMiddleware.verifyToken(token);
        if (!decoded) {
          return res.status(403).json({ success: false, error: 'Token inválido o expirado' });
        }

        // Verificación de roles
        if (!rolesPermitidos.includes(decoded.rol)) {
          return res.status(403).json({ success: false, error: 'Acceso denegado. Rol no autorizado.' });
        }

        req.user = decoded;
        next();
      } catch (error) {
        console.error('Error en middleware de autorización:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    };
  }
};

module.exports = authMiddleware;
