const Usuario = require('../models/usuario');

const login = async (req, res) => {
  const { username, password } = req.body; 

  try {
    // Buscar por username o correo
    const usuario = await Usuario.verificarCredenciales(username, password);
    
    if (!usuario) {
      return res.status(401).json({ 
        success: false, // Añadido para el frontend
        error: 'Credenciales incorrectas' 
      });
    }

    // if (usuario.ROL_id_rol !== 1 && usuario.ROL_id_rol !== 2) {
    //   return res.status(403).json({ 
    //     success: false,
    //     error: 'Acceso restringido' 
    //   });
    // }

    res.json({
      success: true, // Añadido para el frontend
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.nombre_rol,
        ROL_id_rol: usuario.ROL_id_rol, 
        unidad: usuario.unidad
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error en el servidor' 
    });
  }
};

module.exports = { login };