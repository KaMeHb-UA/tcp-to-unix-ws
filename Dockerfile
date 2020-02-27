FROM node:alpine

COPY . /app

WORKDIR /app

RUN yarn

ENTRYPOINT [ "yarn", "start" ]
