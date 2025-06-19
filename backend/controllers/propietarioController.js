const { buscarPropietarioPorCUI } = require("../models/tasas/propietario.service");

const obtenerPorCUI = async (req, res) => {
  const { cui } = req.params;
  try {
    const propietario = await buscarPropietarioPorCUI(cui);
    if (propietario) {
      res.json(propietario);
    } else {
      res.status(404).json({ mensaje: "Propietario no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener propietario por CUI:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { obtenerPorCUI };
