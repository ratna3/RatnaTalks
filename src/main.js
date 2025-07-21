import './style.css'
import Game from './game/Game.js'

// Initialize the game when the page loads
const game = new Game();

// Start game on first click
let gameStarted = false;
window.addEventListener('click', () => {
  if (!gameStarted) {
    const instructions = document.getElementById('instructions');
    if (instructions) {
      instructions.style.display = 'none';
    }
    game.init();
    gameStarted = true;
  }
});
