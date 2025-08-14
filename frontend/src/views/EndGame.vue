<script setup>
import { onBeforeUnmount, ref, onMounted } from "vue";
import {useRouter, onBeforeRouteLeave} from "vue-router";
import socket from '@/socket';
import AppButton from "@/components/AppButton.vue";
import { askServer } from "@/utils";

const username = ref('');

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
		router.push('/');
	window.addEventListener("beforeunload", handleBeforeUnload);
});
onBeforeUnmount(() => {
	window.removeEventListener("beforeunload", handleBeforeUnload);
});

</script>

<template>
	<main class="endgame">
		<div id="game-over">
			<div id="result">
				<!-- TABLEAU -->
				<h2>WAITING FOR OTHER PLAYERS TO FINISH
					<span class="dot-typing"></span>
				</h2>
			</div>
		</div>

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

#game-over {
	background-color: #005C5C;
	border-top: 15px solid #3365ff;
	border-left: 5px solid lightgray;
	border-right: 10px solid lightgray;
	border-bottom: 10px solid lightgray;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	position: relative;
	box-shadow: 2px 2px black;
}

#game-over::before {
	content: "Results";
	position: absolute;
	top: -15px;
	left: -4.7px;
	width: calc(100% + 15px);
	height: 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: blue;
	border-top: 3px solid lightgrey;
	border-bottom: 2px solid lightgrey;
	border-left: 3px solid lightgrey;
	border-right: 3px solid lightgrey;
	box-sizing: border-box;
	color: white;
	font-weight: bold;
	font-size: 12px;
}

.controls {
	margin-top: 0.5rem;
}

h2 {
	color: red;
}

::v-deep(.table-head) {
	background-color: #88ac28;
	color: blue;
	border: 3px red solid;
}

::v-deep(#result-tab) {
	border: 1px solid red;
	color: yellow;
	border-collapse: collapse;
}

::v-deep(#result-tab th),
::v-deep(#result-tab td) {
	border: 1px solid red;
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
