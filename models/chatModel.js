const twilio = require('twilio');
const { accountSid, authToken, chatServiceSid } = require('../config/twilioConfig');
const client = twilio(accountSid, authToken);

const activeChats = {}; 

const getActiveChat = (fromNumber) => activeChats[fromNumber];

const createChatChannel = async (fromNumber, staffMember) => {
    const channel = await client.chat.services(chatServiceSid)
        .channels
        .create({ friendlyName: `Chat com: ${fromNumber}` });

    await client.chat.services(chatServiceSid)
        .channels(channel.sid)
        .members
        .create({ identity: fromNumber });

    await client.chat.services(chatServiceSid)
        .channels(channel.sid)
        .members
        .create({ identity: staffMember });

    activeChats[fromNumber] = channel.sid;

    return channel.sid;
};

module.exports = {
    getActiveChat,
    createChatChannel
};
