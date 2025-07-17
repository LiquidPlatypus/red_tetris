<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'

import {ref} from 'vue'

const pseudo = ref('')

function creerPartie() {
	console.log(pseudo.value);
}

</script>

<template>
	<main>
		<div>
			<h1 class="title">SIMPLYTIS</h1>
		</div>
		<div class="player-input">
			<input
				id="msgInput"
				v-model="pseudo"
				class="pseudo-input"
				type="text"
				placeholder="Pseudo">
			<button id="sendBtn" class="button" type="button" @click="creerPartie">CREATE GAME</button>
			<button id="createList">createList</button>
			<button id="getCurrentPiece">getCurrentPiece</button>
			<button id="getNextPiece">getNextPiece</button>
		</div>
	</main>
</template>

<style scoped>
	main {
		background-color: #8c8899;
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.title {
		color: aliceblue;
		font-family: 'ModernTetris', sans-serif;
		position: absolute;
		top: 50px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 3rem;
	}

	.player-input {
		display: grid;
		gap: 1vh;
	}

	input::placeholder {
		font-family: 'ModernTetris', sans-serif;
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

	.button {
		border-radius: 0;
		background-color: #777482;
		height: 4vh;
		cursor: pointer;
		font-family: 'ModernTetris', sans-serif;
	}
	.button:hover {
		background-color: #bebcc4;
	}
</style>
