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

const ROWS = 20;
const COLS = 10;

const positions = [
	{class: "top-left"},
	{class: "top-right"},
	{class: "bottom-left"},
	{class: "bottom-right"},
]

isGameRunning = false;
gameOver = false;
lines = 0;
intervalId = null;

// Pièces actives.
activePiece = null;
nextPiece = null;

const permanentGrid = ref(Array.from({ length: ROWS }, () => Array(COLS).fill("empty")));


/// a envoyer au client !!!!! (check game.vue en haut)
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
/// =================


// ======== FONCTION DE COMMUNICATION AVEC LE SOCKET ========

/**
 * @need Set the key word 'await' before the function for use it.
 * @descristion Ask to server, who's the next Piece in bag
 */
async function getNextTetromino(socket) {
	return new Promise((resolve, reject) => {
		socket.emit('get-piece');

		socket.once('piece', (piece) => {
			if (!piece)
				return reject("No piece received");

			resolve({
				shape: piece.shape.map(row =>
					row.map(cell => (cell ? piece.color : "empty"))),
				x: piece.x,
				y: piece.y,
				color: piece.color,
			});
		});

		setTimeout(() => reject("Timeout getting piece"), 1000);
	});
}

// ======== ACTIONS UTILISATEUR ========

async function handleMovePiece(dx, dy) {
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

async function handleRotatePiece() {
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

async function handleHardDrop(socket) {
	if (!activePiece.value)
		return false;

	const droppedPiece = attemptHardDrop(
		activePiece.value,
		permanentGrid.value,
		ROWS, COLS
	);

	if (droppedPiece.success) {
		activePiece.value = droppedPiece.newPiece;
		await handleLockPiece(socket);
		return true;
	}

	return false;
}

async function handleLockPiece(socket) {
	if (!activePiece.value)
		return;

	const { newGrid, linesCleared } = calculateGridAfterLocking(
		permanentGrid.value,
		activePiece.value,
		ROWS, COLS,
		lines.value
	);

	permanentGrid.value = newGrid;
	socket.emit("grid", permanentGrid.value);

	lines.value = linesCleared;

	activePiece.value = nextPiece.value;
	nextPiece.value = await getNextTetromino(socket);

	if (linesCleared > 0)
		startInterval();

	spawnNewPiece(socket);
}

function spawnNewPiece(socket) {
	if (!activePiece.value)
		return;

	const canSpawn = canPlacePieceAt(
		activePiece.value,
		permanentGrid.value,
		ROWS, COLS
	);

	if (!canSpawn) {
		gameOver.value = true;
		stopGame(socket);
	}
}

// ======== GESTIONNAIRE D'ÉVÉNEMENTS ========

function handleKeyPress(e) {
	if (e === "ArrowLeft") handleMovePiece(-1, 0);
	else if (e === "ArrowRight") handleMovePiece(1, 0);
	else if (e === "ArrowDown") handleMovePiece(0, 1);
	else if (e === "ArrowUp") handleRotatePiece();
	else if (e === "Space") handleHardDrop();
}

// ======== LOGIQUE DE JEU ========

async function tick(socket) {
	const moved = await handleMovePiece(0, 1);

	if (!moved)
		await handleLockPiece(socket);
}

function getIntervalDelay() {
	const baseSpeed = 500;
	const speedUp = Math.floor(lines.value / 10) * 50;
	return Math.max(baseSpeed - speedUp, 100);
}

function startInterval(socket) {
	if (intervalId.value !== null)
		clearInterval(intervalId.value);

	intervalId.value = setInterval(() => {
		tick(socket);
	}, getIntervalDelay());
}

export async function startGame(socket) {
	if (isGameRunning.value)
		return;

	isGameRunning.value = true;

	if (!isPaused.value) {
		activePiece.value = nextPiece.value;
		nextPiece.value = await getNextTetromino(socket);
	}

	isPaused.value = false;
	startInterval(socket);
}

function stopGame() {
	isGameRunning.value = false;
	if (!gameOver.value)
		isPaused.value = true;

	if (intervalId.value !== null) {
		clearInterval(intervalId.value);
		intervalId.value = null;
	}

	window.removeEventListener("keydown", handleKeyPress);

	if (gameOver.value) {
		socket.emit('finish', lines.value);
		router.push("/endgame");
	}
}


//socket.emit("grid", permanentGrid.value); A METTRE DANS START GAME QUAND SOCKET SERA DEF
//socket.emit('pieceUpdate', getFlattenedNextPiece());
//socket.emit('gridUpdate', getFlattenedGrid());
