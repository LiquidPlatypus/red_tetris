import _ from 'lodash';

let games = [];

export const Player = (username, host, status) => {
    return {
        getUsername: () => username,
        getHost: () => host,
        getStatus: () => status,
    }
};

export const changePlayer = (username, host, status) => {
    return Player(username, host, status);
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
    games.push(game);
};
export const removeGame = (game) => {
    console.log(`${game.getSeed()}: game removed`);
    games = games.filter(g => g.getSeed() !== game.getSeed());
}

export const newHost = (player_list, game) => {
    let player = player_list[0];
    game.removePlayer(player);
    player = changePlayer(player.getUsername(), true, player.getStatus());
    game.addPlayer(player);
};

export const getGame = (seed) => {
    let instance = games.find(g => g.getSeed() === seed);
    if (instance)
        return instance;
    else
        return undefined;
};
