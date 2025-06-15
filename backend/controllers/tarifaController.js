const { obtenerTarifas, actualizarTarifa  } = require("../models/tarifas/tarifas.service");


const getTarifas = async (req, res) => {
  try {
    const tarifas = await obtenerTarifas();
    res.status(200).json(tarifas);
  } catch (error) {
    console.error("Error al obtener tarifas:", error);
    res.status(500).json({ message: "Error al obtener las tarifas." });
  }
};

const putTarifa = async (req, res) => {
  const id = req.params.id;
  try {
    const resultado = await actualizarTarifa(id, req.body);
    res.status(200).json({ message: "Tarifa actualizada correctamente", resultado });
  } catch (error) {
     console.error("Error real al actualizar tarifa:", error);
    res.status(500).json({ message: "Error al actualizar la tarifa.", error: error.message });
  }
};

module.exports = {
  getTarifas,
  putTarifa,
};
