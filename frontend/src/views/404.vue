<script setup>
import { useRouter } from "vue-router";
import AppButton from "@/components/AppButton.vue";
import TetrisText from "@/components/TetrisText.vue";
import Window from "@/components/Window.vue";

const router = useRouter();
function returnHome() {
	router.push('/');
}

</script>

<template>
	<main class="404">
		<Window title="LOST" class="lost">
			<div class="lost-background">
				<TetrisText class="lost-text" text="HAHAH TU T'ES PERDU NULOS"></TetrisText>
				<TetrisText class="emoji" text="/"></TetrisText>
				<div class="loser">
					<TetrisText text="LOSER"></TetrisText>
					<TetrisText class="exclamation" text="!!"></TetrisText>
				</div>
			</div>
		</Window>
		<AppButton @click="returnHome">RETURN HOME</AppButton>
		<ul>
			<li>
				<p>Z</p>
				<a href="https://www.youtube.com/watch?v=nk63slyfAF0" target="_blank">don diego de la vega</a>
			</li>
			<li>
				<p>🤠</p>
				<a href="https://www.youtube.com/watch?v=AF22vaGLziM&list=RDAF22vaGLziM&start_radio=1" target="_blank">tahiti</a>
			</li>
		</ul>
	</main>
</template>

<style scoped>

a {
	text-decoration: none;
	color: #008282;
}

ul {
	margin-top: 5px;
}

li {
	list-style: none;
	display: flex;
	gap: 5px;
}

.lost {
	margin: 15px;
}

.lost-background {
	margin: 10px;
	padding: 20px;
	background: #88ac28;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
}

.emoji {
	animation: blink 1s infinite;
}

.loser {
	display: flex;
	align-items: center;
}

.exclamation {
	animation: blink 1s infinite;
}

@keyframes blink {
	0%, 49% {
		opacity: 1;
	}
	50%, 100% {
		opacity: 0;
	}
}

</style>
