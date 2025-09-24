<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import AppButton from "@/components/AppButton.vue";
import socket from '@/socket';
import { askServer } from "@/utils";
import Window from "@/components/Window.vue";

const router = useRouter()
const route = useRoute()
const seed = route.params.seed;
let username = route.params.username;
if (username.length > 12) {
	const res = window.confirm('Your username is too long (12 char max)\nContinue ? (it be trunc)');
	if (res) {
		console.log('Lobby join !');
		socket.emit('join-user', { seed, username });
	} else {
		router.push(`/${seed}`);
	}
	// router.push(`/${seed}`);
	// window.alert('Your username is too long (12 char max)');
} else {
	console.log('Lobby join !');
	socket.emit('join-user', { seed, username });
}

socket.on('launch-game', () => {
	router.push('/game');
});

const isHost = ref(false);
// askServer("get-host", socket).then((res) => {
// 	isHost.value = res;
// });
socket.emit("ask-server", "get-host");
socket.on("response:get-host", (res) => {
	isHost.value = res;
});

const playerList = ref([]);
socket.emit("ask-server", "get-player-list");
socket.on("get-player-list", (res) => {
	playerList.value = res;
});

const players = computed(() => {
	return (playerList.value || []).map((p) => ({
		username: p.username,
		status: p.status ?? "unknown",
		isHost: p.host === true,
	}));
});

function createGame() {
	socket.emit('launch-game', seed);
}
async function copyLink() {
	const link = `${window.location.origin}/${seed}`;
	console.log(`Link copied : ${window.location.origin}/${seed}/`);
	if (navigator.clipboard && navigator.clipboard.writeText)
		navigator.clipboard.writeText(link);
	else {
		const element = document.getElementById('url');
		element.innerHTML = link;
	}
}

onBeforeRouteLeave((to, from, next) => {
	const allowedPaths = ['/game', '/'];
	if (allowedPaths.includes(to.path)) {
		next();
		return;
	}
	if (to.path === `/${seed}`) {
		next();
		socket.emit('return');
		return;
	}
	const confirmLeave = window.confirm("Rage quit ?");
	if (confirmLeave) {
		next();
		socket.emit('return');
	} else {
		next(false);
	}
});

function handleBeforeUnload(event) {
	event.preventDefault();
}

onMounted(() => {
	window.addEventListener("beforeunload", handleBeforeUnload);
});
onBeforeUnmount(() => {
	window.removeEventListener("beforeunload", handleBeforeUnload);
	socket.off('launch-game');
});

</script>

<template>
	<main class="lobby">
		<Window title="Player list" customClass="fix-overflow-endgame" class="players-list" v-if="players[1]">
			<div class="players-list-content">
				<ul>
					<li v-for="(player, index) in players" :key="index" :class="{ host: player.isHost }">
						{{ player.username }}
					</li>
				</ul>
			</div>
			<p v-if="isHost" class="warning">You Can only launch the game if all players are in the Lobby.</p>
		</Window>
		<div class="gameChoice">
			<AppButton @click="createGame" v-if="isHost">LAUNCH GAME</AppButton>
			<p v-if="!isHost">Only the host can launch the game</p>
			<AppButton @click="copyLink">COPY LINK</AppButton>
		</div>
		<div id="url"></div>
	</main>
</template>

<style scoped>
main {
	font-family: Pixel, sans-serif;
	display: flex;
	flex-direction: row;
	min-height: 100vh;
	width: 100%;
	padding: 1rem;
}

ul {
	list-style: square;
}

li {
	color: #214132;
}
li.host {
	color: #0000e2;
	font-weight: bold;
}

p {
	font-size: 20px;
}

.players-list {
	flex-shrink: 0;
	min-width: 200px;
	max-width: 250px;
	padding: 10px;
	position: absolute;
	left: 5%;
	top: 50%;
	transform: translate(0, -50%);
}

.players-list-content {
	background-color: #88ac28;
	border-top: 2px solid black;
	border-left: 2px solid black;
}

.warning {
	font-size: 15px;
	text-align: center;
}

.gameChoice {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	max-width: 175px;
	gap: 1vh;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
}
</style>
