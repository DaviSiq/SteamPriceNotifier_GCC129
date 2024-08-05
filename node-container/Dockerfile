# Usar a imagem base do Node.js
FROM node:14

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os arquivos package.json e package-lock.json para o contêiner
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante dos arquivos da aplicação
COPY . .

# Expor a porta 3000
EXPOSE 3000

# Comando para rodar a aplicação Node.js
CMD ["node", "server.js"]
