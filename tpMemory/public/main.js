const socket = new WebSocket('ws://localhost:3000');

const gameBoard = document.querySelector('.memory-game');
const scoreElements = document.querySelectorAll('.score');
const players = {
  1: { score: 0 },
  2: { score: 0 },
};

const blankCardImage = 'images/blank.png'; // Imagen de portada
const matchedCardImage = 'images/white.png'; // Imagen para cartas coincidentes

let cards = [];
let flippedCards = [];
let myTurn = false;
let canFlip = true;

function createGameBoard(cards) {
  for (let i = 0; i < cards.length; i++) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.index = i;
    card.style.backgroundImage = `url(${blankCardImage})`; // Portada de la carta
    gameBoard.appendChild(card);

    card.addEventListener('click', () => {
      if (myTurn && !flippedCards.includes(i) && flippedCards.length < 2 && canFlip) {
        flipCard(card, i);
        socket.send(JSON.stringify({ type: 'flip', index: i, card: cards[i], player: myTurn ? 1 : 2 }));
      }
    });
  }
}

function flipCard(card, index) {
  card.style.transform = 'rotateY(180deg)';
  card.style.backgroundImage = `url(${cards[index]})`; // Mostrar la imagen de la carta
  flippedCards.push({ card, index });

  if (flippedCards.length === 2) {
    canFlip = false; // Evitar voltear más cartas durante la comparación
    const [card1, card2] = flippedCards;
    if (cards[card1.index] === cards[card2.index]) {
      setTimeout(() => {
        card1.card.classList.add('matched');
        card2.card.classList.add('matched');
        flippedCards = [];
        players[myTurn ? 1 : 2].score += 1;
        updateScores();
        canFlip = true; // Habilitar el volteo de cartas nuevamente
        if (document.querySelectorAll('.card.matched').length === cards.length) {
          // Juego terminado
          alert('¡Juego terminado! Puntuación final: Jugador 1 - ' + players[1].score + ', Jugador 2 - ' + players[2].score);
        }
      }, 500);
    } else {
      setTimeout(() => {
        card1.card.style.transform = '';
        card1.card.style.backgroundImage = `url(${blankCardImage})`; // Revertir a la imagen de portada
        card2.card.style.transform = '';
        card2.card.style.backgroundImage = `url(${blankCardImage})`; // Revertir a la imagen de portada
        flippedCards = [];
        canFlip = true; // Habilitar el volteo de cartas nuevamente
        myTurn = !myTurn;
        updateScores();
      }, 1000);
    }
  }
}

function updateScores() {
  scoreElements[0].textContent = `Jugador 1: ${players[1].score}`;
  scoreElements[1].textContent = `Jugador 2: ${players[2].score}`;
}

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'start') {
    myTurn = message.player === 1;
    cards = message.cards; // Obtener la secuencia de cartas desde el servidor
    createGameBoard(cards); // Construir el tablero de juego con las cartas
  } else if (message.type === 'flip') {
    flipCard(document.querySelector(`.card[data-index="${message.index}"]`), message.index);
  } else if (message.type === 'score') {
    players[1] = message.scores[1];
    players[2] = message.scores[2];
    updateScores();
  }
};

socket.onopen = () => {
  socket.send(JSON.stringify({ type: 'ready' }));
};

updateScores();
