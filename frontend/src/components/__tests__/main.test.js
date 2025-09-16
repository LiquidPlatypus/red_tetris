import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./assets/main.css", () => {});
vi.mock("@/router", () => ({
	default: {
		install: vi.fn(),
	}
}));

vi.mock("@/App.vue", () => ({
	default: {
		name: "App",
		template: "<div>Test App</div>",
	}
}));

describe("main.js", () => {
	beforeEach(() => {
		document.body.innerHTML = "<div id='app'></div>";

		vi.clearAllMocks();
	});

	it("should create and mount the Vue app correctly", async () => {
		await import("../../main.js");

		const appElement = document.getElementById("app");
		expect(appElement).toBeTruthy();

		expect(appElement.innerHTML).not.toBe("");
	});
});
