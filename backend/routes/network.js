const {registerNetwork, getAllNetworks}=require('../controller/network.controller')
const express = require('express');
const router = express.Router();

router.post('/register', registerNetwork);
router.get('/get-network', getAllNetworks);

module.exports = router;