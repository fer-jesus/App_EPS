const express = require("express");
const router = express.Router();
const {
  postLicencia,
  getDatosTasa,
  getLicenciaPorTasa,
} = require("../controllers/licenciaController");

router.post("/", postLicencia);

// Ruta para obtener datos de una tasa por su ID
router.get("/datos-tasa/:id_tasa", getDatosTasa);


// Ruta para obtener licencia por tasa
router.get("/por-tasa/:id_tasa", getLicenciaPorTasa);

module.exports = router;
