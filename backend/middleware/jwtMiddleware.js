//generar tokens
const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtMiddleware = {
  generateToken: (usuario) => {
    return jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.nombre_rol,
        unidad: usuario.unidad,
        es_contrasena_temporal: usuario.es_contrasena_temporal 
      },
      process.env.SECRET_JWT_KEY,
      { expiresIn: '1h' } 
    );
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.SECRET_JWT_KEY);
    } catch (error) {
      return null;
    }
  }
};

module.exports = jwtMiddleware;
