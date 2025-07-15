<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'

import {ref} from 'vue'

const show = ref(true)
</script>

<template>
	<main>
		<div>
			<h1 class="title" v-if="show">Simplytis</h1>
		</div>
		<div>
			<button class="button" @click="show = !show">Créer partie</button>
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
		font-family: "Droid Sans", sans-serif;
		position: absolute;
		top: 50px;
		left: 50%;
		transform: translateX(-50%);
	}

	.button {
		border-radius: 0;
		background-color: #777482;
		width: 15vw;
		height: 4vh;
	}
	.button:hover {
		background-color: #bebcc4;
	}
</style>
