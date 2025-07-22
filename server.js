const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const path = require('path');

const { Player, Game, changePlayer, getGame, removeGame, addGame, newHost } = require('./js/class.js');

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

app.get('/:room', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/index.html'));
});
app.get('/:room/:username', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/index.html'));
});

io.on('connection', (socket) => {
    console.log('Client join the game.');
    let instance_player = Player('', false, false);
    let instance_game = Game(undefined);
    socket.on('name', (msg) => {
        if (msg !== '') {
            instance_player = changePlayer(msg, false, false);
        }
    });

    socket.on('game-create', (seed) => {
        if (instance_player.getUsername() !== '') {
            console.log(`${instance_player.getUsername()} connected to the game !`);
            instance_player = changePlayer(instance_player.getUsername(), true, true);
            instance_game = Game(seed);
            addGame(instance_game);
            instance_game.addPlayer(instance_player);
            socket.emit('gameCreate', seed);
        }
    });

    socket.on('game-connect', (seed, username) => {
        instance_player = changePlayer(username, false, true);
        console.log(`${instance_player.getUsername()} connected to the game !`);
        instance_game = getGame(seed);
        if (!instance_game) {
            instance_player = changePlayer(instance_player.getUsername(), true, true);
            instance_game = Game(seed);
            addGame(instance_game);
        }
        instance_game.addPlayer(instance_player);
        socket.emit('gameCreate', seed);
    });

    socket.on('gameInfo', () => {
        console.log(`Send player info to ${instance_player.getUsername()}`);
        const objPlayer = {
            username: instance_player.getUsername(),
            status: instance_player.getStatus(),
            host: instance_player.getHost(),
            seed: instance_game.getSeed(),
            count: instance_game.getPlayerList().length
        };
        socket.emit('messageFromServer', objPlayer);
    });

    socket.on('disconnect', () => {
        console.log('Client left the game.');
        if (instance_game) {
            instance_game.removePlayer(instance_player);
            instance_player = changePlayer(instance_player.getUsername(), false, false);
            if (instance_game.getPlayerList().length !== 0)
                newHost(instance_game.getPlayerList(), instance_game);
            else
                removeGame(instance_game);
        }
        instance_game = null;
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
