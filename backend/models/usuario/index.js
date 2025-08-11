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
  as: 'RolNombre' 
});

module.exports = {
  sequelize,
  Usuario,
  Rol,
  RolNombre
};
