<script setup>
import { RouterView } from 'vue-router'

</script>

<template>
	<div id="app">
		<div>
			<h1 class="title">SIMPLYTIS</h1>
		</div>
		<p><strong>Current route :</strong> {{ $route.fullPath }}</p>
		<router-view />
	</div>
</template>

<style scoped>

</style>
