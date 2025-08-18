<script setup>
import {onBeforeUnmount, ref, computed, onMounted, onUnmounted} from "vue";
import socket from '@/socket';
import {useRouter, onBeforeRouteLeave} from "vue-router";

import AppButton from "@/components/AppButton.vue";
import Window from "@/components/Window.vue";

import { askServer } from "../utils.js";
import {
	canPlacePieceAt,
	calculateGridAfterLocking,
	calculateVisualGrid,
	calculateNextPieceGrid,
	attemptMove,
	attemptRotation,
	attemptHardDrop
} from "../logic.js";

const router = useRouter();

const ROWS = 20;
const COLS = 10;

const positions = [
	{class: "top-left"},
	{class: "top-right"},
	{class: "bottom-left"},
	{class: "bottom-right"},
]

const username = ref('');

askServer('get-username', socket).then((res) => {
	username.value = res;
});

const isGameRunning = ref(false);
const gameOver = ref(false);
const isPaused = ref(false);
const lines = ref(0);
const intervalId = ref(null);

// Pièces actives.
const activePiece = ref(null);
const nextPiece = ref(null);

// Grille principale (quand les pieces se fixent).
const permanentGrid = ref(Array.from({ length: ROWS }, () => Array(COLS).fill("empty")));
socket.emit("grid", permanentGrid.value);

// Utilisation des fonctions dans 'logic.js' pour calculer l'affichage.
const visualGrid = computed(() => {
	return calculateVisualGrid(permanentGrid.value, activePiece.value);
});
const flattenedGrid = computed(() => visualGrid.value.flat());

// Grille pour les autres joueurs.
const otherPlayersGrids = ref({});
const flattenedOtherPlayers = computed(() => {
	return Object.values(otherPlayersGrids.value)
		.filter(playerData => playerData && playerData.username)
		.map(playerData => ({
			username: playerData.username,
			flattened: playerData.grid
				? playerData.grid.flat()
				: Array(ROWS * COLS).fill("empty")
		}));
});

// Grille pour la prochaine pièce.
const nextGrid = computed(() => {
	return calculateNextPieceGrid(nextPiece.value, 4);
});
const flattenedNextPiece = computed(() => nextGrid.value.flat())

// ======== FONCTION DE COMMUNICATION AVEC LE SOCKET ========

/**
 * @need Set the key word 'await' before the function for use it.
 * @descristion Ask to server, who's the next Piece in bag
 */
