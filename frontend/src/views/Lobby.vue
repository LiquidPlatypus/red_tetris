<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import AppButton from "@/components/AppButton.vue";
import socket from '@/socket';
import { askServer } from "@/utils";

const router = useRouter()
const route = useRoute()
const seed = route.params.seed;
const username = route.params.username;
if (username.length > 12) {
	// const confirmPseudo = window.confirm("Your username is too long (max 12 characters)\nIt will be trunced\nContinue ?");
	const confirmPseudo = window.prompt("Entre ton pseudo :", "Joueur1");
	if (confirmPseudo !== '') {
		username = confirmPseudo;
	}
}

console.log('Lobby join !');
socket.emit('join-user', { seed, username });

socket.on('launch-game', () => {
	router.push('/game');
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
		<div class="gameChoice">
			<AppButton @click="createGame">LAUNCH GAME</AppButton>
			<AppButton @click="copyLink">COPY LINK</AppButton>
		</div>
		<div id="url"></div>
	</main>
</template>

<style scoped>
.gameChoice {
	display: grid;
	gap: 1vh;
}
</style>
