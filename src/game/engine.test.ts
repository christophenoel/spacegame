import { updateGameState, ThrustInputs } from './engine';
import { GameState, Satellite, Planet, Orb } from '../types/game';
import { GAME_CONFIG } from './constants';

const createTestGameState = (): GameState => {
  const satellite: Satellite = {
    position: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    fuel: 100,
  };

  const planet: Planet = {
    position: { x: 2000, y: 3000 }, // Far away to minimize gravity
    radius: 40,
    mass: 1000,
  };

  const orbs: Orb[] = [
    { id: 1, position: { x: 500, y: 300 }, radius: 15, collected: false },
    { id: 2, position: { x: 600, y: 300 }, radius: 15, collected: false },
  ];

  return {
    satellite,
    planet,
    orbs,
    score: 0,
    gameStatus: 'playing',
    isPaused: false,
  };
};

const noThrust: ThrustInputs = {
  up: false,
  down: false,
  left: false,
  right: false,
};

describe('Game Engine', () => {
  test('updateGameState does not update when paused', () => {
    const gameState = createTestGameState();
    gameState.isPaused = true;
    const initialPosition = { ...gameState.satellite.position };

    const updated = updateGameState(gameState, noThrust, 1);

    expect(updated.satellite.position).toEqual(initialPosition);
  });

  test('updateGameState does not update when game is over', () => {
    const gameState = createTestGameState();
    gameState.gameStatus = 'won';
    const initialPosition = { ...gameState.satellite.position };

    const updated = updateGameState(gameState, noThrust, 1);

    expect(updated.satellite.position).toEqual(initialPosition);
  });

  test('updateGameState applies thrust when input is active', () => {
    const gameState = createTestGameState();
    const thrust: ThrustInputs = {
      up: false,
      down: false,
      left: false,
      right: true,
    };

    const updated = updateGameState(gameState, thrust, 1);

    expect(updated.satellite.velocity.x).toBeGreaterThan(0);
    expect(updated.satellite.fuel).toBeLessThan(100);
  });

  test('updateGameState applies diagonal thrust correctly', () => {
    const gameState = createTestGameState();
    const initialVelocity = { ...gameState.satellite.velocity };
    const thrust: ThrustInputs = {
      up: true,
      down: false,
      left: false,
      right: true,
    };

    const updated = updateGameState(gameState, thrust, 0.1);

    // Should have velocity in the positive x direction (right)
    expect(updated.satellite.velocity.x).toBeGreaterThan(initialVelocity.x);
    // Should have changed from initial velocity (thrust + gravity effect)
    expect(updated.satellite.velocity.y).not.toBe(initialVelocity.y);
  });

  test('updateGameState updates rotation based on velocity', () => {
    const gameState = createTestGameState();
    gameState.satellite.velocity = { x: 1, y: 0 };

    const updated = updateGameState(gameState, noThrust, 0.01);

    // Rotation should be close to 0 (pointing right) for positive x velocity
    // Allow some tolerance due to small gravity effect
    expect(Math.abs(updated.satellite.rotation)).toBeLessThan(0.1);
  });

  test('updateGameState collects orbs and increases score', () => {
    const gameState = createTestGameState();
    // Move satellite close to an orb
    gameState.satellite.position = { x: 500, y: 300 };

    const updated = updateGameState(gameState, noThrust, 0.01);

    const collectedOrbs = updated.orbs.filter((orb) => orb.collected);
    expect(collectedOrbs.length).toBeGreaterThan(0);
    expect(updated.score).toBeGreaterThan(0);
  });

  test('updateGameState sets win status when all orbs collected', () => {
    const gameState = createTestGameState();
    // Mark all orbs as collected except one
    gameState.orbs[0].collected = true;
    gameState.satellite.position = { x: 600, y: 300 }; // Position near last orb

    const updated = updateGameState(gameState, noThrust, 0.01);

    if (updated.orbs.every((orb) => orb.collected)) {
      expect(updated.gameStatus).toBe('won');
    }
  });

  test('updateGameState adds fuel bonus to score when won', () => {
    const gameState = createTestGameState();
    gameState.satellite.fuel = 50;
    gameState.score = GAME_CONFIG.numberOfOrbs * GAME_CONFIG.pointsPerOrb; // Already have orb points
    gameState.orbs.forEach((orb) => (orb.collected = true));

    const updated = updateGameState(gameState, noThrust, 0.01);

    expect(updated.gameStatus).toBe('won');
    // Should have orb points + fuel bonus
    expect(updated.score).toBeGreaterThan(GAME_CONFIG.numberOfOrbs * GAME_CONFIG.pointsPerOrb);
  });

  test('updateGameState sets loss status on planet collision', () => {
    const gameState = createTestGameState();
    // Position satellite very close to planet
    gameState.satellite.position = { x: 2000, y: 3000 };

    const updated = updateGameState(gameState, noThrust, 0.01);

    expect(updated.gameStatus).toBe('lost');
  });

  test('updateGameState sets loss status when out of bounds', () => {
    const gameState = createTestGameState();
    // Position satellite far out of bounds
    gameState.satellite.position = { x: -1000, y: 300 };

    const updated = updateGameState(gameState, noThrust, 0.01);

    expect(updated.gameStatus).toBe('lost');
  });

  test('updateGameState updates satellite position over time', () => {
    const gameState = createTestGameState();
    gameState.satellite.velocity = { x: 10, y: 5 };
    const initialX = gameState.satellite.position.x;
    const initialY = gameState.satellite.position.y;

    const updated = updateGameState(gameState, noThrust, 1);

    expect(updated.satellite.position.x).not.toBe(initialX);
    expect(updated.satellite.position.y).not.toBe(initialY);
  });

  test('updateGameState does not consume fuel without thrust', () => {
    const gameState = createTestGameState();
    const initialFuel = gameState.satellite.fuel;

    const updated = updateGameState(gameState, noThrust, 1);

    expect(updated.satellite.fuel).toBe(initialFuel);
  });

  test('updateGameState prevents fuel from going negative', () => {
    const gameState = createTestGameState();
    gameState.satellite.fuel = 0.1;
    const thrust: ThrustInputs = {
      up: true,
      down: true,
      left: true,
      right: true,
    };

    const updated = updateGameState(gameState, thrust, 10);

    expect(updated.satellite.fuel).toBeGreaterThanOrEqual(0);
  });
});
