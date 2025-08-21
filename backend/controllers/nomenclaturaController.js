const {
  crearNomenclatura,
  listarNomenclaturas,
  obtenerReporteNomenclaturas,
} = require("../models/nomenclaturas/nomenclatura.service");


const postNomenclatura = async (req, res) => {
  try {
    
    // Obtener el usuario autenticado
    if (!req.user || !req.user.id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

      // Asignar un id aleatorio (temporal)
    req.body.id_nomenclatura = Math.round(Math.random() * 10000);
    // console.log("Usuario autenticado:", req.user);

    // Inyectar el id del usuario como firma
  req.body.USUARIOS_id_usuario_firma = req.user.id_usuario;
    //const data = req.body;
    const nueva = await crearNomenclatura(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    console.error("Error al crear nomenclatura:", err);
    res.status(500).json({ error: "Error al crear nomenclatura" });
  }
};


const getNomenclaturas = async (req, res) => {
  try {
    const datos = await listarNomenclaturas();
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener nomenclaturas" });
  }
};

const reporteMensual = async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    const resultado = await obtenerReporteNomenclaturas(inicio, fin);
    res.json(resultado);
  } catch (err) {
    console.error("Error en reporteMensual Nomenclaturas:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  postNomenclatura,
  getNomenclaturas,
  reporteMensual,
};