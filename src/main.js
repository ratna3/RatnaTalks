import { Game } from './game/Game.js'
import './style.css'

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game()
  game.init()
})
