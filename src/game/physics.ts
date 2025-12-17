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

export function rotateVector(v: Vector2D, angleRadians: number): Vector2D {
  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  };
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
): { satellite: Satellite; batteryUsed: number } {
  if (satellite.battery <= 0) {
    return { satellite, batteryUsed: 0 };
  }

  const thrust = scaleVector(direction, GAME_CONFIG.thrustPower * deltaTime);
  const newVelocity = addVectors(satellite.velocity, thrust);
  const batteryUsed = GAME_CONFIG.batteryConsumptionRate * deltaTime;

  return {
    satellite: {
      ...satellite,
      velocity: newVelocity,
      battery: Math.max(0, satellite.battery - batteryUsed),
    },
    batteryUsed,
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

export function checkOutOfBounds(satellite: Satellite, canvasWidth: number, canvasHeight: number): boolean {
  const { x, y } = satellite.position;
  const margin = GAME_CONFIG.satelliteSize;

  return (
    x < -margin ||
    x > canvasWidth + margin ||
    y < -margin ||
    y > canvasHeight + margin
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

export function updateOrbPosition(
  orb: Orb,
  planet: Planet,
  deltaTime: number
): Orb {
  // Don't update collected orbs
  if (orb.collected) {
    return orb;
  }

  // Debris follows stable elliptical orbits (prescribed path, not physics-based)
  // Calculate current position relative to planet
  const dx = orb.position.x - planet.position.x;
  const dy = orb.position.y - planet.position.y;

  // Get current angle from planet center
  const currentAngle = Math.atan2(dy, dx);

  // Calculate current distance from planet (for elliptical orbit)
  const currentRadius = Math.sqrt(dx * dx + dy * dy);

  // Angular velocity varies with distance (Kepler's 2nd law approximation)
  // Objects move faster when closer, slower when farther
  // Base angular velocity scaled by (average radius / current radius)
  const baseAngularVelocity = 0.08; // radians per second
  const averageRadius = 275; // midpoint between min and max orbital radii
  const angularVelocity = baseAngularVelocity * (averageRadius / currentRadius);

  // Update angle
  const newAngle = currentAngle + angularVelocity * deltaTime;

  // Calculate new position on elliptical path
  // Use parametric ellipse: slightly vary radius based on angle to create ellipse
  const ellipseVariation = 1 + 0.15 * Math.cos(newAngle * 2); // Creates ellipse
  const newRadius = currentRadius * ellipseVariation / (1 + 0.15 * Math.cos(currentAngle * 2));

  const newPosition = {
    x: planet.position.x + Math.cos(newAngle) * newRadius,
    y: planet.position.y + Math.sin(newAngle) * newRadius,
  };

  // Calculate velocity (tangent to orbit)
  const tangentVelocity = newRadius * angularVelocity;
  const newVelocity = {
    x: -Math.sin(newAngle) * tangentVelocity,
    y: Math.cos(newAngle) * tangentVelocity,
  };

  return {
    ...orb,
    position: newPosition,
    velocity: newVelocity,
  };
}

export function initializeGame(canvasWidth?: number, canvasHeight?: number): GameState {
  const centerX = (canvasWidth || GAME_CONFIG.canvasWidth) / 2;
  const centerY = (canvasHeight || GAME_CONFIG.canvasHeight) / 2;

  // Initialize satellite in elliptical orbit
  const orbitalRadius = 230; // Starting farther from Earth (was 200)
  const circularSpeed = Math.sqrt(
    (GAME_CONFIG.gravitationalConstant * 1000) / orbitalRadius
  );

  // Use 92% of circular velocity to create a visible ellipse (increased from 88%)
  // Satellite will speed up as it falls toward Earth, slow down as it moves away
  const orbitalSpeed = circularSpeed * 0.92;

  const satellite: Satellite = {
    position: { x: centerX + orbitalRadius, y: centerY },
    velocity: { x: 0, y: orbitalSpeed },
    rotation: 0,
    battery: GAME_CONFIG.maxBattery,
  };

  const planet: Planet = {
    position: { x: centerX, y: centerY },
    radius: 140,
    mass: 1000,
  };

  // Generate debris at various orbital radii around the planet
  // Debris follows stable elliptical paths (prescribed orbits, not physics-based)
  const orbs: Orb[] = [];
  const minOrbitalRadius = 200;
  const maxOrbitalRadius = 350;

  // Define various debris sizes (small, medium, large)
  const debrisSizes = [10, 12, 15, 18, 20, 12, 16, 14]; // Varied sizes for 8 debris

  for (let i = 0; i < GAME_CONFIG.numberOfOrbs; i++) {
    // Spread debris evenly around Earth at different starting angles
    const angle = (i / GAME_CONFIG.numberOfOrbs) * Math.PI * 2;

    // Vary the orbital radius for each piece of debris
    // Use a mix of inner and outer orbits
    const radiusVariation = (i % 3) / 2; // Creates pattern: 0, 0.5, 1, 0, 0.5, 1...
    const orbitalRadius = minOrbitalRadius + (maxOrbitalRadius - minOrbitalRadius) * radiusVariation;

    const x = centerX + Math.cos(angle) * orbitalRadius;
    const y = centerY + Math.sin(angle) * orbitalRadius;

    // Initial velocity for display purposes (will be recalculated during motion)
    const baseSpeed = 20;
    const vx = -Math.sin(angle) * baseSpeed;
    const vy = Math.cos(angle) * baseSpeed;

    orbs.push({
      id: i,
      position: { x, y },
      velocity: { x: vx, y: vy },
      radius: debrisSizes[i] || GAME_CONFIG.orbRadius,
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
    collectionEffects: [],
    solarPanelsDeployed: false,
    solarPanelDeployment: 0.3, // Start slightly deployed
    showTrajectoryPrediction: true,
    sunAngle: Math.PI * 0.25, // Start with sun at 45 degrees
  };
}
