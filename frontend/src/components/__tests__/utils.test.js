import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { askServer } from "@/utils.js";

class MockSocket {
	constructor() {
		this.connected = true;
		this.events = new Map();
		this.emmitedEvents = [];
	}

	emit(event, data) {
		this.emmitedEvents.push({event, data});
	}

	once(event, callback) {
		if (!this.events.has(event))
			this.events.set(event, []);
		this.events.get(event).push(callback);
	}

	simulateServerResponse(event, data) {
		const callbacks = this.events.get(event) || [];
		callbacks.forEach(callback => callback(data));

		this.events.set(event, []);
	}

	disconnect() {
		this.connected = false;
	}
}

describe("askServer", () => {
	let mockSocket;

	beforeEach(() => {
		mockSocket = new MockSocket();

		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("Success case", () => {
		it("should send the message and return the server response", async () => {
			const message = "Hello Server:type";
			const expectedResponse = "Hello Client:type";

			const responsePromise = askServer(message, mockSocket);

			mockSocket.simulateServerResponse("response", expectedResponse);

			const actualResponse = await responsePromise;

			expect(actualResponse).toBe(expectedResponse);
			expect(mockSocket.emmitedEvents).toHaveLength(1);
			expect(mockSocket.emmitedEvents[0]).toEqual({
				event: "ask-server",
				data: message
			});
		});

		it("should work with complex objects", async () => {
			const complexMessage = {
				type: "query",
				payload: {user: "test", data: [1, 2, 3]}
			};
			const complexResponse = {
				status: "success",
				result: {processedData: "some result"}
			};

			const responsePromise = askServer(complexMessage, mockSocket);
			mockSocket.simulateServerResponse("response", complexResponse);

			const result = await responsePromise;

			expect(result).toEqual(complexResponse);
			expect(mockSocket.emmitedEvents[0].data).toEqual(complexMessage);
		});
	});

	describe("Gestion des erreurs", () => {
		it("should reject socket if null", async () => {
			await expect(askServer("test", null))
				.rejects
				.toThrow("Socket not connected");
		});

		it("should reject if socket is undefined", async () => {
			mockSocket.disconnect();

			await expect(askServer("test", mockSocket))
				.rejects
				.toThrow("Socket not connected");
		});

		it("should reject if socket is not connected", async () => {
			mockSocket.disconnect();

			await expect(askServer("test", mockSocket))
				.rejects
				.toThrow("Socket not connected");
		});

		it("should reject with timeout if server doesn't respond", async () => {
			const responsePromise = askServer("test", mockSocket);

			vi.advanceTimersByTime(1000);

			await expect(responsePromise)
				.rejects
				.toThrow("Server not response");
		});

		it("should reject even if response come after timeout", async () => {
			const responsePromise = askServer("test", mockSocket);

			vi.advanceTimersByTime(1000);

			await expect(responsePromise)
				.rejects
				.toThrow("Server not response");
		});
	});
});
