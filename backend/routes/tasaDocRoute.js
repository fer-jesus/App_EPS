const express = require("express");
const router = express.Router();
const { generarPDFTasa } = require("../controllers/tasaDocController");

router.get("/pdf/:id", generarPDFTasa);

module.exports = router;
