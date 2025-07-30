const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const path = require('path');

const { Player, Game, changePlayer, getGame, addGame, removeGame } = require('./js/class.js');

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
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
}); // A REMETTRE PAR DEFAUT !!!!!!!!!!!!!!

app.use(express.static('frontend/dist'));
app.get('/:room', (req, res) => {
  res.redirect('/');
});
app.get('/:room/:username', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

io.on('connection', (socket) => {
    console.log('Client join the game.');
    let instance_player = Player('', false, false, socket.id);
    let instance_game = Game('');

    // client click on create-game btn
    socket.on('create-lobby', (username) => {
        let seed = username + '_room';
        if (getGame(seed) === undefined) {
            instance_game = Game(seed);
            addGame(instance_game);
            instance_player = changePlayer(username, true, true, instance_player.getId());
            console.log(`${seed} created !`);
            socket.emit('lobby-join', seed);
        } else {
            socket.emit('error', 'username already exist');
        }
    });

    socket.on('join-user', ({ seed, username }) => {
        instance_game = getGame(seed);
        if (instance_game !== undefined) {
            instance_player = changePlayer(username, false, true, socket.id);
            io.to(`${seed}`).emit('client-join', instance_player.getUsername());
            socket.join(`${seed}`);
            instance_game.addPlayer(instance_player);
        } else {
            socket.emit('error', 'game not exist');
        }
    });


    socket.on('join-game', (seed) => {
        io.to(`${seed}`).emit('client-join', instance_player.getUsername());
        socket.join(`${seed}`);
        instance_game.addPlayer(instance_player);
    });

    socket.on('launch-game', (seed) => {
        if (instance_player.getHost() === true) {
            io.to(`${seed}`).emit('launch-game');
            console.log(`${seed} game launched now !`);
        }
    });

    socket.on('refreshme', () => {
        new_player = instance_game.getPlayer(instance_player.getId());
        instance_player = new_player;
    });
    socket.on('disconnect', () => {
        console.log('Client left the game.');
        if (instance_game.getSeed() !== '') {
            instance_game.removePlayer(instance_player);
            const player_list = instance_game.getPlayerList();
            if (player_list.size === 0)
                removeGame(instance_game);
            else if (instance_player.getHost() === true) {
                const element = player_list.values().next().value;
                instance_game.removePlayer(element);
                const new_host = Player(element.getUsername(), true, true, element.getId());
                instance_game.addPlayer(new_host);
                io.to(element.getId()).emit('refresh-player');
            }
        }
    });
});

const HOSTURL = getLocalIP();
const HOST = '0.0.0.0';
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`LOG : Listening on ${PORT}`);
    console.log(`URL : http://${HOSTURL}:${PORT}`);
});
