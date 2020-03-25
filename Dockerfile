# base image
FROM node:12.2.0-alpine

# set working directory
WORKDIR /server

# add `/server/node_modules/.bin` to $PATH
ENV PATH /server/node_modules/.bin:$PATH

# install and cache server dependencies
COPY package.json /server/package.json
RUN npm install
RUN npm install react-scripts@3.0.1 -g

# start server
CMD ["npm", "start"]

COPY . .