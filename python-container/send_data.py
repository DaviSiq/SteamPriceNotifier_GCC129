import pandas as pd
import requests

# Carregar dados de jogos
data = pd.read_csv('steam_games_prices.csv')

# Enviar dados para o servidor Node.js
response = requests.post('http://localhost:3000/upload', json=data.to_dict(orient='records'))
print(response.status_code)
