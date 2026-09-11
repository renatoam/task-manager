FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app/

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY package*.json /app/

RUN npm install --only=production

COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public

EXPOSE 3000

CMD ["npm", "start"]
