import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Game from "../views/Game.vue";
import Lobby from "../views/Lobby.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "Home",
			component: Home,
		},
		{
			path: "/lobby",
			name: "Lobby",
			component: Lobby,
		},
		{
			path: "/game",
			name: "Game",
			component: Game,
		},
	],
});

export default router;
