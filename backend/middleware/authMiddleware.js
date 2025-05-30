const Usuario = require('../models/usuario');

const requireRole = (rolesPermitidos) => {
  return async (req, res, next) => {
    try {
      const userId = req.headers['x-user-id']; // se puede usar req.user.id si se implementa JWT o sesión
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        
      }

      // Obtener usuario con su rol desde la base de datos
      const usuario = await Usuario.obtenerPorId(userId);
       if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      if (!rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({ success: false, error: 'Acceso denegado' });
      }

      req.usuario = usuario; // Guardamos al usuario en el request
      next();
    } catch (error) {
      console.error('Error en middleware de autorización:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };
};

module.exports = { requireRole };