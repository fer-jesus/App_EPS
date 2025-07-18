const sequelize = require("../../config/sequelize");
const { DataTypes } = require("sequelize");

const Propietario = require("../tasas/propietario.model")(sequelize, DataTypes);
const Nomenclatura = require("./nomenclatura.model")(sequelize);
const TipoNomenclatura = require("./tipoNomenclatura.model")(sequelize);
const Usuario = require("../usuario/usuario.model")(sequelize);

// Relaciones
Nomenclatura.belongsTo(Propietario, {
  foreignKey: "PROPIETARIOS_cui",
  as: "propietario",
});
Nomenclatura.belongsTo(TipoNomenclatura, {
  foreignKey: "TIPO_NOMENCLATURA_id_tipoNomenclatura",
   as: "tipoNomenclatura",
});
Nomenclatura.belongsTo(Usuario, {
  foreignKey: "USUARIOS_id_usuario_firma",
   as: "usuarioFirma",
});

module.exports = {
  sequelize,
  Nomenclatura,
  Propietario,
  TipoNomenclatura,
  Usuario,
};