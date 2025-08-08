import _ from 'lodash';

const games = new Map();

/// PLAYER

export class Player {
constructor(username, host, status, id) {
	const data = { username, host, status, id };

	const instance = {
	getUsername: () => data.username,
	getHost: () => data.host,
	getStatus: () => data.status,
	getId: () => data.id
	};

	return instance;
}
}

/// PIECE

// Objet piece
export class Piece {
constructor(shape, color, x = 4, y = 0) {
	// Deep copy + freeze each row of the shape
	const safeShape = Object.freeze(
		shape.map(row => Object.freeze([...row]))
	);
	const data = Object.freeze({ shape: safeShape, color, x, y });

	const instance = {
	getShape: () => data.shape,
	getColor: () => data.color,
	getX: () => data.x,
	getY: () => data.y,
	};

	return instance;
}
}

// Array of objet piece (freeze for immutable)
export const TETROMINOS = Object.freeze([
new Piece(
	[
	[0, 0, 0, 0],
	[1, 1, 1, 1],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	],
	"block-I"
),
new Piece(
	[
	[1, 0, 0],
	[1, 1, 1],
	[0, 0, 0],
	],
	"block-J"
),
new Piece(
	[
	[0, 0, 1],
	[1, 1, 1],
	[0, 0, 0],
	],
	"block-L"
),
new Piece(
	[
	[1, 1],
	[1, 1],
	],
	"block-O"
),
new Piece(
	[
	[0, 1, 1],
	[1, 1, 0],
	[0, 0, 0],
	],
	"block-S"
),
new Piece(
	[
	[0, 1, 0],
	[1, 1, 1],
	[0, 0, 0],
	],
	"block-T"
),
new Piece(
	[
	[1, 1, 0],
	[0, 1, 1],
	[0, 0, 0],
	],
	"block-Z"
),
]);

export function createSeededRandom(seed) {
	let state = seed;
	return function () {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
}
export function refillBag(bag, random) {
	const indices = [...Array(TETROMINOS.length).keys()];
	for (let i = indices.length -1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[indices[i], indices[j]] = [indices[j], indices[i]];
	}
	bag.push(...indices);
}

/// GAME

function getRandomInt(max = Number.MAX_SAFE_INTEGER) {
return Math.floor(Math.random() * Math.min(max, Number.MAX_SAFE_INTEGER));
}

export class Game {
	constructor(seed) {
		const players = new Map();
		const ranking = new Map();
		const grids = new Map();
		const integer = getRandomInt();

		const instance = {
			getSeed: () => seed,
			addPlayer: (player) => {
				players.set(player.getId(), player);
			},
			getPlayer: (playerID) => {
				return players.get(playerID);
			},
			removePlayer: (player) => {
				players.delete(player.getId());
			},
			getPlayerList: () => players,
			getInteger: () => integer,
			rankPlayer: (score, player) => {
				players.delete(player.getId());
				players.set(player.getId(), player);
				ranking.set(score, player);
			},
			getRank: () => ranking,
			gameStatus: () => {
				for (const value of players.values()) {
					if (value.getStatus() == true)
						return true;
				}
				return false;
			},
			getGridList: (except_player = undefined) => {
				if (except_player !== undefined) {
					return new Map( [...grids.entries()].filter(([, value]) => value.getId() !== except_player.getId()) );
				} else {
					return grids;
				}
			},
			addGrid: (player, grid) => {
				grids.delete(grid);
				grids.set(grid, player);
			},
		};

		return instance;
	}
};

//   return new Map(
//     [...myMap.entries()].filter(([key, value]) => key !== keyToRemove)
//   );

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
