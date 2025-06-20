const express = require("express");
const router = express.Router();
const { crearTasaHandler, listarRegistros } = require("../controllers/tasaController");

router.post("/", crearTasaHandler);
router.get("/", listarRegistros); 

module.exports = router;
