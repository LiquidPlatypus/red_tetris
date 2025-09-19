import { describe, it, expect } from "vitest";
import {mount} from "@vue/test-utils";
import Window from "../../Window.vue";

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
		const titleBar = wrapper.find(".win95-title-bar");
		expect(titleBar.element.style.backgroundColor).toBe("");
	});

	it("should have custom class alongside default class if provided", () => {
		const wrapper = mount(Window, {
			props: { customClass: "customClass" },
		});

		expect(wrapper.find(".win95-window").classes()).toContain("customClass");
	});

	it("should have custom style if provided", () => {
		const wrapper = mount(Window, {
			props: { customStyle: { border: "1px solid red" } },
		});

		const window = wrapper.find(".win95-window");
		expect(window.element.style.border).toBe("1px solid red");
	});

	it("should not have custom style if not provided", () => {
		const window = wrapper.find(".win95-window");
		expect(window.element.style.border).toBe("");
	});

	it("should render empty when no slot provided", () => {
		const wrapper = mount(Window, {
			props: { title: "Test Window" }
		});

		expect(wrapper.find(".win95-content").text()).toBe("");
		expect(wrapper.find(".win95-content").element.children.length).toBe(0);
	});

	it("should render slot content when provided", () => {
		const wrapper = mount(Window, {
			props: { title: "Test Window" },
			slots: {
				default: "<p>test slot</p>"
			}
		});

		expect(wrapper.find(".win95-content").html()).toContain("<p>test slot</p>");
		expect(wrapper.find(".win95-content").text()).toBe("test slot");
	});

	it("should have a custom CSS class fix-overflow with a certain value", () => {
		const wrapper = mount(Window, {
			props: { customClass: "fix-overflow" }
		});

		expect(wrapper.find(".win95-window").classes()).toContain("fix-overflow");
	});

	it("should have a custom CSS class fix-overflow-endgame with a certain value", () => {
		const wrapper = mount(Window, {
			props: { customClass: "fix-overflow-endgame" }
		});

		expect(wrapper.find(".win95-window").classes()).toContain("fix-overflow-endgame");
	});

	it("should accept an empty customStyle", () => {
		const wrapper = mount(Window, {
			props: { customStyle: {} }
		});

		expect(wrapper.find(".win95-window").exists()).toBeTruthy();
	});
});
