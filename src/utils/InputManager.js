import * as THREE from 'three';

/**
 * InputManager for handling keyboard and mouse input
 * Implements first-person controls
 */
export default class InputManager {
  constructor() {
    this.keys = {};
    this.mouseButtons = {};
    this.mouseMovement = { x: 0, y: 0 };
    this.mouseSensitivity = 0.002;
    this.isPointerLocked = false;
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for keyboard and mouse
   */
  setupEventListeners() {
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
    document.addEventListener('keyup', (event) => this.onKeyUp(event));
    document.addEventListener('mousedown', (event) => this.onMouseDown(event));
    document.addEventListener('mouseup', (event) => this.onMouseUp(event));
    document.addEventListener('mousemove', (event) => this.onMouseMove(event));
    document.addEventListener('click', () => this.requestPointerLock());
    document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
  }

  onKeyDown(event) {
    this.keys[event.code] = true;
  }

  onKeyUp(event) {
    this.keys[event.code] = false;
  }

  onMouseDown(event) {
    this.mouseButtons[event.button] = true;
  }

  onMouseUp(event) {
    this.mouseButtons[event.button] = false;
  }

  onMouseMove(event) {
    if (this.isPointerLocked) {
      this.mouseMovement.x = event.movementX || 0;
      this.mouseMovement.y = event.movementY || 0;
    }
  }

  requestPointerLock() {
    if (!this.isPointerLocked) {
      document.body.requestPointerLock();
    }
  }

  onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === document.body;
  }

  /**
   * Update input states - call this in the game loop
   */
  update() {
    // Reset mouse movement after processing
    this.mouseMovement.x = 0;
    this.mouseMovement.y = 0;
  }

  isKeyPressed(keyCode) {
    return !!this.keys[keyCode];
  }

  isMouseButtonPressed(button) {
    return !!this.mouseButtons[button];
  }

  getMouseMovement() {
    return this.mouseMovement;
  }
}
