const express = require('express');
const router = express.Router();
const  { getRolesBySexo }  = require('../controllers/rolController');


router.get("/", getRolesBySexo);

module.exports = router;