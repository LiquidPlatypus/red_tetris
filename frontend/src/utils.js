export async function askServer(message, socket) {
    return new Promise((resolve, reject) => {
        socket.emit('ask-server', message);

        socket.once('response', (response) => {
            resolve(response);
        });

        setTimeout(() => reject("Server not response"), 1000);
    });
}