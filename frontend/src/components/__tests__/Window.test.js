import { describe, it, expect } from "vitest";
import {mount} from "@vue/test-utils";
import Window from "../Window.vue";

describe ("Window", () => {
	let wrapper;

	beforeEach(() => {
		wrapper = mount(Window)
	})

	it("should render with default props", () => {
		expect(wrapper.find(".win95-window").exists()).toBe(true);
		expect(wrapper.find(".win95-title-bar").exists()).toBe(true);
		expect(wrapper.find(".win95-content").exists()).toBe(true);

		expect(wrapper.find(".win95-window").classes()).toContain("win95-window");
		expect(wrapper.find(".win95-title-bar").classes()).toContain("win95-title-bar");
		expect(wrapper.find(".win95-content").classes()).toContain("win95-content");
	});

	it("should render with custom title", () => {
		const wrapper = mount(Window, {
			props: { title: "custom title" },
		});

		expect(wrapper.find(".win95-title-bar").text()).toContain("custom title");
	});

	it("should render with empty title if no title is provided", () => {
		const wrapper = mount(Window, {
			props: { title: "" },
		});

		expect(wrapper.find(".win95-title-bar").exists()).toBe(true);
		expect(wrapper.find(".win95-title-bar").text()).toContain("");
	})

	it("should render title with custom color", () => {
		const wrapper = mount(Window, {
			props: { titleBgColor: "blue" },
		});

		const titleBar = wrapper.find(".win95-title-bar");
		expect(titleBar.element.style.backgroundColor).toBe("blue");
	});

	it("should not have inline background color when titleBgColor is not provided", () => {
		const wrapper = mount(Window);

		const titleBar = wrapper.find(".win95-title-bar");
		expect(titleBar.element.style.backgroundColor).toBe("");
	});

	it("should have custom class alongside default class if provided", () => {
		const wrapper = mount(Window, {
			props: { customClass: "customClass" },
		});

		expect(wrapper.find(".win95-window").classes()).toContain("customClass");
	});
});
