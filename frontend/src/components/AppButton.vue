<script setup>
defineProps({
	label: { type: String, required: false },
	type: {
		type: String,
		required: false,
		validator: (value) => ["button", "submit", "reset"].includes(value)
	}
})
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
	font-family: "ModernTetris", sans-serif;
}

.app-button:hover {
	background-color: #bebcc4;
}
</style>
