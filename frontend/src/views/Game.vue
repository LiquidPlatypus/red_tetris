<script setup>
import { ref, computed, onMounted } from "vue";
import AppButton from "@/components/AppButton.vue";
import socket from '@/socket';
import {useRouter} from "vue-router";

const router = useRouter();

const ROWS = 20;
const COLS = 10;

const isGameRunning = ref(false);
const gameOver = ref(false);
const isPaused = ref(false);
const lines = ref(0);

const intervalId = ref(null);

// Grille principale (quand les pieces se fixent).
const permanentGrid = ref(Array.from({ length: ROWS }, () => Array(COLS).fill("empty")));

// Grille visuelle (quand les pieces bougent).
const visualGrid = ref(Array.from({ length: ROWS }, () => Array(COLS).fill("empty")));

const flattenedGrid = computed(() => visualGrid.value.flat());

const nextGrid = ref(Array.from({ length: 4 }, () => Array(4).fill("empty")));

const flattenedNextPiece = computed(() => nextGrid.value.flat());

async function getNextTetromino() {
	return new Promise((resolve, reject) => {
		socket.emit('get-piece');

		socket.once('piece', (piece) => {
			if (!piece) return reject('No piece received');

			resolve({
				shape: piece.shape.map(row =>
					row.map(cell => (cell ? piece.color : "empty"))
				),
				x: piece.x,
				y: piece.y,
				color: piece.color,
			});
		});
		setTimeout(() => reject('Timeout getting piece'), 1000);
	});
}
/**
 * @param index Numero de la piece voulu dans la struct
 * Trouve un moyen de recuperer l'index de la piece 
 * et dans ta fonction movePiece ta juste a creer une nouvelle instance avec la nouvelle position
 * et les mettres dans tes valeurs
 * (va voir ta fonction j'ai mis des comments)
 * 
 * faut juste voir comment on fait pour rotate et pour mettre la nextPiece dans la activePiece
 */
// async function newPosPiece(index, new_x, new_y) {
// 	return new Promise((resolve, reject) => {
// 		socket.emit('target-piece', index);

// 		socket.once('target', (piece) => {
// 			if (!piece) return reject('No piece received');

// 			resolve({
// 				shape: piece.shape.map(row =>
// 					row.map(cell => (cell ? piece.color : "empty"))
// 				),
// 				x: new_x,
// 				y: new_y,
// 				color: piece.color,
// 			});
// 		});
// 	});
// }

const nextPiece = ref(null);

onMounted(async () => {
	nextPiece.value = await getNextTetromino();
});

const activePiece = ref(null);

function clearNextGrid() {
	nextGrid.value = Array.from({ length: 4 }, () => Array(4).fill("empty"));
}

function renderNextPiece() {
	clearNextGrid();

	const shape = nextPiece.value.shape;
	const height = shape.length;
	const width = shape[0].length;

	const offsetX = Math.floor((4 - width) / 2);
	const offsetY = Math.floor((4 - height) / 2);

	shape.forEach((row, dy) => {
		row.forEach((value, dx) => {
			if (value !== "empty"){
				const px = offsetX + dx;
				const py = offsetY + dy;
				if (value !== 0) nextGrid.value[py][px] = value;
			}
		});
	});
}

function renderPiece() {
	// Copier la grille permanente
	visualGrid.value = permanentGrid.value.map((row) => [...row]);

	const { shape, x, y } = activePiece.value;

	// Ajouter la pièce active à la grille visuelle
	shape.forEach((row, dy) => {
		row.forEach((value, dx) => {
			if (value !== "empty") {
				const px = x + dx;
				const py = y + dy;
				if (px >= 0 && px < COLS && py >= 0 && py < ROWS) {
					visualGrid.value[py][px] = value;
				}
			}
		});
	});
}

function canMoveTo(x, y, shape) {
	if (!shape || !Array.isArray(shape)) return false;

	for (let dy = 0; dy < shape.length; dy++) {
		const row = shape[dy];
		for (let dx = 0; dx < row.length; dx++) {
			const cell = row[dx];
			if (cell === "empty") continue;

			const px = x + dx;
			const py = y + dy;

			// En dehors de la grille
			if (px < 0 || px >= COLS || py >= ROWS) return false;

			// Collision avec une cellule existante
			if (py >= 0 && permanentGrid.value[py][px] !== "empty") return false;
		}
	}
	return true;
}