async function getNextTetromino() {
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

async function fetchOtherPlayerGrids() {
	try {
		const grids = await getUserGrid();
		if (grids) {
			otherPlayersGrids.value = grids;
			console.log("Grilles des autres joueurs:", otherPlayersGrids.value);
		}
	} catch (error) {
		console.error("Error during grid fetch:", error);
	}
}

/**
 * @need Set the key word 'await' before the function for use it.
 * @description Ask to server for get every grid of player in this game
 * @content Map contain: Key[".grid"] / Value[".username"]
 * @warning If the grid of other player is empty, return undefined
 */
async function getUserGrid() {
	return new Promise((resolve, reject) => {
		socket.emit('get-grids');

		socket.once('grids', (grids) => {
			if (!grids || Object.keys(grids).length === 0)
				resolve(undefined);
			resolve(grids);
		});

		setTimeout(() => reject("Timeout getting grids"), 1000);
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

async function handleHardDrop() {
	if (!activePiece.value)
		return false;

	const droppedPiece = attemptHardDrop(
		activePiece.value,
		permanentGrid.value,
		ROWS, COLS
	);

	if (droppedPiece.success) {
		activePiece.value = droppedPiece.newPiece;
		await handleLockPiece();
		return true;
	}

	return false;
}

async function handleLockPiece() {
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
	nextPiece.value = await getNextTetromino();

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

// ======== GESTIONNAIRE D'ÉVÉNEMENTS ========

function handleKeyPress(e) {
	if (e.key === "ArrowLeft") handleMovePiece(-1, 0);
	else if (e.key === "ArrowRight") handleMovePiece(1, 0);
	else if (e.key === "ArrowDown") handleMovePiece(0, 1);
	else if (e.key === "ArrowUp") handleRotatePiece();
	else if (e.code === "Space") handleHardDrop();
}

// ======== LOGIQUE DE JEU ========

async function tick() {
	const moved = await handleMovePiece(0, 1);

	if (!moved)
		await handleLockPiece();
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
		fetchOtherPlayerGrids();
	}, getIntervalDelay());
}

async function startGame() {
	if (isGameRunning.value)
		return;

	window.addEventListener("keydown", handleKeyPress);
	isGameRunning.value = true;

	if (!isPaused.value) {
		activePiece.value = nextPiece.value;
		nextPiece.value = await getNextTetromino();
	}

	isPaused.value = false;
	startInterval();
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

// ======== INITIALISATION ========

function handleBeforeUnload(event) {
	event.preventDefault();
}

onMounted(async () => {
	if (await askServer('game-exist', socket) === false)
		await router.push('/');
	nextPiece.value = await getNextTetromino();
	window.addEventListener("keydown", handleKeyPress);
	window.addEventListener("beforeunload", handleBeforeUnload);
	await fetchOtherPlayerGrids();

	const gridUpdateInterval = setInterval(() => {
		if (!gameOver.value)
			fetchOtherPlayerGrids();
	}, getIntervalDelay());

	onUnmounted(() => {
		clearInterval(gridUpdateInterval);
	});
});

onUnmounted(async () => {
	lines.value = 0;
	gameOver.value = false;
	permanentGrid.value = Array(COLS).fill("empty");
});

onBeforeRouteLeave((to, from, next) => {
	const allowedPaths = ['/endgame', '/'];
	if (allowedPaths.includes(to.path)) {
		next();
		return;
	}
	const confirmLeave = window.confirm("Rage quit ?");
	if (confirmLeave) {
		next();
		socket.emit('return');
		router.push('/');
	} else {
		next(false);
	}
});

onBeforeUnmount(() => {
	window.removeEventListener("beforeunload", handleBeforeUnload);
});

</script>

<template>
	<main class="game">
		<div class="game-layout">
			<!-- Autres joueurs -->
			<Window
				v-for="(player, index) in flattenedOtherPlayers"
				:key="player.username"
				:class="positions[index]?.class"
				:title="player.username"
				variant="username"
			>
				<div class="tetris-grid other-player-grid">
					<div
						v-for="(cell, cellIndex) in player.flattened"
						:key="cellIndex"
						:class="cell"
						class="cell small-cell"
					></div>
				</div>
			</Window>

			<!-- Terrain principal -->
			<Window
				:title="username"
				variant="username"
				id="game-container"
			>
				<div class="game-content">
					<div id="game-zone" class="tetris-grid">
						<div
							v-for="(cell, index) in flattenedGrid"
							:key="index"
							:class="cell"
							class="cell"
						></div>
					</div>

					<div class="sidebar">
						<div class="infos pixel-corners" id="lines">LINES {{ lines }}</div>
						<div id="next-piece" class="infos pixel-corners next-piece-grid">
							<div
								v-for="(cell_next_piece, index) in flattenedNextPiece"
								:key="index"
								:class="cell_next_piece"
								class="cell_next_piece"
							></div>
						</div>
					</div>
				</div>

				<div class="pause-overlay" v-if="isPaused">
					PAUSE
				</div>
			</Window>
		</div>

		<div class="controls">
			<AppButton v-if="!isGameRunning && !gameOver" @click="startGame">START GAME</AppButton>
			<AppButton v-if="isGameRunning" @click="stopGame">PAUSE</AppButton>
			<!-- AJOUTER CONTROLES -->
		</div>

		<RouterView />
	</main>
</template>

<style scoped>
main {
	font-family: Pixel, sans-serif;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px;
}

.game-layout {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(2, 1fr);
	row-gap: 25px;
	align-items: center;
	justify-items: center;
}

.other-player-grid {
	grid-template-columns: repeat(10, 10px) !important;
	grid-template-rows: repeat(20, 10px) !important;
	background-color: #88ac28;
	border: 1px solid #214132;
	margin: 0.2rem;
}

.small-cell {
	width: 10px !important;
	height: 10px !important;
	border: 0.5px solid darkolivegreen;
}

#game-container {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: flex-start;
	grid-area: 1 / 2 / 3 / 3;
}

.game-content {
	display: flex;
	flex-direction: row;
	gap: 1rem;
	justify-content: center;
	align-items: flex-start;
}

.other-players .username {
	left: 52%;
}

.tetris-grid {
	background-color: #88ac28;
	display: grid;
	grid-template-columns: repeat(10, 20px);
	grid-template-rows: repeat(20, 20px);
	border-top: 2px solid black;
	border-left: 2px solid black;
}

.tetris-grid.other-player-grid {
	border-top: 1.5px solid black;
	border-left: 1.5px solid black;
}

.cell {
	width: 20px;
	height: 20px;
	box-sizing: border-box;
	border: 1px darkolivegreen solid;
}

.sidebar {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	margin-top: 0.5rem;
	margin-right: 1rem;
}

.infos {
	background-color: #88ac28;
	padding: 10px;
	border-right: 2px solid black;
	border-bottom: 2px solid black;
}

.next-piece-grid {
	display: grid;
	grid-template-columns: repeat(4, 20px);
	grid-template-rows: repeat(4, 20px);
	background-color: #88ac28;
	justify-content: center;
	align-items: center;
	padding: 10px;
}

.controls {
	margin-top: 0.5rem;
	grid-column: 1 / 4;
	grid-row: 4;
	text-align: center;
}

.pause-overlay {
	position: absolute;
	top: 48%;
	left: 31.5%;
	transform: translate(-50%, -50%);
	font-size: 2rem;
	font-weight: bold;
	color: RED;
	z-index: 10;
	animation: blinker 1s linear infinite;
}

@keyframes blinker {
	0%, 49% {
		opacity: 1;
	}
	50%, 100% {
		opacity: 0;
	}
}


h3 {
	color: #214132;
	font-size: 150%;
	margin: 5px;
	text-align: center;
}

.block-I {
	background-color: cyan;
	border: 2px solid black;
	position: relative;
	width: 20px;
	height: 20px;
}
.block-I::before {
	content: "";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 50%;
	height: 50%;
	background-color: black;
}

.block-J {
	background-color: blue;
	border: 2px solid black;
	position: relative;
	width: 20px;
	height: 20px;
}
.block-J::before {
	content: "";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 50%;
	height: 50%;
	background-color: black;
}

.block-L {
	background-color: orange;
	border: 2px solid black;
	position: relative;
	width: 20px;
	height: 20px;
}
.block-L::before {
	content: "";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 50%;
	height: 50%;
	background-color: black;
}

.block-O {
	background-color: yellow;
	border: 2px black solid;
	position: relative;
	width: 20px;
	height: 20px;
}
.block-O::before {
	content: "";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 50%;
	height: 50%;
	background-color: black;
}

.block-S {
	background-color: lime;
	border: 2px black solid;
	position: relative;
	width: 20px;
	height: 20px;
}
.block-S::before {
	content: "";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 50%;
	height: 50%;
	background-color: black;
}

.block-T {
	background-color: purple;
	border: 2px black solid;
	position: relative;
	width: 20px;
	height: 20px;
}
.block-T::before {
	content: "";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 50%;
	height: 50%;
	background-color: black;
}

.block-Z {
	background-color: red;
	border: 2px black solid;
	position: relative;
	width: 20px;
	height: 20px;
}
.block-Z::before {
	content: "";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 50%;
	height: 50%;
	background-color: black;
}

</style>
