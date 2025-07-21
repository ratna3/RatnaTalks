import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/**
 * Bullet class for projectile mechanics
 * Implements object pooling and disposal
 */
export default class Bullet {
  /**
   * @param {THREE.Scene} scene
   * @param {CANNON.World} physicsWorld
   * @param {THREE.Vector3} position
   * @param {THREE.Vector3} direction
   */
  constructor(scene, physicsWorld, position, direction) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.position = position.clone();
    this.direction = direction.clone();
    this.speed = 50;
    this.lifeTime = 3000; // ms
    this.createTime = Date.now();
    this.shouldBeRemoved = false;
    this.init();
  }

  /**
   * Initialize bullet mesh and physics body
   */
  init() {
    // Three.js mesh - Enhanced bullet appearance
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xffff00,
      emissive: 0x444400,
      metalness: 0.5,
      roughness: 0.1
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);

    // Add bullet trail effect
    this.createTrailEffect();

    // Cannon.js body
    const shape = new CANNON.Sphere(0.05);
    this.body = new CANNON.Body({ mass: 0.01 });
    this.body.addShape(shape);
    this.body.position.copy(this.position);
    const velocity = new CANNON.Vec3(
      this.direction.x * this.speed,
      this.direction.y * this.speed,
      this.direction.z * this.speed
    );
    this.body.velocity.copy(velocity);
    this.physicsWorld.addBody(this.body);
    this.body.addEventListener('collide', (event) => {
      this.createImpactEffect(event);
      this.shouldBeRemoved = true;
    });
  }

  /**
   * Create bullet trail effect
   */
  createTrailEffect() {
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffff00,
      transparent: true,
      opacity: 0.5
    });
    
    const positions = new Float32Array(6); // 2 points, 3 coordinates each
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    this.trail = new THREE.Line(trailGeometry, trailMaterial);
    this.scene.add(this.trail);
  }

  /**
   * Create impact effect when bullet hits something
   */
  createImpactEffect(collisionEvent) {
    const impactPosition = this.body.position;
    
    // Create particle effect
    const particleCount = 10;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.01, 4, 4);
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4444,
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      particle.position.copy(impactPosition);
      particles.add(particle);
      
      // Random velocity for particles
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      particle.userData.velocity = velocity;
    }
    
    this.scene.add(particles);
    
    // Remove particles after short time
    setTimeout(() => {
      this.scene.remove(particles);
    }, 500);
  }

  /**
   * Update bullet position and check for removal
   */
  update() {
    this.mesh.position.copy(this.body.position);
    
    // Update trail effect
    if (this.trail) {
      const positions = this.trail.geometry.attributes.position.array;
      positions[0] = this.body.position.x - this.direction.x * 0.5;
      positions[1] = this.body.position.y - this.direction.y * 0.5;
      positions[2] = this.body.position.z - this.direction.z * 0.5;
      positions[3] = this.body.position.x;
      positions[4] = this.body.position.y;
      positions[5] = this.body.position.z;
      this.trail.geometry.attributes.position.needsUpdate = true;
    }
    
    if (Date.now() - this.createTime > this.lifeTime || this.shouldBeRemoved) {
      this.dispose();
    }
  }

  /**
   * Dispose of mesh and physics body
   */
  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    
    if (this.trail) {
      this.scene.remove(this.trail);
      this.trail.geometry.dispose();
      this.trail.material.dispose();
    }
    
    this.physicsWorld.removeBody(this.body);
    this.shouldBeRemoved = true;
  }
}
