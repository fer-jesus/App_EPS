const { Tarifa, TipoConstruccionTarifa, TarifaCostoDimension } = require('./index')(require('../../config/sequelize'));

async function obtenerTarifas() {
  try {
    const tarifas = await Tarifa.findAll({
      include: [
        {
          model: TipoConstruccionTarifa,
          attributes: ['id_tipoConstruccion', 'tipo_construccion'],
        },
        {
          model: TarifaCostoDimension,
          attributes: ['costo_tarifa', 'unidad_medida', 'porcentaje'],
        }
      ]
    });
    return tarifas;
  } catch (error) {
    console.error("Error al obtener tarifas:", error);
    throw error;
  }
}

module.exports = {
  obtenerTarifas,
};
