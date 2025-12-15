import { Vector2D, Satellite, Planet, Orb, GameState } from '../types/game';
import { GAME_CONFIG } from './constants';

export function createVector(x: number, y: number): Vector2D {
  return { x, y };
}

export function addVectors(v1: Vector2D, v2: Vector2D): Vector2D {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

export function scaleVector(v: Vector2D, scale: number): Vector2D {
  return { x: v.x * scale, y: v.y * scale };
}

export function vectorMagnitude(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalizeVector(v: Vector2D): Vector2D {
  const mag = vectorMagnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

export function distance(p1: Vector2D, p2: Vector2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateGravity(satellite: Satellite, planet: Planet): Vector2D {
  const dx = planet.position.x - satellite.position.x;
  const dy = planet.position.y - satellite.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return { x: 0, y: 0 };

  const force = (GAME_CONFIG.gravitationalConstant * planet.mass) / (dist * dist);
  const forceX = (dx / dist) * force;
  const forceY = (dy / dist) * force;

  return { x: forceX, y: forceY };
}

export function applyThrust(
  satellite: Satellite,
  direction: Vector2D,
  deltaTime: number
): { satellite: Satellite; fuelUsed: number } {
  if (satellite.fuel <= 0) {
    return { satellite, fuelUsed: 0 };
  }

  const thrust = scaleVector(direction, GAME_CONFIG.thrustPower * deltaTime);
  const newVelocity = addVectors(satellite.velocity, thrust);
  const fuelUsed = GAME_CONFIG.fuelConsumptionRate * deltaTime;

  return {
    satellite: {
      ...satellite,
      velocity: newVelocity,
      fuel: Math.max(0, satellite.fuel - fuelUsed),
    },
    fuelUsed,
  };
}

export function updateSatellitePosition(
  satellite: Satellite,
  planet: Planet,
  deltaTime: number
): Satellite {
  // Apply gravity
  const gravity = calculateGravity(satellite, planet);
  const newVelocity = addVectors(satellite.velocity, scaleVector(gravity, deltaTime));

  // Update position
  const newPosition = addVectors(
    satellite.position,
    scaleVector(newVelocity, deltaTime)
  );

  return {
    ...satellite,
    position: newPosition,
    velocity: newVelocity,
  };
}

export function checkCollisionWithPlanet(satellite: Satellite, planet: Planet): boolean {
  const dist = distance(satellite.position, planet.position);
  return dist < planet.radius + GAME_CONFIG.satelliteSize / 2;
}

export function checkOutOfBounds(satellite: Satellite): boolean {
  const { x, y } = satellite.position;
  const margin = GAME_CONFIG.satelliteSize;

  return (
    x < -margin ||
    x > GAME_CONFIG.canvasWidth + margin ||
    y < -margin ||
    y > GAME_CONFIG.canvasHeight + margin
  );
}

export function checkOrbCollection(satellite: Satellite, orbs: Orb[]): number[] {
  const collectedIds: number[] = [];

  orbs.forEach((orb) => {
    if (!orb.collected) {
      const dist = distance(satellite.position, orb.position);
      if (dist < orb.radius + GAME_CONFIG.satelliteSize / 2) {
        collectedIds.push(orb.id);
      }
    }
  });

  return collectedIds;
}

export function initializeGame(): GameState {
  const centerX = GAME_CONFIG.canvasWidth / 2;
  const centerY = GAME_CONFIG.canvasHeight / 2;

  // Initialize satellite in orbit
  const orbitalRadius = 200;
  const orbitalSpeed = Math.sqrt(
    (GAME_CONFIG.gravitationalConstant * 1000) / orbitalRadius
  );

  const satellite: Satellite = {
    position: { x: centerX + orbitalRadius, y: centerY },
    velocity: { x: 0, y: orbitalSpeed },
    rotation: 0,
    fuel: GAME_CONFIG.maxFuel,
  };

  const planet: Planet = {
    position: { x: centerX, y: centerY },
    radius: 40,
    mass: 1000,
  };

  // Generate orbs in a ring around the planet
  const orbs: Orb[] = [];
  const orbRingRadius = 250;
  for (let i = 0; i < GAME_CONFIG.numberOfOrbs; i++) {
    const angle = (i / GAME_CONFIG.numberOfOrbs) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * orbRingRadius;
    const y = centerY + Math.sin(angle) * orbRingRadius;

    orbs.push({
      id: i,
      position: { x, y },
      radius: GAME_CONFIG.orbRadius,
      collected: false,
    });
  }

  return {
    satellite,
    planet,
    orbs,
    score: 0,
    gameStatus: 'playing',
    isPaused: false,
  };
}
