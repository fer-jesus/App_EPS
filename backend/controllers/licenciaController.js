const {
  crearLicencia,
  obtenerDatosTasaPorId,
} = require("../models/licencias/licencia.service");

const postLicencia = async (req, res) => {
  try {
    console.log("postLicencia recibe:", req.body);
    //asignación de un id_licencia aleatorio temporal, un trigger cambiará el valor antes de insertar
    req.body.id_licencia = Math.round(Math.random() * 10000);
    const nuevaLicencia = await crearLicencia(req.body);
    res.status(201).json(nuevaLicencia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDatosTasa = async (req, res) => {
  const { id_tasa } = req.params;
  try {
    const datos = await obtenerDatosTasaPorId(id_tasa);
    res.json(datos);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getLicenciaPorTasa = async (req, res) => {
  const { id_tasa } = req.params;
  try {
    const licencia = await obtenerLicenciaPorTasa(id_tasa);
    if (!licencia) return res.status(404).json({ error: "Licencia no encontrada" });
    res.json(licencia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  postLicencia,
  getDatosTasa,
  getLicenciaPorTasa,
};
