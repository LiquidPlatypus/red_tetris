import express from'express';
import http from'http';
import { Server } from'socket.io';
import os from'os';
import path from'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HOSTURL = getLocalIP();
const HOST = '0.0.0.0';
const PORT = 3000;

import { 
    Player,
    Game,
    getGame,
    addGame,
    removeGame,
    createSeededRandom,
} from './js/class.js';
import {
    gameLogic
} from './js/game.js';

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
	    instance_game.removeRank(instance_player);
        instance_game.removePlayer(instance_player);
        instance_game.removeGrid(instance_player);
        const player_list = instance_game.getPlayerList();
        io.to(`${instance_game.getSeed()}`).emit('server-log', `${instance_player.getUsername()} left the game !`);
        instance_game.setReady(instance_game.getReady() - 1);
        if (player_list.size === 0)
            removeGame(instance_game.getSeed());
        else if (instance_player.getHost() === true) {
            const element = player_list.values().next().value;
            instance_game.removePlayer(element);
            const new_host = new Player(element.getUsername(), true, true, element.getId());
            instance_game.addPlayer(new_host);
            io.to(element.getId()).emit('refresh-player');
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
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});
app.get('/:room/:username', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});
app.get('*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

io.on('connection', (socket) => {
    let instance_player = new Player('', false, false, socket.id);
    let instance_game = new Game('');
    let random;
    let game;

    // client click on create-game button :
    socket.on('create-lobby', (username) => {
        let seed = username + '_room';
        if (getGame(seed) === undefined) {
            instance_game = new Game(seed);
            addGame(instance_game);
            if (username.length > 12) username = username.substring(0, 12);
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
        else if (!instance_game.getPlayer(instance_player.getId()) && instance_game.getPlayerCount() === 5)
            socket.emit('error', 'Lobby full');
        else if (instance_game.getCurrent() === false) {
            for (const playerId of instance_game.getPlayerList().keys()) {
                if (instance_game.getPlayer(playerId).getUsername() === username && playerId !== instance_player.getId())  {
                    socket.emit('go-to', `/${instance_game.getSeed()}`, 'This username already taked');
                    return;
                }
            }
            if (username.length > 12) username = username.substring(0, 12);
            random = createSeededRandom(instance_game.getInteger());
            instance_player = new Player(username, instance_player.getHost(), true, instance_player.getId());
            instance_game.setReady();
            io.to(`${seed}`).emit('server-log', `${instance_player.getUsername()} join the game !`);
            socket.join(`${seed}`);
            instance_game.addPlayer(instance_player);
            game = gameLogic(socket, instance_player, instance_game, random);
        } else {
            socket.emit('error', 'La partie est en cours chef !')
        }
    });

    /// GAME SERVER INFO

    // Getter and Setter
    socket.on('input', (key) => {
        if (game) {
            if (key === "ArrowLeft") { game.handleMovePiece(-1, 0); }
            else if (key === "ArrowRight") { game.handleMovePiece(1, 0); }
            else if (key === "ArrowDown") { game.handleMovePiece(0, 1); }
            else if (key === "ArrowUp") { game.handleRotatePiece(); }
            else if (key === "Space") { game.handleHardDrop(); }
        }
    });
    socket.on('get-grids', () => {
        if (instance_game) {
            const grids = instance_game.getGridList(instance_player);
            const grid_list = Array.from(grids.entries())
                .filter(([playerId, grid]) => instance_game.getPlayer(playerId))
                .map(([playerId, grid]) => {
                    const player = instance_game.getPlayer(playerId);
                    return {
                        grid,
                        username: player.getUsername(),
                        status: player.getStatus(),
                    };
                });
            socket.emit('grids', grid_list);
        }
    });

    socket.on('ask-server', (signal) => {
        if (signal === 'game-exist') {
            if (instance_game && instance_game.getSeed() === '')
                socket.emit(`response:${signal}`, false);
            else
                socket.emit(`response:${signal}`, true);
        }
        if (instance_game && instance_player && signal === `/${instance_game.getSeed()}/${instance_player.getUsername()}`) {
            socket.emit(`response:${signal}`, true);
            return;
        }
        if (signal === 'get-username') {
            socket.emit(`response:${signal}`, instance_player.getUsername());
            return;
        }
        if (signal === 'start-game') {
            instance_game.setReady();
            if (instance_game.getReady() === instance_game.getPlayerCount() && instance_game.getSeed() !== '') {
                const delay = Date.now() + 3000;
                io.to(`${instance_game.getSeed()}`).emit('launch', delay);
                socket.emit(`response:${signal}`, true);
                return;
            }
            socket.emit(`response:${signal}`, false);
            return;
        }
        if (signal === 'init-grid' && game) {
            socket.emit(`flattenedGrid:${signal}`, game.getVisualGrid().flat());
            return;
        }
        if (signal === 'init-piece' && game) {
            socket.emit(`flattenedNextPiece:${signal}`, game.getNextGrid().flat());
            return;
        }
        if (signal === 'stop-game' && game) {
            game.stopGame();
            return;
        }
        if (signal === 'get-host' && game) {
            socket.emit('response:get-host', instance_player.getHost());
            return;
        }
	    if (signal === 'get-player-list' && instance_game && instance_game.getSeed() !== "") {
		    const playerList = instance_game.getPlayerList();
		    const serializerPlayerList = Array.from(playerList.entries())
			    .filter(([playerId, player]) => instance_game.getPlayer(playerId))
			    .map(([playerId, player]) => {
				    return {
					    player,
					    username: player.getUsername(),
					    status: player.getStatus(),
					    host: player.getHost(),
				    };
			    });
		    socket.emit('get-player-list', serializerPlayerList);
	    }
    });

    socket.on('launch', () => {
        if (instance_game && instance_player && instance_game.getSeed('')) {
            game.startGame();
        }
    });

    // when host click on launch game :
    socket.on('launch-game', (seed) => {
        if (instance_player.getHost() === true && instance_game.getReady() == instance_game.getPlayerCount()) {
            // console.log(`Host: ${instance_player.getHost()} // Ready: ${instance_game.getReady()}`);
            instance_game.setReady(0);
            io.to(`${seed}`).emit('launch-game');
            console.log(`${seed} game launched now !`);
            instance_game.setCurrent(true);
        }
    });

    //End game :
    socket.on('finish', (score) => {
        instance_player = new Player(instance_player.getUsername(), instance_player.getHost(), false, instance_player.getId());
        instance_game.rankPlayer(score, instance_player);
		let res = instance_game.gameStatus();
		if (res === true) {
            const rank = instance_game.getRank();
            const rank_list = Array.from(rank.entries()).map(([pID, pScore]) => ({
                score: pScore,
                username: instance_game.getPlayer(pID).getUsername(),
            }));
            io.to(`${instance_game.getSeed()}`).emit('rank', rank_list);
        }
		else if (res) {
			io.to(res).emit('getGameOver', true);
			game.stopGame();
		}
    });

    socket.on('return-lobby', () => {
        if (instance_game.getCurrent() === true) {
            instance_game.setReady(0);
            instance_game.setCurrent(false);
            instance_game.changeInteger();
        }
        instance_player = new Player(instance_player.getUsername(), instance_player.getHost(), true, instance_player.getId());
        instance_game.removeRank(instance_player);
        socket.emit('get-value', instance_game.getSeed(), instance_player.getUsername());
    });

    /// DISCONNECTION PART

    socket.on('return', () => {
        if (instance_game) {
            if (game)
                game.stopGame();
            clearPlayer(instance_game, instance_player);
            socket.leave(instance_game.getSeed());
            instance_player = new Player('', false, false, socket.id);
            instance_game = new Game('');
        }
    });
    socket.on('disconnect', () => {
        if (process.env.NODE_ENV === "test") return;
        if (instance_game && instance_player) {
            clearPlayer(instance_game, instance_player);
            socket.leave(instance_game.getSeed());
            instance_player = new Player('', false, false, socket.id);
            instance_game = new Game('');
        }
    });
    socket.on('refreshme', () => {
        if (instance_game) {
            const new_player = instance_game.getPlayer(instance_player.getId());
            instance_player = new_player;
        }
    });
});

if (process.env.NODE_ENV !== "test") {
    server.listen(PORT, () => {
        console.log(`LOG : Listening on ${PORT}`);
        console.log(`URL : http://${HOSTURL}:${PORT}`);
    });
}

export { app, server, io };
