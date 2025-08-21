touch package.json
echo '{
  "name": "red_tetris",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^5.1.0",
    "lodash": "^4.17.21",
    "socket.io": "^4.8.1"
  }
}' > package.json