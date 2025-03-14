FROM node:20-alpine

LABEL org.opencontainers.image.source=https://github.com/ProbablePrime/vr-voting-server
LABEL org.opencontainers.image.description="vr-voting-server"
LABEL org.opencontainers.image.licenses=MIT

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "node", "src/index.js" ]
