const { Propietario } = require("../../models/tasas"); 

const buscarPropietarioPorCUI = async (cui) => {
  return await Propietario.findOne({ where: { cui } });
};

module.exports = {
 
  buscarPropietarioPorCUI
};
