FROM node:12.18.2

RUN mkdir /app

WORKDIR /app

COPY package.json /app/package.json

COPY yarn.lock /app/yarn.lock

COPY .envrc /app/envrc

RUN yarn install

RUN yarn global add express
RUN yarn add bcrypt

COPY . /app

RUN touch /app/.aptible.env

ENV NODE_ENV=$production
ENV TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID
ENV TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN
ENV TWILIO_PHONE_NUMBER=$TWILIO_PHONE_NUMBER
ENV ATLAS_URI=$ATLAS_URI
ENV JWT_SECRET=$secret


RUN set -a && . /app/.aptible.env && \
    yarn build


EXPOSE 3000


#Set commands
CMD ["yarn", "start"]