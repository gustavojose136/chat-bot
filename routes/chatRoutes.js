const express = require('express');
const router = express.Router();
const { handleIncomingMessage, insertMockMessages } = require('../controllers/chatController');

router.post('/sms', handleIncomingMessage);
router.get('/teste', insertMockMessages);

module.exports = router;
