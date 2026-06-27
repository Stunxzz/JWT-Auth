# backend/Dockerfile

# Базов image — Python 3.12
FROM python:3.12-slim

# Работна директория в контейнера
WORKDIR /app

# Копираме requirements първо (за кеширане)
COPY requirements.txt .

# Инсталираме зависимостите
RUN pip install --no-cache-dir -r requirements.txt

# Копираме целия проект
COPY . .

# Порт който Django ще слуша
EXPOSE 8000