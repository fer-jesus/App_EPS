const sequelize = require("../../config/sequelize");
const { DataTypes } = require("sequelize");

const Licencia = require("./licencia.model")(sequelize, DataTypes);
const { Tasa } = require("../tasas");

Licencia.belongsTo(Tasa, {
  foreignKey: "TASAS_id_tasa",
  as: "tasa",
});

module.exports = {
  Licencia,
  sequelize,
};
