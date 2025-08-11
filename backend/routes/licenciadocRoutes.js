const express = require("express");
const router = express.Router();
const { generarPDFLicencia } = require("../controllers/licenciadocController");

router.get("/pdf/:id", generarPDFLicencia);
module.exports = router;