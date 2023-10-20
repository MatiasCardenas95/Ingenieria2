const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', draw);

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

function draw(e) {
    if (!isDrawing) return;
    context.strokeStyle = '#000'; // Color del trazo
    context.lineWidth = 2; // Grosor del trazo
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];

    // Envía la información del trazo al servidor a través de WebSockets
    // Implementa el código para enviar el trazo al servidor
}

// Aquí debes configurar la conexión WebSocket con el servidor
const socket = new WebSocket('ws://http://192.168.0.61:3000/');

socket.addEventListener('open', (event) => {
    console.log('Conexión WebSocket establecida.');
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'draw') {
        drawReceivedStroke(data);
    }
});

function drawReceivedStroke(data) {
    context.strokeStyle = '#000'; // Color del trazo
    context.lineWidth = 2; // Grosor del trazo
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(data.startX, data.startY);
    context.lineTo(data.endX, data.endY);
    context.stroke();
}

// Event listener para enviar el trazo al servidor
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    const message = JSON.stringify({
        type: 'draw',
        startX: lastX,
        startY: lastY,
        endX: lastX,
        endY: lastY,
    });
    socket.send(message);
});
