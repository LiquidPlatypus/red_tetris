const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('static'));

io.on('connection', (socket) => {
    console.log('Client join the game.');

    socket.on('disconnect', () => {
        console.log('Client left the game.');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
