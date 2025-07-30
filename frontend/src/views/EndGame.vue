<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

</script>

<template>
	<main class="endgame">
		<div class="game-over">
			<h2>GAME OVER !</h2>
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
	color: #ff0000;
	font-weight: bold;
}
</style>
