const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rol = sequelize.define('Rol', {
    id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    tableName: 'ROL',
    timestamps: false
  });

  const RolNombre = sequelize.define('RolNombre', {
    ROL_id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    sexo: {
      type: DataTypes.ENUM('M', 'F'),
      primaryKey: true
    },
    nombre_rol: {
      type: DataTypes.STRING(45)
    }
  }, {
    tableName: 'ROL_NOMBRE',
    timestamps: false
  });

  // Relaciones internas
  Rol.hasMany(RolNombre, {
    foreignKey: 'ROL_id_rol',
    sourceKey: 'id_rol'
  });

  RolNombre.belongsTo(Rol, {
    foreignKey: 'ROL_id_rol',
    targetKey: 'id_rol'
  });

  return { Rol, RolNombre }; 
};