const socket = io(); // va se connecter au même host:port

const input = document.getElementById('msgInput');
const button = document.getElementById('sendBtn');

socket.on('connect', () => {
    console.log('🤠​ Connected !');
});

socket.on('disconnect', () => {
    console.log('😵​ Disconnected.');
});


button.addEventListener('click', () => {
    const message = input.value.trim();
    if (message.length > 0) {
        socket.emit('messages', message);
        input.value = '';
    }
    else if (message.length === 0) {}
    else {
        console.error('message error');
    }
});
