FROM node:9

MAINTAINER Luca De Feo

USER node
WORKDIR /home/node

COPY . . 
RUN npm install

ENV PORT=38080
EXPOSE 38080

CMD ["npm", "start"]
