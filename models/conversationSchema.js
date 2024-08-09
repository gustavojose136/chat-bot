const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    userPhoneNumber: String,
    messages: [
        {
            sender: String,
            message: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
