const express = require('express');
const  { getRolesBySexo }  = require('../controllers/rolController');
const router = express.Router();

router.get("/", getRolesBySexo);

module.exports = router;