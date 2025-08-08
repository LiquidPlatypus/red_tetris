<script setup>
import { RouterView, useRouter } from "vue-router";
import socket from "./socket.js";

const router = useRouter();

socket.on("connect", () => {
	console.log("🤠​ Connected !");
});

socket.on("disconnect", () => {
	console.log("😵​ Disconnected.");
});

socket.on('refresh-player', () => {
	socket.emit('refreshme');
});

socket.on('error', (message) => {
	console.error(message);
	window.alert(message);
	router.push('/');
});

function clickTitle() {
	socket.emit('return');
}

</script>

<template>
	<div id="app">
		<div>
			<router-link to="/">
				<h1 class="title cursor-pointer" @click="clickTitle" >OK.TRIS</h1>
			</router-link>
		</div>
		<router-view />
	</div>
</template>

<style scoped></style>
