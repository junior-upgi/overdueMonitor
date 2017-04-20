# project boilerplate

> bootstrap, vue.js and express.js

## Build Setup

``` bash
# setup server port
1. modify src/backend/serverConfig.js
2. modify src/frontend/clientConfig.js
3. most of all other configuration or utility functions are commented out, reverted as needed

# install dependencies
npm install
bower install

# start development server with hot reload at localhost:xxxx
npm run start:dev:server (both node.js server and the browser client should start automatically)

# start production server at upgi.ddns.net:xxxx
1. modify src/backend/serverConfig.js (const development = false;)
2. modify src/frontend/clientConfig.js (const development = false;)
npm run production:build (only the server is starting on nodemon, browser client should connect from http://upgi.ddns.net:9006/rawMaterial/index.html)
