const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

const { Player, Game, changePlayer } = require('./js/class.js');

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

let _games = [];

io.on('connection', (socket) => {
    console.log('Client join the game.');
    let instance_player = Player('', false, false);
    socket.on('name', (msg) => {
        if (msg !== '') {
            console.log(`+++ ${instance_player.getUsername()}`);
            instance_player = changePlayer(msg, true, true);
            console.log('---');
        }
    });
    
    socket.on('gameInfo', () => {
        console.log(`Send player info to ${instance_player.getUsername()}`);
        const objPlayer = {
            username: instance_player.getUsername(),
            host: instance_player.getHost(),
            status: instance_player.getStatus()
        };
        socket.emit('messageFromServer', objPlayer);
    });

    socket.on('disconnect', () => {
        console.log('Client left the game.');
        instance_player = null;
    });
});

const HOSTURL = getLocalIP();
const HOST = '0.0.0.0';
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Listening on ${HOST}:${PORT}`);
    console.log(`URL : http://${HOSTURL}:${PORT}`);
});
