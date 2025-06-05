const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: DataTypes.STRING(100),
    titulo: DataTypes.STRING(20),
    fecha_nacimiento: DataTypes.DATE,
    correo: {
      type: DataTypes.STRING(100),
      unique: true
    },
    contrasena: DataTypes.STRING(255),
    es_contrasena_temporal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    fecha_registro: DataTypes.DATE,
    fecha_de_baja: DataTypes.DATE,
    unidad: DataTypes.ENUM(
      'LICENCIAS DE CONSTRUCCION',
      'DIRECCION DE ORDENAMIENTO TERRITORIAL Y DESARROLLO MUNICIPAL'
    ),
    en_funciones: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sexo: DataTypes.ENUM('M', 'F'),
    ROL_id_rol: DataTypes.INTEGER
  }, {
    tableName: 'USUARIOS',
    timestamps: false
  });

  return Usuario;
};
