const { obtenerTarifas } = require("../models/tarifas/tarifas.service");


const getTarifas = async (req, res) => {
  try {
    const tarifas = await obtenerTarifas();
    res.status(200).json(tarifas);
  } catch (error) {
    console.error("Error al obtener tarifas:", error);
    res.status(500).json({ message: "Error al obtener las tarifas." });
  }
};

module.exports = {
  getTarifas,
};
