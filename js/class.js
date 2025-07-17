import _ from 'lodash';

export const Player = (username, host, status) => {
    return {
        getUsername: () => username,
        getHost: () => host,
        getStatus: () => status,
    }
};

export const changePlayer = (username, isHost, status) => {
    return Player(username, isHost, status);
};

export const Game = () => {
    let players = [];
    let seed;

    return {
        addPlayer: (player) => {
            players.push(player);
        },
        getPlayer: (username) => {
            players.find(p => p.username !== username)
        },
        removePlayer: (player) => {
            players = players.filter(p => p.username !== player.username);
        }
    }
};
