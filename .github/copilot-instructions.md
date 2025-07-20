# Copilot Instructions for 3D Zombie Shooter Game

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a 3D zombie shooter game built with Three.js for 3D rendering and Cannon.js for physics simulation. The game is fully functional with working player movement, zombie AI, shooting mechanics, and collision detection.

## Core Technologies
- **3D Rendering**: Three.js (v0.178.0)
- **Physics Engine**: Cannon.js (cannon-es v0.20.0)
- **Build Tool**: Vite (v7.0.4)
- **Language**: JavaScript (ES6+)

## Current Implementation Status

### ✅ FULLY IMPLEMENTED FEATURES
- **Player Controller**: Complete FPS controls with WASD movement, mouse look, and jumping
- **Zombie AI**: Intelligent pathfinding, chasing, attacking, and health system
- **Physics System**: Full Cannon.js integration with collision detection
- **Shooting Mechanics**: Bullet physics with hit detection and visual effects
- **Environment**: 3D urban world with buildings, roads, trees, and collision meshes
- **Health System**: Player and zombie health management with visual feedback
- **UI System**: Health bar, crosshair, ammo counter, and game over screen

### 🎮 CONFIRMED WORKING CONTROLS
- `W/A/S/D` - Player movement (IMPLEMENTED & WORKING)
- `Mouse` - Camera look controls (IMPLEMENTED & WORKING)
- `Space` - Jump (IMPLEMENTED & WORKING - grounded detection active)
- `Left Click` - Shoot bullets (IMPLEMENTED & WORKING)
- `Click to start` - Game initialization (IMPLEMENTED & WORKING)

### 🧟 ZOMBIE BEHAVIOR (CONFIRMED ACTIVE)
- AI pathfinding toward player position
- Movement via physics velocity system
- Attack mechanics when in range
- Health system with damage feedback
- Death animations and cleanup
- Obstacle avoidance and unstuck logic

## Project Structure
```
/
├── src/
│   ├── game/
│   │   ├── Game.js              # Main game class ✅ WORKING
│   │   ├── Player.js            # Player character logic ✅ WORKING  
│   │   ├── Zombie.js            # Zombie AI and behavior ✅ WORKING
│   │   ├── Bullet.js            # Bullet mechanics ✅ WORKING
│   │   ├── Environment.js       # 3D world environment ✅ WORKING
│   │   ├── HealthSystem.js      # Health management ✅ WORKING
│   │   └── CollisionManager.js  # Collision detection ✅ WORKING
│   ├── utils/
│   │   ├── ModelLoader.js       # 3D model loading utilities ✅ AVAILABLE
│   │   ├── InputManager.js      # Keyboard/mouse input ✅ WORKING
│   │   └── Utils.js             # General utilities ✅ AVAILABLE
│   ├── main.js                  # Entry point ✅ WORKING
│   └── style.css                # Styling ✅ WORKING
├── .github/
│   └── copilot-instructions.md  # This file
└── public/                      # Static assets
```

## Development Guidelines

### CRITICAL: Do NOT Hallucinate Features
When working on this codebase, remember that ALL core features are already implemented:
- ❌ Do NOT suggest "adding" player movement - it exists and works
- ❌ Do NOT suggest "implementing" zombie AI - it exists and works  
- ❌ Do NOT suggest "creating" shooting mechanics - they exist and work
- ❌ Do NOT suggest "building" physics system - it exists and works
- ✅ DO focus on debugging, optimization, or genuine enhancements only

### Code Style & Conventions
- Use ES6+ features (classes, modules, arrow functions)
- Use camelCase for variables and functions
- Use PascalCase for classes
- Use meaningful variable names (e.g., `zombiePosition` not `zp`)
- Add JSDoc comments for complex functions
- Keep functions small and focused (single responsibility)

### Game Architecture Patterns
- Use modular design with clear separation of concerns
- Implement Entity-Component-System (ECS) pattern where applicable
- Use event-driven architecture for game state changes
- Maintain consistent coordinate systems (Three.js uses right-handed)

### Three.js Best Practices
- Dispose of geometries, materials, and textures when no longer needed
- Use efficient lighting (avoid too many dynamic lights)
- Implement object pooling for frequently created/destroyed objects (bullets, effects)
- Use LOD (Level of Detail) for distant objects
- Optimize shadow mapping settings

