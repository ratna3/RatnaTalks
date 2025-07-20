import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class Bullet {
  constructor(scene, world, position, direction) {
    this.scene = scene
    this.world = world
    this.speed = 50
    this.lifeTime = 3000 // 3 seconds
    this.createTime = Date.now()
    
    this.setupVisual(position)
    this.setupPhysics(position, direction)
  }

  setupVisual(position) {
    // Create bullet geometry (small sphere)
    const geometry = new THREE.SphereGeometry(0.05, 8, 8)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      emissive: 0x444400 
    })
    
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.copy(position)
    this.scene.add(this.mesh)
    
    // Add trail effect
    this.trail = []
    this.maxTrailLength = 10
  }

  setupPhysics(position, direction) {
    // Create physics body
    const shape = new CANNON.Sphere(0.05)
    this.body = new CANNON.Body({ mass: 0.01 })
    this.body.addShape(shape)
    this.body.position.copy(position)
    
    // Set velocity in shooting direction
    const velocity = direction.clone().multiplyScalar(this.speed)
    this.body.velocity.set(velocity.x, velocity.y, velocity.z)
    
    // Add to physics world
    this.world.addBody(this.body)
    
    // Handle collisions
    this.body.addEventListener('collide', (event) => {
      this.onCollision(event)
    })
  }

  onCollision(event) {
    const other = event.target === this.body ? event.body : event.target
    
    // Create impact effect
    this.createImpactEffect()
    
    // Mark for removal
    this.shouldBeRemoved = true
  }

  createImpactEffect() {
    // Create small particle explosion
    const particleCount = 5
    const particles = new THREE.Group()
    
    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4)
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffa500,
        transparent: true,
        opacity: 0.8
      })
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)
      particle.position.copy(this.mesh.position)
      
      // Random velocity for particles
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      )
      velocity.normalize()
      velocity.multiplyScalar(Math.random() * 2)
      
      particle.userData = { velocity, life: 0.5 }
      particles.add(particle)
    }
    
    this.scene.add(particles)
    
    // Animate particles
    const animateParticles = () => {
      let allDead = true
      
      particles.children.forEach(particle => {
        if (particle.userData.life > 0) {
          particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016))
          particle.userData.velocity.y -= 0.5 // gravity
          particle.userData.life -= 0.016
          particle.material.opacity = particle.userData.life * 2
          allDead = false
        }
      })
      
      if (!allDead) {
        requestAnimationFrame(animateParticles)
      } else {
        this.scene.remove(particles)
        // Dispose of materials and geometries
        particles.children.forEach(particle => {
          particle.geometry.dispose()
          particle.material.dispose()
        })
      }
    }
    
    animateParticles()
  }

  update(deltaTime) {
    // Update visual position from physics
    this.mesh.position.copy(this.body.position)
    
    // Update trail
    this.updateTrail()
  }

  updateTrail() {
    // Add current position to trail
    this.trail.push(this.mesh.position.clone())
    
    // Limit trail length
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift()
    }
    
    // Optional: Create visual trail (commented out for performance)
    /*
    if (this.trailMesh) {
      this.scene.remove(this.trailMesh)
    }
    
    if (this.trail.length > 1) {
      const trailGeometry = new THREE.BufferGeometry().setFromPoints(this.trail)
      const trailMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.5
      })
      this.trailMesh = new THREE.Line(trailGeometry, trailMaterial)
      this.scene.add(this.trailMesh)
    }
    */
  }

  checkCollision(targetMesh) {
    // Simple distance-based collision check
    const distance = this.mesh.position.distanceTo(targetMesh.position)
    return distance < 1.0 // Collision radius
  }

  shouldRemove() {
    const currentTime = Date.now()
    return this.shouldBeRemoved || 
           (currentTime - this.createTime) > this.lifeTime ||
           this.body.position.y < -10 // Fell through world
  }

  removeFromScene() {
    // Remove from scene
    this.scene.remove(this.mesh)
    
    // Remove trail if it exists
    if (this.trailMesh) {
      this.scene.remove(this.trailMesh)
      this.trailMesh.geometry.dispose()
      this.trailMesh.material.dispose()
    }
    
    // Remove from physics world
    this.world.removeBody(this.body)
    
    // Dispose of resources
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}
