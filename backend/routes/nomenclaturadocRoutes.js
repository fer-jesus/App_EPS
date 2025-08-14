const express = require("express");
const router = express.Router();
const { generarPDFNomenclatura } = require("../controllers/nomenclaturadocController");

router.get("/pdf/:id", generarPDFNomenclatura);
module.exports = router;