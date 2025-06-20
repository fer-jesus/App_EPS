const { Propietario } = require("../../models/tasas"); 

const buscarPropietarioPorCUI = async (cui) => {
  return await Propietario.findOne({ where: { cui } });
};

const crearPropietario = async (cui, nombre_propietario) => {
  return await Propietario.create({ cui, nombre_propietario });
};

const actualizarPropietario = async (cui, nombre_propietario) => {
  return await Propietario.upsarte({ cui, nombre_propietario });
};
module.exports = {
  buscarPropietarioPorCUI,
  crearPropietario
};
