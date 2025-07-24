const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const path = require('path');

const { Player, Game, changePlayer, getGame, removeGame, addGame } = require('./js/class.js');

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

app.use(express.static('frontend/dist'));
// app.get('/:room', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist/index.html'));
// });
// app.get('/:room/:username', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist/index.html'));
// });

io.on('connection', (socket) => {
    console.log('Client join the game.');
    let instance_player = Player('', false, false, socket.id);
    let instance_game = Game('');

    // client click on create-game btn
    socket.on('create-lobby', (username) => {
        // NEED PARSING ON USERNAME
        console.log('ERE');
        let seed = username + '_room';
        instance_game = Game(seed);
        addGame(instance_game);
        instance_player = Player(username, false, false, instance_player.getId());
        console.log(`${seed} created !`);
        socket.emit('lobby-join', seed);
    });

    socket.on('join-game', (seed) => {
        io.to(`${seed}`).emit('client-join', instance_player.getUsername());
        socket.join(`${seed}`);
        instance_game.addPlayer(instance_player);
    });




    socket.on('disconnect', () => {
        console.log('Client left the game.');
    });
});

const HOSTURL = getLocalIP();
const HOST = '0.0.0.0';
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`LOG : Listening on ${PORT}`);
    console.log(`URL : http://${HOSTURL}:${PORT}`);
});
