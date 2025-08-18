<script setup>
defineProps({
	title: { type: String, required: false },
	titleBgColor: { type: String, required: false },
	customClass: { type: String, required: false },
	customStyle: { type: Object, required: false }
})
</script>

<template>
	<div :class="['win95-window', customClass]" :style="customStyle">
		<div class="win95-title-bar" :style="{ backgroundColor: titleBgColor }">
			<span class="win95-title">{{ title }}</span>
		</div>
		<div class="win95-content">
			<slot></slot>
		</div>
	</div>
</template>

<style scoped>
.win95-window {
	background-color: #214132;
	border-top: 15px solid #000082;
	border-left: 5px solid lightgrey;
	border-right: 5px solid lightgrey;
	border-bottom: 10px solid lightgrey;
	position: relative;
	box-shadow: 2px 2px black;
}

.win95-title-bar {
	position: absolute;
	top: -15px;
	left: -5px;
	width: calc(100% + 10px);
	height: 15px;
	background-color: #000082;
	border-top: 3px solid lightgrey;
	border-bottom: 2px solid lightgrey;
	border-left: 3px solid lightgrey;
	border-right: 3px solid lightgrey;
	display: flex;
	align-items: center;
	justify-content: left;
	color: white;
	font-size: 0.8rem;
	font-weight: bold;
}

.win95-title {
	margin-left: 3px;
}

.win95-content {
	padding: 0.5rem;
}
</style>
