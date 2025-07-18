const { TipoNomenclatura } = require("./index");

const listarTiposNomenclatura = async () => {
  return await TipoNomenclatura.findAll({
    attributes: ["id_tipoNomenclatura", "tipo_nomenclatura"],
    order: [["tipo_nomenclatura", "ASC"]],
  });
};

module.exports = {
  listarTiposNomenclatura,
};
