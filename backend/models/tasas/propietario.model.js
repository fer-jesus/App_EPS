module.exports = (sequelize, DataTypes) => {
  const Propietario = sequelize.define("Propietario", {
    cui: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    nombre_propietario: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: "PROPIETARIOS",
    timestamps: false
  });

  return Propietario;
};
