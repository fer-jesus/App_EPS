const express = require("express");
const router = express.Router();
const { crearTasaHandler, listarRegistros } = require("../controllers/tasaController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/", authenticate, crearTasaHandler);
router.get("/", authenticate, listarRegistros); 

module.exports = router;
