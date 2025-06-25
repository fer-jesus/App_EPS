const express = require("express");
const router = express.Router();
const tarifasController = require("../controllers/tarifaController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, tarifasController.getTarifas);
router.put("/:id", authenticate, tarifasController.putTarifa);

module.exports = router;