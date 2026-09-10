FROM node:22-alpine

# Instalar herramientas para compilar dependencias nativas
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente y generar cliente Prisma
COPY . .
RUN npx prisma generate

EXPOSE 5000

# Aplicar base de datos y arrancar servidor
CMD ["sh", "-c", "npx prisma db push && node server.js"]