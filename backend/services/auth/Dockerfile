FROM node:22-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# Copy app
COPY . .

# Run migrations and generate at startup (when DB is ready)
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && npm start"]