function movePiece(dx, dy) {
	const newX = activePiece.value.x + dx;
	const newY = activePiece.value.y + dy;
	const shape = activePiece.value.shape;

	if (canMoveTo(newX, newY, shape)) {
		// supprimer et enlever l'affichage de activePiece
		// fait ma fonction newPosPiece(<index>, newX, newY);
		// render la piece avec ta fonction de render
		activePiece.value.x = newX;
		activePiece.value.y = newY;
		return true;
	}
	return false;
}

function rotatePiece() {
	const rotated = activePiece.value.shape[0].map((_, colIndex) =>
		activePiece.value.shape.map((row) => row[colIndex]).reverse(),
	);

	const x = activePiece.value.x;
	const y = activePiece.value.y;

	if (canMoveTo(x, y, rotated)) activePiece.value.shape = rotated;
}

function hardDrop() {
	while (movePiece(0, 1))
		;
	lockPiece();
	renderPiece();
}

async function lockPiece() {
	const { shape, x, y } = activePiece.value;

	// Fixer la pièce dans la grille permanente
	shape.forEach((row, dy) => {
		row.forEach((value, dx) => {
			if (value !== "empty") {
				const px = x + dx;
				const py = y + dy;
				if (py >= 0 && py < ROWS && px >= 0 && px < COLS) {
					permanentGrid.value[py][px] = value;
				}
			}
		});
	});

	// Vérifier les lignes complètes
	for (let i = ROWS - 1; i >= 0; i--) {
		if (permanentGrid.value[i].every((cell) => cell !== "empty")) {
			permanentGrid.value.splice(i, 1);
			permanentGrid.value.unshift(Array(COLS).fill("empty"));
			lines.value++;
			i++; // Revérifier la même ligne car on a ajouté une ligne vide en haut
		}
	}

	activePiece.value = nextPiece.value;
	nextPiece.value = await getNextTetromino();
	renderNextPiece();

	if (lines.value > 0)
		startInterval();

	// Créer une nouvelle pièce
	spawnNewPiece();
}

function spawnNewPiece() {

	// Vérifier si la nouvelle pièce peut être placée (game over)
	if (!canMoveTo(activePiece.value.x, activePiece.value.y, activePiece.value.shape)) {
		gameOver.value = true;
		stopGame();
	}
}

function tick() {
	if (!movePiece(0, 1)) lockPiece();
	renderPiece();
}

function handleKeyPress(e) {
	if (e.key === "ArrowLeft") movePiece(-1, 0);
	else if (e.key === "ArrowRight") movePiece(1, 0);
	else if (e.key === "ArrowDown") movePiece(0, 1);
	else if (e.key === "ArrowUp") rotatePiece();
	else if (e.code === "Space") hardDrop();
	renderPiece();
}

function getIntervalDelay() {
	// Exemple : diminue la vitesse de 50ms tous les 10 lignes, minimum 100ms
	const baseSpeed = 500;
	const speedup = Math.floor(lines.value / 10) * 50;
	return Math.max(baseSpeed - speedup, 100); // minimum 100ms
}

function startInterval() {
	if (intervalId.value !== null) clearInterval(intervalId.value);

	intervalId.value = setInterval(() => {
		tick();
		console.log(getIntervalDelay());
	}, getIntervalDelay());
}

async function startGame() {
	if (isGameRunning.value) return;

	window.addEventListener("keydown", handleKeyPress);

	isGameRunning.value = true;

	if (isPaused.value === false) {
		activePiece.value = nextPiece.value;
		nextPiece.value = await getNextTetromino();
	}

	isPaused.value = false;

	startInterval();

	renderNextPiece();
	renderPiece();
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

	if (gameOver.value)
		router.push("/endgame");
}

onMounted(() => {
	window.addEventListener("keydown", handleKeyPress);
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
						v-for="(cell_next_piece, index) in flattenedNextPiece"
						:key="index"
						:class="cell_next_piece"
						class="cell_next_piece"
					></div>
				</div>
			</div>
		</div>

		<div class="controls">
			<AppButton v-if="!isGameRunning && !gameOver" @click="startGame">START GAME</AppButton>
			<AppButton v-if="isGameRunning" @click="stopGame">PAUSE</AppButton>
		</div>

		<div class="pause-overlay" v-if="isPaused">
			PAUSE
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
	left: 45.2%;
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
