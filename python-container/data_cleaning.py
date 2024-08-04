import pandas as pd

# Carregar dados coletados
data = pd.read_csv('steam_games_prices.csv')

# Remover duplicatas
data.drop_duplicates(subset=['title'], keep='first', inplace=True)

# Tratar dados faltantes
data.fillna('Preço não disponível', inplace=True)

# Converter preços para tipo numérico
data['price'] = data['price'].replace({'R\$': '', ',': '.'}, regex=True).astype(float)

# Salvar dados limpos
data.to_csv('cleaned_steam_games_prices.csv', index=False)
