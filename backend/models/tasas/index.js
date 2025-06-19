const  sequelize  = require("../../config/sequelize");
const { DataTypes } = require("sequelize");

//const Tasa = require("./tasa.model")(sequelize, DataTypes);
const Propietario = require("./propietario.model")(sequelize, DataTypes);

// Asociaciones
//Propietario.hasMany(Tasa, { foreignKey: "PROPIETARIOS_cui" });
//Tasa.belongsTo(Propietario, { foreignKey: "PROPIETARIOS_cui" });

module.exports = {
  //Tasa,
  Propietario,
};