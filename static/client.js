const socket = io(); // va se connecter au même host:port

socket.on('connect', () => {
    console.log('🤠​ Connected !');
});

socket.on('disconnect', () => {
    console.log('😵​ Disconnected.');
});