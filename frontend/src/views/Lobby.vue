<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import AppButton from "@/components/AppButton.vue";
import socket from '@/socket';

const router = useRouter()
const route = useRoute()
const seed = route.params.seed;
const username = route.params.username;
console.log('Lobby join !');

socket.emit('join-user', { seed, username });

socket.on('launch-game', () => {
	router.push('/game');
});

function createGame() {
	socket.emit('launch-game', seed);
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
});

</script>

<template>
	<main class="lobby">
		<div class="gameChoice">
			<AppButton @click="createGame">LAUNCH GAME</AppButton>
			<AppButton>COPY LINK</AppButton>
		</div>
	</main>
</template>

<style scoped>
.gameChoice {
	display: grid;
	gap: 1vh;
}
</style>
