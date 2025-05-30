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
    await Usuario.actualizar(req.params.id, req.body);
    res.json({ success: true });
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

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
