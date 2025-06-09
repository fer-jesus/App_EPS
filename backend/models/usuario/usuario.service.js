const { Usuario, Rol, RolNombre, sequelize } = require("../../models/usuario");
const { Op } = require("sequelize"); 

// Verifica usuario por correo y contraseña (sin bcrypt por ahora)
const verificarCredenciales = async (correo, contrasena) => {
  const usuario = await Usuario.findOne({
    where: { correo, contrasena },
    include: [
      {
        model: Rol,
        as: "Rol",
        include: [
          {
            model: RolNombre,
            as: "RolNombres",
            where: { sexo: sequelize.col("Usuario.sexo") },
            required: false,
          },
        ],
      },
    ],
  });

  if (!usuario) return null;

  return {
    ...usuario.toJSON(),
    nombre_rol: usuario.Rol?.RolNombre?.nombre || null,
  };
};

// Obtener todos los usuarios con su nombre_rol basado en sexo
const getAllUsuarios = async () => {
  const usuarios = await Usuario.findAll({
    where: {
      fecha_de_baja: null,
    },

    include: [
      {
        model: Rol,
        as: "Rol",
        include: [
          {
            model: RolNombre,
            as: "RolNombres",
            //where: { sexo: sequelize.col("Usuario.sexo") },
            required: false,
          },
        ],
      },
    ],
  });

  const usuariosFormateados = usuarios.map((u) => {
    const json = u.toJSON();

      // Seleccion de nombre del rol según el sexo del usuario
    const rolNombres = json.Rol?.RolNombres || [];
    const sexoNombreRol = rolNombres.find(
      (rn) => rn.sexo === json.sexo
    );

    return {
      ...json,
      nombre_rol: sexoNombreRol?.nombre_rol || null,
    };
  });
  return usuariosFormateados;
};

// Obtener un solo usuario por ID
const getUsuarioById = async (id) => {
  const usuario = await Usuario.findByPk(id, {
    include: [
      {
        model: Rol,
        as: "Rol",
        include: [
          {
            model: RolNombre,
            as: "RolNombres",
            where: { sexo: sequelize.col("Usuario.sexo") },
            required: false,
          },
        ],
      },
    ],
  });

  if (!usuario) return null;

  return {
    ...usuario.toJSON(),
    nombre_rol: usuario.Rol?.RolNombres?.[0]?.nombre_rol || null,
  };
};

// Crear usuario con fecha_registro y en_funciones activado por defecto
const createUsuario = async (data) => {
  const usuario = await Usuario.create({
    ...data,
    fecha_registro: new Date(),
    en_funciones: true,
  });

  return usuario.id_usuario;
};

// Actualizar usuario existente
const updateUsuario = async (id, data) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error("Usuario no encontrado");

  if (!data.contrasena) {
    delete data.contrasena;
  }

  return await usuario.update(data);
};

// Eliminar usuario por ID
const deleteUsuario = async (id) => {
  const usuario = await Usuario.findByPk(id);

  if (!usuario) throw new Error("Usuario no encontrado");

    const rol = await Rol.findByPk(usuario.ROL_id_rol, {
    include: {
      model: RolNombre,
      as: "RolNombres",
      where: { sexo: usuario.sexo },
    },
  });

  const nombreRol = rol?.RolNombres?.[0]?.nombre_rol?.toUpperCase() || null;

  const esPrivilegiado = nombreRol === "DIRECTOR" || nombreRol === "SUBDIRECTOR";

  if (esPrivilegiado) {
    // Ver cuántos usuarios siguen activos con el mismo ROL_id_rol
    const conteo = await Usuario.count({
      where: {
        ROL_id_rol: usuario.ROL_id_rol,
        fecha_de_baja: null,
        id_usuario: { [Op.ne]: id }
      }
    });

    if (conteo === 0) {
      throw new Error(`No se puede eliminar. Debe haber al menos un ${nombreRol} activo.`);
    }
  }

  await usuario.update({ fecha_de_baja: new Date() });

  return { success: true, message: "Usuario dado de baja correctamente" };
};

// Actualizar estado en_funciones (activar/desactivar usuario)
const actualizarEstadoEnFuncion = async (id, en_funciones) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error("Usuario no encontrado");
  await usuario.update({ en_funciones });
};

module.exports = {
  verificarCredenciales,
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  actualizarEstadoEnFuncion,
};
