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
			<div id="game-zone" class="tetris-grid">...</div>

			<div class="sidebar">
				<div class="infos pixel-corners" id="lines">LINES</div>
				<div class="infos pixel-corners" id="next-piece">next piece</div>
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
	border-top: 15px solid #3365ff;
	border-left: 5px solid lightgrey;
	border-right: 5px solid lightgrey;
	border-bottom: 10px solid lightgrey;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: flex-start;
	gap: 0.5rem;
	position: relative;
	box-shadow: 2px 2px black;
}

#game-container::before {
	content: "";
	position: absolute;
	top: -15px; /* pour aligner avec le border-top */
	left: -4.5px; /* dépassement à gauche */
	width: calc(100% + 9px); /* dépassement à droite aussi */
	height: 15px; /* même hauteur que ton border-top */
	background-color: blue; /* même couleur que ton border-top */
	border-top: 3px solid lightgrey;
	border-bottom: 2px solid lightgrey;
	border-left: 3px solid lightgrey;
	border-right: 3px solid lightgrey;
	box-sizing: border-box;
}

.tetris-grid {
	background-color: #88ac28;
	display: grid;
	grid-template-columns: repeat(10, 20px);
	grid-template-rows: repeat(20, 20px);
	border-top: 2px solid black;
	border-left: 2px solid black;
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

#next-piece {
	width: 100%;
	aspect-ratio: 1 / 1;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #88ac28;
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
