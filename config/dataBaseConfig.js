const mongoose = require('mongoose');

//dev
// const connectDB = async () => {
//     try {
//         await mongoose.connect('mongodb://0.0.0.0:27017/clinicaDB', {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log('MongoDB conectado com sucesso');
//     } catch (error) {
//         console.error('Erro ao conectar ao MongoDB', error);
//         process.exit(1);
//     }
// };

//prod
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://grosa:teste123@chat-bot.doacpds.mongodb.net/', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB conectado com sucesso');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB', error);
        process.exit(1);
    }
};

module.exports = connectDB;