### Physics (Cannon.js) Guidelines
- Keep physics world step size consistent (1/60 seconds)
- Use appropriate collision shapes (boxes, spheres for performance)
- Implement collision groups and masks for selective collisions
- Sync Three.js visual objects with Cannon.js physics bodies

### Performance Considerations
- Use `requestAnimationFrame` for the main game loop
- Implement frustum culling for off-screen objects
- Use instanced rendering for similar objects (trees, buildings)
- Optimize texture sizes and use compression
- Profile and monitor FPS regularly

### CURRENT WORKING FEATURES (Do Not Re-implement)

1. **Player Character**:
   - ✅ First-person camera controls with mouse look
   - ✅ WASD movement with physics integration
   - ✅ Space bar jumping with ground detection
   - ✅ Health system with visual feedback and damage immunity
   - ✅ Weapon aiming and shooting mechanics
   - ✅ Ammo management system

2. **Zombie System**:
   - ✅ AI pathfinding toward player using Three.js Vector3 calculations
   - ✅ Physics-based movement using Cannon.js velocity
   - ✅ Attack animations and damage dealing with cooldowns
   - ✅ Health system with death mechanics and visual feedback
   - ✅ Spawning system with increasing difficulty over time
   - ✅ Unstuck logic for obstacle navigation

3. **Environment**:
   - ✅ Detailed 3D terrain with roads, buildings, vegetation
   - ✅ Collision meshes for all interactive objects using Cannon.js
   - ✅ Skybox and atmospheric effects with Three.js shaders
   - ✅ Strategic cover points and obstacles

4. **Combat System**:
   - ✅ Bullet physics with realistic trajectories
   - ✅ Hit detection using raycasting and distance calculations
   - ✅ Damage calculation and visual feedback
   - ✅ Particle effects for bullet impacts

### Common Debugging Areas
- **MIME Type Errors**: Check import statements and file extensions
- **Physics Issues**: Verify Cannon.js world.fixedStep() is called
- **Movement Problems**: Check if physics bodies have proper mass and velocity
- **Collision Detection**: Ensure collision groups and masks are properly set
- **Performance**: Monitor browser console for WebGL warnings

### Error Handling
- Always check for null/undefined before accessing object properties
- Implement try-catch blocks for async operations (model loading)
- Provide fallback behaviors for missing assets
- Log meaningful error messages for debugging

### Asset Management
- Use relative paths for all assets
- Implement loading screens for large assets
- Use placeholder models/textures during development
- Optimize file sizes for web delivery

### Testing Guidelines
- Test on different screen resolutions
- Verify performance on lower-end devices
- Test all input combinations (WASD + mouse + space + click)
- Validate collision detection accuracy
- Ensure pointer lock works correctly

### Security Considerations
- Sanitize any user inputs
- Use HTTPS for asset loading in production
- Implement rate limiting for high-frequency actions

## Debugging Tips
- Use Three.js helpers (AxesHelper, GridHelper) for spatial debugging
- Enable Cannon.js debug renderer to visualize physics bodies
- Use browser dev tools performance tab for optimization
- Log frame rates and memory usage during development
- Check browser console for WebGL context errors

## Build & Development Commands
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Known Working Features (Verified)
1. ✅ Player spawns at origin (0, 1.8, 0)
2. ✅ Mouse look controls camera rotation
3. ✅ WASD keys move player in 3D space
4. ✅ Space bar makes player jump (with ground detection)
5. ✅ Left click fires bullets with physics
6. ✅ Zombies spawn around player and chase
7. ✅ Zombies move using physics velocity system
8. ✅ Bullets damage zombies on collision
9. ✅ Zombies damage player when close
10. ✅ Health bars update correctly
11. ✅ Game over screen appears when health reaches 0

## Future Enhancement Areas (NOT Missing Features)
- Multiple weapon types and upgrades
- Sound effects and background music
- Procedural level generation
- Multiplayer support with WebRTC or WebSockets
- Mobile device support with touch controls
- Save/load game state functionality
- Additional zombie types with different behaviors
- Power-ups and collectibles

Remember: This is a COMPLETE, WORKING game. Focus on enhancements, optimizations, and bug fixes rather than re-implementing existing functionality.
