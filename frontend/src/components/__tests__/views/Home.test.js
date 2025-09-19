import { vi, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router"
import { routes } from "@/router"
import Home from "../../../views/Home.vue";

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

import socket from "@/socket.js";

describe("Home.vue", () => {
	let wrapper;
	let router;

	beforeEach(async () => {
		vi.clearAllMocks();
		socket._events.clear();

		socket.emit = vi.fn();
		socket.on = vi.fn().mockImplementation((event, handler) => {
			if (!socket._events.has(event)) {
				socket._events.set(event, []);
			}
			socket._events.get(event).push(handler);
		});

		router = createRouter({
			history: createWebHistory(),
			routes: [
				{ path: "/", component: { template: "<div>Home</div>" } },
				// { path: `/${info.Seed}/${info.Username}`, component: { template: "<div></div>" } }
			]
		});

		await router.push("/");

		wrapper = mount(Home, {
			global: {
				plugins: [router]
			}
		});

		await router.isReady();
	});

	afterEach(async () => {
		vi.clearAllMocks();
		if (socket._events)
			socket._events.clear();

		if (wrapper)
			wrapper.unmount();
	});

	describe("Initialisation du composant", () => {
		it("should save all socket listeners on mount", () => {
			expect(socket.on).toHaveBeenCalledWith("lobby-join", expect.any(Function));
		});
	});

	describe("createLobby()", () => {
		it ("should not emit if empty alias", async () => {
			const input = wrapper.find("input#msgInput");
			await input.setValue("");
			await wrapper.find("button").trigger("click");

			expect(socket.emit).not.toHaveBeenCalledWith();
		});

		it("should emit if non-empty alias", async () => {
			const input = wrapper.find("input#msgInput");
			await input.setValue("VVPOIROT");
			await wrapper.find("button").trigger("click");

			expect(socket.emit).toHaveBeenCalledWith("create-lobby", "VVPOIROT");
		});
	});

	describe("socket event lobby-join", () => {
		it("should redirect to the correct route", async () => {
			const pushSpy = vi.spyOn(router, "push");

			socket._trigger("lobby-join", { Seed: "123", Username: "VVPOIROT" });

			expect(pushSpy).toHaveBeenCalled("/123/VVPOIROT");
		});
	});
});
