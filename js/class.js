import _ from 'lodash';
const players = [];

export const Player = (username) => ({username});

export function addPlayer(player) {
    players.push(player);
} export function getPlayer(username) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].username === username)
            return players;
    }
    return undefined;
} export function removePlayer(player) {
    _.remove(players, n => n.username === player.username);
} export function changeUserName(new_username, player) {
    _.remove(players, n => n.username === player.username);
    addPlayer(Player(new_username));
}
