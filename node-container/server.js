const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer().single('file');
const csv = require('csv-parser');
const path = require('path');
const nodemailer = require('nodemailer'); 
const fs = require('fs'); 
const { v4: uuidv4 } = require('uuid');  // Importando a biblioteca UUID

let gamesData = [];
const registeredEmails = []; // Array para armazenar os e-mails cadastrados

// Middleware para JSON
app.use(bodyParser.json());

// Middleware para servir arquivos estáticos na pasta 'event'
app.use('/event', express.static(path.join(__dirname, 'event')));

// Configuração do transporte para envio de e-mails
const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
        user: 'steamNotifyGCC129@outlook.com',
        pass: 'Davi171201'
    },
    tls: {
        rejectUnauthorized: false // Ignorar erros de certificado
    }
});

// Rota para upload do CSV
app.post('/upload', upload, (req, res) => {
    const results = [];
    const file = req.file;
    const message = req.body.message; // Acessa a mensagem corretamente

    if (!file || !message) {
        return res.status(400).json({ message: 'Arquivo CSV e mensagem são obrigatórios.' });
    }

    // Use o buffer diretamente
    const bufferStream = require('stream').Readable.from(file.buffer);

    bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            gamesData = results; // Armazena os dados do CSV
            res.json({ message: 'Upload bem-sucedido', data: gamesData });

            // Enviar notificação por e-mail
            registeredEmails.forEach(email => {
                const uniqueId = uuidv4();  // Gerando um UUID único para cada e-mail
                const mailOptions = {
                    from: 'steamNotifyGCC129@outlook.com',
                    to: email,
                    subject: `Atualização de Preços da Steam - ID: ${uniqueId}`,
                    text: `${message}\n\nVerifique os dados atualizados!\n\nEnviado em: ${new Date().toLocaleString()} - ID: ${uniqueId}`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Erro ao enviar e-mail:', error);
                    } else {
                        console.log(`E-mail enviado para ${email}:`, info.response);
                    }
                });
            });
        })
        .on('error', (error) => {
            console.error('Error reading CSV:', error);
            res.status(500).json({ message: 'Erro ao ler o CSV' });
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
    const uniqueId = uuidv4();  // Gerando um UUID único para cada e-mail
    const mailOptions = {
        from: 'steamNotifyGCC129@outlook.com',
        to: email,
        subject: `Confirmação de Cadastro - ID: ${uniqueId}`,
        text: `Você foi cadastrado com sucesso para receber notificações sobre promoções da Steam! - ID: ${uniqueId}`
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
