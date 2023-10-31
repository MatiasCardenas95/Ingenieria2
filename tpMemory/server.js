const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = 
{
  1: { score: 0 },
  2: { score: 0 },
};

let turn = 1; // Jugador 1 inicia
let flippedCards = [];

app.use(express.static('public'));

// Barajas las cartas
const images = 
[
  'images/elephant.png',
  'images/fox.png',
  'images/giraffe.png', 
  'images/lion.png',
  'images/monkey.png',
  'images/snail.png'
];

const shuffledCards = [...images, ...images].sort(() => Math.random() - 0.5);

wss.on('connection', (ws) =>
{
  ws.on('message', (message) => 
  {
    const data = JSON.parse(message);

    if (data.type === 'ready') 
    {
      ws.send(JSON.stringify({ type: 'start', player: turn, cards: shuffledCards, scores: players }));
      turn = 3 - turn; // Alternar turno entre 1 y 2
    } 
    
    else if (data.type === 'flip') 
    {
      const card = data.card;
      flippedCards.push(data);

      if (flippedCards.length === 2) 
      {
        const [card1, card2] = flippedCards;

        if (card1.card === card2.card) 
        {
          players[card1.player].score += 1;
          players[card2.player].score += 1;
        }

        wss.clients.forEach((client) => 
        {

          if (client.readyState === WebSocket.OPEN) 
          {
            client.send(JSON.stringify({ type: 'flip', index: card1.index, card: card1.card, player: card1.player }));
            client.send(JSON.stringify({ type: 'flip', index: card2.index, card: card2.card, player: card2.player }));
            client.send(JSON.stringify({ type: 'score', scores: players }));
          }
        });

        flippedCards = [];
      }
    }
  });
});

server.listen(3000, () => 
{
  console.log('Servidor en ejecución en el puerto 3000');
});
