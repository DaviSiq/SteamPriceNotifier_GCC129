const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const csv = require('csv-parser');
const path = require('path');
const nodemailer = require('nodemailer'); // Importa nodemailer
const axios = require('axios'); // Importa axios para requisições HTTP

let gamesData = [];
const registeredEmails = []; // Array para armazenar os e-mails cadastrados

// Middleware para JSON
app.use(bodyParser.json());

// Middleware para servir arquivos estáticos na pasta 'event'
app.use('/event', express.static(path.join(__dirname, 'event')));

// Configuração do transporte para envio de e-mails
const transporter = nodemailer.createTransport({
    host: 'bulk.smtp.mailtrap.io', // Host do Mailtrap
    port: 587, // Porta recomendada do Mailtrap
    auth: {
        user: 'api', // Seu usuário do Mailtrap
        pass: 'f269a0ee0e5518f4a84238923be49e42' // Sua senha do Mailtrap
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Rota para upload do CSV
app.post('/upload', upload.single('file'), (req, res) => {
    const results = [];
    
    // Use o buffer diretamente
    const bufferStream = require('stream').Readable.from(req.file.buffer.toString());

    bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            gamesData = results; // Armazena os dados do CSV
            res.json({ message: 'Upload successful', data: gamesData });
        })
        .on('error', (error) => {
            console.error('Error reading CSV:', error);
            res.status(500).json({ message: 'Error reading CSV' });
        });
});

// Rota para servir a página com o gráfico
app.get('/chart', (req, res) => {
    res.sendFile(path.join(__dirname, 'chart.html'));
});

// Rota para obter os dados do gráfico
app.get('/api/data', (req, res) => {
    res.json(gamesData);
});

// Rota para cadastrar o e-mail e enviar notificação
app.post('/api/register', (req, res) => {
    const { email } = req.body;

    // Verifica se o e-mail é válido
    if (!email) {
        return res.status(400).json({ message: 'E-mail é obrigatório.' });
    }

    // Adiciona o e-mail ao array de registrados
    registeredEmails.push(email);
    console.log(`E-mail cadastrado: ${email}`);

    // Envia a notificação de confirmação por e-mail
    const mailOptions = {
        from: 'mailtrap@demomailtrap.com', // Alterado para um domínio válido
        to: email,
        subject: 'Confirmação de Cadastro',
        text: 'Você foi cadastrado com sucesso para receber notificações sobre promoções da Steam!'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erro ao enviar e-mail:', error);
            return res.status(500).json({ message: 'Erro ao enviar notificação.' });
        }
        console.log('E-mail enviado:', info.response);
        res.status(200).json({ message: 'E-mail cadastrado e notificação enviada!' });
    });
});

// Rota para servir a página de cadastro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'event', 'index.html'));
});

// Função para verificar mudanças no site da Steam (exemplo básico)
const checkForUpdates = async () => {
    try {
        const response = await axios.get('https://store.steampowered.com/search/?specials=1'); // Substitua pela URL que deseja monitorar
        const data = response.data;

        // Aqui você pode fazer a lógica de comparação para detectar mudanças
        const hasChanged = false; // Substitua pela sua lógica de comparação

        if (hasChanged) {
            registeredEmails.forEach(email => {
                const mailOptions = {
                    from: 'mailtrap@demomailtrap.com', // Alterado para um domínio válido
                    to: email,
                    subject: 'Mudança no Site da Steam',
                    text: 'Uma mudança foi detectada no site da Steam. Verifique!'
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Erro ao enviar e-mail:', error);
                    } else {
                        console.log(`E-mail enviado para ${email}:`, info.response);
                    }
                });
            });
        }
    } catch (error) {
        console.error('Erro ao verificar mudanças:', error);
    }
};

// Configura a verificação para executar a cada 10 minutos (600000 ms)
setInterval(checkForUpdates, 600000); // Ajuste o tempo conforme necessário

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
