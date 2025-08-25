<script setup>
import { onBeforeUnmount, ref, onMounted, computed } from "vue";
import {useRouter, onBeforeRouteLeave} from "vue-router";
import socket from '@/socket';
import AppButton from "@/components/AppButton.vue";
import Window from "@/components/Window.vue";
import TetrisText from "@/components/TetrisText.vue";
import { askServer } from "@/utils";

const username = ref('');
const router = useRouter();

const positions = [
	{class: "top-left"},
	{class: "top-right"},
	{class: "bottom-left"},
	{class: "bottom-right"},
]

function retry() {
	socket.emit('return-lobby');
	socket.once('get-value', (seed, username) => {
		router.push(`/${seed}/${username}`);
	});
}

onBeforeRouteLeave(async (to, from, next) => {
	const allowedPaths = ['/'];
	if (allowedPaths.includes(to.path) || await askServer(to.path, socket) === true) {
		next();
		return;
	}
	const confirmLeave = window.confirm("Return menu ?");
	if (confirmLeave) {
		next();
		socket.emit('return');
		await router.push('/');
	} else {
		next(false);
	}
});

function handleBeforeUnload(event) {
	event.preventDefault();
}

onMounted(async () => {
	if (await askServer('game-exist', socket) === false)
		await router.push('/');
	window.addEventListener("beforeunload", handleBeforeUnload);
});
onBeforeUnmount(() => {
	window.removeEventListener("beforeunload", handleBeforeUnload);
});

const rank = ref([]);
const allPlayersFinished = ref(false);

socket.on('rank', (data) => {
	rank.value = data;
	allPlayersFinished.value = true;
});

const winner = computed(() => rank.value.at(-1))
const losers = computed(() => rank.value.slice(0, -1));
</script>

<template>
	<main class="endgame">
		<div v-if="allPlayersFinished" class="end-screen">
			<!-- Vainqueur en haut -->
			<Window title="Winner" variant="results" class="winner" customClass="fix-overflow-endgame">
				<div class="winner-box">
					<div class=winner-text>
						<TetrisText :text="winner?.username"></TetrisText>
						<TetrisText text="!! WINNER !!"></TetrisText>
					</div>
				</div>
			</Window>

			<!-- Les autres joueurs en dessous -->
			<Window title="Losers" class="losers">
				<div class="losers-box">
					<Window
						v-for="(player, index) in losers"
						:key="player.username"
						:title="player.username"
						variant="results"
						:class="`loser loser-${index}`"
						customClass="fix-overflow-endgame"
					>
						<h2 class="losers-name">{{ player.username }}</h2>
					</Window>

					<TetrisText class="loser-text" text="LOSERS"></TetrisText>
				</div>
			</Window>

			<AppButton @click="retry">
				RETURN TO LOBBY
			</AppButton>
		</div>

		<div v-else>
			<Window title="Results" variant="results" id="game-over">
				<h2>
					WAITING FOR OTHER PLAYERS TO FINISH
					<span class="dot-typing"></span>
				</h2>
			</Window>
		</div>
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

.end-screen {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 5rem;
	width: 100%;
}

.winner {
	position: relative;
	padding: 0;
	width: 50rem;
	height: 17rem;
}

.winner-box {
	position: absolute;
	inset: 0.75rem;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 2rem;
	align-items: center;
	justify-content: center;
	font-size: 2.5rem;
	color: #555555;
	background-color: #88ac28;
	border-top: 2px solid black;
	border-left: 2px solid black;
}

.winner-text {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 2rem;
	animation: blink 1s infinite;
}

@keyframes blink {
	0%, 49% {
		opacity: 1;
	}
	50%, 100% {
		opacity: 0;
	}
}

.losers-box {
	display: grid;
	background-color: #88ac28;
	grid-template-columns: repeat(3, auto);
	grid-template-rows: repeat(3, 5rem);
	column-gap: 2rem;
	row-gap: 1rem;
	position: relative;
	justify-content: center;
	align-items: center;
	padding-left: 5px;
	padding-right: 5px;
}

.loser-0 { grid-area: 1 / 1; } /* haut gauche */
.loser-1 { grid-area: 1 / 3; } /* haut droit */
.loser-2 { grid-area: 3 / 1; } /* bas gauche */
.loser-3 { grid-area: 3 / 3; } /* bas droit */

.losers-name {
	font-size: 1rem;
	text-align: center;
	padding: 0.1rem;
}

.loser-text {
	grid-area: 2 / 2;
}

.dot-typing {
	display: inline-block;
}

.dot-typing::after {
	content: '...';
	animation: dots-blink 3s steps(4, end) infinite;
	letter-spacing: 2px;
}

@keyframes dots-blink {
	0% {
		content: '';
	}
	25% {
		content: '.';
	}
	50% {
		content: '..';
	}
	75% {
		content: '...';
	}
	100% {
		content: '';
	}
}
</style>
