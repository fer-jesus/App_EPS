const express = require("express");
const router = express.Router();
const { crearTasaHandler, listarRegistros, obtenerDatosAmpliacionHandler } = require("../controllers/tasaController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/", authenticate, crearTasaHandler);
router.get("/", authenticate, listarRegistros); 
router.get("/ampliacion/:id", authenticate, obtenerDatosAmpliacionHandler);

module.exports = router;
