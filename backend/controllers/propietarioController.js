const { buscarPropietarioPorCUI, crearPropietario } = require("../models/tasas/propietario.service");

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

const crearPropietarioHandler = async (req, res) => {
  const { cui, nombre_propietario } = req.body;
  try {
    const existente = await buscarPropietarioPorCUI(cui);
    if (existente) {
      return res.status(400).json({ mensaje: "El propietario ya existe" });
    }

    const nuevo = await crearPropietario(cui, nombre_propietario);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error("Error al crear propietario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


module.exports = { obtenerPorCUI, crearPropietarioHandler };
