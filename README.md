# 3D Zombie Shooter Game

A thrilling 3D zombie shooter game built with Three.js and Cannon.js, featuring immersive first-person gameplay, realistic physics, and dynamic environments.

## 🎮 Game Features

### Core Gameplay
- **First-Person Shooter**: Immersive FPS experience with mouse-look controls
- **Zombie AI**: Intelligent zombies that chase and attack the player
- **Physics-Based Combat**: Realistic bullet physics and collision detection
- **Health System**: Visual health bar with damage immunity mechanics
- **Dynamic Spawning**: Zombies spawn continuously with increasing difficulty

### Characters
- **Player Character**: 
  - Health system with visual feedback
  - WASD movement with mouse look
  - Shooting mechanics with ammo management
  - Damage immunity system

- **Zombies**: 
  - Well-modeled 3D characters with animations
  - AI pathfinding and target tracking
  - Melee attack system
  - Health system with damage feedback
  - Death animations

### Environment
- **Detailed 3D World**: Urban environment with buildings, roads, and vegetation
- **Realistic Lighting**: Dynamic shadows and atmospheric lighting
- **Collision Physics**: Full collision detection for all objects
- **Skybox**: Gradient sky for immersive atmosphere

## 🕹️ Controls

| Control | Action |
|---------|--------|
| `W A S D` | Move character |
| `Mouse` | Look around |
| `Left Click` | Shoot |
| `Space` | Jump |
| `Click anywhere` | Start game / Lock pointer |

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

5. **Click to start** the game and lock your mouse pointer for FPS controls

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🛠️ Technologies Used

- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[Cannon.js](https://github.com/pmndrs/cannon-es)** - Physics engine
- **[Vite](https://vitejs.dev/)** - Build tool and development server
- **JavaScript ES6+** - Modern JavaScript features

## 📁 Project Structure

```
src/
├── game/
│   ├── Game.js              # Main game logic and loop
│   ├── Player.js            # Player character controller
│   ├── Zombie.js            # Zombie AI and behavior
│   ├── Bullet.js            # Bullet physics and mechanics
│   ├── Environment.js       # 3D world generation
│   └── CollisionManager.js  # Physics collision handling
├── utils/
│   ├── InputManager.js      # Mouse and keyboard input
│   └── Utils.js             # Utility functions and health system
├── main.js                  # Application entry point
└── style.css                # Game UI styling
```

## 🎯 Gameplay Mechanics

### Combat System
- **Realistic Ballistics**: Bullets follow physics-based trajectories
- **Hit Detection**: Precise collision detection using raycasting
- **Damage System**: Visual feedback for both giving and receiving damage
- **Ammunition**: Limited ammo system (reload feature can be added)

### AI System
- **Pathfinding**: Zombies navigate around obstacles to reach the player
- **State Machine**: Idle, chasing, attacking, and death states
- **Attack Patterns**: Melee attacks with cooldown periods
- **Unstuck Logic**: AI recovery when caught on obstacles

### Physics Integration
- **Cannon.js Integration**: Full physics simulation for all entities
- **Collision Groups**: Organized collision detection between different object types
- **Material Properties**: Realistic friction and restitution values
- **Performance Optimized**: Efficient physics updates for smooth gameplay

## 🔧 Customization

### Game Balance
Modify these values in the respective classes:

```javascript
// Player.js
this.health = 100
this.moveSpeed = 10
this.fireRate = 200

// Zombie.js  
this.health = 100
this.speed = 3
this.attackDamage = 10

// Game.js
this.maxZombies = 10
this.zombieSpawnInterval = 3000
```

### Visual Settings
Update graphics settings in `Game.js`:

```javascript
// Renderer quality
this.renderer.setPixelRatio(window.devicePixelRatio)
this.renderer.shadowMap.enabled = true

// Fog settings
this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200)
```

## 🐛 Known Issues

- Performance may decrease with many zombies on lower-end devices
- Pointer lock may need to be re-enabled after tab switching
- Some physics edge cases with rapid movement

## 🔮 Future Enhancements

- **Multiple Weapons**: Different gun types with unique characteristics
- **Power-ups**: Health packs, ammo, temporary abilities
- **Sound Effects**: Audio feedback for actions and environment
- **Levels/Waves**: Progressive difficulty with different environments
- **Multiplayer**: Co-op or competitive multiplayer support
- **Mobile Support**: Touch controls for mobile devices
- **Save System**: Progress saving and high scores

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 🙋‍♂️ Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure your browser supports WebGL and pointer lock
3. Try refreshing the page and clicking to restart the game
4. Open an issue on the project repository

---

**Enjoy the zombie apocalypse! 🧟‍♂️🔫**
