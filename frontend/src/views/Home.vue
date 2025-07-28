<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppButton from "@/components/AppButton.vue";
import socket from "@/socket.js";

socket.on("messageFromServer", (message) => {
	console.log(message);
});
socket.on('error', (message) => {
	console.error(message);
	window.alert(message);
});

const router = useRouter();

const pseudo = ref("");

function createLobby() {
	if (pseudo.value.trim() === "") return;
	router.push("/lobby");
}
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
