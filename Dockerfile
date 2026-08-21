FROM node:22-alpine

RUN apk add --no-cache tzdata

ENV TZ=Asia/Dhaka

WORKDIR /app

COPY package*.json ./

# Build dependencies including Nest CLI
ENV NODE_ENV=development
RUN npm ci --include=dev

COPY . .

# Build NestJS
RUN npm run build

# Check build output
RUN echo "===== DIST =====" && find dist -type f

# Runtime
ENV NODE_ENV=production

EXPOSE 5004

CMD ["node", "dist/src/main.js"]