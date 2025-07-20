import * as THREE from 'three'

/**
 * Gun class for rendering and managing the player's weapon
 * Creates a 3D gun model and handles visual effects
 */
export class Gun {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera
    
    this.gunGroup = new THREE.Group()
    this.originalPosition = new THREE.Vector3(0.3, -0.2, -0.5)
    this.originalRotation = new THREE.Euler(0, 0, 0)
    
    this.recoilAmount = 0
    this.recoilRecovery = 0.1
    this.maxRecoil = 0.1
    
    this.createGunModel()
    this.setupPosition()
  }

  createGunModel() {
    // Gun barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.025, 0.3, 8)
    const barrelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
    this.barrel = new THREE.Mesh(barrelGeometry, barrelMaterial)
    this.barrel.rotation.z = Math.PI / 2
    this.barrel.position.set(0.1, 0, 0)
    this.gunGroup.add(this.barrel)

    // Gun body/receiver
    const bodyGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.25)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 })
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    this.body.position.set(-0.05, 0, 0)
    this.gunGroup.add(this.body)

    // Trigger guard
    const triggerGeometry = new THREE.TorusGeometry(0.03, 0.01, 4, 8)
    const triggerMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 })
    this.trigger = new THREE.Mesh(triggerGeometry, triggerMaterial)
    this.trigger.position.set(-0.08, -0.05, 0)
    this.trigger.rotation.x = Math.PI / 2
    this.gunGroup.add(this.trigger)

    // Gun grip
    const gripGeometry = new THREE.BoxGeometry(0.04, 0.12, 0.08)
    const gripMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
    this.grip = new THREE.Mesh(gripGeometry, gripMaterial)
    this.grip.position.set(-0.08, -0.1, 0)
    this.gunGroup.add(this.grip)

    // Gun sight (front)
    const sightGeometry = new THREE.BoxGeometry(0.005, 0.02, 0.01)
    const sightMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 })
    this.frontSight = new THREE.Mesh(sightGeometry, sightMaterial)
    this.frontSight.position.set(0.2, 0.05, 0)
    this.gunGroup.add(this.frontSight)

    // Muzzle flash placeholder (hidden by default)
    const muzzleGeometry = new THREE.ConeGeometry(0.03, 0.08, 6)
    const muzzleMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffaa00,
      transparent: true,
      opacity: 0
    })
    this.muzzleFlash = new THREE.Mesh(muzzleGeometry, muzzleMaterial)
    this.muzzleFlash.position.set(0.25, 0, 0)
    this.muzzleFlash.rotation.z = -Math.PI / 2
    this.gunGroup.add(this.muzzleFlash)

    // Add gun to camera (so it follows the camera)
    this.camera.add(this.gunGroup)
  }

  setupPosition() {
    // Position gun relative to camera
    this.gunGroup.position.copy(this.originalPosition)
    this.gunGroup.rotation.copy(this.originalRotation)
  }

  /**
   * Trigger recoil animation when shooting
   */
  fireWeapon() {
    this.recoilAmount = this.maxRecoil
    
    // Muzzle flash effect
    this.showMuzzleFlash()
    
    console.log('Gun fired with recoil!')
  }

  showMuzzleFlash() {
    // Show muzzle flash briefly
    this.muzzleFlash.material.opacity = 0.8
    
    setTimeout(() => {
      this.muzzleFlash.material.opacity = 0
    }, 50)
  }

  /**
   * Update gun animations and effects
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    // Handle recoil animation
    if (this.recoilAmount > 0) {
      // Apply recoil to gun position
      this.gunGroup.position.z = this.originalPosition.z - this.recoilAmount
      this.gunGroup.rotation.x = this.originalRotation.x - this.recoilAmount * 2
      
      // Recover from recoil
      this.recoilAmount -= this.recoilRecovery * deltaTime * 60
      this.recoilAmount = Math.max(0, this.recoilAmount)
    } else {
      // Return to original position
      this.gunGroup.position.copy(this.originalPosition)
      this.gunGroup.rotation.copy(this.originalRotation)
    }
    
    // Subtle idle animation (gun sway)
    const time = Date.now() * 0.001
    this.gunGroup.rotation.x += Math.sin(time * 1.5) * 0.002
    this.gunGroup.rotation.y += Math.cos(time * 1.2) * 0.001
  }

  /**
   * Get the position where bullets should spawn from
   * @returns {THREE.Vector3} World position of gun barrel tip
   */
  getBulletSpawnPosition() {
    const muzzlePosition = new THREE.Vector3(0.25, 0, 0)
    muzzlePosition.applyMatrix4(this.gunGroup.matrixWorld)
    return muzzlePosition
  }

  /**
   * Show/hide the gun
   * @param {boolean} visible - Whether gun should be visible
   */
  setVisible(visible) {
    this.gunGroup.visible = visible
  }

  /**
   * Remove gun from scene
   */
  dispose() {
    this.camera.remove(this.gunGroup)
    
    // Dispose of geometries and materials
    this.gunGroup.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose()
      }
      if (child.material) {
        child.material.dispose()
      }
    })
  }

  /**
   * Get gun group for additional customization
   * @returns {THREE.Group}
   */
  getGunGroup() {
    return this.gunGroup
  }
}
