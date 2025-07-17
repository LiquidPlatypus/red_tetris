<script setup>
import {ref} from 'vue'
import {useRouter} from "vue-router";
import ApppButton from "@/components/ApppButton.vue";

const router = useRouter();

const pseudo = ref('');

function creerPartie() {
	console.log(pseudo.value);
	if (pseudo.value.trim() === '') return;
	router.push('/lobby');

}

</script>

<template>
	<main class="home">
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
			<ApppButton @click="creerPartie">CREATE GAME</ApppButton>
		</div>

		<RouterView />
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
</style>
