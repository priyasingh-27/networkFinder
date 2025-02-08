const { sendQuery } = require('../controller/user.controller');
const express = require('express');
const router = express.Router();

router.post('/send-query', sendQuery);

module.exports = router;