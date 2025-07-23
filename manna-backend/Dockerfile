FROM node:22.15.1-alpine AS builder

WORKDIR /usr/src/server
COPY  ./package*.json ./
COPY  ./yarn.lock ./
RUN yarn install
COPY . .

# Prisma generate: @prisma/client 생성
RUN npx prisma generate

# 빌드
RUN yarn build  

ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
EXPOSE 4030
CMD ["yarn", "start:app"]
