import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { Bullet } from './Bullet.js'
import { HealthSystem } from './HealthSystem.js'
import { Gun } from './Gun.js'

export class Player {
  constructor(scene, world, camera) {
    this.scene = scene
    this.world = world
    this.camera = camera
    
    this.health = 100
    this.maxHealth = 100
    this.ammo = 30
    this.maxAmmo = 30
    
    this.position = new THREE.Vector3(0, 1.8, 0)
    this.velocity = new THREE.Vector3()
    this.moveSpeed = 10
    this.jumpForce = 8
    this.isGrounded = false
    
    this.bullets = []
    this.lastShotTime = 0
    this.fireRate = 200 // milliseconds between shots
    
    this.lastDamageTime = 0
    this.damageImmunityTime = 1000 // 1 second immunity after taking damage
    
    // Create gun
    this.gun = new Gun(scene, camera)
    
    this.setupPhysics()
    this.setupControls()
  }

  setupPhysics() {
    // Create physics body for player
    const shape = new CANNON.Cylinder(0.5, 0.5, 1.8, 8)
    this.body = new CANNON.Body({ mass: 75 })
    this.body.addShape(shape)
    this.body.position.set(0, 1.8, 0)
    this.body.material = new CANNON.Material('playerMaterial')
    
    // Prevent player from falling over
    this.body.fixedRotation = true
    this.body.updateMassProperties()
    
    this.world.addBody(this.body)
    
    // Ground collision detection
    this.body.addEventListener('collide', (event) => {
      const contact = event.contact
      
      // Check if collision is with ground (y-normal pointing up or down)
      const normal = contact.ni
      // If the contact normal has a significant Y component, we're touching ground/ceiling
      if (Math.abs(normal.y) > 0.7) {
        this.isGrounded = true
        console.log('Player grounded! Normal Y:', normal.y)
      }
    })
  }

  setupControls() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      shoot: false
    }
    
    // Keyboard events
    document.addEventListener('keydown', (event) => this.onKeyDown(event))
    document.addEventListener('keyup', (event) => this.onKeyUp(event))
    
    // Mouse events
    document.addEventListener('mousedown', (event) => this.onMouseDown(event))
    document.addEventListener('mouseup', (event) => this.onMouseUp(event))
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
        this.keys.forward = true
        break
      case 'KeyS':
        this.keys.backward = true
        break
      case 'KeyA':
        this.keys.left = true
        break
      case 'KeyD':
        this.keys.right = true
        break
      case 'Space':
        this.keys.jump = true
        event.preventDefault()
        break
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
        this.keys.forward = false
        break
      case 'KeyS':
        this.keys.backward = false
        break
      case 'KeyA':
        this.keys.left = false
        break
      case 'KeyD':
        this.keys.right = false
        break
      case 'Space':
        this.keys.jump = false
        break
    }
  }

  onMouseDown(event) {
    if (event.button === 0) { // Left mouse button
      this.keys.shoot = true
    }
  }

  onMouseUp(event) {
    if (event.button === 0) { // Left mouse button
      this.keys.shoot = false
    }
  }

  update(deltaTime) {
    // Reset grounded state at the beginning of frame
    this.isGrounded = false
    
    this.updateMovement(deltaTime)
    this.updateShooting()
    this.updateBullets(deltaTime)
    this.updateCamera()
    this.gun.update(deltaTime)
  }

  updateMovement(deltaTime) {
    // Check if player is close to ground for better jump detection
    if (this.body.position.y <= 1.5) {
      this.isGrounded = true
    }
    
    // Get camera direction for movement
    const direction = new THREE.Vector3()
    this.camera.getWorldDirection(direction)
    direction.y = 0 // Remove vertical component
    direction.normalize()
    
    const right = new THREE.Vector3()
    right.crossVectors(direction, new THREE.Vector3(0, 1, 0))
    right.normalize()
    
    // Calculate movement vector
    const movement = new THREE.Vector3()
    
    if (this.keys.forward) {
      movement.add(direction)
    }
    if (this.keys.backward) {
      movement.sub(direction)
    }
    if (this.keys.left) {
      movement.sub(right)
    }
    if (this.keys.right) {
      movement.add(right)
    }
    
    // Normalize movement and apply speed
    if (movement.length() > 0) {
      movement.normalize()
      movement.multiplyScalar(this.moveSpeed)
    }
    
    // Apply movement to physics body
    this.body.velocity.x = movement.x
    this.body.velocity.z = movement.z
    
    // Handle jumping
    if (this.keys.jump && this.isGrounded) {
      this.body.velocity.y = this.jumpForce
      this.isGrounded = false
      console.log('Player jumped! Velocity Y:', this.body.velocity.y, 'Position Y:', this.body.position.y)
    }
    
    // Update position from physics body
    this.position.copy(this.body.position)
  }

  updateShooting() {
    const currentTime = Date.now()
    
    if (this.keys.shoot && 
        currentTime - this.lastShotTime >= this.fireRate &&
        this.ammo > 0) {
      this.shoot()
      this.lastShotTime = currentTime
      this.ammo--
    }
  }

  shoot() {
    // Get shooting direction from camera
    const direction = new THREE.Vector3()
    this.camera.getWorldDirection(direction)
    
    // Use gun's muzzle position for bullet spawn
    const startPosition = this.gun.getBulletSpawnPosition()
    
    const bullet = new Bullet(this.scene, this.world, startPosition, direction)
    this.bullets.push(bullet)
    
    // Trigger gun recoil animation
    this.gun.fireWeapon()
    
    console.log('Shot fired! Ammo remaining:', this.ammo)
  }

  updateBullets(deltaTime) {
    this.bullets.forEach((bullet, index) => {
      bullet.update(deltaTime)
      
      // Remove bullets that are too old or too far
      if (bullet.shouldRemove()) {
        bullet.removeFromScene()
        this.bullets.splice(index, 1)
      }
    })
  }

  updateCamera() {
    // Update camera position to follow player
    this.camera.position.copy(this.position)
  }

  takeDamage(amount) {
    const currentTime = Date.now()
    
    // Check damage immunity
    if (currentTime - this.lastDamageTime < this.damageImmunityTime) {
      return
    }
    
    this.health -= amount
    this.health = Math.max(0, this.health)
    this.lastDamageTime = currentTime
    
    // Visual feedback for taking damage
    this.flashDamage()
  }

  flashDamage() {
    // Add red tint to screen briefly
    const overlay = document.createElement('div')
    overlay.style.position = 'fixed'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)'
    overlay.style.pointerEvents = 'none'
    overlay.style.zIndex = '1000'
    document.body.appendChild(overlay)
    
    setTimeout(() => {
      document.body.removeChild(overlay)
    }, 200)
  }

  reload() {
    this.ammo = this.maxAmmo
    console.log('Reloaded! Ammo:', this.ammo)
  }

  reset() {
    this.health = this.maxHealth
    this.ammo = this.maxAmmo
    this.position.set(0, 1.8, 0)
    this.body.position.set(0, 1.8, 0)
    this.body.velocity.set(0, 0, 0)
    
    // Remove all bullets
    this.bullets.forEach(bullet => bullet.removeFromScene())
    this.bullets = []
    
    this.lastDamageTime = 0
    this.lastShotTime = 0
  }

  // Getters
  getHealth() { return this.health }
  getAmmo() { return this.ammo }
  getPosition() { return this.position }
  getBullets() { return this.bullets }
}
