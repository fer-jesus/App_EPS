const express = require("express");
const router = express.Router();
const { generarPDFTasa } = require("../controllers/tasadocController");

router.get("/pdf/:id", generarPDFTasa);
module.exports = router;