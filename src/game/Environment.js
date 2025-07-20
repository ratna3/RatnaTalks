import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class Environment {
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
    const buildingPositions = [
      { x: 15, z: 15, width: 8, height: 12, depth: 8 },
      { x: -15, z: 15, width: 6, height: 8, depth: 6 },
      { x: 15, z: -15, width: 10, height: 15, depth: 8 },
      { x: -15, z: -15, width: 7, height: 10, depth: 7 },
      { x: 25, z: 25, width: 12, height: 20, depth: 10 },
      { x: -25, z: 25, width: 8, height: 14, depth: 8 },
      { x: 25, z: -25, width: 9, height: 16, depth: 9 },
      { x: -25, z: -25, width: 11, height: 18, depth: 8 }
    ]
    
    buildingPositions.forEach(pos => {
      this.createBuilding(pos.x, pos.z, pos.width, pos.height, pos.depth)
    })
  }

  createBuilding(x, z, width, height, depth) {
    // Building geometry
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth)
    const buildingMaterial = new THREE.MeshLambertMaterial({ 
      color: this.getRandomBuildingColor() 
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
    
    // Add windows
    this.addWindows(building, width, height, depth)
    
    // Add rooftop details
    this.addRooftop(x, z, width, height, depth)
  }

  addWindows(building, width, height, depth) {
    const windowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x6666ff,
      emissive: 0x111133 
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

  addRooftop(x, z, width, height, depth) {
    // Simple rooftop structure
    const rooftopGeometry = new THREE.BoxGeometry(width * 0.8, 1, depth * 0.8)
    const rooftopMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 })
    
    const rooftop = new THREE.Mesh(rooftopGeometry, rooftopMaterial)
    rooftop.position.set(x, height + 0.5, z)
    rooftop.castShadow = true
    this.scene.add(rooftop)
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
