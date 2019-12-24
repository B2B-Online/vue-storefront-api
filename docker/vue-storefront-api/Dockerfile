FROM node:10-alpine

ENV VS_ENV prod

WORKDIR /var/www

RUN apk add --no-cache curl git

COPY package.json ./

RUN apk add --no-cache --virtual .build-deps ca-certificates wget && \
    yarn install --no-cache && \
    apk del .build-deps

COPY docker/vue-storefront-api/vue-storefront-api.sh /usr/local/bin/

ADD config /var/www/config
COPY ecosystem.json /var/www/
ADD migrations /var/www/migrations
COPY package.json /var/www/
COPY babel.config.js /var/www/ 
COPY tsconfig.json /var/www/
COPY nodemon.json /var/www/
ADD scripts /var/www/scripts
ADD src /var/www/src
ADD var /var/www/var
CMD ["vue-storefront-api.sh"]
