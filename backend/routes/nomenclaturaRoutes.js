const express = require("express");
const router = express.Router();
const {
  getNomenclaturas,
  postNomenclatura,
} = require("../controllers/nomenclaturaController");


router.get("/", getNomenclaturas);
router.post("/", postNomenclatura);

module.exports = router;