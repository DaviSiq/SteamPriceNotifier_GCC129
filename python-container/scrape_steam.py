import requests
from bs4 import BeautifulSoup
import pandas as pd

def scrape_steam():
    url = "https://store.steampowered.com/search/?specials=1"  # URL de jogos em promoção
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    games = []
    for item in soup.select('.search_result_row'):
        title = item.select_one('.title').text
        price = item.select_one('.discount_final_price').text if item.select_one('.discount_final_price') else "Sem preço"
        
        games.append({
            'title': title,
            'price': price
        })
    
    return games

# Salvar dados em CSV
games_data = scrape_steam()
df = pd.DataFrame(games_data)
df.to_csv('steam_games_prices.csv', index=False)
