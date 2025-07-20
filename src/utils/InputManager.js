import * as THREE from 'three'

export class InputManager {
  constructor(camera, player) {
    this.camera = camera
    this.player = player
    
    this.mouseMovement = { x: 0, y: 0 }
    this.mouseSensitivity = 0.002
    this.isPointerLocked = false
    
    this.pitch = 0 // Up/down rotation
    this.yaw = 0   // Left/right rotation
    this.maxPitch = Math.PI / 2 - 0.1 // Prevent looking too far up/down
    
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Pointer lock events
    document.addEventListener('pointerlockchange', () => this.onPointerLockChange())
    document.addEventListener('pointerlockerror', () => this.onPointerLockError())
    
    // Mouse movement
    document.addEventListener('mousemove', (event) => this.onMouseMove(event))
    
    // Prevent context menu on right click
    document.addEventListener('contextmenu', (event) => event.preventDefault())
    
    // Handle pointer lock request
    document.addEventListener('click', () => this.requestPointerLock())
  }

  requestPointerLock() {
    if (!this.isPointerLocked) {
      document.body.requestPointerLock()
    }
  }

  onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === document.body
    
    if (this.isPointerLocked) {
      console.log('Pointer locked - FPS controls active')
    } else {
      console.log('Pointer unlocked - FPS controls inactive')
    }
  }

  onPointerLockError() {
    console.error('Pointer lock error')
  }

  onMouseMove(event) {
    if (!this.isPointerLocked) return
    
    // Get mouse movement deltas
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0
    
    // Update rotation angles
    this.yaw -= movementX * this.mouseSensitivity
    this.pitch -= movementY * this.mouseSensitivity
    
    // Clamp pitch to prevent over-rotation
    this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch))
    
    // Apply rotation to camera
    this.updateCameraRotation()
  }

  updateCameraRotation() {
    // Create rotation quaternion from yaw and pitch
    const yawQuaternion = new THREE.Quaternion()
    yawQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw)
    
    const pitchQuaternion = new THREE.Quaternion()
    pitchQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch)
    
    // Combine rotations
    const combinedQuaternion = new THREE.Quaternion()
    combinedQuaternion.multiplyQuaternions(yawQuaternion, pitchQuaternion)
    
    // Apply to camera
    this.camera.quaternion.copy(combinedQuaternion)
  }

  // Get the current look direction
  getLookDirection() {
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyQuaternion(this.camera.quaternion)
    return direction
  }

  // Get the right direction (for strafing)
  getRightDirection() {
    const right = new THREE.Vector3(1, 0, 0)
    right.applyQuaternion(this.camera.quaternion)
    return right
  }

  // Get the forward direction (without Y component, for movement)
  getForwardDirection() {
    const forward = this.getLookDirection()
    forward.y = 0
    forward.normalize()
    return forward
  }

  // Check if pointer is locked
  isPointerLockActive() {
    return this.isPointerLocked
  }

  // Set mouse sensitivity
  setMouseSensitivity(sensitivity) {
    this.mouseSensitivity = sensitivity
  }

  // Reset camera rotation
  resetRotation() {
    this.pitch = 0
    this.yaw = 0
    this.updateCameraRotation()
  }

  // Get current rotation angles (useful for debugging)
  getRotationAngles() {
    return {
      pitch: this.pitch,
      yaw: this.yaw,
      pitchDegrees: this.pitch * (180 / Math.PI),
      yawDegrees: this.yaw * (180 / Math.PI)
    }
  }
}
