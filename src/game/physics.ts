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

  // Use simple circular orbit motion for stable, slow-moving debris
  // Calculate current angle and radius from planet center
  const dx = orb.position.x - planet.position.x;
  const dy = orb.position.y - planet.position.y;
  const currentRadius = Math.sqrt(dx * dx + dy * dy);
  const currentAngle = Math.atan2(dy, dx);

  // Very slow angular velocity (0.05 radians per second = ~18 seconds per full orbit)
  const angularVelocity = 0.05;
  const newAngle = currentAngle + angularVelocity * deltaTime;

  // Calculate new position on the circular orbit
  const newPosition = {
    x: planet.position.x + Math.cos(newAngle) * currentRadius,
    y: planet.position.y + Math.sin(newAngle) * currentRadius,
  };

  // Calculate velocity vector (tangent to the circle)
  const newVelocity = {
    x: -Math.sin(newAngle) * currentRadius * angularVelocity,
    y: Math.cos(newAngle) * currentRadius * angularVelocity,
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

  // Initialize satellite in orbit
  const orbitalRadius = 200;
  const orbitalSpeed = Math.sqrt(
    (GAME_CONFIG.gravitationalConstant * 1000) / orbitalRadius
  );

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

  // Generate orbs at various orbital radii around the planet
  const orbs: Orb[] = [];
  const minOrbitalRadius = 200;
  const maxOrbitalRadius = 350;

  // Define various debris sizes (small, medium, large)
  const debrisSizes = [10, 12, 15, 18, 20, 12, 16, 14]; // Varied sizes for 8 debris

  // Define speed multipliers for very slow, regular orbital speeds (0.15 to 0.25 range)
  // Much slower than satellite for visible but gentle motion
  const speedMultipliers = [0.18, 0.20, 0.19, 0.21, 0.17, 0.22, 0.19, 0.20];

  for (let i = 0; i < GAME_CONFIG.numberOfOrbs; i++) {
    const angle = (i / GAME_CONFIG.numberOfOrbs) * Math.PI * 2;

    // Vary the orbital radius for each orb
    // Use a mix of inner and outer orbits
    const radiusVariation = (i % 3) / 2; // Creates pattern: 0, 0.5, 1, 0, 0.5, 1...
    const orbitalRadius = minOrbitalRadius + (maxOrbitalRadius - minOrbitalRadius) * radiusVariation;

    const x = centerX + Math.cos(angle) * orbitalRadius;
    const y = centerY + Math.sin(angle) * orbitalRadius;

    // Calculate orbital velocity (tangent to radius vector)
    // Base orbital speed from physics: v = sqrt(GM/r)
    const baseOrbitalSpeed = Math.sqrt(
      (GAME_CONFIG.gravitationalConstant * planet.mass) / orbitalRadius
    );

    // Apply speed multiplier for variation
    const orbitalSpeed = baseOrbitalSpeed * speedMultipliers[i];

    // Velocity is perpendicular to radius (tangent to orbit)
    const vx = -Math.sin(angle) * orbitalSpeed;
    const vy = Math.cos(angle) * orbitalSpeed;

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
