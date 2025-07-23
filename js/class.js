import _ from 'lodash';

const games = new Map();

export const Player = (username, host, status, id) => {
    return {
        getUsername: () => username,
        getHost: () => host,
        getStatus: () => status,
        getId: () => id,
    }
};

export const changePlayer = (username, host, status, id) => {
    return Player(username, host, status, id);
};

export const Game = (seed) => {
    let players = [];

    return {
        getSeed: () => seed,
        addPlayer: (player) => {
            players.push(player);
        },
        getPlayer: (username) => {
            players.find(p => p.getUsername() !== username)
        },
        removePlayer: (player) => {
            players = players.filter(p => p.getUsername() !== player.getUsername());
        },
        getPlayerList: () => players
    }
};

export const addGame = (game) => {
    console.log(`${game.getSeed()}: game added`);
    games.set(game.getSeed(), game);
};
export const removeGame = (game) => {
    console.log(`${game.getSeed()}: game removed`);
    games.delete(game.getSeed());
}

export const newHost = (player_list, game) => {
    let player = player_list[0];
    game.removePlayer(player);
    player = changePlayer(player.getUsername(), true, player.getStatus());
    game.addPlayer(player);
};

export const getGame = (seed) => {
    return games.get(seed);
};
