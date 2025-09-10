import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppButton from "../../AppButton.vue";

describe("AppButton", () => {
	let wrapper;

	beforeEach(() => {
		wrapper = mount(AppButton)
	})

	it("should render with default props", () => {
		expect(wrapper.find("button").exists()).toBe(true);
		expect(wrapper.find("button").attributes("type")).toBe("button");
		expect(wrapper.find("button").classes()).toContain("app-button");
	});

	it("should render with custom label", () => {
		const label = "Test Button";
		const wrapper = mount(AppButton, {
			props: { label },
		});

		expect(wrapper.text()).toBe(label);
	});

	it("should render slot content over label prop", () => {
		const label = "Label Prop";
		const slotContent = "Slot Content";
		const wrapper = mount(AppButton, {
			props: { label },
			slots: {
				default: slotContent,
			},
		});

		expect(wrapper.text()).toBe(slotContent);
	});

	it("should set correct type attribute", () => {
		const wrapper = mount(AppButton, {
			props: { type: "submit" },
		});

		expect(wrapper.find("button").attributes("type")).toBe("submit");
	});

	it("should handle all button types", () => {
		const types = ["button", "submit", "reset"];

		types.forEach((type) => {
			const wrapper = mount(AppButton, {
				props: { type },
			});

			expect(wrapper.find("button").attributes("type")).toBe(type);
		});
	});

	it("should emit click event when clicked", async () => {
		await wrapper.find("button").trigger("click");

		expect(wrapper.emitted("click")).toBeTruthy();
		expect(wrapper.emitted("click")).toHaveLength(1);
	});

	it("should have correct CSS classes", () => {
		const button = wrapper.find("button");

		expect(button.classes()).toContain("app-button");
	});

	it("should render empty when no label or slot provided", () => {
		expect(wrapper.text()).toBe("");
	});

	it("should be focusable", async () => {
		const button = wrapper.find("button");

		await button.trigger("focus");

		expect(wrapper.emitted("focus")).toBeTruthy();
	});

	it("should support keyboard events", async () => {
		const button = wrapper.find("button");

		await button.trigger("keydown.enter");

		expect(wrapper.emitted("keydown")).toBeTruthy();
	});
});
