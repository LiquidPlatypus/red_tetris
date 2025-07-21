<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const COLS = 10;
const ROWS = 20;

const gameGrid = ref([]);
let score = ref(0);
const lines = ref(0);
const currentPiece = ref(null);
const currentRotation = ref(0);
const currentX = ref(0);
const currentY = ref(0);
const nextPiece = ref(null);
const nextPiecePreview = ref([]);
const gameInterval = ref();
const isGameRunning = ref(false);
const gameOver = ref(false);

const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const nextPieceDisplay = document.getElementById("next-piece");

const TETROMINOS = [
	// I
	{ shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], color: 'block-I' },
	// J
	{ shape: [[1,0,0], [1,1,1], [0,0,0]], color: 'block-J' },
	// L
	{ shape: [[0,0,1], [1,1,1], [0,0,0]], color: 'block-L' },
	// O
	{ shape: [[1,1], [1,1]], color: 'block-O' },
	// S
	{ shape: [[0,1,1], [1,1,0], [0,0,0]], color: 'block-S' },
	// T
	{ shape: [[0,1,0], [1,1,1], [0,0,0]], color: 'block-T' },
	// Z
	{ shape: [[1,1,0], [0,1,1], [0,0,0]], color: 'block-Z' }
];

function initGrid() {
	gameGrid.value = [];
	for (let row = 0; row < ROWS; row++) {
		gameGrid.value[row] = [];
		for (let col = 0; col < COLS; col++) {
			gameGrid.value[row][col] = 'empty';
		}
	}
}

function startGame() {
	initGrid();
	score.value = 0;
	lines.value = 0;
	gameOver.value = false;
	isGameRunning.value = true;

	nextPiece.value = getNextPiece();
	spawnNextPiece();

	gameInterval.value = setInterval(dropPiece, 1000);
}

function stopGame() {
	isGameRunning.value = false;
	if (gameInterval.value)
		clearInterval(gameInterval.value);
}

function restartGame() {
	stopGame();
	startGame();
}

onMounted(() => {
	initGrid();
	generateNextPiecePreview();
	window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
	stopGame();
	window.removeEventListener('keydown', handleKeyPress);
});
</script>

<template>
	<main class="game">
		<div id="game-container">
			<div id="score" class="infos">
				<h3>SCORE {{ score }}</h3>
			</div>
			<div id="lines" class="infos">
				<h3>LINES {{ lines }}</h3>
			</div>
			<div id="next-piece" class="infos">
				<h3>NEXT PIECE </h3>
				<table class="next-piece-table">
					<tr v-for="(row, rowIndex) in nextPiecePreview" :key="rowIndex">
						<td v-for="(cell, colIndex) in row" :key="colIndex" :class="cell">

						</td>
					</tr>
				</table>
			</div>
			<div id="game-zone">
				<table class="game-zone-table">
					<tr v-for="(row, rowIndex) in gameGrid" :key="rowIndex">
						<td v-for="(cell, colIndex) in row" :key="colIndex" :class="cell">

						</td>
					</tr>
				</table>
			</div>
		</div>

		<div class="controls">
			<button v-if="!isGameRunning && !gameOver" @click="startGame">START GAME</button>
			<button v-if="gameOver" @click="restartGame">RESTART</button>
			<button v-if="isGameRunning" @click="stopGame">PAUSE</button>
		</div>

		<div v-if="gameOver" class="game-over">
			<h2>GAME OVER !</h2>
			<p>FINAL SCORE : {{ score }}</p>
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

#game-container {
	background-color: #214132;
	padding: 15px;
	display: grid;
	grid-template-columns: 1fr 0.5fr;
	grid-template-rows: 1fr 1fr 1fr 1fr;
	gap: 0px 0px;
	grid-template-areas:
		"GAME SCORE"
		"GAME SCORE NUMBER"
		"GAME LINES"
		"GAME NEXT PIECE";
}

#score {
	grid-column: 1;
	grid-row: 1;
}

#lines {
	grid-column: 1;
	grid-row: 1;
}

#next-piece {
	grid-column: 3;
	grid-row: 1 / 3;
}

#game-zone {
	grid-column: 2;
	grid-row: 1 / 4;
}

.controls {
	grid-column: 1 / 4;
	grid-row: 4;
	text-align: center;
}

.game-over {
	grid-column: 1 / 4;
	grid-row: 5;
	text-align: center;
	color: #ff0000;
	font-weight: bold;
}

h3 {
	color: #214132;
	font-size: 150%;
	margin: 5px;
	text-align: center;
}

.infos {
	border: 2px solid #416a26;
	background-color: #88ac28;
	padding: 10px;
}

.game-zone-table {
	background-color: #88ac28;
	border-collapse: collapse;
	border: 2px solid #416a26;
}

.game-zone-table td, .next-piece-table td {
	width: 20px;
	height: 20px;
	border: 1px solid #688a26;
	box-sizing: border-box;
}

.empty { background-color: #214132; }
.block-I { background-color: cyan; }
.block-J { background-color: blue; }
.block-L { background-color: orange; }
.block-O { background-color: yellow; }
.block-S { background-color: lime; }
.block-T { background-color: purple; }
.block-Z { background-color: red; }

.next-piece-table {
	margin-top: 5px;
	border-collapse: collapse;
}
</style>
