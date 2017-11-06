FROM node:latest

MAINTAINER Luca De Feo

WORKDIR /srv
COPY package.json package.json
RUN npm install
COPY lib lib
COPY server.js server.js
COPY config.js config.js

RUN groupadd -r s2o2b && useradd -r -g s2o2b s2o2b
USER s2o2b

EXPOSE 8080
CMD ["npm", "start"]
