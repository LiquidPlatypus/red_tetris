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
    const players = new Map();

    return {
        getSeed: () => seed,
        addPlayer: (player) => {
            players.set(player.getId(), player);
        },
        getPlayer: (playerID) => {
            players.get(playerID);
        },
        removePlayer: (player) => {
            players.delete(player.getId());
        },
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

export const getGame = (seed) => {
    return games.get(seed);
};
