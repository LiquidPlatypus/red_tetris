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

export function gameLogic(socket, instance_player, instance_game, random) {
	
	// INIT PART
	const ROWS = 20;
	const COLS = 10;

	let isGameRunning = false;
	let gameOver = false;
	let lines = 0;
	let intervalId = null;
	let grids;

	// Piece:
	let activePiece = null;
	let nextPiece = getNextTetromino();
	getFlatNextGrid();

	let permanentGrid = Array.from({ length: ROWS }, () => Array(COLS).fill("empty"));
	instance_game.addGrid(instance_player, permanentGrid);

	function getVisualGrid() {
		return calculateVisualGrid(permanentGrid, activePiece);
	}

	function getNextGrid() {
		return calculateNextPieceGrid(nextPiece, 4);
	}
	function getFlatNextGrid() {
		const debug = getNextGrid();
		console.log(debug);
		socket.emit('flattenedNextPiece', debug);
	}

	function getNextTetromino() {
		const bag = instance_player.getBag();
		if (bag.length === 0)
			refillBag(bag, random);
		const index = bag.shift();
		const tetromino = TETROMINOS[index];
		return ({
			shape: tetromino.getShape(),
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

		if (rotationResult.success)
			activePiece = rotationResult.newPiece;
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

		lines = linesCleared;
		socket.emit('getLines', lines);

		activePiece = nextPiece;
		nextPiece = getNextTetromino();
		getFlatNextGrid();

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
			socket.emit('getGameOver', gameOver);
		}
	}

	function startGame() {
		// LAUNCH PART
		if (isGameRunning)
			return;
		isGameRunning = true;
		activePiece = nextPiece;
		nextPiece = getNextTetromino();
		getFlatNextGrid();
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
