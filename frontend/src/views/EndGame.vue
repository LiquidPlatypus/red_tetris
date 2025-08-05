<script setup>
import {ref} from "vue";
import { useRouter } from "vue-router";
import socket from '@/socket';
import AppButton from "@/components/AppButton.vue";

socket.on('game-finish', () => {
	socket.emit('get-rank');
});

socket.on('rank', (rank) => {
	console.log(rank);
	const html = rank.map(({ score, username }) => {
        return `<h1>[${score}] => ${username}</h1>`;
    }).join('');
	document.getElementById('result').innerHTML = html;
});

const router = useRouter();

// A ENLEVER !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const allPlayerFinished = ref(false);

function retry() {
	router.push("/game");
}
</script>

<template>
	<main class="endgame">
		<div class="game-over">
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
.game-over {
	font-family: Pixel, sans-serif;
	grid-column: 1 / 4;
	grid-row: 5;
	text-align: center;
	color: red;
	font-weight: bold;
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
