#!/bin/bash

echo "Iniciando o script de scraping..."

# Executa o script de scraping Python
python3 scrape_steam.py

# Verifica se o arquivo foi criado
if [ -f steam_games_prices.csv ]; then
    echo "Arquivo steam_games_prices.csv criado. Enviando para o servidor..."

    # Envia o arquivo CSV para o servidor Node.js
    curl -F "file=@steam_games_prices.csv" http://localhost:3000/upload

    if [ $? -eq 0 ]; then
        echo "Arquivo enviado com sucesso."
    else
        echo "Erro ao enviar o arquivo."
    fi
else
    echo "Erro: Arquivo steam_games_prices.csv não foi criado."
    exit 1
fi

echo "Scraping e envio concluídos."
