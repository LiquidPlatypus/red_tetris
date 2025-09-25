<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppButton from "@/components/AppButton.vue";

const router = useRouter();
const route = useRoute();
const pseudo = ref('');
const seed = route.params.seed;

function joinLobby() {
	if (pseudo.value.trim() === '')
		return;
	if (pseudo.value.includes('/')) {
		alert("Forbidden char in username");
		return;
	}
	router.push(`/${seed}/${pseudo.value}`);
}

</script>

<template>
	<main class="before-room">
		<div id="pseudo-request">
			<input
				id="sendUsername"
				v-model="pseudo"
				class="pseudo-input"
				type="text"
				placeholder="Pseudo"
			/>
			<AppButton @click="joinLobby">JOIN GAME</AppButton>
		</div>
	</main>

</template>

<style scoped>
main {
	font-family: Pixel, sans-serif;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px;
}

#pseudo-request {
	display: grid;
	gap: 1vh;
}

input::placeholder {
	font-family: "ModernTetris", sans-serif;
	font-size: 0.8rem;
	color: darkgray;
}

.pseudo-input {
	font-family: Pixel, sans-serif;
	font-size: 15px;
	border-left: #5454541a solid 3px;
	border-top: #5454541a solid 3px;
	border-right: #5454547a solid 3px;
	border-bottom: #5454547a solid 3px;
	height: 4vh;
}
</style>
