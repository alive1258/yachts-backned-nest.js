FROM node:22-alpine

RUN apk add --no-cache tzdata

ENV TZ=Asia/Dhaka

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx nest --version

RUN npm run build

RUN echo "===== DIST =====" && find dist -type f

EXPOSE 5004

CMD ["node", "dist/src/main.js"]
