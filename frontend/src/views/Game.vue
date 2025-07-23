<script setup>
import { ref, computed, onMounted } from 'vue';

const ROWS = 20;
const COLS = 10;

const grid = ref(
	Array.from({ length: ROWS }, () => Array(COLS).fill("empty"))
);

const flattenedGrid = computed(() => grid.value.flat());

const activePiece = ref({
	shape: [
		["block-O", "block-O"],
		["block-O", "block-O"]
	],
	x: 4,
	y: 0
});

function renderPiece() {
	const newGrid = Array.from({ length: ROWS }, () => Array(COLS).fill("empty"));

	const { shape, x, y } = activePiece.value;

	shape.forEach((row, dy) => {
		row.forEach((value, dx) => {
			if (value !== "empty") {
				const px = x + dx;
				const py = y + dy;
				if (px >= 0 && px < COLS && py >= 0 && py < ROWS) {
					newGrid[py][px] = value;
				}
			}
		});
	});

	grid.value = newGrid;
}

function handleKeyPress(e) {
	if (e.key === "ArrowLeft") activePiece.value.x--;
	if (e.key === "ArrowRight") activePiece.value.x++;
	if (e.key === "ArrowDown") activePiece.value.y++;
	renderPiece();
}

onMounted(() => {
	window.addEventListener('keydown', handleKeyPress);

	// Faire descendre la pièce automatiquement
	setInterval(() => {
		activePiece.value.y += 1;
		renderPiece();
	}, 500);

	renderPiece();
});
</script>

<template>
	<main class="game">
		<div id="game-container">
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
						v-for="(cell, index) in flattenedNextPiece"
						:key="index"
						:class="cell"
						class="cell"
					></div>
				</div>
			</div>
		</div>

		<div class="controls">
			<button v-if="!isGameRunning && !gameOver" @click="startGame">START GAME</button>
			<button v-if="gameOver" @click="restartGame">RESTART</button>
			<button v-if="isGameRunning" @click="stopGame">PAUSE</button>
		</div>

		<div v-if="gameOver" class="game-over">
			<h2>GAME OVER !</h2>
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

.cell {
	width: 20px;
	height: 20px;
	box-sizing: border-box;
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
