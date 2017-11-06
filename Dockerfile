FROM node:latest

MAINTAINER Luca De Feo

WORKDIR /srv
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY lib lib
COPY server.js server.js
COPY config.js config.js

RUN groupadd -r c2o2b && useradd -r -g c2o2b c2o2b
USER c2o2b

EXPOSE 8080
CMD ["npm", "start"]
