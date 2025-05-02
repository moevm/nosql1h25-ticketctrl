FROM node:18-alpine

WORKDIR /app

# Копируем только файлы, необходимые для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем остальные файлы проекта
COPY . .

# Убедимся, что порт доступен
EXPOSE 3000

# Запускаем приложение
CMD ["node", "app.js"]