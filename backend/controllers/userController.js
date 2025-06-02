const pool = require('../config/database');
const Usuario = require("../models/usuario");

//const isAuthorized = (rolNombre) => rolNombre === "DIRECTOR" || rolNombre === "SUBDIRECTOR"; // DIRECTOR o SUBDIRECTOR

const getAllUsers = async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerTodos();
    res.json({ success: true, usuarios });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener usuarios" });
  }
};

const getUserById = async (req, res) => {
  try {
    const usuario = await Usuario.obtenerPorId(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }
    res.json({ success: true, usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error al obtener usuario" });
  }
};

const createUser = async (req, res) => {
  try {
    const id = await Usuario.crear(req.body);
    console.log("Usuario creado con id:", id);
    res.json({ success: true, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error al crear usuario" });
  }
};

const updateUser = async (req, res) => {
  try {
     const { id_usuario } = req.params;
     console.log("ID del usuario a actualizar:", req.body);
    console.log("ID del usuario a actualizar:", id_usuario);
    if (!id_usuario || id_usuario === 'NULL' || id_usuario === 'null') {
      return res.status(400).json({ success: false, error: "ID de usuario no válido" });
    }
    //console.log("Actualizando usuario con id_usuario:", req.body);
    await Usuario.actualizar(id_usuario, req.body);
  
    res.status(200).json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error al actualizar usuario" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT r.nombre_rol 
      FROM USUARIOS u
      JOIN ROL_NOMBRE r ON u.ROL_id_rol = r.ROL_id_rol AND u.sexo = r.sexo
      WHERE u.id_usuario = ?
    `,
      [req.params.id]
    );

    const rolEliminar = rows[0]?.nombre_rol;

    if (rolEliminar === "DIRECTOR") {
      return res
        .status(400)
        .json({
          success: false,
          error: "No se puede eliminar al usuario DIRECTOR",
        });
    }

    await Usuario.eliminar(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error al eliminar usuario" });
  }
};

const actualizarEstadoFuncion = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    let { en_funciones } = req.body;

    // Asegurar que en_funciones sea 0 o 1
    en_funciones = en_funciones ? 1 : 0;

    await Usuario.actualizarEstadoFuncion(id_usuario, en_funciones);

    // Devuelve el nuevo estado para que el frontend pueda sincronizar
    res.json({ 
      success: true, 
      message: "Estado actualizado correctamente",
      en_funciones 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error al actualizar estado" });
  }
};


module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  actualizarEstadoFuncion
};
