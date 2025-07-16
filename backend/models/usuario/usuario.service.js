const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Usuario, Rol, RolNombre, sequelize } = require("../../models/usuario/");
const { Op } = require("sequelize");

// Verifica usuario por correo y contraseña (sin bcrypt por ahora)
const verificarCredenciales = async (correo, contrasena) => {
  const usuario = await Usuario.findOne({
    where: { correo },
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

  // Si no se encuentra el usuario o no tiene contraseña
  if (!usuario || !usuario.contrasena) return null;

  // Comparar contraseñas
  const match = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!match) return null;

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
    const sexoNombreRol = rolNombres.find((rn) => rn.sexo === json.sexo);

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
  try {
    console.log("pass original", data);
    const existe = await Usuario.findOne({ where: { correo: data.correo } });
    if (existe) {
      const error = new Error("Correo ya registrado");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(data.contrasena, 10);
    console.log("Contraseña hasheada:", hashedPassword);

    const usuario = await Usuario.create({
      ...data,
      contrasena: hashedPassword,
      fecha_registro: new Date(),
      en_funciones: true,
    });

    return usuario.id_usuario;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

// Actualizar usuario existente
const updateUsuario = async (id, data) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error("Usuario no encontrado");

  // Si se incluye una nueva contraseña, hashearla
  if (data.contrasena) {
    const hashedPassword = await bcrypt.hash(data.contrasena, 10);
    data.contrasena = hashedPassword;
    data.es_contrasena_temporal = 0; // ya no es temporal
  } else {
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

  const esPrivilegiado =
    nombreRol === "DIRECTOR" || nombreRol === "SUBDIRECTOR";

  if (esPrivilegiado) {
    // Ver cuántos usuarios siguen activos con el mismo ROL_id_rol
    const conteo = await Usuario.count({
      where: {
        ROL_id_rol: usuario.ROL_id_rol,
        fecha_de_baja: null,
        id_usuario: { [Op.ne]: id },
      },
    });

    if (conteo === 0) {
      throw new Error(
        `No se puede eliminar. Debe haber al menos un ${nombreRol} activo.`
      );
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

const resetPassword = async (correo) => {
  const tempPassword = crypto.randomBytes(6).toString("base64url"); // ejemplo: vDk7x4Ws
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Update directo usando Sequelize
  await Usuario.update(
    {
      contrasena: hashedPassword,
      es_contrasena_temporal: 1,
    },
    {
      where: { correo },
    }
  );

  return tempPassword;
};

module.exports = {
  verificarCredenciales,
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  actualizarEstadoEnFuncion,
  resetPassword,
};
