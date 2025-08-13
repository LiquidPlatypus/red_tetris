<script setup>
import { onBeforeUnmount, ref, onMounted } from "vue";
import {useRouter, onBeforeRouteLeave} from "vue-router";
import socket from '@/socket';
import AppButton from "@/components/AppButton.vue";
import { askServer } from "@/utils";

const seed = ref('');
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
		router.push('/');
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

			<!-- A ENLEVER -->
			<AppButton @click="retry">RETURN LOBBY</AppButton>
		</div>

		<RouterView />
	</main>
</template>

<style scoped>
main {
	font-family: Pixel, sans-serif;
}

#game-over {
	background-color: #214132;
	border-top: 15px solid #3365ff;
	border-left: 5px solid lightgray;
	border-right: 10px solid lightgray;
	border-bottom: 10px solid lightgray;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 5px;
	position: relative;
	box-shadow: 2px 2px black;
}

#game-over::before {
	content: "";
	position: absolute;
	top: -15px; /* pour aligner avec le border-top */
	left: -4.7px; /* dépassement à gauche */
	width: calc(100% + 15px); /* dépassement à droite aussi */
	height: 15px; /* même hauteur que ton border-top */
	background-color: blue; /* même couleur que ton border-top */
	border-top: 3px solid lightgrey;
	border-bottom: 2px solid lightgrey;
	border-left: 3px solid lightgrey;
	border-right: 3px solid lightgrey;
	box-sizing: border-box;
}

h2 {
	color: red;
}

.retry {
	width: 75%;
}

::v-deep(.table-head) {
	background-color: darkolivegreen;
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
