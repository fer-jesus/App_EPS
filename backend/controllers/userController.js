const {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  actualizarEstadoEnFuncion:  updateEnFunciones
} = require("../models/usuario/usuario.service");

const getAllUsers = async (req, res) => {
  try {
    const usuarios = await getAllUsuarios();
    res.json({ success: true, usuarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error al obtener usuarios" });
  }
};

const getUserById = async (req, res) => {
  try {
    const usuario = await getUsuarioById(req.params.id);
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
    const id = await createUsuario(req.body);
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
    if (!id_usuario || id_usuario.toLowerCase() === "null") {
      return res.status(400).json({ success: false, error: "ID de usuario no válido" });
    }

    await updateUsuario(id_usuario, req.body);
    res.status(200).json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error al actualizar usuario" });
  }
};

const deleteUser = async (req, res) => {
  try {
    await deleteUsuario(req.params.id);
    res.json({ success: true, message: "Usuario dado de baja correctamente" });
  } catch (error) {
    console.error(error);

    if (error.message.includes("No se puede eliminar")) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Error al dar de baja al usuario",
    });
  }
};

const actualizarEstadoEnFuncion = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    let { en_funciones } = req.body;

    en_funciones = en_funciones ? 1 : 0;
    await  updateEnFunciones(id_usuario, en_funciones);

    res.json({
      success: true,
      message: "Estado actualizado correctamente",
      en_funciones,
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
  actualizarEstadoEnFuncion
};
