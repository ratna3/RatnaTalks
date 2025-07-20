import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class Zombie {
  constructor(scene, world, x, y, z) {
    this.scene = scene
    this.world = world
    
    this.health = 100
    this.maxHealth = 100
    this.speed = 3
    this.attackDamage = 10
    this.attackRange = 2
    this.attackCooldown = 1500 // 1.5 seconds
    this.lastAttackTime = 0
    
    this.target = null
    this.state = 'idle' // idle, chasing, attacking, dead
    
    this.setupVisual(x, y, z)
    this.setupPhysics(x, y, z)
    this.setupAI()
  }

  setupVisual(x, y, z) {
    // Create zombie group
    this.group = new THREE.Group()
    
    // Body (cylinder for simplicity)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.6, 8)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4a5d23 }) // Dark green
    this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
    this.bodyMesh.position.y = 0.8
    this.bodyMesh.castShadow = true
    this.group.add(this.bodyMesh)
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 8, 8)
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0x6b7c32 }) // Slightly lighter green
    this.headMesh = new THREE.Mesh(headGeometry, headMaterial)
    this.headMesh.position.y = 1.8
    this.headMesh.castShadow = true
    this.group.add(this.headMesh)
    
    // Eyes (red dots)
    const eyeGeometry = new THREE.SphereGeometry(0.05, 4, 4)
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, emissive: 0x440000 })
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.1, 1.85, 0.2)
    this.group.add(leftEye)
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    rightEye.position.set(0.1, 1.85, 0.2)
    this.group.add(rightEye)
    
    // Arms (simple cylinders)
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6)
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x5a6b2a })
    
    this.leftArm = new THREE.Mesh(armGeometry, armMaterial)
    this.leftArm.position.set(-0.4, 1.2, 0)
    this.leftArm.rotation.z = 0.5
    this.leftArm.castShadow = true
    this.group.add(this.leftArm)
    
    this.rightArm = new THREE.Mesh(armGeometry, armMaterial)
    this.rightArm.position.set(0.4, 1.2, 0)
    this.rightArm.rotation.z = -0.5
    this.rightArm.castShadow = true
    this.group.add(this.rightArm)
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 6)
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x3a4b1a })
    
    this.leftLeg = new THREE.Mesh(legGeometry, legMaterial)
    this.leftLeg.position.set(-0.15, 0.4, 0)
    this.leftLeg.castShadow = true
    this.group.add(this.leftLeg)
    
    this.rightLeg = new THREE.Mesh(legGeometry, legMaterial)
    this.rightLeg.position.set(0.15, 0.4, 0)
    this.rightLeg.castShadow = true
    this.group.add(this.rightLeg)
    
    // Position the group
    this.group.position.set(x, y, z)
    this.scene.add(this.group)
    
    // Animation properties
    this.walkCycle = 0
    this.armSwing = 0
  }

  setupPhysics(x, y, z) {
    // Create physics body
    const shape = new CANNON.Cylinder(0.4, 0.4, 1.8, 8)
    this.body = new CANNON.Body({ mass: 70 })
    this.body.addShape(shape)
    this.body.position.set(x, y + 0.9, z)
    this.body.material = new CANNON.Material('zombieMaterial')
    
    // Prevent zombie from falling over
    this.body.fixedRotation = true
    this.body.updateMassProperties()
    
    this.world.addBody(this.body)
  }

  setupAI() {
    this.pathfindingTimer = 0
    this.pathfindingInterval = 100 // Update path every 100ms
    this.stuckTimer = 0
    this.lastPosition = new THREE.Vector3()
    this.movementThreshold = 0.1
  }

  setTarget(target) {
    this.target = target
  }

  update(deltaTime) {
    if (this.health <= 0) {
      this.state = 'dead'
      return
    }

    this.updateAI(deltaTime)
    this.updateAnimation(deltaTime)
    this.updatePhysics()
  }

  updateAI(deltaTime) {
    if (!this.target) return
    
    const targetPosition = this.target.getPosition()
    const zombiePosition = this.group.position
    const distance = zombiePosition.distanceTo(targetPosition)
    
    // Update pathfinding
    this.pathfindingTimer += deltaTime * 1000
    if (this.pathfindingTimer >= this.pathfindingInterval) {
      this.pathfindingTimer = 0
      
      if (distance > this.attackRange) {
        this.state = 'chasing'
        this.moveTowardsTarget(targetPosition)
      } else {
        this.state = 'attacking'
        this.body.velocity.x = 0
        this.body.velocity.z = 0
      }
    }
    
    // Check if stuck
    const currentPosition = new THREE.Vector3().copy(this.group.position)
    if (currentPosition.distanceTo(this.lastPosition) < this.movementThreshold) {
      this.stuckTimer += deltaTime * 1000
      if (this.stuckTimer > 2000) { // Stuck for 2 seconds
        this.unstuck()
        this.stuckTimer = 0
      }
    } else {
      this.stuckTimer = 0
    }
    this.lastPosition.copy(currentPosition)
  }

  moveTowardsTarget(targetPosition) {
    const direction = new THREE.Vector3()
    direction.subVectors(targetPosition, this.group.position)
    direction.y = 0 // Only move horizontally
    direction.normalize()
    
    // Apply movement
    this.body.velocity.x = direction.x * this.speed
    this.body.velocity.z = direction.z * this.speed
    
    // Rotate to face target
    const angle = Math.atan2(direction.x, direction.z)
    this.group.rotation.y = angle
  }

  unstuck() {
    // Add random movement to get unstuck
    const randomDirection = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      0,
      (Math.random() - 0.5) * 2
    )
    randomDirection.normalize()
    
    this.body.velocity.x = randomDirection.x * this.speed * 1.5
    this.body.velocity.z = randomDirection.z * this.speed * 1.5
  }

  updateAnimation(deltaTime) {
    this.walkCycle += deltaTime * 5
    this.armSwing += deltaTime * 8
    
    if (this.state === 'chasing') {
      // Walking animation
      this.leftLeg.rotation.x = Math.sin(this.walkCycle) * 0.5
      this.rightLeg.rotation.x = Math.sin(this.walkCycle + Math.PI) * 0.5
      
      this.leftArm.rotation.x = Math.sin(this.armSwing) * 0.3
      this.rightArm.rotation.x = Math.sin(this.armSwing + Math.PI) * 0.3
    } else if (this.state === 'attacking') {
      // Attack animation
      this.leftArm.rotation.x = Math.sin(this.armSwing * 2) * 0.8
      this.rightArm.rotation.x = Math.sin(this.armSwing * 2 + Math.PI) * 0.8
    }
    
    // Head bobbing
    this.headMesh.position.y = 1.8 + Math.sin(this.walkCycle * 2) * 0.05
  }

  updatePhysics() {
    // Sync visual position with physics
    this.group.position.copy(this.body.position)
    this.group.position.y -= 0.9 // Adjust for body center offset
  }

  takeDamage(amount) {
    this.health -= amount
    this.health = Math.max(0, this.health)
    
    // Visual feedback for taking damage
    this.flashDamage()
    
    if (this.health <= 0) {
      this.die()
    }
  }

  flashDamage() {
    // Flash red briefly
    const originalColor = this.bodyMesh.material.color.getHex()
    this.bodyMesh.material.color.setHex(0xff0000)
    this.headMesh.material.color.setHex(0xff0000)
    
    setTimeout(() => {
      this.bodyMesh.material.color.setHex(originalColor)
      this.headMesh.material.color.setHex(0x6b7c32)
    }, 100)
  }

  die() {
    this.state = 'dead'
    
    // Death animation - fall over
    this.group.rotation.z = Math.PI / 2
    
    // Stop physics
    this.body.velocity.set(0, 0, 0)
    this.body.mass = 0
    this.body.updateMassProperties()
  }

  isNearPlayer(playerPosition, range) {
    const distance = this.group.position.distanceTo(playerPosition)
    return distance <= range
  }

  canAttack() {
    const currentTime = Date.now()
    return this.state === 'attacking' && 
           (currentTime - this.lastAttackTime) >= this.attackCooldown
  }

  attack() {
    this.lastAttackTime = Date.now()
    
    // Visual attack effect
    this.leftArm.rotation.x = -1.5
    this.rightArm.rotation.x = -1.5
    
    setTimeout(() => {
      this.leftArm.rotation.x = 0
      this.rightArm.rotation.x = 0
    }, 200)
  }

  isDead() {
    return this.state === 'dead'
  }

  getMesh() {
    return this.group
  }

  removeFromScene() {
    // Remove from scene
    this.scene.remove(this.group)
    
    // Remove from physics world
    this.world.removeBody(this.body)
    
    // Dispose of resources
    this.group.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose()
      }
      if (child.material) {
        child.material.dispose()
      }
    })
  }
}
