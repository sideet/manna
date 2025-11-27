# syntax=docker/dockerfile:1
FROM node:22.15.1-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
RUN npx prisma generate --config=prisma.config.ts        
RUN yarn build             

FROM node:22.15.1-alpine AS prod-deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

FROM node:22.15.1-alpine
WORKDIR /app
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 4030
CMD ["node", "dist/main.js"]
