module.exports = (sequelize, DataTypes) => {
  const TasaTarifaVariosNiveles = sequelize.define(
    "TasaTarifaVariosNiveles",
    {
      TASAS_TARIFA_TASAS_id_tasa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      TASAS_TARIFA_tarifa_correlativo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      TASAS_TARIFA_TARIFA_id_nombreTarifa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      nivel: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      dimension_construccion: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      formula: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      valor: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
    },
    {
      tableName: "TASAS_TARIFA_VARIOS_NIVELES",
      timestamps: false,
    }
  );

  return TasaTarifaVariosNiveles;
};
