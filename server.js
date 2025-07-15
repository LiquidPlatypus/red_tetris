const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

const { Player, addPlayer, getPlayer, removePlayer } = require('./js/class.js');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('static'));

io.on('connection', (socket) => {
    console.log('Client join the game.');
    let instance_player;
    socket.on('messages', (msg) => {
        console.log(`Name get: ${msg}`);
        if (getPlayer(msg) === undefined)
            console.error("Name already exist");
        else {
            instance_player = Player(msg);
            addPlayer(instance_player);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client left the game.');
        removePlayer(instance_player);
    });
});

const HOSTURL = getLocalIP();
const HOST = '0.0.0.0';
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Listening on ${HOST}:${PORT}`);
    console.log(`URL : http://${HOSTURL}:${PORT}`);
});
