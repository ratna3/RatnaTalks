import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export default class Zombie {
  constructor(scene, world, x, y, z) {
    this.scene = scene;
    this.world = world;
    this.health = 100;
    this.attackDamage = 10;
    this.attackRange = 2;
    this.attackCooldown = 1500;
    this.lastAttackTime = 0;
    this.state = 'idle';
    this.speed = 3;
    this.setupVisual(x, y, z);
    this.setupPhysics(x, y, z);
  }
  
  setupVisual(x, y, z) {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0x00aa00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y + 1, z);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
  }
  
  setupPhysics(x, y, z) {
    const shape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
    this.body = new CANNON.Body({ mass: 70 });
    this.body.addShape(shape);
    this.body.position.set(x, y + 1, z);
    this.body.fixedRotation = true;
    this.world.addBody(this.body);
  }
  
  setTarget(target) {
    this.target = target;
  }
  
  update(deltaTime) {
    if (this.health <= 0) return;
    this.updatePhysics();
  }
  
  updatePhysics() {
    if (this.mesh && this.body) {
      this.mesh.position.copy(this.body.position);
    }
  }
  
  getPosition() {
    return this.mesh ? this.mesh.position : new THREE.Vector3();
  }
  
  isNearPlayer(playerPosition, range = this.attackRange) {
    if (!this.mesh) return false;
    return this.mesh.position.distanceTo(playerPosition) <= range;
  }
  
  canAttack() {
    const currentTime = Date.now();
    return currentTime - this.lastAttackTime >= this.attackCooldown;
  }
  
  attack() {
    if (!this.canAttack() || !this.target) return;
    this.lastAttackTime = Date.now();
    console.log('Zombie attacks!');
  }
  
  takeDamage(amount) {
    this.health -= amount;
    return this.health > 0;
  }
  
  isDead() {
    return this.health <= 0;
  }
  
  removeFromScene() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
    if (this.body && this.world) {
      this.world.removeBody(this.body);
    }
  }
}
