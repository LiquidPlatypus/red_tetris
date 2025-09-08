import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import App from "@/App.vue";

// Mock du module socket.
vi.mock("@/socker.js", () => {
	const mockSocket = {
		on: vi.fn(),
		off: vi.fn(),
		emit: vi.fn(),
		// Simuler les événements reçus du serveur
		_events: new Map(),

		// Méthode helper pour déclencher des événements dans les tests
		_trigger: function(event, ...args) {
			const handlers = this._events.get(event) || []
			handlers.forEach(handler => handler(...args))
		}
	}

	// Intercepter les appels socket.on pour stocer les handlers.
	mockSocket.on.mockImplementation((event, handler) => {
		if (!mockSocket._events.has(event)) {
			mockSocket._events.set(event, [])
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
