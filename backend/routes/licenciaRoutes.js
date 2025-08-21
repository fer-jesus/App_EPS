const express = require("express");
const router = express.Router();
const {
  postLicencia,
  getDatosTasa,
  getLicenciaPorTasa,
  updateRotulo,
  reporteMensual,
} = require("../controllers/licenciaController");

//Ruta para crear una nueva licencia
router.post("/", postLicencia);

// Ruta para obtener datos de una tasa por su ID
router.get("/datos-tasa/:id_tasa", getDatosTasa);


// Ruta para obtener licencia por tasa
router.get("/por-tasa/:id_tasa", getLicenciaPorTasa);

//Ruta para actualizar el rotulo de una licencia
router.put("/:id_licencia/:fecha_emisionL", updateRotulo);

//Ruta de reporte
router.get("/reporte-mensual", reporteMensual);


module.exports = router;
