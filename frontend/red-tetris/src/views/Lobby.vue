<script setup>

import {ref} from 'vue';
import {useRouter} from "vue-router";
import ApppButton from "@/components/ApppButton.vue";

const router = useRouter();

function createGame() {
	router.push('/game');
}

</script>

<template>
	<main class="lobby">
		<div class="gameChoice">
			<ApppButton @click="createGame">LAUNCH GAME</ApppButton>
			<ApppButton>COPY LINK</ApppButton>
		</div>
	</main>
</template>

<style scoped>
	.gameChoice {
		display: grid;
		gap: 1vh;
	}

</style>
