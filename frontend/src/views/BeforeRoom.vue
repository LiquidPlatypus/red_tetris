<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppButton from "@/components/AppButton.vue";
import socket from "@/socket.js";

const router = useRouter();
const route = useRoute();
const pseudo = ref('');
const seed = route.params.seed;

function joinLobby() {
    if (pseudo.value.trim() === '') return;
    console.log(`/${seed}/${pseudo.value}`);
    router.push(`/${seed}/${pseudo.value}`);
}

</script>

<template>

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

</template>

<style>
</style>