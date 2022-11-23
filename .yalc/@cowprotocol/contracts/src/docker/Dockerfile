FROM node:14-alpine3.13

# Create app directory
WORKDIR /usr/src/app/

COPY . .

RUN apk add --no-cache tini git python3 linux-headers eudev-dev libusb-dev build-base
# Tini is now available at /sbin/tini

RUN yarn install --frozen
RUN yarn build

# Run Node app as child of tini
# Signal handling for PID1 https://github.com/krallin/tini
ENTRYPOINT ["/sbin/tini", "--"]
