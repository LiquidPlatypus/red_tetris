<script setup>
import {useRouter} from "vue-router";
import socket from '@/socket';
import AppButton from "@/components/AppButton.vue";

socket.on('game-finish', () => {
	socket.emit('get-rank');
});

socket.on('rank', (rank) => {
	console.log(rank);
	document.getElementById("result").innerHTML = rank.map(({score, username}) => {
		return `
			<tr class="result-tab">
				<th title="${username}">
					${username}
				</th>
			</tr>
			<tr>
				<td>${score}</td>
			</tr>
	`}).join('');
});

const router = useRouter();

function retry() {
	router.push("/game");
}
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
			<AppButton @click="retry">RETRY</AppButton>
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
}

#result {
	color: red;
	text-align: center;
}

.result-tab {
	border: 1px solid red;
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
