module.exports = (sequelize, DataTypes) => {
  const TasaTarifa = sequelize.define(
    "TasaTarifa",
    {
      tarifa_correlativo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: false,
      },
      TASAS_id_tasa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      TARIFA_id_nombreTarifa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      dimension_construccion: {
        type: DataTypes.DECIMAL,
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
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "TASAS_TARIFA",
      timestamps: false,
    }
  );

  return TasaTarifa;
};
