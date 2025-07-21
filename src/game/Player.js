
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Bullet from './Bullet.js';

/**
 * Player class for first-person character controls
 * Handles movement, shooting, and health management
 */
export default class Player {
  constructor(scene, physicsWorld, camera, inputManager) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.camera = camera;
    this.inputManager = inputManager;
    
    this.health = 100;
    this.maxHealth = 100;
    this.ammo = 30;
    this.maxAmmo = 30;
    
    this.position = new THREE.Vector3(0, 1.8, 0);
    this.velocity = new THREE.Vector3();
    this.moveSpeed = 10;
    this.jumpForce = 8;
    this.isGrounded = false;
    
    this.bullets = [];
    this.lastShotTime = 0;
    this.fireRate = 200; // milliseconds between shots
    
    this.lastDamageTime = 0;
    this.damageImmunityTime = 1000; // 1 second immunity after taking damage
    
    // Initialize keys object (will be updated from inputManager)
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      shoot: false
    };
    
    this.init();
  }

  init() {
    this.setupPhysics();
  }

  setupPhysics() {
    // Create physics body for player
    const shape = new CANNON.Cylinder(0.5, 0.5, 1.8, 8);
    this.body = new CANNON.Body({ mass: 75 });
    this.body.addShape(shape);
    this.body.position.set(0, 1.8, 0);
    this.body.material = new CANNON.Material('playerMaterial');
    
    // Prevent player from falling over
    this.body.fixedRotation = true;
    this.body.updateMassProperties();
    
    this.physicsWorld.addBody(this.body);
    
    // Ground collision detection
    this.body.addEventListener('collide', (event) => {
      const contact = event.contact;
      // Check if collision is with ground (y-normal pointing up)
      if (contact.ni.y > 0.5 || contact.ni.y < -0.5) {
        this.isGrounded = true;
      }
    });
  }

  update(deltaTime) {
    this.updateMovement(deltaTime);
    this.updateShooting();
    this.updateBullets(deltaTime);
    this.updateCamera();
    
    // Reset grounded state (will be set again by collision detection)
    this.isGrounded = false;
  }

  updateMovement(deltaTime) {
    // Update keys from input manager
    if (this.inputManager) {
      this.keys.forward = this.inputManager.isKeyPressed('KeyW');
      this.keys.backward = this.inputManager.isKeyPressed('KeyS');
      this.keys.left = this.inputManager.isKeyPressed('KeyA');
      this.keys.right = this.inputManager.isKeyPressed('KeyD');
      this.keys.jump = this.inputManager.isKeyPressed('Space');
      // Mouse buttons are handled differently in shooting
    }
    
    // Get camera direction for movement
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0; // Remove vertical component
    direction.normalize();
    
    const right = new THREE.Vector3();
    right.crossVectors(direction, new THREE.Vector3(0, 1, 0));
    right.normalize();
    
    // Calculate movement vector
    const movement = new THREE.Vector3();
    
    if (this.keys.forward) {
      movement.add(direction);
    }
    if (this.keys.backward) {
      movement.sub(direction);
    }
    if (this.keys.left) {
      movement.sub(right);
    }
    if (this.keys.right) {
      movement.add(right);
    }
    
    // Normalize movement and apply speed
    if (movement.length() > 0) {
      movement.normalize();
      movement.multiplyScalar(this.moveSpeed);
    }
    
    // Apply movement to physics body
    this.body.velocity.x = movement.x;
    this.body.velocity.z = movement.z;
    
    // Handle jumping
    if (this.keys.jump && this.isGrounded) {
      this.body.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }
    
    // Update position from physics body
    this.position.copy(this.body.position);
  }

  updateShooting() {
    const currentTime = Date.now();
    
    // Update shooting state from input manager
    if (this.inputManager) {
      this.keys.shoot = this.inputManager.isMouseButtonPressed(0); // Left mouse button
    }
    
    if (this.keys.shoot && 
        currentTime - this.lastShotTime >= this.fireRate &&
        this.ammo > 0) {
      this.shoot();
      this.lastShotTime = currentTime;
      this.ammo--;
    }
  }

  shoot() {
    // Get shooting direction from camera
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    
    // Create bullet slightly in front of camera
    const startPosition = this.camera.position.clone();
    startPosition.add(direction.clone().multiplyScalar(0.5));
    
    const bullet = new Bullet(this.scene, this.physicsWorld, startPosition, direction);
    this.bullets.push(bullet);
    
    console.log('Shot fired! Ammo remaining:', this.ammo);
  }

  updateBullets(deltaTime) {
    this.bullets.forEach((bullet, index) => {
      bullet.update(deltaTime);
      
      // Remove bullets that should be disposed
      if (bullet.shouldBeRemoved) {
        this.bullets.splice(index, 1);
      }
    });
  }

  updateCamera() {
    // Update camera position to follow player
    this.camera.position.copy(this.position);
  }

  takeDamage(amount) {
    const currentTime = Date.now();
    
    // Check damage immunity
    if (currentTime - this.lastDamageTime < this.damageImmunityTime) {
      return;
    }
    
    this.health -= amount;
    this.health = Math.max(0, this.health);
    this.lastDamageTime = currentTime;
    
    // Visual feedback for taking damage
    this.flashDamage();
  }

  flashDamage() {
    // Add red tint to screen briefly
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1000';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 200);
  }

  reload() {
    this.ammo = this.maxAmmo;
    console.log('Reloaded! Ammo:', this.ammo);
  }

  reset() {
    this.health = this.maxHealth;
    this.ammo = this.maxAmmo;
    this.position.set(0, 1.8, 0);
    this.body.position.set(0, 1.8, 0);
    this.body.velocity.set(0, 0, 0);
    
    // Remove all bullets
    this.bullets.forEach(bullet => bullet.dispose());
    this.bullets = [];
    
    this.lastDamageTime = 0;
    this.lastShotTime = 0;
  }

  // Getters
  getHealth() { return this.health; }
  getAmmo() { return this.ammo; }
  getPosition() { return this.position; }
  getBullets() { return this.bullets; }
}
