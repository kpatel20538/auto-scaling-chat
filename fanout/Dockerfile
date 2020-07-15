FROM node:lts-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY ./src ./src

EXPOSE 8080
CMD [ "npm", "start" ]
