<script setup>
import { RouterView } from "vue-router";
import socket from "./socket.js";

socket.on("connect", () => {
	console.log("🤠​ Connected !");
});

socket.on("disconnect", () => {
	console.log("😵​ Disconnected.");
});
</script>

<template>
	<div id="app">
		<div>
			<router-link to="/" class="no-underline">
				<h1 class="title cursor-pointer">OK.TRIS</h1>
			</router-link>
		</div>
		<router-view />
	</div>
</template>

<style scoped></style>
