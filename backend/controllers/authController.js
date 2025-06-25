const { verificarCredenciales } = require("../models/usuario/usuario.service");
const jwtMiddleware = require('../middleware/jwtMiddleware');

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const usuario = await verificarCredenciales(username, password);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: "Credenciales incorrectas"
      });
    }
    
// let roles = usuario.Rol.RolNombres;
// const rolEncontrado = roles.find(rol => rol.dataValues.sexo === usuario.sexo);
const nombreRol = usuario.Rol && usuario.Rol.RolNombres
  ? usuario.Rol.RolNombres.find(rn => rn.sexo === usuario.sexo)?.nombre_rol
  : null;

    // Generar token JWT
    const token = jwtMiddleware.generateToken({
      ...usuario,
      nombre_rol: nombreRol
    });


    res.json({
      success: true,
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: nombreRol,
        //rol: rolEncontrado,
        ROL_id_rol: usuario.ROL_id_rol,
        unidad: usuario.unidad,
        fecha_de_baja: usuario.fecha_de_baja
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      error: "Error en el servidor"
    });
  }
};

module.exports = { login };
