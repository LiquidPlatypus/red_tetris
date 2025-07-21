const socket = io(); // va se connecter au même host:port

const input = document.getElementById('msgInput');
const buttonName = document.getElementById('sendName');
const btnGameInfo = document.getElementById('gameInfo');
const btnLaunchGame = document.getElementById('launch-game');

function ft_seed() {
    return Math.floor(100000 + Math.random() * 900000);
}

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
        <p>Status: ${msg.status}</p>
        <p>Is host: ${msg.host}</p>
        <p>Seed: ${msg.seed}</p>
    `;

    document.getElementById('server-response').innerHTML = html;
});

btnLaunchGame.addEventListener('click', () => {
    const seed = ft_seed();
    console.log(`seed [${seed}]`);
    socket.emit('game-connect', seed);
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
