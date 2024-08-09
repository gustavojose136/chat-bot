const { getActiveChat, createChatChannel } = require('../models/chatModel');
const twilio = require('twilio');
const { accountSid, authToken } = require('../config/twilioConfig');
const client = twilio(accountSid, authToken);
const Conversation = require('../models/conversationModel'); // Certifique-se de que a variável Conversation é importada corretamente aqui.

const insertMockMessages = async () => {
    const mockMessages = [
        { sender: 'bot', message: '👋 Olá! Bem vindo a Clínica Martins! Sou o assistente virtual 🤖 e estou aqui para ajudar. Escolha uma das opções abaixo:\n1️⃣ Agendar Consulta\n2️⃣ Planos aceitos\n3️⃣ Ver especialidades atendidas\n4️⃣ Falar com um Atendente\n5️⃣ Sair\nPor favor, responda com o número da opção desejada. Estamos aqui para cuidar de você!❤️' },
        { sender: 'user', message: '1' },
        { sender: 'bot', message: '📅 Por favor, forneça o seu número de confirmação de agendamento:' },
        { sender: 'user', message: '123456' },
        { sender: 'bot', message: '✅ Seu agendamento foi confirmado com o número 123456. Digite "menu" para voltar ao menu principal.' }
    ];

    // Certifique-se de que a variável Conversation é usada corretamente após a inicialização
    const conversation = new Conversation({ userPhoneNumber: '+5511999999999', messages: mockMessages });
    await conversation.save();

    console.log('Mensagens de teste inseridas com sucesso!');
};

const getMessages = async (fromNumber) => {
    let conversation = await Conversation
        .findOne({ userPhoneNumber: fromNumber })
        .select('messages -_id');
    return conversation ? conversation.messages : [];
};

const saveMessage = async (fromNumber, sender, message) => {
    let conversation = await Conversation.findOne({ userPhoneNumber: fromNumber });
    if (!conversation) {
        conversation = new Conversation({ userPhoneNumber: fromNumber, messages: [] });
    }
    conversation.messages.push({ sender, message });
    await conversation.save();
};

const updateState = async (fromNumber, newState, options = []) => {
    let conversation = await Conversation.findOne({ userPhoneNumber: fromNumber });
    if (!conversation) {
        conversation = new Conversation({ userPhoneNumber: fromNumber, state: newState, options });
    } else {
        conversation.state = newState;
        conversation.options = options;
    }
    await conversation.save();
};

const handleIncomingMessage = async (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const incomingMsg = req.body.Body.toLowerCase();
    const fromNumber = req.body.From;

    // Recuperar o estado atual e as opções apresentadas ao usuário
    let conversation = await Conversation.findOne({ userPhoneNumber: fromNumber });
    let currentState = conversation ? conversation.state : 'menu';
    let currentOptions = conversation ? conversation.options : [];

    // Salvar a mensagem do usuário
    await saveMessage(fromNumber, 'user', incomingMsg);

    if (currentState === 'menu') {
        const message = `
            👋 Olá! Bem vindo a Clínica Martins! Sou o assistente virtual 🤖 e estou aqui para ajudar. Escolha uma das opções abaixo:\n
            1️⃣ Agendar Consulta \n
            2️⃣ Planos aceitos\n
            3️⃣ Ver especialidades atendidas\n
            4️⃣ Falar com um Atendente \n
            5️⃣ Sair\n
            Por favor, responda com o número da opção desejada. Estamos aqui para cuidar de você!❤️
            `;
        twiml.message(message);
        await saveMessage(fromNumber, 'bot', message);
        await updateState(fromNumber, 'awaiting_option', ['1', '2', '3', '4', '5']);
    } else if (currentState === 'awaiting_option') {
        if (currentOptions.includes(incomingMsg)) {
            switch (incomingMsg) {
                case '1':
                    twiml.message('📅 Por favor, forneça o seu número de confirmação de agendamento:');
                    await updateState(fromNumber, 'confirmacao', []);
                    break;
                case '2':
                    twiml.message('📆 Para marcar um novo agendamento, por favor informe a especialidade e a data desejada:');
                    await updateState(fromNumber, 'marcar_agendamento', []);
                    break;
                case '3':
                    const message3 = '🏥 Nossas especialidades atendidas são:\n- Cardiologia\n- Dermatologia\n- Ginecologia\n- Pediatria\n- Ortopedia\nDigite "menu" para voltar ao menu principal.';
                    twiml.message(message3);
                    await saveMessage(fromNumber, 'bot', message3);
                    await updateState(fromNumber, 'especialidades', []);
                    break;
                case '4':
                    let chatChannel = getActiveChat(fromNumber);
                    if (!chatChannel) {
                        const staffMember = 'staff_member_identity';
                        chatChannel = await createChatChannel(fromNumber, staffMember);
                        const message4 = '📞 Você foi conectado com um membro da nossa equipe. Por favor, aguarde enquanto conectamos você...';
                        twiml.message(message4);
                        await saveMessage(fromNumber, 'bot', message4);
                        await updateState(fromNumber, 'atendente', []);
                    } else {
                        const message4_2 = 'Você já está conectado com um membro da nossa equipe. Por favor, continue a conversa.';
                        twiml.message(message4_2);
                        await saveMessage(fromNumber, 'bot', message4_2);
                    }
                    break;
                case '5':
                    twiml.message('👋 Obrigado por entrar em contato com a Clínica Martins. Tenha um ótimo dia!');
                    await updateState(fromNumber, 'ended');
                    break;
                default:
                    twiml.message('❓ Desculpe, não entendi sua mensagem. Por favor, responda com o número da opção desejada.');
                    await updateState(fromNumber, 'awaiting_option', ['1', '2', '3', '4', '5']);
            }
        } else {
            twiml.message('❓ Desculpe, não entendi sua mensagem. Por favor, responda com o número da opção desejada.');
            await updateState(fromNumber, 'awaiting_option', ['1', '2', '3', '4', '5']);
        }
    } else if (currentState === 'confirmacao') {
        twiml.message(`✅ Seu agendamento foi confirmado com o número ${incomingMsg}. Digite "menu" para voltar ao menu principal.`);
        await updateState(fromNumber, 'menu');
    } else if (currentState === 'marcar_agendamento') {
        twiml.message('✅ Agendamento recebido. Entraremos em contato para confirmação. Digite "menu" para voltar ao menu principal.');
        await updateState(fromNumber, 'menu');
    } else if (currentState === 'especialidades') {
        twiml.message('🔍 Está buscando uma especialidade específica? Responda com o nome ou digite "menu" para voltar.');
        await updateState(fromNumber, 'menu');
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
};

module.exports = {
    handleIncomingMessage,
    insertMockMessages
};
