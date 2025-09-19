import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import flushPromises from "flush-promises";
import App from "@/App.vue";

// Mock du module socket.
vi.mock("@/socket.js", () => {
	const mockSocket = {
		on: vi.fn(),
		off: vi.fn(),
		emit: vi.fn(),
		// Simuler les événements reçus du serveur
		_events: new Map(),

		// Méthode helper pour déclencher des événements dans les tests
		_trigger: function(event, ...args) {
			const handlers = this._events.get(event) || [];
			handlers.forEach(handler => handler(...args));
		}
	};

	// Intercepter les appels socket.on pour stocker les handlers.
	mockSocket.on.mockImplementation((event, handler) => {
		if (!mockSocket._events.has(event)) {
			mockSocket._events.set(event, []);
		}
		mockSocket._events.get(event).push(handler);
	});

	return { default: mockSocket };
});

// Mock des API navigateur.
const mockAlert = vi.fn();
const mockConfirm = vi.fn();

// Configuration globale des mocks navigateur.
Object.defineProperty(window, "alert", {
	writable: true,
	value: mockAlert
});
Object.defineProperty(window, "confirm", {
	writable: true,
	value: mockConfirm
});

// Import du socket mocké.
import socket from "@/socket.js";

describe("App.vue", () => {
	let wrapper;
	let router;

	beforeEach(async () => {
		// Réinitialiser le mock socket avant chaque test
		vi.clearAllMocks();
		socket._events.clear();

		// Re-mocker les méthodes pour être sûr qu'elles sont des spies
		socket.emit = vi.fn();
		socket.off = vi.fn();
		socket.on = vi.fn().mockImplementation((event, handler) => {
			if (!socket._events.has(event)) {
				socket._events.set(event, []);
			}
			socket._events.get(event).push(handler);
		});

		// Créer un router de test avec des routes simples.
		router = createRouter({
			history: createWebHistory(),
			routes: [
				{ path: "/", component: { template: "<div>Home</div>" } },
				{ path: "/game", component: { template: "<div>Game</div>" } }
			]
		});

		// Naviguer vers la page d'accueil pour commencer.
		await router.push("/");

		// Monter le composant avec le router.
		wrapper = mount(App, {
			global: {
				plugins: [router]
			}
		});

		// Attendre que le router soit prêt.
		await router.isReady();
	});

	afterEach(() => {
		// Nettoyer les mocks entre les tests.
		vi.clearAllMocks();
		if (socket._events)
			socket._events.clear();

		if (wrapper)
			wrapper.unmount();
	});

	describe("Initialisation du composant", () => {
		it("should save all socket listeners on mount", () => {
			// Vérifier que tous les événements socket ont été enregistrés.
			expect(socket.on).toHaveBeenCalledWith("connect", expect.any(Function));
			expect(socket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
			expect(socket.on).toHaveBeenCalledWith("refresh-player", expect.any(Function));
			expect(socket.on).toHaveBeenCalledWith("server-log", expect.any(Function));
			expect(socket.on).toHaveBeenCalledWith("error", expect.any(Function));
			expect(socket.on).toHaveBeenCalledWith("go-to", expect.any(Function));
		});

		it("should display OK.TRIS title", () => {
			const title = wrapper.find("h1.title");
			expect(title.exists()).toBe(true);
			expect(title.text()).toBe("OK.TRIS");
		});

		it("should have RouterView to display components", () => {
			expect(wrapper.findComponent({ name: "RouterView" }).exists()).toBe(true);
		});
	});

	describe("Gestion des événements socket", () => {
		it("should handle the connect event with a log", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			// Simuler la réception de l'événement connect
			socket._trigger("connect");
			const calls = consoleSpy.mock.calls[0][0].replace(/\u200B/g, ""); // enlève les ZWSP
			expect(calls).toBe("🤠 Connected !");
			consoleSpy.mockRestore();
		});

		it("should handle the disconnect event with a log", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			socket._trigger("disconnect");
			const calls = consoleSpy.mock.calls[0][0].replace(/\u200B/g, ""); // enlève les ZWSP
			expect(calls).toBe("😵 Disconnected.");
			consoleSpy.mockRestore();
		});

		it("should emit refreshme when refresh-player is received", () => {
			socket._trigger("refresh-player");

			expect(socket.emit).toHaveBeenCalledWith("refreshme");
		});

		it("should log server messages", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			const testMessage = "test server message";

			socket._trigger("server-log", testMessage);
			expect(consoleSpy).toHaveBeenCalledWith(`[SERVER LOG] ${testMessage}`);
			consoleSpy.mockRestore();
		});
	});

	describe("Gestion des erreurs", () => {
		it("should display a warning and redirect to home in case of an error", async () => {
			const errorMessage = "Une erreur est survenue";
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			socket._trigger("error", errorMessage);

			// Vérifier que l'erreur est loggée.
			expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage);

			// Vérifier que l'alerte est affichée.
			expect(mockAlert).toHaveBeenCalledWith(errorMessage);

			// Attendre que la navigation soit terminée.
			await wrapper.vm.$nextTick();

			// Vérifier que la navigation vers l'accueil a eu lieu.
			expect(wrapper.vm.$route.path).toBe('/');

			consoleErrorSpy.mockRestore();
		});
	});

	describe("Navigation automatique via socket", () => {
		it("should navigate to the specified target with a message", async () => {
			const destination = "/game";
			const message = "Bienvenue dans le jeu";

			socket._trigger("go-to", destination, message);

			// Vérifier que l'alerte avec le message est affichée.
			expect(mockAlert).toHaveBeenCalledWith(message);

			// Attendre la navigation.
			await wrapper.vm.$nextTick();

			await flushPromises();

			// Vérifier que la navigation a eu lieu.
			expect(wrapper.vm.$route.path).toBe(destination);
		});

		it("should navigate without warning when the message is empty", async () => {
			const destination = "/game"; // Correction: destinaton -> destination

			socket._trigger("go-to", destination, "");

			// Vérifier qu'aucune alerte n'a été affichée.
			expect(mockAlert).not.toHaveBeenCalled();

			await wrapper.vm.$nextTick();

			await flushPromises();

			expect(wrapper.vm.$route.path).toBe(destination);
		});
	});

	describe("Interaction avec le titre", () => {
		it("should not do anything if already on home page", async () => {
			// S'assurer qu'on est sur la page d'accueil.
			await router.push("/");
			await wrapper.vm.$nextTick();

			const title = wrapper.find("h1.title");
			await title.trigger("click");

			// Aucune confirmation ne devrait être demandée.
			expect(mockConfirm).not.toHaveBeenCalled();
		});

		it("should ask for confirmation and navigate if accepted", async () => {
			// Naviguer vers une autre page.
			await router.push("/game");
			await wrapper.vm.$nextTick();

			// Simuler que l'utilisateur accepte la confirmation.
			mockConfirm.mockReturnValue(true);

			const title = wrapper.find("h1.title");
			await title.trigger("click");

			// Vérifier que la confirmation a été demandée.
			expect(mockConfirm).toHaveBeenCalledWith("Return menu ?");

			// Vérifier que l'événement 'return' a été émis.
			expect(socket.emit).toHaveBeenCalledWith("return");

			// Vérifier la navigation vers l'accueil.
			await wrapper.vm.$nextTick();

			await flushPromises();

			expect(wrapper.vm.$route.path).toBe("/");
		});

		it("should not navigate if the confirmation is denied", async () => {
			await router.push("/game");
			await wrapper.vm.$nextTick();

			// Simuler que l'utilisateur refuse la confirmation.
			mockConfirm.mockReturnValue(false);

			const title = wrapper.find("h1.title");
			await title.trigger("click");

			expect(mockConfirm).toHaveBeenCalledWith("Return menu ?");

			// Vérifier qu'aucun événement return n'a été émis.
			expect(socket.emit).not.toHaveBeenCalledWith("return");

			// Vérifier qu'on reste sur la même page.
			expect(wrapper.vm.$route.path).toBe("/game");
		});
	});

	describe("Nettoyage des listeners", () => {
		it("should delete all socket listeners on unmount", () => {
			// Démonter le composant pour déclencher onBeforeUnmount.
			wrapper.unmount();

			// Vérifier que tous les listeners ont été supprimés.
			expect(socket.off).toHaveBeenCalledWith("go-to");
			expect(socket.off).toHaveBeenCalledWith("error");
			expect(socket.off).toHaveBeenCalledWith("server-log");
			expect(socket.off).toHaveBeenCalledWith("refresh-player");
			expect(socket.off).toHaveBeenCalledWith("disconnect");
			expect(socket.off).toHaveBeenCalledWith("connect");
		});
	});
});
