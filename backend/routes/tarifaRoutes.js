const express = require("express");
const router = express.Router();
const tarifasController = require("../controllers/tarifaController");

router.get("/", tarifasController.getTarifas);

module.exports = router;