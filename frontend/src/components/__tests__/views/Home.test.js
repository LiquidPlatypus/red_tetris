import { vi, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router"
import { routes } from "@/router"
import Home from "../../../views/Home.vue";

const router = createRouter({
	history: createWebHistory(),
	routes
})

vi.mock("@/socket.js", () => {
	const mockSocket = {
		on: vi.fn(),
		emit: vi.fn(),
		_events: new Map(),

		_trigger: function(event, ...args) {
			const handlers = this._events.get(event) || [];
			handlers.forEach(handler => handler(...args));
		}
	};

	mockSocket.on.mockImplementation((event, handler) => {
		if (!mockSocket._events.has(event)) {
			mockSocket._events.set(event, []);
		}
		mockSocket._events.get(event).push(handler);
	});

	return { default: mockSocket };
});
