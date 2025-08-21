<script setup>
import {onBeforeUnmount, ref, computed, onMounted, onUnmounted} from "vue";
import socket from '@/socket';
import {useRouter, onBeforeRouteLeave} from "vue-router";

import AppButton from "@/components/AppButton.vue";
import Window from "@/components/Window.vue";

import { askServer } from "../utils.js";

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
socket.on('getGameRunning', (info) => {
	isGameRunning.value = info;
});
const gameOver = ref(false);
socket.on('getGameOver', (info) => {
	gameOver.value = info;
	if (gameOver.value) {
		socket.emit('finish', lines.value);
		router.push('endgame');
	}

});
const lines = ref(0);
socket.on('getLines', (info) => {
	lines.value = info;
});

// Utilisation des fonctions dans 'logic.js' pour calculer l'affichage.
const flattenedGrid = ref([]);
socket.emit('ask-server', 'init-grid');
socket.on('flattenedGrid', (flatGrid) => {
	flattenedGrid.value = flatGrid;
});

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
const flattenedNextPiece = ref([]);
socket.emit('ask-server', 'init-piece');
socket.on('flattenedNextPiece', (flatNextPiece) => {
	flattenedNextPiece.value = flatNextPiece;
});

function getIntervalDelay() {
	const baseSpeed = 500;
	const speedUp = Math.floor(lines / 10) * 50;
	return Math.max(baseSpeed - speedUp, 100);
}

// ======== FONCTION DE COMMUNICATION AVEC LE SOCKET ========

function handleKeyPress(e) {
	socket.emit('input', e.code);
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

// ======== INITIALISATION ========


askServer('start-game', socket).then((res) => {
	console.log(`Game status: ${res}`);
});
socket.on('launch', ({ startAt }) => {
	const delay = startAt - Date.now();
	setTimeout(() => {
		socket.emit('launch');
	}, delay);
});

const isProcessing = ref(false);

async function hostStart() {
	if (isProcessing.value) return;
	isProcessing.value = true;
	
	try {
		await askServer('start-game', socket);
	} catch (error) {
		console.error(error);
	}
}

function handleBeforeUnload(event) {
	event.preventDefault();
}

const gridUpdateInterval = ref([]);
onMounted(async () => {
	if (await askServer('game-exist', socket) === false)
		await router.push('/');
	window.addEventListener("keydown", handleKeyPress);
	window.addEventListener("beforeunload", handleBeforeUnload);
	socket.emit('ask-server', 'init-piece');
	await fetchOtherPlayerGrids();

	gridUpdateInterval.value = setInterval(() => {
		if (!gameOver.value)
			fetchOtherPlayerGrids();
	}, getIntervalDelay());
});
onUnmounted(() => {
	socket.emit('ask-server', 'stop-game');
	clearInterval(gridUpdateInterval.value);
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
	window.removeEventListener("keydown", handleKeyPress);
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
				customClass="fix-overflow"
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
			</Window>
		</div>

		<div class="controls">
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
