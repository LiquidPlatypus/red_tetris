<script setup>
import { onBeforeUnmount, ref, onMounted } from "vue";
import {useRouter, onBeforeRouteLeave} from "vue-router";
import socket from '@/socket';
import AppButton from "@/components/AppButton.vue";
import Window from "@/components/Window.vue";
import { askServer } from "@/utils";

const username = ref('');
const router = useRouter();

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


socket.on('rank', (rank) => {
	document.getElementById("result").innerHTML = `
		<table id="result-tab">
			<thead class="table-head">
				<tr>
					<th>Username</th>
					<th>Score</th>
				</tr>
			</thead>
			<tbody>
				${rank.map(({score, username}) => `
				<tr>
					<td title="${username}">${username}</td>
					<td>${score}</td>
				</tr>
				`).join('')}
			</tbody>
		</table>
`;
});

</script>

<template>
	<main class="endgame">
		<Window title="Results" variant="results" id="game-over">
			<div id="result">
				<!-- TABLEAU -->
				<h2>WAITING FOR OTHER PLAYERS TO FINISH
					<span class="dot-typing"></span>
				</h2>
			</div>
		</Window>

		<div class="controls">
			<AppButton @click="retry">RETURN LOBBY</AppButton>
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

.controls {
	margin-top: 0.5rem;
}

::v-deep(.table-head) {
	background-color: #88ac28;
	color: blue;
	border-top: 2px black solid;
	border-left: 2px black solid;
}

::v-deep(#result-tab) {
	color: yellow;
	border-collapse: collapse;
	border-left: 2px black solid;
}

::v-deep(#result-tab th),
::v-deep(#result-tab td) {
	padding: 8px;
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
