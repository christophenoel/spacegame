import { GameState, Satellite, Vector2D } from '../types/game';
import { GAME_CONFIG } from './constants';
import { calculateGravity, addVectors, scaleVector } from './physics';

export function drawStarfield(ctx: CanvasRenderingContext2D, stars: Array<{ x: number; y: number; size: number; opacity: number }>) {
  stars.forEach((star) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
}

function predictTrajectory(gameState: GameState, predictionTime: number, steps: number): Vector2D[] {
  const points: Vector2D[] = [];
  let satellite = { ...gameState.satellite };
  const dt = predictionTime / steps;

  for (let i = 0; i < steps; i++) {
    points.push({ x: satellite.position.x, y: satellite.position.y });

    // Calculate gravity
    const gravity = calculateGravity(satellite, gameState.planet);

    // Update velocity with gravity
    const newVelocity = addVectors(satellite.velocity, scaleVector(gravity, dt));

    // Update position
    const newPosition = addVectors(satellite.position, scaleVector(newVelocity, dt));

    satellite = {
      ...satellite,
      position: newPosition,
      velocity: newVelocity,
    };
  }

  return points;
}

export function drawTrajectoryPrediction(ctx: CanvasRenderingContext2D, gameState: GameState) {
  const trajectoryPoints = predictTrajectory(gameState, 2.0, 30); // 2 seconds, 30 points

  ctx.strokeStyle = 'rgba(0, 217, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();

  trajectoryPoints.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawCollectionEffects(ctx: CanvasRenderingContext2D, gameState: GameState) {
  const currentTime = Date.now();

  gameState.collectionEffects.forEach((effect) => {
    const elapsed = currentTime - effect.startTime;
    const progress = elapsed / 1000; // 0 to 1 over 1 second

    if (progress < 1) {
      // Expanding ring effect
      const ringRadius = 15 + progress * 30;
      const opacity = 1 - progress;

      ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.position.x, effect.position.y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Score popup
      const yOffset = -20 - progress * 30;
      ctx.fillStyle = `rgba(0, 255, 136, ${opacity})`;
      ctx.font = 'bold 20px "Courier New"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${effect.points}`, effect.position.x, effect.position.y + yOffset);

      // Add a glow effect to the text
      ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(`+${effect.points}`, effect.position.x, effect.position.y + yOffset);
      ctx.shadowBlur = 0;
    }
  });
}

export function drawPlanet(ctx: CanvasRenderingContext2D, gameState: GameState) {
  const { planet } = gameState;

  // Draw glow
  const gradient = ctx.createRadialGradient(
    planet.position.x,
    planet.position.y,
    planet.radius * 0.5,
    planet.position.x,
    planet.position.y,
    planet.radius * 1.5
  );
  gradient.addColorStop(0, 'rgba(200, 100, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(100, 50, 200, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(planet.position.x, planet.position.y, planet.radius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Draw planet
  const planetGradient = ctx.createRadialGradient(
    planet.position.x - planet.radius * 0.3,
    planet.position.y - planet.radius * 0.3,
    planet.radius * 0.1,
    planet.position.x,
    planet.position.y,
    planet.radius
  );
  planetGradient.addColorStop(0, '#8B7FFF');
  planetGradient.addColorStop(1, '#4B3FBF');

  ctx.fillStyle = planetGradient;
  ctx.beginPath();
  ctx.arc(planet.position.x, planet.position.y, planet.radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw orbit line
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(planet.position.x, planet.position.y, 200, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawOrbs(ctx: CanvasRenderingContext2D, gameState: GameState, time: number) {
  gameState.orbs.forEach((orb) => {
    if (orb.collected) return;

    // Pulsing effect
    const pulse = Math.sin(time * 0.003 + orb.id) * 0.2 + 1;
    const radius = orb.radius * pulse;

    // Draw glow
    const gradient = ctx.createRadialGradient(
      orb.position.x,
      orb.position.y,
      0,
      orb.position.x,
      orb.position.y,
      radius * 1.5
    );
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(orb.position.x, orb.position.y, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw orb
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath();
    ctx.arc(orb.position.x, orb.position.y, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  });
}

export interface ThrustInputs {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export function drawSatellite(
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  thrustInputs: ThrustInputs
) {
  const { satellite } = gameState;
  const size = GAME_CONFIG.satelliteSize;

  ctx.save();
  ctx.translate(satellite.position.x, satellite.position.y);
  ctx.rotate(satellite.rotation);

  // Draw thrust flames based on which thrusters are active
  if (satellite.fuel > 0) {
    ctx.fillStyle = '#FF6600';
    const flameSize = size * 0.7;

    // Forward thrust (up key) - flame at back
    if (thrustInputs.up) {
      ctx.fillStyle = '#FF6600';
      ctx.beginPath();
      ctx.moveTo(-size / 2, 0);
      ctx.lineTo(-size / 2 - flameSize, -size / 4);
      ctx.lineTo(-size / 2 - flameSize, size / 4);
      ctx.closePath();
      ctx.fill();
    }

    // Backward thrust (down key) - flame at front
    if (thrustInputs.down) {
      ctx.fillStyle = '#FF6600';
      ctx.beginPath();
      ctx.moveTo(size / 2, 0);
      ctx.lineTo(size / 2 + flameSize, -size / 4);
      ctx.lineTo(size / 2 + flameSize, size / 4);
      ctx.closePath();
      ctx.fill();
    }

    // Left thrust - flame on right side
    if (thrustInputs.left) {
      ctx.fillStyle = '#FF6600';
      ctx.beginPath();
      ctx.moveTo(0, size / 2);
      ctx.lineTo(-size / 4, size / 2 + flameSize);
      ctx.lineTo(size / 4, size / 2 + flameSize);
      ctx.closePath();
      ctx.fill();
    }

    // Right thrust - flame on left side
    if (thrustInputs.right) {
      ctx.fillStyle = '#FF6600';
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(-size / 4, -size / 2 - flameSize);
      ctx.lineTo(size / 4, -size / 2 - flameSize);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Draw satellite body
  ctx.fillStyle = '#CCCCCC';
  ctx.fillRect(-size / 2, -size / 2, size, size);

  // Draw solar panels
  ctx.fillStyle = '#4444FF';
  ctx.fillRect(-size / 2 - 8, -size / 2 - 2, 6, size + 4);
  ctx.fillRect(size / 2 + 2, -size / 2 - 2, 6, size + 4);

  // Draw antenna
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.lineTo(0, -size);
  ctx.stroke();

  // Draw direction indicator
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2 + 8, -4);
  ctx.lineTo(size / 2 + 8, 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  stars: Array<{ x: number; y: number; size: number; opacity: number }>,
  thrustInputs: ThrustInputs,
  time: number
) {
  // Clear canvas
  ctx.fillStyle = '#000814';
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

  // Draw starfield
  drawStarfield(ctx, stars);

  // Draw game objects
  drawPlanet(ctx, gameState);
  drawTrajectoryPrediction(ctx, gameState);
  drawOrbs(ctx, gameState, time);
  drawSatellite(ctx, gameState, thrustInputs);
  drawCollectionEffects(ctx, gameState);
}

export function generateStars(count: number): Array<{ x: number; y: number; size: number; opacity: number }> {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * GAME_CONFIG.canvasWidth,
      y: Math.random() * GAME_CONFIG.canvasHeight,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    });
  }
  return stars;
}
