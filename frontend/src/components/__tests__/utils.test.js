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
			const message = "Hello Server";
			const expectedResponse = "Hello Client";

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
});
