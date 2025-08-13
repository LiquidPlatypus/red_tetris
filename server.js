const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const path = require('path');

const { Player, Game, getGame, addGame, removeGame, TETROMINOS, Piece, createSeededRandom, refillBag  } = require('./js/class.js');

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
function clearPlayer(instance_game, instance_player) {
    if (instance_game && instance_game.getSeed() !== '') {
        instance_game.removePlayer(instance_player);
        const player_list = instance_game.getPlayerList();
        io.to(`${instance_game.getSeed()}`).emit('server-log', `${instance_player.getUsername()} left the game !`);
        if (player_list.size === 0)
            removeGame(instance_game);
        else if (instance_player.getHost() === true) {
            const element = player_list.values().next().value;
            instance_game.removePlayer(element);
            const new_host = new Player(element.getUsername(), true, true, element.getId());
            instance_game.addPlayer(new_host);
            io.to(element.getId()).emit('refresh-player'); // If new host defined, refresh his status on his side
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
    let instance_player = new Player('', false, false, socket.id);
    let instance_game = new Game('');
    const bag = [];
    let random; // mettre le createSeededRandom chelou ici pour TEST l'erreur avec random

    // client click on create-game button :
    socket.on('create-lobby', (username) => {
        let seed = username + '_room';
        if (getGame(seed) === undefined) {
            instance_game = new Game(seed);
            addGame(instance_game);
            instance_player = new Player(username, true, true, instance_player.getId());
            console.log(`${seed} created !`);
            socket.emit('lobby-join', {
                Seed: seed,
                Username: username,
            });
        } else {
            socket.emit('error', 'username already exist');
        }
    });

    // if client join with /room_name/username :
    socket.on('join-user', ({ seed, username }) => {
        instance_game = getGame(seed);
        if (!instance_game)
            socket.emit('error', 'Game not exist');
        else if (instance_game.getCurrent() === false) {
            random = createSeededRandom(instance_game.getInteger());
            if (instance_player && instance_player.getUsername() === '')
                instance_player = new Player(username, false, true, socket.id);
            io.to(`${seed}`).emit('server-log', `${instance_player.getUsername()} join the game !`);
            socket.join(`${seed}`);
            instance_game.addPlayer(instance_player);
        } else {
            socket.emit('error', 'La partie est en cours chef !')
        }
    });

    /// GAME SERVER INFO    

    // Getter and Setter
    socket.on('get-piece', () => {
        if (instance_game) {
            if (bag.length === 0) {
                refillBag(bag, random);
            }
            const index = bag.shift();
            const tetromino = TETROMINOS[index];
            socket.emit('piece', {
                shape: tetromino.getShape(),
                x: tetromino.getX(),
                y: tetromino.getY(),
                color: tetromino.getColor(),
            });
        } else {
            socket.emit('error', 'game not exist');
        }
    });
    socket.on('grid', (value) => {
        if (instance_game) {
            instance_game.addGrid(instance_player, value);
        } else {
            socket.emit('error', 'game not exist');
        }
    });
    socket.on('get-grids', () => {
        if (instance_game) {
            const grids = instance_game.getGridList(instance_player);
            const grid_list = Array.from(grids.entries()).map(([grid, player]) => ({
                grid: grid,
                username: player.getUsername(),
                status: player.getStatus(),
            }));
            socket.emit('grids', grid_list);
        }
    });

    socket.on('ask-server', (signal) => {
        if (signal === 'game-exist') {
            if (instance_game && instance_game.getSeed() === '')
                socket.emit('response', false);
            else
                socket.emit('response', true);
        }
        if (signal === `/${instance_game.getSeed()}/${instance_player.getUsername()}`) {
            socket.emit('response', true);
            return;
        }
        if (signal === 'get-username') {
            socket.emit('response', instance_player.getUsername());
            return;
        }
        if (signal === 'line-complete') {}
    });

    // when host click on launch game :
    socket.on('launch-game', (seed) => {
        if (instance_player.getHost() === true) {
            io.to(`${seed}`).emit('launch-game');
            console.log(`${seed} game launched now !`);
            instance_game.setCurrent(true);
        }
    });

    //End game :
    socket.on('finish', (score) => {
        instance_player = new Player(instance_player.getUsername(), instance_player.getHost(), false, instance_player.getId());
        instance_game.rankPlayer(score, instance_player);
        // if not the last to finish: don't send ending signal
        if (instance_game.gameStatus() === false) {
            const rank = instance_game.getRank();
            const rank_list = Array.from(rank.entries()).map(([pID, pScore]) => ({
                score: pScore,
                username: instance_game.getPlayer(pID).getUsername(),
            }));
            io.to(`${instance_game.getSeed()}`).emit('rank', rank_list);
        }
    });

    socket.on('return-lobby', () => {
        if (instance_game.getCurrent() === true)
            instance_game.setCurrent(false);
        instance_player = new Player(instance_player.getUsername(), instance_player.getHost(), true, instance_player.getId());
        instance_game.removeRank(instance_player);
        socket.emit('get-value', instance_game.getSeed(), instance_player.getUsername());
    });

    /// DISCONNECTION PART

    socket.on('return', () => {
        if (instance_game) {
            clearPlayer(instance_game, instance_player);
            socket.leave(instance_game.getSeed());
            instance_player = new Player('', false, false, socket.id);
            instance_game = new Game('');
        }
    });
    socket.on('disconnect', () => {
        if (instance_game && instance_player) {
            clearPlayer(instance_game, instance_player);
            socket.leave(instance_game.getSeed());
            instance_player = new Player('', false, false, socket.id);
            instance_game = new Game('');
        }
    });
    socket.on('refreshme', () => {
        if (instance_game) {
            new_player = instance_game.getPlayer(instance_player.getId());
            console.log(new_player.getUsername());
            instance_player = new_player;
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
