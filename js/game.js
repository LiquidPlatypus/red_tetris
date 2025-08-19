import {ref, computed} from "vue";
import {
	canPlacePieceAt,
	calculateGridAfterLocking,
	calculateVisualGrid,
	calculateNextPieceGrid,
	attemptMove,
	attemptRotation,
	attemptHardDrop
} from "./logic.js";
import { refillBag } from "./class.js";

const {
	Player,
	Game,
	getGame,
	addGame,
	removeGame,
	TETROMINOS,
	Piece,
	createSeededRandom,
	refillBag 
} = require('./js/class.js');

export function startGame(socket, instance_player, instance_game, random) {
	
	// INIT PART
	const ROWS = 20;
	const COLS = 10;

	isGameRunning = false;
	gameOver = false;
	lines = 0;
	intervalId = null;

	// Piece:
	activePiece = null;
	nextPiece = null;

	const permanentGrid = ref(Array.from({ length: ROWS }, () => Array(COLS).fill("empty")));
	instance_game.addGrid(instance_player, permanentGrid.value);

	function getVisualGrid() {
		return calculateVisualGrid(permanentGrid, activePiece);
	}
	function getFlattenedGrid() {
		return getVisualGrid().flat();
	}

	function getNextGrid() {
		return calculateNextPieceGrid(nextPiece.value, 5);
	}
	function getFlattenedNextPiece() {
		return getNextGrid().flat();
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
		if (!activePiece.value)
			return false;

		const moveResult = attemptMove(
			activePiece.value,
			permanentGrid.value,
			dx, dy,
			ROWS, COLS
		);

		if (moveResult.success) {
			activePiece.value = moveResult.newPiece;
			return true;
		}
		return false;
	}

	function handleRotatePiece() {
		if (!activePiece.value)
			return false;

		const rotationResult = attemptRotation(
			activePiece.value,
			permanentGrid.value,
			ROWS, COLS
		);

		if (rotationResult.success)
			activePiece.value = rotationResult.newPiece;
	}

	function handleHardDrop() {
		if (!activePiece.value)
			return false;

		const droppedPiece = attemptHardDrop(
			activePiece.value,
			permanentGrid.value,
			ROWS, COLS
		);

		if (droppedPiece.success) {
			activePiece.value = droppedPiece.newPiece;
			handleLockPiece();
			return true;
		}
		return false;
	}

	function handleLockPiece() {
		if (!activePiece.value)
			return;

		const { newGrid, linesCleared } = calculateGridAfterLocking(
			permanentGrid.value,
			activePiece.value,
			ROWS, COLS,
			lines.value
		);

		permanentGrid.value = newGrid;
		instance_game.addGrid(instance_player, permanentGrid.value);

		lines.value = linesCleared;

		activePiece.value = nextPiece.value;
		nextPiece.value = getNextTetromino();

		if (linesCleared > 0)
			startInterval();

		spawnNewPiece();
	}

	function spawnNewPiece() {
		if (!activePiece.value)
			return;

		const canSpawn = canPlacePieceAt(
			activePiece.value,
			permanentGrid.value,
			ROWS, COLS
		);

		if (!canSpawn) {
			gameOver.value = true;
			stopGame();
		}
	}

	/// A VOIR COMMENT ON GERE APRES
	function handleKeyPress(e) {
		if (e === "ArrowLeft") handleMovePiece(-1, 0);
			else if (e === "ArrowRight") handleMovePiece(1, 0);
			else if (e === "ArrowDown") handleMovePiece(0, 1);
			else if (e === "ArrowUp") handleRotatePiece();
			else if (e === "Space") handleHardDrop();
	}

	function tick() {
		const moved = handleMovePiece(0, 1);

		if (!moved)
			handleLockPiece();
	}

	function getIntervalDelay() {
		const baseSpeed = 500;
		const speedUp = Math.floor(lines.value / 10) * 50;
		return Math.max(baseSpeed - speedUp, 100);
	}

	function startInterval() {
		if (intervalId.value !== null)
			clearInterval(intervalId.value);
		intervalId.value = setInterval(() => {
			tick();
		}, getIntervalDelay());
	}

	function stopGame() {
		isGameRunning.value = false;
		if (intervalId.value !== null) {
			clearInterval(intervalId.value);
			intervalId.value = null;
		}

		if (gameOver.value) {
			//endgames
		}
	}

	// LAUNCH PART
	if (isGameRunning.value)
		return;
	isGameRunning.value = true;
	startInterval();
}
