FROM python:3.8-slim

WORKDIR /app
COPY . .

RUN apt-get update && \
    apt-get install -y curl && \
    pip install pandas requests beautifulsoup4

CMD ["bash", "scrape.sh"]
