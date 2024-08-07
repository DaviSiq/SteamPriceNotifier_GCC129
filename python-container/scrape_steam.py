import requests
from bs4 import BeautifulSoup
import pandas as pd
import os
import time

def scrape_steam():
    url = "https://store.steampowered.com/search/?specials=1"  # URL de jogos em promoção
    print("Acessando a URL:", url)  # Debug
    response = requests.get(url)
    
    if response.status_code == 200:
        print("Requisição bem-sucedida.")
    else:
        print(f"Erro ao acessar a URL: {response.status_code}")
        return []

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

# Função para comparar dados
def compare_data(new_data, old_data):
    new_titles = {game['title']: game['price'] for game in new_data}
    old_titles = {game['title']: game['price'] for game in old_data}
    
    changes = []
    
    for title, price in new_titles.items():
        if title not in old_titles:
            changes.append(f"Novo jogo: {title} - {price}")
        elif old_titles[title] != price:
            changes.append(f"Preço alterado: {title} de {old_titles[title]} para {price}")
    
    for title in old_titles:
        if title not in new_titles:
            changes.append(f"Jogo removido: {title}")
    
    return changes

# Loop de execução a cada 1 minuto
if __name__ == "__main__":
    while True:
        # Carregar dados antigos
        old_data = []
        if os.path.exists('steam_games_prices.csv'):
            old_data = pd.read_csv('steam_games_prices.csv').to_dict(orient='records')

        # Captura novos dados
        new_data = scrape_steam()
        if new_data:
            df = pd.DataFrame(new_data)
            df.to_csv('steam_games_prices.csv', index=False)
            print("Dados salvos em 'steam_games_prices.csv'.")

            # Comparar novos dados com os antigos
            changes = compare_data(new_data, old_data)
            
            # Montar uma mensagem com todos os preços dos jogos
            message = "Preços dos jogos:\n"
            for game in new_data:
                message += f"{game['title']}: {game['price']}\n"
            
            if changes:
                print("Mudanças detectadas:")
                for change in changes:
                    print(change)
                # Adiciona as mudanças à mensagem
                message += "\nMudanças detectadas:\n" + "\n".join(changes)
            else:
                print("Nenhuma mudança detectada.")
                message += "\nNenhuma mudança detectada."
            
            # Envie o CSV e a mensagem para o servidor Node.js
            try:
                with open('steam_games_prices.csv', 'rb') as f:
                    files = {'file': f}
                    data = {'message': message}
                    response = requests.post('http://node-container:3000/upload', files=files, data=data)
                
                # Verifique a resposta do servidor
                if response.status_code == 200:
                    print("Dados enviados com sucesso:", response.text)
                else:
                    print(f"Erro ao enviar dados. Código de status: {response.status_code}, Resposta: {response.text}")
            except Exception as e:
                print(f"Ocorreu um erro ao enviar o arquivo: {e}")

        else:
            print("Nenhum dado para salvar.")

        print("Aguardando 1 minuto...")
        time.sleep(600)  # Espera 1 minuto (60 segundos)
