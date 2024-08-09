const express = require('express');
const connectToMongoDB = require('./config/dataBaseConfig');

const mongoose = require('mongoose');

const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// Conectar ao banco de dados
connectToMongoDB();

// Middleware para parsing de requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rotas e controladores
const chatRoutes = require('./routes/chatRoutes');
app.use('/chat', chatRoutes);

app.get('/', (req, res) => {
    res.send('Olá, mundo!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
