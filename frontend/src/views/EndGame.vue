<script setup>
import { onBeforeUnmount, ref, onMounted, computed } from "vue";
import {useRouter, onBeforeRouteLeave} from "vue-router";
import socket from '@/socket';
import AppButton from "@/components/AppButton.vue";
import Window from "@/components/Window.vue";
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
const losers = computed(() => rank.value.slice(0, -1));
</script>

<template>
	<main class="endgame">
		<div v-if="allPlayersFinished" class="end-screen">
			<!-- Vainqueur en haut -->
			<Window title="Winner" variant="results" class="winner">
				<div class="winner-box">
					<span class="winner-name">{{ winner?.username }}</span>
				</div>
			</Window>

			<!-- Les autres joueurs en dessous -->
			<div class="losers">
				<Window
					v-for="{ username } in losers"
					:key="username"
					:title="username"
					variant="results"
				>
					<h2>{{ username }}</h2>
				</Window>
			</div>

			<AppButton>
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
	gap: 1rem;
	width: 100%;
}

.winner {
	width: 100%;
	text-align: center;
}

.winner-box {
	font-size: 1.8rem;
	font-weight: bold;
	text-align: center;
	color: gold;
}

.losers {
	display: grid;
	grid-template-columns: repeat(2, 10rem);
	gap: 1rem;
	width: 100%;
	max-width: 900px;
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
