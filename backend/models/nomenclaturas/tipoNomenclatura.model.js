const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TipoNomenclatura = sequelize.define("TipoNomenclatura", {
    id_tipoNomenclatura: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    tipo_nomenclatura: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
  }, {
    tableName: "TIPO_NOMENCLATURA",
    timestamps: false,
  });

  return TipoNomenclatura;
};
