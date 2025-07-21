# Copilot Instructions for 3D Zombie Shooter Game

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a 3D zombie shooter game built with Three.js for 3D rendering and Cannon.js for physics simulation.

## Core Technologies
- **3D Rendering**: Three.js
- **Physics Engine**: Cannon.js (cannon-es)
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)

## Project Structure
```
/
├── src/
│   ├── game/
│   │   ├── Game.js              # Main game class
│   │   ├── Player.js            # Player character logic
│   │   ├── Zombie.js            # Zombie AI and behavior
│   │   ├── Bullet.js            # Bullet mechanics
│   │   ├── Environment.js       # 3D world environment
│   │   ├── HealthSystem.js      # Health management
│   │   └── CollisionManager.js  # Collision detection
│   ├── utils/
│   │   ├── ModelLoader.js       # 3D model loading utilities
│   │   ├── InputManager.js      # Keyboard/mouse input
│   │   └── Utils.js             # General utilities
│   ├── assets/
│   │   ├── models/              # 3D models (.glb, .gltf)
│   │   ├── textures/            # Texture files
│   │   └── sounds/              # Audio files
│   ├── main.js                  # Entry point
│   └── style.css                # Styling
├── .github/
│   └── copilot-instructions.md  # This file
└── public/                      # Static assets
```

## Development Guidelines

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

### Game Features Implementation
1. **Player Character**:
   - First-person camera controls
   - WASD movement with mouse look
   - Health system with visual feedback
   - Weapon aiming and shooting mechanics

2. **Zombie System**:
   - AI pathfinding toward player
   - Attack animations and damage dealing
   - Health system with death mechanics
   - Spawning system with increasing difficulty

3. **Environment**:
   - Detailed 3D terrain with roads, buildings, vegetation
   - Collision meshes for all interactive objects
   - Skybox and atmospheric effects
   - Strategic cover points and obstacles

4. **Combat System**:
   - Bullet physics with realistic trajectories
   - Hit detection using raycasting
   - Damage calculation and visual feedback
   - Weapon recoil and reload mechanics

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
- Test all input combinations (WASD + mouse)
- Validate collision detection accuracy

### Security Considerations
- Sanitize any user inputs
- Use HTTPS for asset loading in production
- Implement rate limiting for high-frequency actions

## Debugging Tips
- Use Three.js helpers (AxesHelper, GridHelper) for spatial debugging
- Enable Cannon.js debug renderer to visualize physics bodies
- Use browser dev tools performance tab for optimization
- Log frame rates and memory usage during development

## Future Enhancement Ideas
Multiplayer support with WebRTC or WebSockets
Procedural level generation
Different weapon types and upgrades (shotgun, rifle, sniper, etc.)
Weapon attachments and customization (scopes, silencers, extended mags)
Zombie variants (fast, tank, ranged, boss zombies)
Power-ups (health packs, ammo crates, temporary boosts)
Score and progression system (kills, combos, unlocks)
Wave system with increasing difficulty and boss waves
Randomized/procedural environment and item spawns
Sound effects and background music
UI enhancements (minimap, quest tracker, pause/settings menu)
Performance tools (FPS counter, memory usage, debug helpers)
Save/load game state functionality
Mobile device support with touch controls

Remember to maintain clean, readable code and follow these conventions consistently throughout the project.
