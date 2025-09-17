import { io as Client } from "socket.io-client";
import { server } from "../server.js";
import { removeGame, TETROMINOS, refillBag, createSeededRandom } from "../js/class.js";
import { calculateNextPieceGrid, calculateVisualGrid } from "../js/logic.js";

let clientSocket;
let port;
const ROWS = 20;
const COLS = 10;

function MockGNT() {
    const bag = [];
    let random = createSeededRandom(412541254125);
    if (bag.length === 0)
        refillBag(bag, random);
    const index = bag.shift();
    const tetromino = TETROMINOS[index];
    return ({
        shape: tetromino.getShape().map(row =>
            row.map(cell => (cell ? tetromino.getColor() : "empty"))),
        x: tetromino.getX(),
        y: tetromino.getY(),
        color: tetromino.getColor(),
    });
}

let testcount = 1;

beforeEach((done) => {
    console.log(`Test #${testcount} START ===========`);
    server.listen(() => {
        port = server.address().port;
        clientSocket = new Client(`http://localhost:${port}`);
        clientSocket.on("connect", done);
    });
});

afterEach(() => {
    removeGame("Etienne_room");
    clientSocket.close();
    server.close();
    console.log(`Test #${testcount} FINISH ===========`);
    testcount++;
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
        
        clientSocket.on("lobby-join", (data) => {
            clientSocket.on("error", (errorMessage) => {
                expect(errorMessage).toBe("username already exist");
                clientSocket.off("lobby-join");
                clientSocket.off("error");
                done();
            });
            clientSocket.emit("create-lobby", "Etienne");
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
        clientSocket.emit("create-lobby", "Etienne");
        clientSocket.on("lobby-join", (data) => {
            clientSocket.emit('join-user', {seed, username});
            username = "EtienneII";
            clientSocket.emit('join-user', {seed, username});
            clientSocket.on("server-log", (message) => {
                expect(message).toBe("EtienneII join the game !");
                clientSocket.off("server-log");
                clientSocket.off("lobby-join");
                clientSocket.off("error");
                done();
            });
        });
    });

    it("quit lobby must delete it", (done) => {
        let pass = 0;
        clientSocket.emit("create-lobby", "Etienne");
        clientSocket.on("lobby-join", (data) => {
            if (pass == 0) {
                clientSocket.emit("return");
                pass = 1;
                clientSocket.emit("create-lobby", "Etienne");
            } else {
                expect(data.Seed).toBe("Etienne_room");
                clientSocket.off("lobby-join");
                done();
            }
        });
    });

    it("change host and launch game", (done) => {
        let username = "Etienne";
        let seed = "Etienne_room";
        let clientSocket2 = new Client(`http://localhost:${port}`);

        clientSocket.emit("create-lobby", username);
        clientSocket.on("lobby-join", (data) => {
            clientSocket.emit("join-user", {seed, username});
            username = "Etienne2";
            clientSocket2.emit("join-user", {seed, username});
            
            clientSocket.on("server-log", (message) => {
                if (message === "Etienne2 join the game !") {
                    clientSocket.emit("return");
                    clientSocket2.on("refresh-player", () => {
                        clientSocket2.emit('refreshme');
                        clientSocket2.on("launch-game", () => {
                            clientSocket2.on('ask-server', "game-stop");
                            clientSocket2.close();
                            done();
                        });
                        clientSocket2.emit("launch-game", seed);
                    });
                }
            });

        });
    });

    it("launch game for everyone on lobby", (done) => {
        let username = "Etienne";
        let seed = "Etienne_room";
        let clientSocket2 = new Client(`http://localhost:${port}`);
        let player = 0;

        clientSocket.emit("create-lobby", username);
        clientSocket.on("lobby-join", (data) => {
            clientSocket.emit("join-user", {seed, username});
            username = "Etienne2";
            clientSocket2.emit("join-user", {seed, username});
            
            clientSocket.on("server-log", (message) => {
                if (message === "Etienne2 join the game !") {
                    let activePiece = null;
                    let nextPiece = MockGNT();
                    let permanentGrid = Array.from({ length: ROWS }, () => Array(COLS).fill("empty"));
                    clientSocket.emit("launch-game", seed);
                    clientSocket.on("launch-game", () => {
                        clientSocket.emit("ask-server", "init-grid");
                        clientSocket.on("flattenedGrid", (flatGrid) => {
                            expect(flatGrid);
                        });
                        clientSocket.emit("ask-server", "init-piece");
                        clientSocket.on("flattenedNextPiece", (flatNextPiece) => {
                            expect(flatNextPiece);
                        });
                        clientSocket.emit("ask-server", "start-game");
                        clientSocket.on("launch", (startAt) => {
                            clientSocket.emit("launch");
                            clientSocket.emit("ask-server", "stop-game");
                            player++;
                            if (player === 2) {
                                clientSocket2.close();
                                done();
                            }
                        });
                    });
                    clientSocket2.on("launch-game", () => {
                        clientSocket2.emit("ask-server", "init-grid");
                        clientSocket2.on("flattenedGrid", (flatGrid) => {
                            expect(flatGrid);
                        });
                        clientSocket2.emit("ask-server", "init-piece");
                        clientSocket2.on("flattenedNextPiece", (flatNextPiece) => {
                            expect(flatNextPiece);
                        });
                        clientSocket2.emit("ask-server", "start-game");
                        clientSocket2.on("launch", (startAt) => {
                            clientSocket2.emit("launch");
                            clientSocket2.emit("ask-server", "stop-game");
                            player++;
                            if (player === 2) {
                                clientSocket2.close();
                                done();
                            }
                        });
                    });
                }
            });

        });
    });
});
