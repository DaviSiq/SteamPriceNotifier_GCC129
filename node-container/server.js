const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer().single('file');
const csv = require('csv-parser');
const path = require('path');
const nodemailer = require('nodemailer'); 
const fs = require('fs'); 

let gamesData = [];
const registeredEmails = []; // Array para armazenar os e-mails cadastrados

// Middleware para JSON
app.use(bodyParser.json());

// Middleware para servir arquivos estáticos na pasta 'event'
app.use('/event', express.static(path.join(__dirname, 'event')));

// Configuração do transporte para envio de e-mails
const transporter = nodemailer.createTransport({
    host: 'bulk.smtp.mailtrap.io', 
    port: 587,
    auth: {
        user: 'api', 
        pass: 'f269a0ee0e5518f4a84238923be49e42' 
    },
    tls: {
        rejectUnauthorized: false
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
                const mailOptions = {
                    from: 'mailtrap@demomailtrap.com',
                    to: email,
                    subject: 'Atualização de Preços da Steam',
                    text: `${message}\n\nVerifique os dados atualizados!` // Inclui a mensagem no e-mail
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
    const mailOptions = {
        from: 'mailtrap@demomailtrap.com',
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
