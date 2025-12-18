# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Human OSBW** (Onboard Software) is a browser-based space satellite game built with React 19 and TypeScript. The player takes the role of a human operating as onboard software, controlling a satellite to collect space debris of various sizes while maintaining orbit around Earth using realistic orbital mechanics. The game features an AI assistant narrative that guides the player through their mission with dynamic sun lighting effects and realistic physics.

## Development Commands

### Start Development Server
```bash
npm start
```
Opens the game at `http://localhost:3000`

### Build for Production
```bash
npm run build
```
Creates optimized production build in `build/` directory

### Run Tests
```bash
npm test
```
Runs Jest tests in watch mode

### Run Tests Without Watch Mode
```bash
npm test -- --watchAll=false
```

### Run Specific Test File
```bash
npm test -- path/to/test/file.test.ts
```

## Architecture

### Game Loop Architecture

The game uses a **time-based physics game loop** with delta time:

1. **GameScreen component** (`src/components/GameScreen.tsx`) manages the game loop using `requestAnimationFrame`
2. **Engine** (`src/game/engine.ts`) updates game state based on thrust inputs and delta time
3. **Physics** (`src/game/physics.ts`) calculates gravity, orbital mechanics, and collisions
4. **Renderer** (`src/game/renderer.ts`) draws all game objects to Canvas

The game loop runs at ~60 FPS with delta time compensation to ensure consistent physics regardless of frame rate.

### State Management

Game state flows in a unidirectional pattern:
- `GameState` contains all game entities (satellite, planet, orbs) and game status
- State is immutable - updates create new state objects
- React state holds current `GameState`, updated each frame
- `useRef` stores mutable input state (`thrustInputsRef`) to avoid re-render loops

### Physics System

The physics engine implements:
- **Newtonian gravity** with inverse-square law (`calculateGravity`) - gravity force = GM/r²
- **Vector mathematics** for 2D position and velocity
- **Satellite orbital mechanics** - realistic Keplerian physics with elliptical orbit:
  - Satellite speeds up as it falls toward Earth (periapsis - closest point)
  - Satellite slows down as it moves away from Earth (apoapsis - farthest point)
  - Initial velocity set to 88% of circular orbit velocity to create a visible ellipse
  - Gravity continuously pulls satellite toward Earth, creating natural elliptical motion
- **Debris motion** - stable prescribed elliptical paths (NOT physics-based):
  - Debris follows stable elliptical orbits that don't change
  - Motion calculated using angular velocity that varies with distance (Kepler's 2nd law approximation)
  - Debris speeds up when closer to Earth, slows down when farther away
  - Stable orbits make debris predictable and easier to collect
- **Thrust mechanics** - player inputs apply acceleration in satellite-relative coordinates, rotated to world space
- **Delta time integration** - all physics calculations scaled by frame time for consistency

### Coordinate Systems

Two coordinate systems are used:
1. **World space** - canvas coordinates, origin at top-left
2. **Satellite-relative space** - thrust inputs are relative to satellite orientation, then rotated to world space using `rotateVector`

### Rendering System

Canvas rendering with camera system:
- **Camera modes**: Earth-centered (default) or satellite-centered (toggle with C key)
- **Zoom**: Adjustable zoom level (±0.2 increments, range 0.5-3.0)
- **Transform pipeline**: Translate to center → Scale (zoom) → Translate to camera target
- **Image assets**: Earth texture and space background loaded asynchronously with fallback graphics
- **Visual effects**: Trajectory prediction (dashed line showing 2-second orbit), collection effects (expanding rings and floating score text)

## Key Files

### Core Game Logic
- `src/types/game.ts` - TypeScript interfaces for all game entities
- `src/game/constants.ts` - Game configuration (thrust power, gravity, fuel consumption, etc.)
- `src/game/physics.ts` - Vector math, gravity, collision detection, game initialization
- `src/game/engine.ts` - Game state updates, win/loss conditions, orb collection
- `src/game/renderer.ts` - Canvas drawing functions, camera system, visual effects

### React Components
- `src/App.tsx` - Screen navigation (home → game → end)
- `src/components/GameScreen.tsx` - Main gameplay, game loop, keyboard input, HUD
- `src/components/HomeScreen.tsx` - Title screen and mission briefing
- `src/components/EndScreen.tsx` - Victory/defeat screen with score
- `src/components/ControlsModal.tsx` - In-game controls reference

### Tests
- `src/game/physics.test.ts` - Physics calculations and collision detection
- `src/game/engine.test.ts` - Game state management and logic
- Component test files (`*.test.tsx`) - React component tests

## Game Configuration

All gameplay parameters are in `src/game/constants.ts`:
- Canvas size: 800×600 (reference size, actual size is dynamic)
- Thrust power: 150
- Battery consumption (thrust): 0.8 per second
- Battery passive discharge (panels NOT deployed): 0.5 per second
- Battery passive discharge (panels deployed, no sunlight): 0.3 per second
- Solar recharge rate: 2.0 per second (when panels >80% deployed AND in sunlight)
- Gravitational constant: 8000
- Number of debris: 8 (various sizes: 10-20 radius)
- Points per debris: 100

### Battery Management Rules
- **Panels deployed (>80%)**:
  - In sunlight: Recharges at 2.0/sec
  - In shadow: Discharges at 0.3/sec (systems consumption)
  - **Cannot use thrusters** (panels block thrust ports)
- **Panels retracted (<80%)**:
  - Discharges at 0.5/sec (faster - systems running without charging)
  - Can use thrusters (costs additional 0.8/sec when firing)

When adjusting game difficulty, modify these constants rather than hardcoding values.

## Testing Strategy

The project has two testing approaches:

1. **Unit tests** - Physics calculations, game logic, collision detection
2. **Manual testing** - See `MANUAL_TEST_CHECKLIST.md` for comprehensive gameplay testing procedures

When adding features, write unit tests for physics/logic and update the manual test checklist for gameplay scenarios.

## Technical Notes

### Coordinate System
- Canvas origin (0,0) is top-left
- Satellite rotation uses radians (Math.atan2 for direction of movement)
- Gravity always points toward planet center
- Thrust is applied in satellite-relative coordinates then rotated to world space

### Performance
- Game loop uses `requestAnimationFrame` (target 60 FPS)
- Delta time is capped at 0.1s to prevent physics explosions during lag
- Stars are generated once at initialization (150 stars)
- Collection effects auto-cleanup after 1 second

### Visual Effects & Animations
- **Thrust flames**: Multi-layered with flickering animation (outer red-orange, middle orange, inner white-yellow core) and glow effects
- **Solar panels**: Smooth deployment/retraction animation over 1 second with progressive grid line appearance, color interpolation, and charging glow when >80% deployed
- **Battery indicator**: Color-coded bar on spaceship (green→yellow→red gradient based on charge level)
- **Debris**: Various sizes (10-20 radius) with metallic appearance and rotation animation
- **Collection effects**: Expanding rings and floating score text that fade over 1 second

### Keyboard Controls
All key bindings are defined in `src/game/constants.ts`:
- Arrow keys or WASD for thrust (satellite-relative directional controls)
- P to deploy/retract solar panels (enables battery recharging)
- T to toggle trajectory prediction line
- Space or Escape to pause
- H or ? to show controls modal
- C to toggle camera mode (Earth-centered or satellite-centered)
- +/- to zoom in/out

### Asset Loading
Images are loaded asynchronously with a 2-second timeout. The game starts even if images fail to load, using fallback gradient graphics for planet and starfield for background.
