FROM node:22-slim

# Instalación de dependencias del sistema necesarias para Chromium
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  netcat-openbsd \
  xdg-utils \
  wget \
  tzdata \
  --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

#RUN apk add --no-cache tzdata

ENV TZ=America/Guatemala

RUN cp /usr/share/zoneinfo/America/Guatemala /etc/localtime && echo "America/Guatemala" > /etc/timezone
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start"]



