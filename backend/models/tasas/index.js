const  sequelize  = require("../../config/sequelize");
const { DataTypes } = require("sequelize");

const Tasa = require("./tasa.model")(sequelize, DataTypes);
const TasaTarifa = require("./tasaTarifa.model")(sequelize, DataTypes); 
const Propietario = require("./propietario.model")(sequelize, DataTypes);
const { Tarifa } = require("../tarifas/tarifas.model")(sequelize);
const { Licencia } = require("../licencias");

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

TasaTarifa.belongsTo(Tarifa, {
  foreignKey: "TARIFA_id_nombreTarifa",
  as: "tarifa"
});

Tasa.hasOne(Licencia, {
  foreignKey: "TASAS_id_tasa",
  as: "licencia"
});

Licencia.belongsTo(Tasa, {
  foreignKey: "TASAS_id_tasa",
  as: "tasa"
});


module.exports = {
  Tasa,
  TasaTarifa,
  Propietario,
  Tarifa,
  Licencia,
  sequelize
};