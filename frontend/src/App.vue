<script setup>
import { RouterView, useRoute, useRouter, onBeforeRouteLeave  } from "vue-router";
import socket from "./socket.js";
import { onBeforeUnmount } from "vue";

const router = useRouter();
const route = useRoute();

socket.on("connect", () => {
	console.log("🤠​ Connected !");
});

socket.on("disconnect", () => {
	console.log("😵​ Disconnected.");
});

socket.on('refresh-player', () => {
	socket.emit('refreshme');
});

socket.on('server-log', (log) => {
	console.log(`[SERVER LOG] ${log}`);
});

socket.on('error', (message) => {
	console.error(message);
	window.alert(message);
	router.push('/');
});

socket.on('go-to', (router_dest, message) => {
	if (message !== '')
		window.alert(message);
	router.push(router_dest);
});

function clickTitle() {
	if (route.fullPath === '/')
		return;
	const answer = window.confirm("Return menu ?");
	if (answer) {
		socket.emit('return');
		router.push('/');
	}
}

onBeforeUnmount(() => {
	socket.off('go-to');
	socket.off('error');
	socket.off('server-log');
	socket.off('refresh-player');
	socket.off('disconnect');
	socket.off('connect');
});

</script>

<template>
	<div id="app">
		<div>
			<!-- <router-link to="/"> -->
			<h1 class="title cursor-pointer" @click="clickTitle" >OK.TRIS</h1>
			<!-- </router-link> -->
		</div>
		<router-view />
	</div>
</template>

<style scoped></style>
