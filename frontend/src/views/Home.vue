<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppButton from "@/components/AppButton.vue";
import socket from "@/socket.js";

const router = useRouter();

const pseudo = ref('');

function createLobby() {
	if (pseudo.value.trim() === '') return;
	socket.emit('create-lobby', pseudo.value);
}

socket.on('lobby-join', (seed) => {
	socket.emit('join-game', seed);
	router.push(`/${seed}`);
});
socket.on('error', (message) => {
	console.error(message);
	window.alert(message);
});

</script>

<template>
	<main class="home">
		<div class="player-input">
			<input
				id="msgInput"
				v-model="pseudo"
				class="pseudo-input"
				type="text"
				placeholder="Pseudo"
			/>
			<AppButton @click="createLobby">CREATE GAME</AppButton>
		</div>

		<RouterView />
	</main>
</template>

<style scoped>
.player-input {
	display: grid;
	gap: 1vh;
}

input::placeholder {
	font-family: "ModernTetris", sans-serif;
	font-size: 0.8rem;
	color: darkgrey;
}

.pseudo-input {
	border-left: #5454541a solid 3px;
	border-top: #5454541a solid 3px;
	border-right: #5454547a solid 3px;
	border-bottom: #5454547a solid 3px;
	height: 4vh;
}
</style>
