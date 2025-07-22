FROM node:22.15.1-alpine AS builder

WORKDIR /usr/src/server
COPY  ./package*.json ./
COPY  ./yarn.lock ./
RUN yarn install
COPY . .

ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
EXPOSE 4030
CMD ["yarn", "start:app"]
