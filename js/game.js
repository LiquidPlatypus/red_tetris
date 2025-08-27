import {
	canPlacePieceAt,
	calculateGridAfterLocking,
	calculateVisualGrid,
	calculateNextPieceGrid,
	attemptMove,
	attemptRotation,
	attemptHardDrop
} from "./logic.js";

import {
	TETROMINOS,
	refillBag
} from './class.js';

const ROWS = 20;
const COLS = 10;

function addLines(instance_game, instance_player) {
	const grid_list = instance_game.getGridList(instance_player);
	for (const grid of grid_list.values()) {
		grid.shift();
		grid.push(Array(COLS).fill("stone"));
	}
}

export function gameLogic(socket, instance_player, instance_game, random) {
	
	// INIT PART

	let isGameRunning = false;
	let gameOver = false;
	let lines = 0;
	let intervalId = null;
	let grids;

	// Piece:
	let activePiece = null;
	let nextPiece = getNextTetromino();
	socket.emit('flattenedNextPiece', getNextGrid().flat());

	let permanentGrid = Array.from({ length: ROWS }, () => Array(COLS).fill("empty"));
	instance_game.addGrid(instance_player, permanentGrid);

	function getVisualGrid() {
		return calculateVisualGrid(permanentGrid, activePiece);
	}

	function getNextGrid() {
		return calculateNextPieceGrid(nextPiece, 4);
	}

	function getNextTetromino() {
		const bag = instance_player.getBag();
		if (bag.length === 0)
			refillBag(bag, random);
		const index = bag.shift();
		const tetromino = TETROMINOS[index];
		return ({
			shape: tetromino.getShape().map(row =>
				row.map(cell => (cell ? tetromino.getColor() : "empty"))),
			x: tetromino.getX(),
			y: tetromino.getY(),
			color: tetromino.getColor(),
		});
	}

	function handleMovePiece(dx, dy) {
		if (!activePiece)
			return false;

		const moveResult = attemptMove(
			activePiece,
			permanentGrid,
			dx, dy,
			ROWS, COLS
		);

		if (moveResult.success) {
			activePiece = moveResult.newPiece;
			socket.emit('flattenedGrid', getVisualGrid().flat());
			return true;
		}
		return false;
	}

	function handleRotatePiece() {
		if (!activePiece)
			return false;

		const rotationResult = attemptRotation(
			activePiece,
			permanentGrid,
			ROWS, COLS
		);

		if (rotationResult.success) {
			activePiece = rotationResult.newPiece;
			socket.emit('flattenedGrid', getVisualGrid().flat());
		}
	}

	function handleHardDrop() {
		if (!activePiece)
			return false;

		const droppedPiece = attemptHardDrop(
			activePiece,
			permanentGrid,
			ROWS, COLS
		);

		if (droppedPiece.success) {
			activePiece = droppedPiece.newPiece;
			handleLockPiece();
			return true;
		}
		return false;
	}

	function spawnNewPiece() {
		if (!activePiece)
			return;

		const canSpawn = canPlacePieceAt(
			activePiece,
			permanentGrid,
			ROWS, COLS
		);

		if (!canSpawn) {
			gameOver = true;
			socket.emit('getGameOver', gameOver);
			stopGame();
		}
	}

	function handleLockPiece() {
		if (!activePiece)
			return;

		const { newGrid, linesCleared } = calculateGridAfterLocking(
			permanentGrid,
			activePiece,
			ROWS, COLS,
			lines
		);

		permanentGrid = newGrid;
		instance_game.addGrid(instance_player, permanentGrid);

		if (linesCleared > lines)
			addLines(instance_game, instance_player);
		lines = linesCleared;
		socket.emit('getLines', lines);

		activePiece = nextPiece;
		socket.emit('flattenedGrid', getVisualGrid().flat());
		nextPiece = getNextTetromino();
		socket.emit('flattenedNextPiece', getNextGrid().flat());

		if (linesCleared > 0)
			startInterval();

		spawnNewPiece();
	}

	function tick() {
		const moved = handleMovePiece(0, 1);

		if (!moved)
			handleLockPiece();

		socket.emit('flattenedGrid', getVisualGrid().flat());
	}

	function getIntervalDelay() {
		const baseSpeed = 500;
		const speedUp = Math.floor(lines / 10) * 50;
		return Math.max(baseSpeed - speedUp, 100);
	}

	function startInterval() {
		if (intervalId !== null)
			clearInterval(intervalId);
		intervalId = setInterval(() => {
			tick();
		}, getIntervalDelay());
	}

	function stopGame() {
		if (!isGameRunning) return;
		isGameRunning = false;
		socket.emit('getGameRunning', isGameRunning);
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}

		if (gameOver) {
			lines = 0;
			gameOver = false;
			permanentGrid = Array(COLS).fill("empty");
			instance_game.removeGrid(instance_player);
			socket.emit('getGameOver', gameOver);
		}
	}

	function startGame() {
		// LAUNCH PART
		if (isGameRunning)
			return;
		isGameRunning = true;
		activePiece = nextPiece;
		socket.emit('flattenedGrid', getVisualGrid().flat());
		nextPiece = getNextTetromino();
		socket.emit('flattenedNextPiece', getNextGrid().flat());
		socket.emit('getGameRunning', isGameRunning);
		startInterval();
	}

	return {
		handleMovePiece,
		handleHardDrop,
		handleRotatePiece,
		getVisualGrid,
		getNextGrid,
		startGame,
		stopGame,
	};
}
