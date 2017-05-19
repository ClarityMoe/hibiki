FROM node:latest

RUN mkdir -p /usr/src/hibiki
WORKDIR /usr/src/hibiki

COPY package.json /usr/src/hibiki
RUN npm install

COPY . /usr/src/hibiki

CMD [ "npm", "test" ]