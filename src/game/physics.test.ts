import {
  createVector,
  addVectors,
  scaleVector,
  vectorMagnitude,
  normalizeVector,
  distance,
  calculateGravity,
  applyThrust,
  updateSatellitePosition,
  checkCollisionWithPlanet,
  checkOutOfBounds,
  checkOrbCollection,
  initializeGame,
} from './physics';
import { Satellite, Planet, Orb } from '../types/game';
import { GAME_CONFIG } from './constants';

describe('Vector Operations', () => {
  test('createVector creates a vector with correct x and y', () => {
    const v = createVector(3, 4);
    expect(v.x).toBe(3);
    expect(v.y).toBe(4);
  });

  test('addVectors adds two vectors correctly', () => {
    const v1 = createVector(1, 2);
    const v2 = createVector(3, 4);
    const result = addVectors(v1, v2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  test('scaleVector scales a vector by a scalar', () => {
    const v = createVector(2, 3);
    const result = scaleVector(v, 2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  test('vectorMagnitude calculates correct magnitude', () => {
    const v = createVector(3, 4);
    expect(vectorMagnitude(v)).toBe(5);
  });

  test('normalizeVector returns unit vector', () => {
    const v = createVector(3, 4);
    const normalized = normalizeVector(v);
    expect(normalized.x).toBeCloseTo(0.6);
    expect(normalized.y).toBeCloseTo(0.8);
    expect(vectorMagnitude(normalized)).toBeCloseTo(1);
  });

  test('normalizeVector handles zero vector', () => {
    const v = createVector(0, 0);
    const normalized = normalizeVector(v);
    expect(normalized.x).toBe(0);
    expect(normalized.y).toBe(0);
  });

  test('distance calculates correct distance between points', () => {
    const p1 = createVector(0, 0);
    const p2 = createVector(3, 4);
    expect(distance(p1, p2)).toBe(5);
  });
});

describe('Physics Calculations', () => {
  test('calculateGravity returns zero vector for zero distance', () => {
    const satellite: Satellite = {
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      fuel: 100,
    };
    const planet: Planet = {
      position: { x: 100, y: 100 },
      radius: 50,
      mass: 1000,
    };
    const gravity = calculateGravity(satellite, planet);
    expect(gravity.x).toBe(0);
    expect(gravity.y).toBe(0);
  });

  test('calculateGravity returns force pointing toward planet', () => {
    const satellite: Satellite = {
      position: { x: 200, y: 100 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      fuel: 100,
    };
    const planet: Planet = {
      position: { x: 100, y: 100 },
      radius: 50,
      mass: 1000,
    };
    const gravity = calculateGravity(satellite, planet);
    expect(gravity.x).toBeLessThan(0); // Force should point left (toward planet)
    expect(gravity.y).toBe(0); // No vertical component
  });

  test('applyThrust updates velocity and consumes fuel', () => {
    const satellite: Satellite = {
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      fuel: 100,
    };
    const thrust = createVector(1, 0);
    const deltaTime = 1;
    const result = applyThrust(satellite, thrust, deltaTime);

    expect(result.satellite.velocity.x).toBeGreaterThan(0);
    expect(result.satellite.fuel).toBeLessThan(100);
    expect(result.fuelUsed).toBeGreaterThan(0);
  });

  test('applyThrust does nothing when fuel is empty', () => {
    const satellite: Satellite = {
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      fuel: 0,
    };
    const thrust = createVector(1, 0);
    const deltaTime = 1;
    const result = applyThrust(satellite, thrust, deltaTime);

    expect(result.satellite.velocity.x).toBe(0);
    expect(result.satellite.fuel).toBe(0);
    expect(result.fuelUsed).toBe(0);
  });

  test('updateSatellitePosition updates position based on velocity', () => {
    const satellite: Satellite = {
      position: { x: 100, y: 100 },
      velocity: { x: 10, y: 5 },
      rotation: 0,
      fuel: 100,
    };
    const planet: Planet = {
      position: { x: 1000, y: 1000 }, // Far away to minimize gravity effect
      radius: 50,
      mass: 1000,
    };
    const deltaTime = 1;
    const updated = updateSatellitePosition(satellite, planet, deltaTime);

    expect(updated.position.x).toBeGreaterThan(satellite.position.x);
    expect(updated.position.y).toBeGreaterThan(satellite.position.y);
  });
});

describe('Collision Detection', () => {
  test('checkCollisionWithPlanet detects collision', () => {
    const satellite: Satellite = {
      position: { x: 110, y: 100 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      fuel: 100,
    };
    const planet: Planet = {
      position: { x: 100, y: 100 },
      radius: 50,
      mass: 1000,
    };
    expect(checkCollisionWithPlanet(satellite, planet)).toBe(true);
  });

  test('checkCollisionWithPlanet returns false when no collision', () => {
    const satellite: Satellite = {
      position: { x: 200, y: 200 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      fuel: 100,
    };
    const planet: Planet = {
      position: { x: 100, y: 100 },
      radius: 50,
      mass: 1000,
    };
    expect(checkCollisionWithPlanet(satellite, planet)).toBe(false);
  });

  test('checkOutOfBounds detects out of bounds position', () => {
    const satellite: Satellite = {
      position: { x: -100, y: 100 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      fuel: 100,
    };
    expect(checkOutOfBounds(satellite)).toBe(true);
  });

  test('checkOutOfBounds returns false when in bounds', () => {
    const satellite: Satellite = {
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      fuel: 100,
    };
    expect(checkOutOfBounds(satellite)).toBe(false);
  });

  test('checkOrbCollection detects orb collection', () => {
    const satellite: Satellite = {
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      fuel: 100,
    };
    const orbs: Orb[] = [
      { id: 1, position: { x: 105, y: 105 }, radius: 15, collected: false },
      { id: 2, position: { x: 500, y: 500 }, radius: 15, collected: false },
    ];
    const collectedIds = checkOrbCollection(satellite, orbs);
    expect(collectedIds).toContain(1);
    expect(collectedIds).not.toContain(2);
  });

  test('checkOrbCollection ignores already collected orbs', () => {
    const satellite: Satellite = {
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      fuel: 100,
    };
    const orbs: Orb[] = [
      { id: 1, position: { x: 105, y: 105 }, radius: 15, collected: true },
    ];
    const collectedIds = checkOrbCollection(satellite, orbs);
    expect(collectedIds).toHaveLength(0);
  });
});

describe('Game Initialization', () => {
  test('initializeGame creates valid game state', () => {
    const gameState = initializeGame();

    expect(gameState.satellite).toBeDefined();
    expect(gameState.satellite.fuel).toBe(GAME_CONFIG.maxFuel);
    expect(gameState.planet).toBeDefined();
    expect(gameState.orbs).toHaveLength(GAME_CONFIG.numberOfOrbs);
    expect(gameState.score).toBe(0);
    expect(gameState.gameStatus).toBe('playing');
    expect(gameState.isPaused).toBe(false);
  });

  test('initializeGame creates satellite in orbit', () => {
    const gameState = initializeGame();
    const centerX = GAME_CONFIG.canvasWidth / 2;
    const centerY = GAME_CONFIG.canvasHeight / 2;

    // Satellite should be offset from center
    expect(gameState.satellite.position.x).not.toBe(centerX);
    expect(gameState.satellite.position.y).toBe(centerY);

    // Satellite should have orbital velocity
    expect(gameState.satellite.velocity.x).toBe(0);
    expect(gameState.satellite.velocity.y).toBeGreaterThan(0);
  });

  test('initializeGame creates orbs in ring formation', () => {
    const gameState = initializeGame();
    const centerX = GAME_CONFIG.canvasWidth / 2;
    const centerY = GAME_CONFIG.canvasHeight / 2;

    gameState.orbs.forEach((orb) => {
      const dist = distance(orb.position, { x: centerX, y: centerY });
      expect(dist).toBeCloseTo(250, 0); // Should be on ring with radius 250
      expect(orb.collected).toBe(false);
    });
  });
});
