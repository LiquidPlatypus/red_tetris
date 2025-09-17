echo '{
  "name": "red_tetris",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "test": "NODE_OPTIONS='--experimental-vm-modules --no-warnings' jest --coverage",
    "test:watch": "NODE_OPTIONS='--experimental-vm-modules --no-warnings' jest --watch",
    "start": "node server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^5.1.0",
    "lodash": "^4.17.21",
    "socket.io": "^4.8.1"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "babel-jest": "^29.7.0",
    "jest": "^30.1.3",
    "socket.io-client": "^4.8.1",
    "supertest": "^7.1.4"
  }
}' > package.json