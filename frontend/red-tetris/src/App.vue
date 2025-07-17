<script setup>
import { RouterView } from 'vue-router'

</script>

<template>
	<div id="app">
		<p><strong>Current route :</strong> {{ $route.fullPath }}</p>
		<router-view />
	</div>
</template>

<style scoped>

</style>
