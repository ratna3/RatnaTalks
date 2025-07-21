import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Player from './Player.js';
import Zombie from './Zombie.js';
import Environment from './Environment.js';
import Bullet from './Bullet.js';
import HealthSystem from './HealthSystem.js';
import CollisionManager from './CollisionManager.js';
import InputManager from '../utils/InputManager.js';

export default class Game {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.world = null
    this.player = null
    this.zombies = []
    this.environment = null
    this.inputManager = null
    this.collisionManager = null
    
    this.clock = new THREE.Clock()
    this.isGameStarted = false
    this.zombieSpawnTimer = 0
    this.zombieSpawnInterval = 3000 // 3 seconds
    this.maxZombies = 10
    this.gameRunning = false
  }

  init() {
    this.setupRenderer()
    this.setupScene()
    this.setupPhysics()
    this.setupCamera()
    this.setupLights()
    this.setupEntities()
    this.setupEventListeners()
    this.startGame()
    this.animate()
  }

  setupRenderer() {
    const canvas = document.getElementById('gameCanvas')
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setClearColor(0x87CEEB) // Sky blue
  }

  setupScene() {
    this.scene = new THREE.Scene()
    
    // Add fog for atmosphere
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200)
  }

  setupPhysics() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    })
    
    // Set solver parameters
    this.world.solver.iterations = 10
    this.world.solver.tolerance = 0.1
    
    // Create collision manager
    this.collisionManager = new CollisionManager(this.world)
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 1.8, 0) // Eye level height
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    this.scene.add(ambientLight)

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 50, 0)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 500
    directionalLight.shadow.camera.left = -100
    directionalLight.shadow.camera.right = 100
    directionalLight.shadow.camera.top = 100
    directionalLight.shadow.camera.bottom = -100
    this.scene.add(directionalLight)

    // Add helper for debugging (remove in production)
    // const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
    // this.scene.add(lightHelper)
  }

  setupEntities() {
    // Create environment
    this.environment = new Environment(this.scene, this.world)
    
    // Create input manager
    this.inputManager = new InputManager()
    
    // Create player
    this.player = new Player(this.scene, this.world, this.camera, this.inputManager)
    
    // Spawn initial zombies
    this.spawnZombies(3)
  }

  spawnZombies(count) {
    for (let i = 0; i < count && this.zombies.length < this.maxZombies; i++) {
      // Random spawn position around the player (but not too close)
      const angle = Math.random() * Math.PI * 2
      const distance = 20 + Math.random() * 30
      const x = Math.cos(angle) * distance
      const z = Math.sin(angle) * distance
      
      const zombie = new Zombie(this.scene, this.world, x, 0, z)
      zombie.setTarget(this.player)
      this.zombies.push(zombie)
    }
  }

  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize())
    
    // Start game on click
    document.addEventListener('click', () => this.startGame(), { once: true })
  }

  startGame() {
    if (!this.isGameStarted) {
      this.isGameStarted = true
      this.gameRunning = true
      
      const instructions = document.getElementById('instructions')
      if (instructions) {
        instructions.classList.add('hidden')
      }
      
      // Lock pointer for FPS controls (will be handled by InputManager)
      
      console.log('Game started!')
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  update(deltaTime) {
    if (!this.gameRunning) return

    // Update input manager
    this.inputManager.update()

    // Update physics world
    this.world.fixedStep()

    // Update player
    this.player.update(deltaTime)

    // Update zombies
    this.zombies.forEach((zombie, index) => {
      zombie.update(deltaTime)
      
      // Remove dead zombies
      if (zombie.isDead()) {
        zombie.removeFromScene()
        this.zombies.splice(index, 1)
      }
    })

    // Handle zombie spawning
    this.zombieSpawnTimer += deltaTime * 1000
    if (this.zombieSpawnTimer >= this.zombieSpawnInterval) {
      this.spawnZombies(1)
      this.zombieSpawnTimer = 0
      
      // Increase difficulty over time
      if (this.zombieSpawnInterval > 1000) {
        this.zombieSpawnInterval -= 50
      }
    }

    // Update collision detection
    this.collisionManager.update()

    // Handle bullet-zombie collisions
    this.handleBulletCollisions()
    
    // Handle zombie-player collisions
    this.handleZombiePlayerCollisions()

    // Update UI
    this.updateUI()
  }

  handleBulletCollisions() {
    const bullets = this.player.getBullets()
    
    bullets.forEach((bullet, bulletIndex) => {
      this.zombies.forEach((zombie, zombieIndex) => {
        if (bullet.checkCollision(zombie.getMesh())) {
          // Damage zombie
          zombie.takeDamage(25)
          
          // Remove bullet
          bullet.removeFromScene()
          bullets.splice(bulletIndex, 1)
          
          console.log('Zombie hit!')
        }
      })
    })
  }

  handleZombiePlayerCollisions() {
    this.zombies.forEach(zombie => {
      if (zombie.isNearPlayer(this.player.getPosition(), 2.0)) {
        if (zombie.canAttack()) {
          this.player.takeDamage(10)
          zombie.attack()
          console.log('Player hit! Health:', this.player.getHealth())
        }
      }
    })
  }

  updateUI() {
    // Update health bar
    const health = this.player.getHealth()
    const healthFill = document.getElementById('healthFill')
    const healthText = document.getElementById('healthText')
    
    healthFill.style.width = `${health}%`
    healthText.textContent = `Health: ${health}`
    
    // Update ammo counter
    const ammo = this.player.getAmmo()
    const ammoCounter = document.getElementById('ammoCounter')
    ammoCounter.textContent = `Ammo: ${ammo}`
    
    // Check game over
    if (health <= 0) {
      this.gameOver()
    }
  }

  gameOver() {
    this.gameRunning = false
    document.exitPointerLock()
    
    // Show game over screen
    const instructions = document.getElementById('instructions')
    instructions.innerHTML = `
      <h2>Game Over!</h2>
      <p>You survived and eliminated ${this.getKillCount()} zombies!</p>
      <p>Click to restart</p>
    `
    instructions.classList.remove('hidden')
    
    // Reset game on click
    document.addEventListener('click', () => this.restartGame(), { once: true })
  }

  restartGame() {
    // Reset player
    this.player.reset()
    
    // Remove all zombies
    this.zombies.forEach(zombie => zombie.removeFromScene())
    this.zombies = []
    
    // Reset timers
    this.zombieSpawnTimer = 0
    this.zombieSpawnInterval = 3000
    
    // Restart game
    this.startGame()
    this.spawnZombies(3)
  }

  getKillCount() {
    // This would be tracked in a real implementation
    return Math.max(0, 10 - this.zombies.length)
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    
    const deltaTime = this.clock.getDelta()
    this.update(deltaTime)
    this.renderer.render(this.scene, this.camera)
  }
}
