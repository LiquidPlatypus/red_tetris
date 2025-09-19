import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TetrisText from "../../TetrisText.vue";

describe("TetrisText", () => {
	let wrapper;

	beforeEach(() => {
		wrapper = mount(TetrisText, {
			props: { text: "ABC" }
		});
	});

	it("should render with default props", () => {
		expect(wrapper.find(".tetris-text").exists()).toBe(true);
		expect(wrapper.find(".letter").exists()).toBe(true);
		expect(wrapper.find(".row").exists()).toBe(true);
		expect(wrapper.find(".pixel").exists()).toBe(true);
		expect(wrapper.find(".tetris-font-block").exists()).toBe(true);
	});

	it("should render empty for unsuppported characters", () => {
		const wrapper = mount(TetrisText, {
			props: { text: "?" }
		});

		const letters = wrapper.findAll(".letter");
		expect(letters.length).toBe(1);
		expect(letters[0].findAll(".row").length).toBe(0);
	});
})
