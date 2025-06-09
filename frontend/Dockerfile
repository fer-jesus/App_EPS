FROM node:22-alpine3.21

RUN apk add --no-cache tzdata

ENV TZ="America/Guatemala"

#RUN cp /usr/share/zoneinfo/America/Guatemala /etc/localtime && echo "America/Guatemala" > /etc/timezone

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

