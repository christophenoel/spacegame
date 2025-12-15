# Orbital Rescue - Space Satellite Game

A browser-based space game where you control a satellite to collect energy orbs while maintaining orbit around a planet.

## Game Concept

**Orbital Rescue** is a physics-based space game that challenges players to:
- Navigate a satellite through orbital space
- Collect all 8 energy orbs scattered in a ring around the planet
- Manage limited fuel resources
- Avoid crashing into the planet or flying off into deep space

The game features realistic orbital mechanics with gravity affecting the satellite's trajectory, requiring careful thrust management to maintain a stable orbit while collecting all objectives.

## Controls

### Keyboard Controls
- **↑ / W** - Fire thrusters upward
- **↓ / S** - Fire thrusters downward
- **← / A** - Fire thrusters left
- **→ / D** - Fire thrusters right
- **SPACE / ESC** - Pause/Resume game

### Control Mechanics
- Thrusters change the satellite's velocity in the specified direction
- Diagonal movement is supported (press multiple keys simultaneously)
- The satellite rotates to face its direction of movement
- Fuel depletes when using thrusters
- Gravity constantly pulls the satellite toward the planet

## Game Screens

### Home Screen
- Displays game title and mission briefing
- Shows complete control instructions
- Lists game objectives
- Start button to begin the mission

### Game Screen
- Real-time gameplay with physics simulation
- HUD displaying:
  - Current score
  - Orbs collected / Total orbs
  - Fuel gauge with percentage
  - Pause indicator
- Visual elements:
  - Starfield background
  - Central planet with glow effects
  - Pulsing energy orbs
  - Satellite with solar panels and directional indicator
  - Thrust flames when boosting

### End Screen
- Victory or defeat message
- Final score display
- Fuel efficiency bonus (on victory)
- Retry mission button
- Back to menu button

## Objectives

1. **Collect all 8 energy orbs** - Navigate to each orb to collect it (+100 points each)
2. **Avoid planet collision** - Don't crash into the central planet
3. **Stay in bounds** - Remain within the play area
4. **Fuel efficiency** - Conserve fuel for bonus points on victory

## Scoring System

- **Energy Orbs**: 100 points per orb
- **Fuel Bonus**: Remaining fuel × 10 points (awarded on victory)
- **Maximum Score**: 1800+ points (800 from orbs + up to 1000 from fuel)

## Physics & Gameplay Mechanics

### Gravity
- The planet exerts gravitational force on the satellite
- Force follows inverse-square law (stronger when closer)
- Constantly pulls satellite toward planet center

### Orbital Mechanics
- Satellite starts with initial orbital velocity
- Players must balance thrust and gravity to maintain orbit
- Tangential velocity keeps satellite from falling
- Radial velocity changes orbital radius

### Fuel System
- Maximum fuel: 100 units
- Depletes at 0.5 units per second when thrusting
- No fuel regeneration
- Thrusters become inactive when fuel reaches zero

### Win Conditions
- Collect all 8 energy orbs
- Bonus points for remaining fuel

### Loss Conditions
- Collision with planet (crash)
- Flying beyond screen boundaries (lost in space)

## Technical Features

### Visual Design
- Space-themed color palette (dark blues, cyans, purples)
- Gradient and glow effects
- Animated starfield background
- Pulsing orb animations
- Smooth canvas-based rendering at 60 FPS

### Testing
- Comprehensive unit tests for physics engine
- Collision detection tests
- Game state management tests
- UI component tests
- Integration tests for game flow
- Manual test checklist provided

### Performance
- Optimized game loop with delta time
- Efficient canvas rendering
- Smooth animations
- Responsive layout
- Browser-compatible (Chrome, Firefox, Safari)

## Development

### Prerequisites
- Node.js 20.x
- npm or yarn

### Installation
```bash
npm install
```

### Running the Game
```bash
npm start
```
The game will open at `http://localhost:3000`

### Building for Production
```bash
npm run build
```

### Running Tests
```bash
npm test
```

### Manual Testing
Refer to `MANUAL_TEST_CHECKLIST.md` for comprehensive manual testing procedures.

## Project Structure

```
src/
├── components/           # React components
│   ├── HomeScreen.tsx   # Title and instructions
│   ├── GameScreen.tsx   # Main gameplay
│   ├── EndScreen.tsx    # Results screen
│   └── *.css           # Component styles
├── game/                # Game logic
│   ├── constants.ts    # Game configuration
│   ├── physics.ts      # Physics calculations
│   ├── engine.ts       # Game state management
│   ├── renderer.ts     # Canvas rendering
│   └── *.test.ts       # Unit tests
├── types/              # TypeScript definitions
│   └── game.ts         # Game type definitions
└── App.tsx             # Main application component
```

## Game Configuration

Key parameters can be adjusted in `src/game/constants.ts`:
- Canvas size (800x600)
- Maximum fuel (100)
- Thrust power (0.3)
- Fuel consumption rate (0.5)
- Gravitational constant (5000)
- Number of orbs (8)
- Points per orb (100)

## Tips for Players

1. **Start conservatively** - Get a feel for the controls before aggressive maneuvering
2. **Use short bursts** - Tap keys rather than holding for better fuel efficiency
3. **Plan your route** - Collect orbs in an efficient pattern
4. **Watch your orbit** - Maintain a stable circular path when possible
5. **Fuel management** - Conserve fuel for maximum bonus points
6. **Use momentum** - Let orbital velocity carry you when possible

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Credits

Built with:
- React 19
- TypeScript 4.9
- HTML5 Canvas
- Create React App

---

**Enjoy your mission, pilot! Good luck navigating the stars!**
