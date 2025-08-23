const express = require("express");
const router = express.Router();
const { crearTasaHandler, getTasaEdicion, actualizarTasaHandler, listarRegistros, obtenerDatosAmpliacionHandler } = require("../controllers/tasaController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/", authenticate, crearTasaHandler);
router.get("/edicion/:id", authenticate, getTasaEdicion); 
router.put("/:id", authenticate, actualizarTasaHandler);
router.get("/", authenticate, listarRegistros); 
router.get("/ampliacion/:id", authenticate, obtenerDatosAmpliacionHandler);

module.exports = router;
