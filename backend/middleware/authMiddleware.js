//const sequelize = require('../config/sequelize'); 
const { Usuario, Rol, RolNombre } = require('../models/usuario');

const requireRole = (rolesPermitidos) => {
  return async (req, res, next) => {
    try {
      const userId = req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
      }

      const usuario = await Usuario.findByPk(userId, {
        include: {
          model: Rol,
          as: 'Rol',
          include: {
            model: RolNombre,
            as: 'RolNombres'
          }
        }
      });

      if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      const nombreRol = usuario.Rol?.RolNombres?.find(rn => rn.sexo === usuario.sexo)?.nombre_rol;


      if (!rolesPermitidos.includes(nombreRol)) {
        return res.status(403).json({ success: false, error: 'Acceso denegado' });
      }

      req.usuario = usuario;
      next();
    } catch (error) {
      console.error('Error en middleware de autorización:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  };
};

module.exports = { requireRole };
