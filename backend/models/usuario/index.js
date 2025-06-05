const sequelize = require('../../config/sequelize');
const Usuario = require('./usuario.model')(sequelize);
const { Rol, RolNombre } = require('../rol')(sequelize);

// Relaciones
Rol.hasMany(Usuario, {
  foreignKey: 'ROL_id_rol',
  sourceKey: 'id_rol'
});
Usuario.belongsTo(Rol, {
  foreignKey: 'ROL_id_rol',
  targetKey: 'id_rol'
});

// Relación entre Usuario y RolNombre según sexo
RolNombre.hasMany(Usuario, {
  foreignKey: 'ROL_id_rol',
  sourceKey: 'ROL_id_rol',
  as: 'usuarios' // opcional, pero útil si haces consultas con alias
});
Usuario.belongsTo(RolNombre, {
  foreignKey: 'ROL_id_rol',
  targetKey: 'ROL_id_rol',
  as: 'RolNombre' // importante si quieres incluir esto en consultas
});

module.exports = {
  sequelize,
  Usuario,
  Rol,
  RolNombre
};
