const express = require("express");
const router = express.Router();
const { generarPDFLicencia } = require("../controllers/licenciadocController");

router.get("/pdf/:id/:fechaEmision", generarPDFLicencia);
module.exports = router;