<script setup>
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/AppButton.vue'
import socket from '@/socket';

const router = useRouter()
const route = useRoute()
const seed = route.params.seed;
console.log('Lobby join !');

function createGame() {
	router.push('/game')
}
</script>

<template>
	<main class="lobby">
		<div class="gameChoice">
			<AppButton @click="createGame">LAUNCH GAME</AppButton>
			<AppButton>COPY LINK</AppButton>
		</div>
	</main>
</template>

<style scoped>
.gameChoice {
	display: grid;
	gap: 1vh;
}
</style>
