FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY src ./src
COPY uploads ./uploads
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json

RUN yarn build
EXPOSE 3000

CMD ["yarn", "run", "start"]
