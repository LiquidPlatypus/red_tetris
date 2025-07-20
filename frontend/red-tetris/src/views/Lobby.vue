<script setup>
import { useRouter } from 'vue-router'
import AppButton from '@/components/AppButton.vue'

const router = useRouter()

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
