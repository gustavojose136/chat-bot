const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    userPhoneNumber: String,
    state: { type: String, default: 'menu' }, // Estado atual da conversa
    options: { type: Array, default: [] }, // Opções apresentadas ao usuário
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
