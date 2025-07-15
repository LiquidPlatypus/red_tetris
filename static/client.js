const socket = io(); // va se connecter au même host:port

const input = document.getElementById('msgInput');
const buttonName = document.getElementById('sendName');

socket.on('connect', () => {
    console.log('🤠​ Connected !');
});

socket.on('disconnect', () => {
    console.log('😵​ Disconnected.');
});


buttonName.addEventListener('click', () => {
    const message = input.value.trim();
    if (message.length > 0) {
        socket.emit('name', message);
        input.value = '';
    }
    else if (message.length === 0) {}
    else {
        console.error('message error');
    }
});
