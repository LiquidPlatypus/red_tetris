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

function retry() {
	socket.emit('return-lobby');
}
socket.on('get-value', (seed, username) => {
	router.push(`/${seed}/${username}`);
});

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
	socket.off('get-value');
	socket.off('rank');
});

const rank = ref([]);
const allPlayersFinished = ref(false);

socket.on('rank', (data) => {
	rank.value = data;
	allPlayersFinished.value = true;
});

const winner = computed(() => rank.value.at(-1))
const losers = computed(() => rank.value.slice(0, -1).reverse());
</script>

<template>
	<main class="endgame">
		<div v-if="allPlayersFinished" class="end-screen">
			<div v-if="losers[0]">
				<Window title="Winner" variant="results" class="winner" customClass="fix-overflow-endgame">
					<div class="winner-box">
						<div class=winner-text>
							<TetrisText :text="winner?.username"></TetrisText>
							<TetrisText text="!! WINNER !!"></TetrisText>
						</div>
					</div>
				</Window>
			</div>

			<div v-if="!losers[0]">
				<Window title="Winner" variant="results" class="winner" customClass="fix-overflow-endgame">
					<div class="winner-box">
						<div class=winner-text>
							<TetrisText :text="winner?.username"></TetrisText>
							<TetrisText text="GAME OVER"></TetrisText>
						</div>
					</div>
				</Window>
			</div>

			<div v-if="losers[0]" class="loser-div">
				<TetrisText class="loser-text" text="LOSERS"></TetrisText>
				<Window title="Losers" class="losers">
					<div class="losers-box">
						<div class="tab-border">
							<table id="losers-tab">
								<tbody>
								<tr v-for="(player) in losers" :key="username" class="losers-cell">
									<td :title="username" class="losers-name">{{ player.username }}</td>
								</tr>
								</tbody>
							</table>
						</div>
					</div>
				</Window>
			</div>

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

.loser-div {
	display: grid;
	grid-template-columns: 200px;
	grid-template-rows: repeat(2, auto);
	justify-items: center;
}

.loser-text {
	grid-area: 1 / 1;
	margin-bottom: 10px;
}

.losers {
	width: 75%;
	grid-area: 2 / 1;
}

.tab-border {
	margin: 15px;
	border-top: 2px solid #627A20;
	border-left: 2px solid #627A20;
	border-right: 2px solid #96BA34;
	border-bottom: 2px solid #96BA34;
}

.losers-box {
	background-color: #88ac28;
	position: relative;
	padding-left: 5px;
	padding-right: 5px;
	display: flex;
	justify-content: center;
	border-top: 2px solid black;
	border-left: 2px solid black;
}

#losers-tab {
	margin: 4px;
	border-collapse: collapse;
}

.losers-cell {
	border: 2px dotted #627A20;
}

.losers-name {
	font-size: 1rem;
	text-align: center;
	padding: 0.1rem;
	color: #214132;
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
