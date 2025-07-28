const sequelize = require("../../config/sequelize");
const { DataTypes } = require("sequelize");

const Licencia = require("./licencia.model")(sequelize, DataTypes);

module.exports = {
  Licencia,
  sequelize,
};
