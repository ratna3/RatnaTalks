import './style.css'
import { Game } from './game/Game.js'

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game()
  game.init()
})
