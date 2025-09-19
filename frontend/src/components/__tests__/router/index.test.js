import { describe, it, expect } from "vitest";
import router from "@/router";

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
	it("should load BeforeRoom component dynamically", async () => {
		const beforeRoomRoute = router.getRoutes().find(r => r.name === "LobbyJoin");
		expect(beforeRoomRoute).toBeTruthy();

		const comp = await beforeRoomRoute.components.default();
		expect(comp.default).toBeDefined();
	});

	it("should load Lobby component dynamically", async () => {
		const lobbyRoute = router.getRoutes().find(r => r.name === "Lobby");
		expect(lobbyRoute).toBeTruthy();

		const comp = await lobbyRoute.components.default();
		expect(comp.default).toBeDefined();
	});

	it("should load 404 component dynamically", async () => {
		const notFoundRoute = router.getRoutes().find(r => r.name === "UrlNotFound");
		expect(notFoundRoute).toBeTruthy();

		const comp = await notFoundRoute.components.default();
		expect(comp.default).toBeDefined();
	});
});
