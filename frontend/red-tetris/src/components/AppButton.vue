<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
	label?: string
	type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
	<button class="app-button" :type="type ?? 'button'">
		<slot>{{ label }}</slot>
	</button>
</template>

<style scoped>
	.app-button {
		border-radius: 0;
		background-color: #777482;
		height: 4vh;
		cursor: pointer;
		font-family: 'ModernTetris', sans-serif;
	}

	.app-button:hover {
		background-color: #bebcc4;
	}
</style>
