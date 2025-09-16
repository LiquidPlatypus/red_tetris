import { io as Client } from "socket.io-client";
import { server } from "../server.js";

let clientSocket;

beforeAll((done) => {
    server.listen(() => {
        const port = server.address().port;
        clientSocket = new Client(`http://localhost:${port}`);
        clientSocket.on("connect", done);
    });
});

afterAll(() => {
    clientSocket.close();
    server.close();
});

describe("Socket.IO events", () => {

    it("should emit lobby-join when create-lobby is called", (done) => {
        clientSocket.emit("create-lobby", "Etienne");

        clientSocket.on("lobby-join", (data) => {
            expect(data.Seed).toBe("Etienne_room");
            expect(data.Username).toBe("Etienne");
            clientSocket.off("lobby-join");
            done();
        });
    });

    it("should emit error when lobby already exists", (done) => {
        clientSocket.emit("create-lobby", "Etienne");
        clientSocket.on("error", (errorMessage) => {
            clientSocket.emit("return");
            expect(errorMessage).toBe("username already exist");
            clientSocket.off("lobby-join");
            clientSocket.off("error");
            done();
        });
    });

    it("should emit join-user when join not exist lobby is called", (done) => {
        let Username = "Etienne";
        let lobby_name = "not-exist-lobby";
        clientSocket.emit('join-user', {lobby_name, Username});

        clientSocket.on("error", (data) => {
            expect(data).toBe("Game not exist");
            clientSocket.off("error");
            done();
        });
    });

    it("join exist lobby", (done) => {
        let seed = "Etienne_room";
        let username = "Etienne";
        clientSocket.on("error", (data) => {
            console.log(data);
            clientSocket.off("error");  
            done();
        });
        clientSocket.on("server-log", (message) => {
            expect(message).toBe("EtienneII join the game !");
            clientSocket.off("server-log");
            done();
        });
        clientSocket.emit("create-lobby", "Etienne");
        clientSocket.on("lobby-join", (data) => {
            clientSocket.emit('join-user', {seed, username});
            username = "EtienneII";
            clientSocket.emit('join-user', {seed, username});
            clientSocket.off("lobby-join");
        });
    });
});
