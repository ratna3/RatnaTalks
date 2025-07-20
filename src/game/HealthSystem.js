/**
 * HealthSystem class for managing entity health
 * Provides damage immunity, healing, and death detection
 */
export class HealthSystem {
  constructor(maxHealth = 100) {
    this.maxHealth = maxHealth
    this.currentHealth = maxHealth
    this.lastDamageTime = 0
    this.damageImmunityDuration = 1000 // 1 second
    
    // Callback functions
    this.onHealthChanged = null
    this.onDeath = null
    this.onDamageBlocked = null
  }

  /**
   * Apply damage to the entity
   * @param {number} amount - Amount of damage to apply
   * @returns {boolean} - True if damage was applied, false if blocked by immunity
   */
  takeDamage(amount) {
    const currentTime = Date.now()
    
    // Check for damage immunity
    if (currentTime - this.lastDamageTime < this.damageImmunityDuration) {
      if (this.onDamageBlocked) {
        this.onDamageBlocked(amount)
      }
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

  /**
   * Heal the entity
   * @param {number} amount - Amount of health to restore
   */
  heal(amount) {
    this.currentHealth += amount
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth)
    
    if (this.onHealthChanged) {
      this.onHealthChanged(this.currentHealth, this.maxHealth)
    }
  }

  /**
   * Reset health to maximum
   */
  reset() {
    this.currentHealth = this.maxHealth
    this.lastDamageTime = 0
    
    if (this.onHealthChanged) {
      this.onHealthChanged(this.currentHealth, this.maxHealth)
    }
  }

  /**
   * Set maximum health and optionally current health
   * @param {number} maxHealth - New maximum health
   * @param {boolean} resetCurrent - Whether to reset current health to max
   */
  setMaxHealth(maxHealth, resetCurrent = false) {
    this.maxHealth = maxHealth
    
    if (resetCurrent) {
      this.currentHealth = maxHealth
    } else {
      this.currentHealth = Math.min(this.currentHealth, maxHealth)
    }
    
    if (this.onHealthChanged) {
      this.onHealthChanged(this.currentHealth, this.maxHealth)
    }
  }

  // Getters
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

  isFullHealth() {
    return this.currentHealth >= this.maxHealth
  }

  getRemainingImmunityTime() {
    const currentTime = Date.now()
    const elapsed = currentTime - this.lastDamageTime
    return Math.max(0, this.damageImmunityDuration - elapsed)
  }
}
