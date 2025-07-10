const { crearTasa, obtenerRegistros, obtenerDatosTasaPorId  } = require("../models/tasas/tasa.service");

const crearTasaHandler = async (req, res) => {
  try {
    console.log("Datos recibidos en el backend:", req.body);
    const { tasaData, tarifasData } = req.body;
    console.log("Datos de tasa:", tasaData);
    console.log("Datos recibidos para crear tasa:", tasaData);
    console.log("Datos de tarifas:", tarifasData);
    

    if (!tasaData || !tarifasData) {
      console.error("Datos incompletos en la solicitud");
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const nuevaTasa = await crearTasa(tasaData, tarifasData);
    console.log("Tasa creada:", nuevaTasa);

    res.status(201).json({
      message: "Tasa creada exitosamente",
      data: nuevaTasa,
    });
  } catch (error) {
    console.error("Error al crear tasa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const listarRegistros = async (req, res) => {
  try {
    const tasas = await obtenerRegistros();
    // const response = tasas.map((t) => ({
    //   id: t.id_tasa,
    //    nombre_propietario: t.propietario?.nombre_propietario  || "Desconocido",
    // }));
    // res.json(response);
    res.json(tasas);
  } catch (error) {
    console.error("Error al obtener tasas:", error);
    res.status(500).json({ error: "Error al obtener tasas" });
  }
};

const obtenerDatosAmpliacionHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const tasa = await obtenerDatosTasaPorId(id);

    if (!tasa) {
      return res.status(404).json({ error: "Tasa no encontrada" });
    }

    // res.json({
    //   direccionExacta: tasa.direccion_propiedad,
    //   nombrePropietario: tasa.propietario?.nombre_propietario || "",
    //   dpi: tasa.propietario?.cui || "",
    //   LICENCIAS_id_licencia_original: tasa.LICENCIAS_id_licencia_original,
    //   LICENCIAS_fecha_emisionL_original: tasa.LICENCIAS_fecha_emisionL_original,
    // });
    res.json(tasa);
  } catch (error) {
    console.error("Error al obtener datos de la tasa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  crearTasaHandler,
  listarRegistros,
  obtenerDatosAmpliacionHandler,
};
