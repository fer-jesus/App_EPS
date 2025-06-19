module.exports = (sequelize, DataTypes) => {
  const Tasa = sequelize.define("Tasa", {
    id_tasa: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    PROPIETARIOS_cui: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
   
  }, {
    tableName: "TASAS",
    timestamps: false
  });

  return Tasa;
};
