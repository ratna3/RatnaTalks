import * as THREE from 'three'

export class HealthSystem {
  constructor(maxHealth = 100) {
    this.maxHealth = maxHealth
    this.currentHealth = maxHealth
    this.lastDamageTime = 0
    this.damageImmunityDuration = 1000 // 1 second
    
    this.onHealthChanged = null // Callback function
    this.onDeath = null // Callback function
  }

  takeDamage(amount) {
    const currentTime = Date.now()
    
    // Check for damage immunity
    if (currentTime - this.lastDamageTime < this.damageImmunityDuration) {
      return false // Damage was blocked
    }
    
    this.currentHealth -= amount
    this.currentHealth = Math.max(0, this.currentHealth)
    this.lastDamageTime = currentTime
    
    // Trigger callbacks
    if (this.onHealthChanged) {
      this.onHealthChanged(this.currentHealth, this.maxHealth)
    }
    
    if (this.currentHealth <= 0 && this.onDeath) {
      this.onDeath()
    }
    
    return true // Damage was applied
  }

  heal(amount) {
    this.currentHealth += amount
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth)
    
    if (this.onHealthChanged) {
      this.onHealthChanged(this.currentHealth, this.maxHealth)
    }
  }

  reset() {
    this.currentHealth = this.maxHealth
    this.lastDamageTime = 0
    
    if (this.onHealthChanged) {
      this.onHealthChanged(this.currentHealth, this.maxHealth)
    }
  }

  getHealth() {
    return this.currentHealth
  }

  getMaxHealth() {
    return this.maxHealth
  }

  getHealthPercentage() {
    return (this.currentHealth / this.maxHealth) * 100
  }

  isDead() {
    return this.currentHealth <= 0
  }

  isImmune() {
    const currentTime = Date.now()
    return (currentTime - this.lastDamageTime) < this.damageImmunityDuration
  }
}

// Utility functions
export class Utils {
  // Linear interpolation
  static lerp(start, end, factor) {
    return start + (end - start) * factor
  }

  // Clamp a value between min and max
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value))
  }

  // Map a value from one range to another
  static map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin
  }

  // Generate random number between min and max
  static random(min, max) {
    return Math.random() * (max - min) + min
  }

  // Generate random integer between min and max (inclusive)
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Distance between two 3D points
  static distance3D(point1, point2) {
    const dx = point1.x - point2.x
    const dy = point1.y - point2.y
    const dz = point1.z - point2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  // Distance between two 2D points (ignoring Y)
  static distance2D(point1, point2) {
    const dx = point1.x - point2.x
    const dz = point1.z - point2.z
    return Math.sqrt(dx * dx + dz * dz)
  }

  // Normalize angle to 0-2π range
  static normalizeAngle(angle) {
    while (angle < 0) angle += Math.PI * 2
    while (angle >= Math.PI * 2) angle -= Math.PI * 2
    return angle
  }

  // Get angle between two 2D points
  static getAngleBetweenPoints(from, to) {
    return Math.atan2(to.z - from.z, to.x - from.x)
  }

  // Create a random position within a circle
  static randomPositionInCircle(center, radius) {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * radius
    return new THREE.Vector3(
      center.x + Math.cos(angle) * distance,
      center.y,
      center.z + Math.sin(angle) * distance
    )
  }

  // Create a random position in a ring (donut shape)
  static randomPositionInRing(center, innerRadius, outerRadius) {
    const angle = Math.random() * Math.PI * 2
    const distance = innerRadius + Math.random() * (outerRadius - innerRadius)
    return new THREE.Vector3(
      center.x + Math.cos(angle) * distance,
      center.y,
      center.z + Math.sin(angle) * distance
    )
  }

  // Check if a point is within a certain distance of another point
  static isWithinDistance(point1, point2, distance) {
    return this.distance3D(point1, point2) <= distance
  }

  // Smooth step function for easing
  static smoothStep(t) {
    return t * t * (3 - 2 * t)
  }

  // Smoother step function
  static smootherStep(t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  // Convert degrees to radians
  static degToRad(degrees) {
    return degrees * (Math.PI / 180)
  }

  // Convert radians to degrees
  static radToDeg(radians) {
    return radians * (180 / Math.PI)
  }

  // Format time in MM:SS format
  static formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Dispose of Three.js resources
  static disposeObject(object) {
    if (object.geometry) {
      object.geometry.dispose()
    }
    
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose())
      } else {
        object.material.dispose()
      }
    }
    
    if (object.texture) {
      object.texture.dispose()
    }
  }

  // Recursively dispose of all objects in a group
  static disposeGroup(group) {
    group.traverse((child) => {
      this.disposeObject(child)
    })
  }

  // Simple object pool for performance
  static createObjectPool(createFunction, resetFunction, initialSize = 10) {
    const pool = []
    const active = []
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      pool.push(createFunction())
    }
    
    return {
      get() {
        if (pool.length > 0) {
          const obj = pool.pop()
          active.push(obj)
          return obj
        } else {
          const obj = createFunction()
          active.push(obj)
          return obj
        }
      },
      
      release(obj) {
        const index = active.indexOf(obj)
        if (index > -1) {
          active.splice(index, 1)
          resetFunction(obj)
          pool.push(obj)
        }
      },
      
      getActiveCount() {
        return active.length
      },
      
      getPoolSize() {
        return pool.length
      }
    }
  }
}
