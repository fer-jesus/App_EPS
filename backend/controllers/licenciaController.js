const {
  crearLicencia,
  obtenerDatosTasaPorId,
  obtenerLicenciaPorTasa,
  actualizarRotulo,
  obtenerReporteLicencias,
} = require("../models/licencias/licencia.service");

const postLicencia = async (req, res) => {
  try {
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    console.log("postLicencia recibe:", req.body);
    //asignación de un id_licencia aleatorio temporal, un trigger cambiará el valor antes de insertar
    req.body.id_licencia = Math.round(Math.random() * 10000);

    const nuevaLicencia = await crearLicencia(req.body, id_usuario);

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
    if (!licencia)
      return res.status(404).json({ error: "Licencia no encontrada" });
    res.json(licencia);
  } catch (error) {
    console.error("Error en getLicenciaPorTasa:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateRotulo = async (req, res) => {
  const { id_licencia, fecha_emisionL } = req.params;
  const { rotulo } = req.body;

  try {
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const resultado = await actualizarRotulo(
      id_licencia,
      fecha_emisionL,
      rotulo,
      id_usuario
    );

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const reporteMensual = async (req, res) => {
  try {
    const { inicio, fin } = req.query;

    const resultado = await obtenerReporteLicencias(inicio, fin);

    res.json(resultado);
  } catch (error) {
    console.error("Error en reporteMensual:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  postLicencia,
  getDatosTasa,
  getLicenciaPorTasa,
  updateRotulo,
  reporteMensual,
};
