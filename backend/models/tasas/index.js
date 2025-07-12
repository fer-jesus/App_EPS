const  sequelize  = require("../../config/sequelize");
const { DataTypes } = require("sequelize");

const Tasa = require("./tasa.model")(sequelize, DataTypes);
const TasaTarifa = require("./tasaTarifa.model")(sequelize, DataTypes); 
const Propietario = require("./propietario.model")(sequelize, DataTypes);
const { Tarifa } = require("../tarifas/tarifas.model")(sequelize);
const { Licencia } = require("../licencias");
const TasaTarifaVariosNiveles = require("./tasaTarifaVariosNiveles.model")(sequelize, DataTypes);

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

// TasaTarifa.hasMany(TasaTarifaVariosNiveles, {
//   foreignKey: ["TASAS_TARIFA_TASAS_id_tasa", "TASAS_TARIFA_tarifa_correlativo", "TASAS_TARIFA_TARIFA_id_nombreTarifa"],
//   sourceKey: ["TASAS_id_tasa", "tarifa_correlativo", "TARIFA_id_nombreTarifa"],
//   as: "niveles"
// });

// TasaTarifaVariosNiveles.belongsTo(TasaTarifa, {
//   foreignKey: ["TASAS_TARIFA_TASAS_id_tasa", "TASAS_TARIFA_tarifa_correlativo", "TASAS_TARIFA_TARIFA_id_nombreTarifa"],
//   targetKey: ["TASAS_id_tasa", "tarifa_correlativo", "TARIFA_id_nombreTarifa"],
//   as: "tarifaBase"
// });



module.exports = {
  Tasa,
  TasaTarifa,
  Propietario,
  Tarifa,
  Licencia,
  TasaTarifaVariosNiveles,
  sequelize
};