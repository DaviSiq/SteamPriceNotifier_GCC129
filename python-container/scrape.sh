#!/bin/bash

# Executa o script de scraping Python
python3 scrape_steam.py

# Verifica se o arquivo foi criado
if [ -f steam_games_prices.csv ]; then
    # Envia o dataset para o servidor Node.js
    python3 send_data.py
else
    echo "Erro: Arquivo steam_games_prices.csv não foi criado."
    exit 1
fi
