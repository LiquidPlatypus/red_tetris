import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Game from '../views/Game.vue'
import Lobby from '../views/Lobby.vue'
import EndGame from "../views/EndGame.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'Home',
			component: Home,
		},
		{
			path: '/:seed',
			name: 'LobbyJoin',
			component: () => import('@/views/BeforeRoom.vue'),
			props: true,
		},
		{
			path: '/:seed/:username',
			name: 'Lobby',
			component: () => import('@/views/Lobby.vue'),
			props: true,
		},
		{
			path: '/game',
			name: 'Game',
			component: Game,
		},
		{
			path: '/endgame',
			name: 'EndGame',
			component: EndGame,
		}
	],
})

export default router
