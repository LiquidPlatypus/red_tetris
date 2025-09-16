import { describe, it, expect } from "vitest";
import {mount} from "@vue/test-utils";
import router from "@/router";
import BeforeRoom from "@/views/BeforeRoom.vue";
import Lobby from "@/views/Lobby.vue";

describe("router", () => {
	it("should have Home route", () => {
		const home = router.getRoutes().find(r => r.name === "Home");
		expect(home).toBeTruthy();
		expect(home.path).toBe("/");
	});

	it("should have Lobby route with params", () => {
		const lobby = router.getRoutes().find(r => r.name === "Lobby");
		expect(lobby).toBeTruthy();
		expect(lobby.path).toBe("/:seed/:username");
	});

	it("should have a 404 route", () => {
		const notFound = router.getRoutes().find(r => r.name === "UrlNotFound");
		expect(notFound).toBeTruthy();
	});
});

describe("router navigation", () => {
	it("resolve Lobby route", async () => {
		const route = router.resolve({ name: "Lobby", params: { seed: "123", username: "VVPOIROT" } });
		expect(route.href).toBe("/123/VVPOIROT");
	});

	it("resolve Home route", async () => {
		const route = router.resolve({ name: "Home" });
		expect(route.href).toBe("/");
	});
});

describe("route content", () => {
	it.skip("should show BeforeRoom", async () => {
		const wrapper = mount(BeforeRoom);

		expect(wrapper.find(".pseudo-input").exists()).toBe(true);
	})

	it.skip("should show Lobby", async () => {
		const wrapper = mount(Lobby);

		expect(wrapper.find("gameChoice").exists()).toBe(true);
	});

	it.skip("should show 404", async () => {
		const wrapper = mount();
	});
});
