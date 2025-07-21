/**
 * HealthSystem class for managing entity health
 * Provides damage immunity, healing, and death detection
 */
export default class HealthSystem {
  /**
   * @param {number} maxHealth
   */
  constructor(maxHealth = 100) {
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.lastDamageTime = 0;
    this.damageImmunityDuration = 1000; // ms
    this.onHealthChanged = null;
    this.onDeath = null;
    this.onDamageBlocked = null;
  }

  /**
   * Apply damage to the entity
   * @param {number} amount
   * @returns {boolean}
   */
  takeDamage(amount) {
    const currentTime = Date.now();
    if (currentTime - this.lastDamageTime < this.damageImmunityDuration) {
      if (this.onDamageBlocked) this.onDamageBlocked(amount);
      return false;
    }
    this.currentHealth -= amount;
    this.currentHealth = Math.max(0, this.currentHealth);
    this.lastDamageTime = currentTime;
    if (this.onHealthChanged) this.onHealthChanged(this.currentHealth, this.maxHealth);
    if (this.currentHealth <= 0 && this.onDeath) this.onDeath();
    return true;
  }

  /**
   * Heal the entity
   * @param {number} amount
   */
  heal(amount) {
    this.currentHealth += amount;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth);
    if (this.onHealthChanged) this.onHealthChanged(this.currentHealth, this.maxHealth);
  }

  /**
   * Reset health to maximum
   */
  reset() {
    this.currentHealth = this.maxHealth;
    this.lastDamageTime = 0;
    if (this.onHealthChanged) this.onHealthChanged(this.currentHealth, this.maxHealth);
  }

  /**
   * Set maximum health and optionally current health
   * @param {number} maxHealth
   * @param {boolean} resetCurrent
   */
  setMaxHealth(maxHealth, resetCurrent = false) {
    this.maxHealth = maxHealth;
    if (resetCurrent) {
      this.currentHealth = maxHealth;
    } else {
      this.currentHealth = Math.min(this.currentHealth, maxHealth);
    }
    if (this.onHealthChanged) this.onHealthChanged(this.currentHealth, this.maxHealth);
  }

  getHealth() { return this.currentHealth; }
  getMaxHealth() { return this.maxHealth; }
  getHealthPercentage() { return (this.currentHealth / this.maxHealth) * 100; }
  isDead() { return this.currentHealth <= 0; }
  isImmune() { return (Date.now() - this.lastDamageTime) < this.damageImmunityDuration; }
  isFullHealth() { return this.currentHealth >= this.maxHealth; }
  getRemainingImmunityTime() { return Math.max(0, this.damageImmunityDuration - (Date.now() - this.lastDamageTime)); }
}
