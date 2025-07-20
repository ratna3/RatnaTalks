import * as CANNON from 'cannon-es'

export class CollisionManager {
  constructor(world) {
    this.world = world
    this.setupCollisionGroups()
    this.setupContactMaterials()
  }

  setupCollisionGroups() {
    // Define collision groups
    this.COLLISION_GROUPS = {
      GROUND: 1,
      PLAYER: 2,
      ZOMBIE: 4,
      BULLET: 8,
      BUILDING: 16,
      VEGETATION: 32
    }
    
    // Set up collision masks (what each group can collide with)
    this.COLLISION_MASKS = {
      GROUND: this.COLLISION_GROUPS.PLAYER | this.COLLISION_GROUPS.ZOMBIE | this.COLLISION_GROUPS.BULLET,
      PLAYER: this.COLLISION_GROUPS.GROUND | this.COLLISION_GROUPS.ZOMBIE | this.COLLISION_GROUPS.BUILDING | this.COLLISION_GROUPS.VEGETATION,
      ZOMBIE: this.COLLISION_GROUPS.GROUND | this.COLLISION_GROUPS.PLAYER | this.COLLISION_GROUPS.BULLET | this.COLLISION_GROUPS.BUILDING | this.COLLISION_GROUPS.VEGETATION,
      BULLET: this.COLLISION_GROUPS.GROUND | this.COLLISION_GROUPS.ZOMBIE | this.COLLISION_GROUPS.BUILDING | this.COLLISION_GROUPS.VEGETATION,
      BUILDING: this.COLLISION_GROUPS.PLAYER | this.COLLISION_GROUPS.ZOMBIE | this.COLLISION_GROUPS.BULLET,
      VEGETATION: this.COLLISION_GROUPS.PLAYER | this.COLLISION_GROUPS.ZOMBIE | this.COLLISION_GROUPS.BULLET
    }
  }

  setupContactMaterials() {
    // Create materials
    this.materials = {
      ground: new CANNON.Material('groundMaterial'),
      player: new CANNON.Material('playerMaterial'),
      zombie: new CANNON.Material('zombieMaterial'),
      bullet: new CANNON.Material('bulletMaterial'),
      building: new CANNON.Material('buildingMaterial')
    }
    
    // Ground contact materials
    const groundPlayerContact = new CANNON.ContactMaterial(
      this.materials.ground,
      this.materials.player,
      {
        friction: 0.8,
        restitution: 0.0,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
      }
    )
    this.world.addContactMaterial(groundPlayerContact)
    
    const groundZombieContact = new CANNON.ContactMaterial(
      this.materials.ground,
      this.materials.zombie,
      {
        friction: 0.6,
        restitution: 0.0,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
      }
    )
    this.world.addContactMaterial(groundZombieContact)
    
    // Bullet contact materials
    const bulletGroundContact = new CANNON.ContactMaterial(
      this.materials.bullet,
      this.materials.ground,
      {
        friction: 0.1,
        restitution: 0.1
      }
    )
    this.world.addContactMaterial(bulletGroundContact)
    
    const bulletZombieContact = new CANNON.ContactMaterial(
      this.materials.bullet,
      this.materials.zombie,
      {
        friction: 0.0,
        restitution: 0.0
      }
    )
    this.world.addContactMaterial(bulletZombieContact)
    
    const bulletBuildingContact = new CANNON.ContactMaterial(
      this.materials.bullet,
      this.materials.building,
      {
        friction: 0.1,
        restitution: 0.2
      }
    )
    this.world.addContactMaterial(bulletBuildingContact)
    
    // Player-zombie contact
    const playerZombieContact = new CANNON.ContactMaterial(
      this.materials.player,
      this.materials.zombie,
      {
        friction: 0.1,
        restitution: 0.1
      }
    )
    this.world.addContactMaterial(playerZombieContact)
    
    // Building contacts
    const playerBuildingContact = new CANNON.ContactMaterial(
      this.materials.player,
      this.materials.building,
      {
        friction: 0.8,
        restitution: 0.0
      }
    )
    this.world.addContactMaterial(playerBuildingContact)
    
    const zombieBuildingContact = new CANNON.ContactMaterial(
      this.materials.zombie,
      this.materials.building,
      {
        friction: 0.6,
        restitution: 0.0
      }
    )
    this.world.addContactMaterial(zombieBuildingContact)
  }

  setBodyCollisionGroup(body, groupName) {
    if (this.COLLISION_GROUPS[groupName] !== undefined) {
      body.collisionFilterGroup = this.COLLISION_GROUPS[groupName]
      body.collisionFilterMask = this.COLLISION_MASKS[groupName]
    }
  }

  setBodyMaterial(body, materialName) {
    if (this.materials[materialName]) {
      body.material = this.materials[materialName]
    }
  }

  update() {
    // This method can be used for any custom collision handling
    // that needs to happen each frame
    
    // Check for collision events
    this.world.contacts.forEach(contact => {
      this.handleContact(contact)
    })
  }

  handleContact(contact) {
    // Custom contact handling can be implemented here
    // For example, playing sound effects on specific collisions
    
    const bodyA = contact.bi
    const bodyB = contact.bj
    
    // Example: Handle bullet impacts
    if (this.isBulletContact(bodyA, bodyB)) {
      this.handleBulletImpact(contact)
    }
    
    // Example: Handle player-zombie collisions
    if (this.isPlayerZombieContact(bodyA, bodyB)) {
      this.handlePlayerZombieCollision(contact)
    }
  }

  isBulletContact(bodyA, bodyB) {
    return (bodyA.collisionFilterGroup === this.COLLISION_GROUPS.BULLET) ||
           (bodyB.collisionFilterGroup === this.COLLISION_GROUPS.BULLET)
  }

  isPlayerZombieContact(bodyA, bodyB) {
    return (bodyA.collisionFilterGroup === this.COLLISION_GROUPS.PLAYER && 
            bodyB.collisionFilterGroup === this.COLLISION_GROUPS.ZOMBIE) ||
           (bodyA.collisionFilterGroup === this.COLLISION_GROUPS.ZOMBIE && 
            bodyB.collisionFilterGroup === this.COLLISION_GROUPS.PLAYER)
  }

  handleBulletImpact(contact) {
    // Could trigger impact effects, sounds, etc.
    // This is called automatically by the physics engine
  }

  handlePlayerZombieCollision(contact) {
    // Could trigger damage effects, sounds, etc.
    // This is called automatically by the physics engine
  }

  // Utility methods for raycasting
  raycast(from, to, options = {}) {
    const result = new CANNON.RaycastResult()
    this.world.rayTest(from, to, result)
    return result
  }

  // Check if there's a clear line of sight between two points
  hasLineOfSight(from, to) {
    const result = this.raycast(from, to)
    return !result.hasHit
  }

  // Find the closest hit point along a ray
  getClosestHit(from, direction, maxDistance = 100) {
    const to = new CANNON.Vec3()
    to.copy(from)
    to.vadd(direction.scale(maxDistance))
    
    const result = this.raycast(from, to)
    
    if (result.hasHit) {
      return {
        hit: true,
        point: result.hitPointWorld,
        normal: result.hitNormalWorld,
        body: result.body,
        distance: from.distanceTo(result.hitPointWorld)
      }
    }
    
    return { hit: false }
  }
}
