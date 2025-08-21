const express = require("express");
const router = express.Router();
const {
  getNomenclaturas,
  postNomenclatura,
  reporteMensual,
} = require("../controllers/nomenclaturaController");


router.get("/", getNomenclaturas);
router.post("/", postNomenclatura);
//Ruta de reporte
router.get("/reporte-mensual", reporteMensual);

module.exports = router;