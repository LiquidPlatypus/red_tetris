<script setup>
import { useRoute, useRouter } from "vue-router";
import AppButton from "@/components/AppButton.vue";
import socket from '@/socket';

const router = useRouter()
const route = useRoute()
const seed = route.params.seed;
const username = route.params.username;
console.log('Lobby join !');

if (seed && username) {
	console.log('HERE');
	socket.emit('join-user', { seed, username });
}

socket.on('client-join', (username) => {
	console.log(`${username} join the game.`);
});

socket.on('launch-game', () => {
	router.push('/game');
});

function createGame() {
	socket.emit('launch-game', seed);
}
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
