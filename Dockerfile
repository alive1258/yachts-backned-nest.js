FROM node:22-alpine

# Container clock — alpine has no zone data by default, so a bare TZ env var
# would silently fall back to UTC and shift every saved timestamp
RUN apk add --no-cache tzdata
ENV TZ=Asia/Dhaka

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# FORCE build log show
RUN npm run build

# VERIFY dist exists
RUN echo "===== DIST =====" && find dist -type f

EXPOSE 5004

CMD ["node", "dist/src/main.js"]
