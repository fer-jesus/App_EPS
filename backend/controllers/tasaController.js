const { crearTasa, obtenerTasaEdicion, actualizarTasa, obtenerRegistros, obtenerDatosTasaPorId  } = require("../models/tasas/tasa.service");

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

    // Verificar que el usuario esté autenticado
     const id_usuario = req.user?.id_usuario;
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const nuevaTasa = await crearTasa(tasaData, tarifasData, id_usuario);
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

const getTasaEdicion = async (req, res) => {
  try {
    const { id } = req.params;
    const tasa = await obtenerTasaEdicion(id);

    if (!tasa) {
      return res.status(404).json({ message: "Tasa no encontrada" });
    }

    res.json(tasa);
  } catch (error) {
    console.error("Error en getTasaEdicion:", error);
    res.status(500).json({ message: "Error obteniendo la tasa", error });
  }
};

const actualizarTasaHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { tasaData, tarifasData } = req.body;
    const id_usuario = req.user?.id_usuario;
    
    console.log("Actualizando tasa ID:", id);
    console.log("Datos recibidos:", { tasaData, tarifasData });

    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const tasaActualizada = await actualizarTasa(id, tasaData, tarifasData, id_usuario);
    
    res.json({ 
      message: "Tasa actualizada exitosamente",
      data: { id: tasaActualizada }
    });
    
  } catch (error) {
    console.error("Error al actualizar tasa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const listarRegistros = async (req, res) => {
  try {
    const tasas = await obtenerRegistros();

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

    res.json(tasa);
  } catch (error) {
    console.error("Error al obtener datos de la tasa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  crearTasaHandler,
  getTasaEdicion,
  actualizarTasaHandler,
  listarRegistros,
  obtenerDatosAmpliacionHandler,
};
