const sequelize = require("../../config/sequelize");
const { DataTypes } = require("sequelize");

const Licencia = require("./licencia.model")(sequelize, DataTypes);
const UsuarioFirma = require("../usuario/usuarioFirma.model")(sequelize, DataTypes);;

// Relación: una Licencia tiene muchas firmas
Licencia.hasMany(UsuarioFirma, {
  foreignKey: "LICENCIAS_id_licencia",
  sourceKey: "id_licencia",
  as: "firmas"
});

// Relación inversa: una firma pertenece a una Licencia
UsuarioFirma.belongsTo(Licencia, {
  foreignKey: "LICENCIAS_id_licencia",
  targetKey: "id_licencia",
  as: "licencia"
});

module.exports = {
  Licencia,
  UsuarioFirma,
  sequelize,
};
