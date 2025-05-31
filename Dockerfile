FROM node:18-alpine

WORKDIR /app

# Копируем package*.json из папки app
COPY app/package*.json ./

RUN npm install --production

# Копируем весь код из папки app
COPY app/. .

EXPOSE 3000

CMD ["node", "app.js"]