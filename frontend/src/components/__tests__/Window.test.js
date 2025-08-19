import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Window from "../Window.vue";

describe ("Window", () => {
	it("should render with default props", () => {
		const wrapper = mount(Window);

		expect(wrapper.find(".win95-window").exists()).toBe(true);
		expect(wrapper.find(".win95-title-bar").exists()).toBe(true);
		expect(wrapper.find(".win95-content").exists()).toBe(true);

		expect(wrapper.find(".win95-window").classes()).toContain("win95-window");
		expect(wrapper.find(".win95-title-bar").classes()).toContain("win95-title-bar");
		expect(wrapper.find(".win95-content").classes()).toContain("win95-content");

	});
});
