<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
	<div id="app">
		<p><strong>Current route :</strong> {{ $route.fullPath }}</p>
		<div>
			<router-link to="/" class="no-underline">
				<h1 class="title cursor-pointer">OK.TRIS</h1>
			</router-link>
		</div>
		<router-view />
	</div>
</template>

<style scoped></style>
