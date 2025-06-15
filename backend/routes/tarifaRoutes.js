const express = require("express");
const router = express.Router();
const tarifasController = require("../controllers/tarifaController");

router.get("/", tarifasController.getTarifas);
router.put("/:id", tarifasController.putTarifa);

module.exports = router;