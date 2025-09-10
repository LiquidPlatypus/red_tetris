import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router"
import { routes } from "@/router"
import Home from "../../../views/Home.vue";

const router = createRouter({
	history: createWebHistory(),
	routes
})

