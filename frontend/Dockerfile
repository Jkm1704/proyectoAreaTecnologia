FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Arranca el servidor de desarrollo de Vite/React expuesto al contenedor
CMD ["npm", "run", "dev", "--", "--host"]