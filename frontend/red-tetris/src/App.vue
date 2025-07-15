<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
	<main>
		<div>
			<p>Simplytis</p>
			<button>Créer partie</button>
		</div>
	</main>
</template>

<style scoped>
	main {
		background-color: darkblue;
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	div {
		text-align: center;
	}
</style>
