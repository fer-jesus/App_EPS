const { Usuario, Rol, RolNombre, sequelize } = require('../../models/usuario');
//const { Op } = require('sequelize');

// Verifica usuario por correo y contraseña (sin bcrypt por ahora)
const verificarCredenciales = async (correo, contrasena) => {
  const usuario = await Usuario.findOne({
    where: { correo, contrasena },
    include: [
      {
        model: Rol,
        include: [
          {
            model: RolNombre,
            where: { sexo: sequelize.col('Usuario.sexo') },
            required: false
          }
        ]
      }
    ]
  });

  if (!usuario) return null;

  return {
    ...usuario.toJSON(),
    nombre_rol: usuario.Rol?.RolNombre?.nombre || null
  };
};

// Obtener todos los usuarios con su nombre_rol basado en sexo
const getAllUsuarios = async () => {
  const usuarios = await Usuario.findAll({
    include: [
      {
        model: Rol,
        as: 'Rol',
        include: [
          {
            model: RolNombre,
            where: { sexo: sequelize.col('Usuario.sexo') },
            required: false
          }
        ]
      }
    ]
  });

  const usuariosFormateados = usuarios.map(u => {
    const json = u.toJSON();

    // Accede a Rol.RolNombres (plural) que es un array, toma el primero y su nombre_rol
    const nombreRol = json.Rol?.RolNombres?.[0]?.nombre_rol || null;

    return {
      ...json,
      nombre_rol: nombreRol
    };
  });


  console.log('Usuarios formateados:', usuariosFormateados);

  return usuariosFormateados;
};


// Obtener un solo usuario por ID
const getUsuarioById = async (id) => {
  const usuario = await Usuario.findByPk(id, {
    include: [
      {
        model: Rol,
        include: [
          {
            model: RolNombre,
            where: { sexo: sequelize.col('Usuario.sexo') },
            required: false
          }
        ]
      }
    ]
  });

  if (!usuario) return null;

  return {
    ...usuario.toJSON(),
    nombre_rol: usuario.Rol?.RolNombre?.nombre || null
  };
};

// Crear usuario con fecha_registro y en_funciones activado por defecto
const createUsuario = async (data) => {
  const usuario = await Usuario.create({
    ...data,
    fecha_registro: new Date(),
    en_funciones: true
  });

  return usuario.id_usuario;
};

// Actualizar usuario existente
const updateUsuario = async (id, data) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error('Usuario no encontrado');
  return await usuario.update(data);
};

// Eliminar usuario por ID
const deleteUsuario = async (id) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error('Usuario no encontrado');
  await usuario.destroy();
  return { success: true, message: 'Usuario eliminado correctamente' };
};

// Actualizar estado en_funciones (activar/desactivar usuario)
const actualizarEstadoFuncion = async (id, en_funciones) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error('Usuario no encontrado');
  await usuario.update({ en_funciones });
};

module.exports = {
  verificarCredenciales,
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  actualizarEstadoFuncion
};
