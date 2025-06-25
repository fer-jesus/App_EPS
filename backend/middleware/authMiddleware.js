//const sequelize = require('../config/sequelize'); 
// const { Usuario, Rol, RolNombre } = require('../models/usuario');

// const requireRole = (rolesPermitidos) => {
//   return async (req, res, next) => {
//     try {
//       const userId = req.headers['x-user-id'];

//       if (!userId) {
//         return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
//       }

//       const usuario = await Usuario.findByPk(userId, {
//         include: {
//           model: Rol,
//           as: 'Rol',
//           include: {
//             model: RolNombre,
//             as: 'RolNombres'
//           }
//         }
//       });

//       if (!usuario) {
//         return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
//       }

//       const nombreRol = usuario.Rol?.RolNombres?.find(rn => rn.sexo === usuario.sexo)?.nombre_rol;


//       if (!rolesPermitidos.includes(nombreRol)) {
//         return res.status(403).json({ success: false, error: 'Acceso denegado' });
//       }

//       req.usuario = usuario;
//       next();
//     } catch (error) {
//       console.error('Error en middleware de autorización:', error);
//       res.status(500).json({ success: false, error: 'Error interno del servidor' });
//     }
//   };
// };

// module.exports = { requireRole };

const jwtMiddleware = require('./jwtMiddleware');

const authMiddleware = {
  authenticate: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token no proporcionado' });
    }

    const decoded = jwtMiddleware.verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ success: false, error: 'Token inválido o expirado' });
    }

    req.user = decoded;
    next();
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
