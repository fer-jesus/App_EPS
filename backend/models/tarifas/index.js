const defineTarifaModels = require("./tarifas.model");

module.exports = (sequelize) => {
  const models = defineTarifaModels(sequelize);
  return models;
};