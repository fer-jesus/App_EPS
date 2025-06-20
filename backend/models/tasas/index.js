const  sequelize  = require("../../config/sequelize");
const { DataTypes } = require("sequelize");

const Tasa = require("./tasa.model")(sequelize, DataTypes);
const TasaTarifa = require("./tasaTarifa.model")(sequelize, DataTypes); 
const Propietario = require("./propietario.model")(sequelize, DataTypes);

// Relaciones
Tasa.belongsTo(Propietario, {
  foreignKey: "PROPIETARIOS_cui",
  as: "propietario"
});
Propietario.hasMany(Tasa, {
  foreignKey: "PROPIETARIOS_cui",
    as: "tasas"
});

Tasa.hasMany(TasaTarifa, {
  foreignKey: "TASAS_id_tasa",
  as: "detalles_tarifas"
});

TasaTarifa.belongsTo(Tasa, {
  foreignKey: "TASAS_id_tasa",
   as: "tasa"
});

module.exports = {
  Tasa,
  TasaTarifa,
  Propietario,
  sequelize
};