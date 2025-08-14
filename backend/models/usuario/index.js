const sequelize = require('../../config/sequelize');
const { DataTypes } = require('sequelize');
const Usuario = require('./usuario.model')(sequelize);
const { Rol, RolNombre } = require('../rol')(sequelize);
const UsuarioFirma = require("./usuarioFirma.model")(sequelize, DataTypes);;

// Relaciones
Rol.hasMany(Usuario, {
  foreignKey: 'ROL_id_rol',
  sourceKey: 'id_rol'
});

Usuario.belongsTo(Rol, {
  foreignKey: 'ROL_id_rol',
  targetKey: 'id_rol',
  as: 'Rol'
});

// Relación entre Usuario y RolNombre según sexo
RolNombre.hasMany(Usuario, {
  foreignKey: 'ROL_id_rol',
  sourceKey: 'ROL_id_rol',
  as: 'usuarios' 
});
Usuario.belongsTo(RolNombre, {
  foreignKey: 'ROL_id_rol',
  targetKey: 'ROL_id_rol',
  as: 'RolNombre' ,
});

// Relación: un Usuario puede tener muchas firmas
Usuario.hasMany(UsuarioFirma, {
  foreignKey: "USUARIOS_id_usuario",
  sourceKey: "id_usuario",
  as: "firmas"
});

// Relación inversa: una firma pertenece a un Usuario
UsuarioFirma.belongsTo(Usuario, {
  foreignKey: "USUARIOS_id_usuario",
  targetKey: "id_usuario",
  as: "usuario"
});


module.exports = {
  sequelize,
  Usuario,
  Rol,
  RolNombre,
  UsuarioFirma
};
