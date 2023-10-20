const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

wss.on('connection', (ws) => {
    console.log('Cliente conectado.');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'draw') {
            // Reenvía el trazo a todos los clientes, incluido el remitente
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
    });
});

server.listen(3000, () => {
    console.log('Servidor en ejecución en http://localhost:3000');
});
