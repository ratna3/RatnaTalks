import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export default class Environment {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    
    this.createTerrain()
    this.createBuildings()
    this.createVegetation()
    this.createSkybox()
  }

  createTerrain() {
    // Ground plane
    const groundSize = 200
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 32, 32)
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x3a5f3a,
      transparent: true,
      opacity: 0.9
    })
    
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial)
    this.ground.rotation.x = -Math.PI / 2
    this.ground.receiveShadow = true
    this.scene.add(this.ground)
    
    // Physics ground
    const groundShape = new CANNON.Box(new CANNON.Vec3(groundSize / 2, 0.1, groundSize / 2))
    const groundBody = new CANNON.Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.position.set(0, -0.1, 0)
    this.world.addBody(groundBody)
    
    // Roads
    this.createRoads()
  }

  createRoads() {
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 })
    
    // Main road (north-south)
    const mainRoadGeometry = new THREE.PlaneGeometry(8, 200)
    const mainRoad = new THREE.Mesh(mainRoadGeometry, roadMaterial)
    mainRoad.rotation.x = -Math.PI / 2
    mainRoad.position.y = 0.01
    mainRoad.receiveShadow = true
    this.scene.add(mainRoad)
    
    // Cross road (east-west)
    const crossRoadGeometry = new THREE.PlaneGeometry(200, 8)
    const crossRoad = new THREE.Mesh(crossRoadGeometry, roadMaterial)
    crossRoad.rotation.x = -Math.PI / 2
    crossRoad.position.y = 0.01
    crossRoad.receiveShadow = true
    this.scene.add(crossRoad)
    
    // Road markings
    this.createRoadMarkings()
  }

  createRoadMarkings() {
    const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    
    // Center line markings
    for (let i = -90; i <= 90; i += 10) {
      const markingGeometry = new THREE.PlaneGeometry(0.3, 4)
      const marking = new THREE.Mesh(markingGeometry, markingMaterial)
      marking.rotation.x = -Math.PI / 2
      marking.position.set(0, 0.02, i)
      this.scene.add(marking)
    }
    
    // Horizontal center line
    for (let i = -90; i <= 90; i += 10) {
      const markingGeometry = new THREE.PlaneGeometry(4, 0.3)
      const marking = new THREE.Mesh(markingGeometry, markingMaterial)
      marking.rotation.x = -Math.PI / 2
      marking.position.set(i, 0.02, 0)
      this.scene.add(marking)
    }
  }

  createBuildings() {
    // Enhanced building system with more variety
    const buildingPositions = [
      { x: 15, z: 15, width: 8, height: 12, depth: 8, type: 'residential' },
      { x: -15, z: 15, width: 6, height: 8, depth: 6, type: 'residential' },
      { x: 15, z: -15, width: 10, height: 15, depth: 8, type: 'residential' },
      { x: -15, z: -15, width: 7, height: 10, depth: 7, type: 'residential' },
      { x: 25, z: 25, width: 12, height: 20, depth: 10, type: 'commercial' },
      { x: -25, z: 25, width: 8, height: 14, depth: 8, type: 'commercial' },
      { x: 25, z: -25, width: 9, height: 16, depth: 9, type: 'commercial' },
      { x: -25, z: -25, width: 11, height: 18, depth: 8, type: 'commercial' },
      // Add more distant buildings for atmosphere
      { x: 45, z: 35, width: 15, height: 25, depth: 12, type: 'skyscraper' },
      { x: -45, z: -35, width: 18, height: 30, depth: 15, type: 'skyscraper' },
      { x: 60, z: -60, width: 20, height: 8, depth: 25, type: 'warehouse' },
      { x: -60, z: 60, width: 25, height: 6, depth: 20, type: 'warehouse' }
    ]
    
    buildingPositions.forEach(pos => {
      this.createBuilding(pos.x, pos.z, pos.width, pos.height, pos.depth, pos.type)
    })
    
    // Add obstacles and cover objects
    this.createObstacles()
  }

  createBuilding(x, z, width, height, depth, type = 'residential') {
    // Building geometry
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth)
    const buildingMaterial = new THREE.MeshLambertMaterial({ 
      color: this.getBuildingColorByType(type)
    })
    
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
    building.position.set(x, height / 2, z)
    building.castShadow = true
    building.receiveShadow = true
    this.scene.add(building)
    
    // Building physics
    const buildingShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2))
    const buildingBody = new CANNON.Body({ mass: 0 })
    buildingBody.addShape(buildingShape)
    buildingBody.position.set(x, height / 2, z)
    this.world.addBody(buildingBody)
    
    // Add windows based on building type
    this.addWindows(building, width, height, depth, type)
    
    // Add rooftop details
    this.addRooftop(x, z, width, height, depth, type)
  }

  addWindows(building, width, height, depth, type) {
    const windowMaterial = new THREE.MeshBasicMaterial({ 
      color: type === 'skyscraper' ? 0x6666ff : 0x4444ff,
      transparent: true,
      opacity: 0.8
    })
    
    // Front and back windows
    const windowsPerRow = Math.floor(width / 2)
    const windowRows = Math.floor(height / 3)
    
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowsPerRow; col++) {
        // Front windows
        const frontWindow = new THREE.Mesh(
          new THREE.PlaneGeometry(0.8, 1.2),
          windowMaterial
        )
        frontWindow.position.set(
          -width / 2 + (col + 0.5) * (width / windowsPerRow),
          -height / 2 + (row + 1) * (height / (windowRows + 1)),
          depth / 2 + 0.01
        )
        building.add(frontWindow)
        
        // Back windows
        const backWindow = frontWindow.clone()
        backWindow.position.z = -depth / 2 - 0.01
        backWindow.rotation.y = Math.PI
        building.add(backWindow)
      }
    }
  }

  addRooftop(x, z, width, height, depth, type = 'residential') {
    if (type === 'skyscraper') {
      // Add antenna or radio equipment
      const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8)
      const antennaMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 })
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial)
      antenna.position.set(x, height + 1.5, z)
      antenna.castShadow = true
      this.scene.add(antenna)
    } else if (type === 'commercial') {
      // Add HVAC units
      const hvacGeometry = new THREE.BoxGeometry(2, 0.8, 1.5)
      const hvacMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 })
      const hvac = new THREE.Mesh(hvacGeometry, hvacMaterial)
      hvac.position.set(x + (Math.random() - 0.5) * 2, height + 0.4, z + (Math.random() - 0.5) * 2)
      hvac.castShadow = true
      this.scene.add(hvac)
    } else {
      // Simple rooftop structure for residential
      const rooftopGeometry = new THREE.BoxGeometry(width * 0.8, 1, depth * 0.8)
      const rooftopMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 })
      
      const rooftop = new THREE.Mesh(rooftopGeometry, rooftopMaterial)
      rooftop.position.set(x, height + 0.5, z)
      rooftop.castShadow = true
      this.scene.add(rooftop)
    }
  }

  createVegetation() {
    // Trees
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 180
      const z = (Math.random() - 0.5) * 180
      
      // Avoid placing trees on roads
      if (Math.abs(x) < 10 || Math.abs(z) < 10) continue
      
      // Avoid placing trees too close to buildings
      let tooClose = false
      const minDistance = 8
      
      // Simple distance check (could be improved)
      if (Math.abs(x - 15) < minDistance && Math.abs(z - 15) < minDistance) continue
      if (Math.abs(x + 15) < minDistance && Math.abs(z - 15) < minDistance) continue
      if (Math.abs(x - 15) < minDistance && Math.abs(z + 15) < minDistance) continue
      if (Math.abs(x + 15) < minDistance && Math.abs(z + 15) < minDistance) continue
      
      this.createTree(x, z)
    }
    
    // Bushes and smaller vegetation
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 190
      const z = (Math.random() - 0.5) * 190
      
      if (Math.abs(x) < 12 || Math.abs(z) < 12) continue
      
      this.createBush(x, z)
    }
  }

  createTree(x, z) {
    const treeGroup = new THREE.Group()
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8)
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 2
    trunk.castShadow = true
    treeGroup.add(trunk)
    
    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(2.5, 8, 8)
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 })
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial)
    leaves.position.y = 5
    leaves.castShadow = true
    treeGroup.add(leaves)
    
    treeGroup.position.set(x, 0, z)
    this.scene.add(treeGroup)
    
    // Tree physics (trunk only)
    const treeShape = new CANNON.Cylinder(0.5, 0.3, 4, 8)
    const treeBody = new CANNON.Body({ mass: 0 })
    treeBody.addShape(treeShape)
    treeBody.position.set(x, 2, z)
    this.world.addBody(treeBody)
  }

  createBush(x, z) {
    const bushGeometry = new THREE.SphereGeometry(0.8, 6, 6)
    const bushMaterial = new THREE.MeshLambertMaterial({ color: 0x32CD32 })
    
    const bush = new THREE.Mesh(bushGeometry, bushMaterial)
    bush.position.set(x, 0.4, z)
    bush.scale.y = 0.6
    bush.castShadow = true
    this.scene.add(bush)
  }

  createSkybox() {
    // Simple gradient skybox
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32)
    const skyMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      side: THREE.BackSide
    })
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial)
    this.scene.add(sky)
  }

  getBuildingColorByType(type) {
    const colorMap = {
      'residential': [0x8B4513, 0xA0522D, 0xCD853F, 0xDEB887], // Browns and tans
      'commercial': [0x708090, 0x778899, 0x696969, 0x2F4F4F], // Grays
      'skyscraper': [0x4682B4, 0x5F9EA0, 0x6495ED, 0x87CEEB], // Blues
      'warehouse': [0x556B2F, 0x6B8E23, 0x808000, 0x8FBC8F], // Greens
      'industrial': [0x8B0000, 0xA52A2A, 0xB22222, 0xDC143C]  // Reds
    }
    
    const colors = colorMap[type] || colorMap['residential']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  createObstacles() {
    // Cars and vehicles
    this.createVehicles()
    
    // Debris and cover objects
    this.createDebris()
    
    // Barricades and military obstacles
    this.createBarricades()
    
    // Street furniture
    this.createStreetFurniture()
  }

  createVehicles() {
    const vehiclePositions = [
      { x: 12, z: 8, type: 'car' },
      { x: -15, z: 12, type: 'truck' },
      { x: 8, z: -20, type: 'car' },
      { x: -8, z: -15, type: 'van' },
      { x: 20, z: 30, type: 'car' },
      { x: -30, z: 20, type: 'truck' }
    ]
    
    vehiclePositions.forEach(pos => {
      this.createVehicle(pos.x, pos.z, pos.type)
    })
  }

  createVehicle(x, z, type) {
    const group = new THREE.Group()
    
    let bodyGeometry, bodyColor, width = 2, height = 1.5, depth = 4
    
    switch(type) {
      case 'truck':
        bodyGeometry = new THREE.BoxGeometry(2.5, 2, 6)
        bodyColor = 0x8B0000
        width = 2.5; height = 2; depth = 6
        break
      case 'van':
        bodyGeometry = new THREE.BoxGeometry(2, 2.2, 5)
        bodyColor = 0x4169E1
        width = 2; height = 2.2; depth = 5
        break
      default: // car
        bodyGeometry = new THREE.BoxGeometry(2, 1.5, 4)
        bodyColor = Math.random() > 0.5 ? 0x000080 : 0x8B0000
        break
    }
    
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: bodyColor })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = height / 2
    body.castShadow = true
    group.add(body)
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8)
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 })
    
    const wheelPositions = [
      { x: -width/2 + 0.1, y: 0.3, z: depth/2 - 0.5 },
      { x: width/2 - 0.1, y: 0.3, z: depth/2 - 0.5 },
      { x: -width/2 + 0.1, y: 0.3, z: -depth/2 + 0.5 },
      { x: width/2 - 0.1, y: 0.3, z: -depth/2 + 0.5 }
    ]
    
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.position.set(pos.x, pos.y, pos.z)
      wheel.rotation.z = Math.PI / 2
      wheel.castShadow = true
      group.add(wheel)
    })
    
    group.position.set(x, 0, z)
    group.rotation.y = Math.random() * Math.PI * 2
    this.scene.add(group)
    
    // Vehicle physics
    const vehicleShape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2))
    const vehicleBody = new CANNON.Body({ mass: 0 })
    vehicleBody.addShape(vehicleShape)
    vehicleBody.position.set(x, height/2, z)
    this.world.addBody(vehicleBody)
  }

  createDebris() {
    // Concrete blocks and rubble
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 80
      const z = (Math.random() - 0.5) * 80
      
      if (Math.abs(x) < 10 && Math.abs(z) < 10) continue
      
      this.createDebrisBlock(x, z)
    }
  }

  createDebrisBlock(x, z) {
    const size = 0.5 + Math.random() * 1.5
    const geometry = new THREE.BoxGeometry(size, size * 0.8, size * 1.2)
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x696969,
      transparent: true,
      opacity: 0.9
    })
    
    const debris = new THREE.Mesh(geometry, material)
    debris.position.set(x, size * 0.4, z)
    debris.rotation.y = Math.random() * Math.PI
    debris.castShadow = true
    this.scene.add(debris)
    
    // Physics
    const shape = new CANNON.Box(new CANNON.Vec3(size/2, size*0.4, size*0.6))
    const body = new CANNON.Body({ mass: 0 })
    body.addShape(shape)
    body.position.set(x, size * 0.4, z)
    this.world.addBody(body)
  }

  createBarricades() {
    const barricadePositions = [
      { x: 35, z: 0, rotation: 0 },
      { x: -35, z: 0, rotation: 0 },
      { x: 0, z: 35, rotation: Math.PI/2 },
      { x: 0, z: -35, rotation: Math.PI/2 }
    ]
    
    barricadePositions.forEach(pos => {
      this.createBarricade(pos.x, pos.z, pos.rotation)
    })
  }

  createBarricade(x, z, rotation) {
    const group = new THREE.Group()
    
    // Main barrier
    const barrierGeometry = new THREE.BoxGeometry(4, 1, 0.3)
    const barrierMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial)
    barrier.position.y = 0.5
    barrier.castShadow = true
    group.add(barrier)
    
    // Support posts
    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8)
    const postMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 })
    
    // Create posts manually to avoid forEach issue
    const leftPost = new THREE.Mesh(postGeometry, postMaterial)
    leftPost.position.set(-1.5, 0.5, 0.2)
    leftPost.castShadow = true
    group.add(leftPost)
    
    const rightPost = new THREE.Mesh(postGeometry, postMaterial)
    rightPost.position.set(1.5, 0.5, 0.2)
    rightPost.castShadow = true
    group.add(rightPost)
    
    group.position.set(x, 0, z)
    group.rotation.y = rotation
    this.scene.add(group)
    
    // Physics
    const barrierShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 0.15))
    const barrierBody = new CANNON.Body({ mass: 0 })
    barrierBody.addShape(barrierShape)
    barrierBody.position.set(x, 0.5, z)
    barrierBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotation)
    this.world.addBody(barrierBody)
  }

  createStreetFurniture() {
    // Street lamps
    this.createStreetLamps()
    
    // Fire hydrants
    this.createFireHydrants()
    
    // Trash cans
    this.createTrashCans()
  }

  createStreetLamps() {
    const lampPositions = [
      { x: 10, z: 25 }, { x: -10, z: 25 },
      { x: 10, z: -25 }, { x: -10, z: -25 },
      { x: 25, z: 10 }, { x: 25, z: -10 },
      { x: -25, z: 10 }, { x: -25, z: -10 }
    ]
    
    lampPositions.forEach(pos => {
      this.createStreetLamp(pos.x, pos.z)
    })
  }

  createStreetLamp(x, z) {
    const group = new THREE.Group()
    
    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.15, 6, 8)
    const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F })
    const pole = new THREE.Mesh(poleGeometry, poleMaterial)
    pole.position.y = 3
    pole.castShadow = true
    group.add(pole)
    
    // Light fixture
    const lightGeometry = new THREE.SphereGeometry(0.3, 8, 8)
    const lightMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffaa,
      transparent: true,
      opacity: 0.8
    })
    const light = new THREE.Mesh(lightGeometry, lightMaterial)
    light.position.y = 5.8
    group.add(light)
    
    // Actual light source
    const pointLight = new THREE.PointLight(0xffffaa, 0.5, 20)
    pointLight.position.y = 5.8
    pointLight.castShadow = true
    group.add(pointLight)
    
    group.position.set(x, 0, z)
    this.scene.add(group)
    
    // Physics for pole
    const poleShape = new CANNON.Cylinder(0.15, 0.1, 6, 8)
    const poleBody = new CANNON.Body({ mass: 0 })
    poleBody.addShape(poleShape)
    poleBody.position.set(x, 3, z)
    this.world.addBody(poleBody)
  }

  createFireHydrants() {
    const positions = [
      { x: 18, z: 3 }, { x: -18, z: 3 },
      { x: 3, z: 18 }, { x: 3, z: -18 }
    ]
    
    positions.forEach(pos => {
      this.createFireHydrant(pos.x, pos.z)
    })
  }

  createFireHydrant(x, z) {
    const hydrantGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 8)
    const hydrantMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
    const hydrant = new THREE.Mesh(hydrantGeometry, hydrantMaterial)
    hydrant.position.set(x, 0.5, z)
    hydrant.castShadow = true
    this.scene.add(hydrant)
    
    // Physics
    const hydrantShape = new CANNON.Cylinder(0.4, 0.3, 1, 8)
    const hydrantBody = new CANNON.Body({ mass: 0 })
    hydrantBody.addShape(hydrantShape)
    hydrantBody.position.set(x, 0.5, z)
    this.world.addBody(hydrantBody)
  }

  createTrashCans() {
    for (let i = 0; i < 10; i++) {
      const x = (Math.random() - 0.5) * 60
      const z = (Math.random() - 0.5) * 60
      
      if (Math.abs(x) < 8 || Math.abs(z) < 8) continue
      
      this.createTrashCan(x, z)
    }
  }

  createTrashCan(x, z) {
    const canGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8)
    const canMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 })
    const can = new THREE.Mesh(canGeometry, canMaterial)
    can.position.set(x, 0.6, z)
    can.castShadow = true
    this.scene.add(can)
    
    // Physics
    const canShape = new CANNON.Cylinder(0.4, 0.4, 1.2, 8)
    const canBody = new CANNON.Body({ mass: 0 })
    canBody.addShape(canShape)
    canBody.position.set(x, 0.6, z)
    this.world.addBody(canBody)
  }

  getRandomBuildingColor() {
    const colors = [
      0x8B8B8B, // Gray
      0xA0A0A0, // Light gray
      0x696969, // Dim gray
      0x708090, // Slate gray
      0x2F4F4F, // Dark slate gray
      0xD2B48C, // Tan
      0xF5DEB3  // Wheat
    ]
    
    return colors[Math.floor(Math.random() * colors.length)]
  }
}
