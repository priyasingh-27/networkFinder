const { sendQuery, registerUser, getCredits } = require('../controller/user.controller');
const express = require('express');
const router = express.Router();

router.post('/register', registerUser);
router.post('/send-query', sendQuery);
router.post('/credits', getCredits);

module.exports = router;