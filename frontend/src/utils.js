/**
 * @param {*} message is what you ask to the server
 * @param {*} socket is client socket to send the resquest
 * @returns response of the server
 */
export async function askServer(message, socket) {
    if (!socket || !socket.connected) {
        throw new Error('Socket not connected');
    }
    return new Promise((resolve, reject) => {
        socket.emit('ask-server', message);

        socket.once(`response:${message}`, (response) => {
            resolve(response);
        });

        setTimeout(() => reject("Server not response"), 1000);
    });
}
