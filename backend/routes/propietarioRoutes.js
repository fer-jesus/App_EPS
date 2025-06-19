const express = require("express");
const router = express.Router();
const propietarioController = require("../controllers/propietarioController");

router.get('/:cui', propietarioController.obtenerPorCUI);

module.exports = router;
