FROM node:12.20

RUN mkdir /app
WORKDIR /app

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN yarn install --frozen-lockfile

COPY . /app

ENV NODE_ENV=production

RUN yarn build

EXPOSE 3000
CMD ["node", "build/src/index.js"]