const socket = io(); // va se connecter au même host:port

const input = document.getElementById('msgInput');
const buttonName = document.getElementById('sendName');
const btnGameInfo = document.getElementById('gameInfo');

socket.on('connect', () => {
    console.log('🤠​ Connected !');
});

socket.on('disconnect', () => {
    console.log('😵​ Disconnected.');
});

socket.on('messageFromServer', (msg) => {
    console.log(`Message from server receive: ${msg}`);

    const html = `
        <p>Name: ${msg.username}</p>
        <p>Host: ${msg.host}</p>
        <p>Status: ${msg.status}</p>
    `;

    document.getElementById('server-response').innerHTML = html;
});

buttonName.addEventListener('click', () => {
    const message = input.value.trim();
    if (message.length > 0) {
        socket.emit('name', message);
        input.value = '';
    }
    else if (message.length === 0) {}
    else {
        console.error('name error');
    }
});

btnGameInfo.addEventListener('click', () => {
    socket.emit('gameInfo');
});
