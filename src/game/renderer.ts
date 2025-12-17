import { GameState, Vector2D } from '../types/game';
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

export function drawCrashBurst(ctx: CanvasRenderingContext2D, gameState: GameState) {
  if (!gameState.crashBurst) return;

  const currentTime = Date.now();
  const elapsed = currentTime - gameState.crashBurst.startTime;
  const duration = 800; // 0.8 seconds
  const progress = Math.min(elapsed / duration, 1); // 0 to 1

  if (progress < 1) {
    const { position } = gameState.crashBurst;

    // Multiple expanding blast waves
    for (let i = 0; i < 3; i++) {
      const waveDelay = i * 0.15;
      const waveProgress = Math.max(0, (progress - waveDelay) / (1 - waveDelay));

      if (waveProgress > 0) {
        const radius = 10 + waveProgress * 60;
        const opacity = (1 - waveProgress) * 0.8;

        // Outer red wave
        ctx.strokeStyle = `rgba(255, 50, 0, ${opacity})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner orange wave
        ctx.strokeStyle = `rgba(255, 140, 0, ${opacity * 0.7})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Bright flash at the center (strongest at the start)
    const flashProgress = Math.min(progress * 3, 1);
    const flashOpacity = (1 - flashProgress) * 0.9;
    const flashRadius = 15 * (1 + progress * 2);

    // White-hot center
    const gradient = ctx.createRadialGradient(
      position.x, position.y, 0,
      position.x, position.y, flashRadius
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${flashOpacity})`);
    gradient.addColorStop(0.3, `rgba(255, 200, 0, ${flashOpacity * 0.8})`);
    gradient.addColorStop(0.6, `rgba(255, 100, 0, ${flashOpacity * 0.5})`);
    gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(position.x, position.y, flashRadius, 0, Math.PI * 2);
    ctx.fill();

    // Debris particles flying outward
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const particleProgress = progress;
      const distance = particleProgress * 40;
      const particleX = position.x + Math.cos(angle) * distance;
      const particleY = position.y + Math.sin(angle) * distance;
      const particleOpacity = (1 - progress) * 0.9;
      const particleSize = 3 + Math.random() * 2;

      ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${particleOpacity})`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      ctx.fill();

      // Particle trails
      ctx.strokeStyle = `rgba(255, 150, 0, ${particleOpacity * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(position.x, position.y);
      ctx.lineTo(particleX, particleY);
      ctx.stroke();
    }
  }
}

export function drawPlanet(
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  earthImage: HTMLImageElement | null
) {
  const { planet, sunAngle } = gameState;

  // Calculate sun direction from angle
  const sunDirX = Math.cos(sunAngle);
  const sunDirY = Math.sin(sunAngle);

  // Draw visible sun rays coming from the sun direction
  const sunDistance = 600; // Distance of sun from planet
  const sunX = planet.position.x - sunDirX * sunDistance;
  const sunY = planet.position.y - sunDirY * sunDistance;

  // Draw multiple sun rays
  ctx.save();
  const numRays = 8;
  const rayLength = 500;
  const rayWidth = 80;

  for (let i = 0; i < numRays; i++) {
    const rayAngle = sunAngle + (i / numRays) * Math.PI * 2;
    const rayEndX = sunX + Math.cos(rayAngle) * rayLength;
    const rayEndY = sunY + Math.sin(rayAngle) * rayLength;

    const rayGradient = ctx.createLinearGradient(sunX, sunY, rayEndX, rayEndY);
    rayGradient.addColorStop(0, 'rgba(255, 240, 180, 0.15)');
    rayGradient.addColorStop(0.3, 'rgba(255, 230, 150, 0.08)');
    rayGradient.addColorStop(1, 'rgba(255, 220, 120, 0)');

    ctx.fillStyle = rayGradient;
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(
      sunX + Math.cos(rayAngle - 0.1) * rayLength,
      sunY + Math.sin(rayAngle - 0.1) * rayLength
    );
    ctx.lineTo(rayEndX, rayEndY);
    ctx.lineTo(
      sunX + Math.cos(rayAngle + 0.1) * rayLength,
      sunY + Math.sin(rayAngle + 0.1) * rayLength
    );
    ctx.closePath();
    ctx.fill();
  }

  // Draw sun glow at the source
  const sunGlowGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 150);
  sunGlowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
  sunGlowGradient.addColorStop(0.5, 'rgba(255, 240, 150, 0.2)');
  sunGlowGradient.addColorStop(1, 'rgba(255, 220, 100, 0)');
  ctx.fillStyle = sunGlowGradient;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw shadow cone behind Earth (darkens space behind planet)
  ctx.save();
  const shadowConeLength = 800;
  const shadowConeStartX = planet.position.x + sunDirX * planet.radius;
  const shadowConeStartY = planet.position.y + sunDirY * planet.radius;
  const shadowConeEndX = planet.position.x + sunDirX * shadowConeLength;
  const shadowConeEndY = planet.position.y + sunDirY * shadowConeLength;

  const shadowSpread = planet.radius * 1.5;
  const shadowGradient = ctx.createLinearGradient(
    shadowConeStartX,
    shadowConeStartY,
    shadowConeEndX,
    shadowConeEndY
  );
  shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
  shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
  shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = shadowGradient;
  ctx.beginPath();
  // Create cone shape
  const perpX = -sunDirY;
  const perpY = sunDirX;
  ctx.moveTo(shadowConeStartX + perpX * planet.radius, shadowConeStartY + perpY * planet.radius);
  ctx.lineTo(shadowConeStartX - perpX * planet.radius, shadowConeStartY - perpY * planet.radius);
  ctx.lineTo(shadowConeEndX - perpX * shadowSpread, shadowConeEndY - perpY * shadowSpread);
  ctx.lineTo(shadowConeEndX + perpX * shadowSpread, shadowConeEndY + perpY * shadowSpread);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Draw atmospheric glow only on sun-facing side
  ctx.save();

  // Create a clipping region for the lit hemisphere
  ctx.beginPath();
  const glowStartAngle = sunAngle - Math.PI / 2;
  const glowEndAngle = sunAngle + Math.PI / 2;
  ctx.arc(planet.position.x, planet.position.y, planet.radius * 1.8, glowEndAngle, glowStartAngle);
  ctx.clip();

  const glowOffset = planet.radius * 0.3;
  const glowX = planet.position.x - sunDirX * glowOffset;
  const glowY = planet.position.y - sunDirY * glowOffset;

  const gradient = ctx.createRadialGradient(
    glowX,
    glowY,
    planet.radius * 0.5,
    planet.position.x,
    planet.position.y,
    planet.radius * 1.8
  );
  gradient.addColorStop(0, 'rgba(255, 220, 150, 0.6)'); // Stronger warm sunlight glow
  gradient.addColorStop(0.5, 'rgba(100, 180, 255, 0.3)');
  gradient.addColorStop(0.7, 'rgba(60, 120, 200, 0.2)');
  gradient.addColorStop(1, 'rgba(30, 60, 150, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(planet.position.x, planet.position.y, planet.radius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Draw planet with Earth image if available
  if (earthImage && earthImage.complete && earthImage.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(planet.position.x, planet.position.y, planet.radius, 0, Math.PI * 2);
    ctx.clip();

    // Draw Earth image inside the circle (slightly larger to avoid edge artifacts)
    const imageSize = planet.radius * 2 + 40;
    ctx.drawImage(
      earthImage,
      planet.position.x - planet.radius - 20,
      planet.position.y - planet.radius - 20,
      imageSize,
      imageSize
    );

    ctx.restore();
  } else {
    // Fallback gradient with sun lighting
    const lightX = planet.position.x - sunDirX * planet.radius * 0.3;
    const lightY = planet.position.y - sunDirY * planet.radius * 0.3;

    const planetGradient = ctx.createRadialGradient(
      lightX,
      lightY,
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
  }

  // Draw much more pronounced day/night terminator that follows Earth's curved surface
  ctx.save();
  ctx.beginPath();
  ctx.arc(planet.position.x, planet.position.y, planet.radius, 0, Math.PI * 2);
  ctx.clip();

  // The night side is the hemisphere facing AWAY from the sun
  // If sun is at angle sunAngle, the dark side center is at sunAngle + PI
  // The terminator arc spans perpendicular to the sun direction

  // Draw the dark hemisphere (night side) using a semi-circle that follows Earth's curve
  ctx.save();

  // Create a path for the night side hemisphere
  ctx.beginPath();

  // The dark hemisphere faces in the SAME direction as sunDir (since sun is positioned opposite)
  // Arc spans from sunAngle - PI/2 to sunAngle + PI/2, covering the dark side
  const startAngle = sunAngle - Math.PI / 2; // Top of terminator
  const endAngle = sunAngle + Math.PI / 2; // Bottom of terminator

  // Draw the night hemisphere arc
  ctx.arc(planet.position.x, planet.position.y, planet.radius, startAngle, endAngle);
  ctx.lineTo(planet.position.x, planet.position.y);
  ctx.closePath();

  // Create gradient for the night side that fades from center to edge
  const nightGradient = ctx.createRadialGradient(
    planet.position.x + sunDirX * planet.radius * 0.3,
    planet.position.y + sunDirY * planet.radius * 0.3,
    0,
    planet.position.x + sunDirX * planet.radius * 0.3,
    planet.position.y + sunDirY * planet.radius * 0.3,
    planet.radius * 1.3
  );
  nightGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)'); // Dark at the far side (reduced opacity)
  nightGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.4)');
  nightGradient.addColorStop(0.85, 'rgba(0, 0, 0, 0.2)'); // Twilight zone near terminator
  nightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = nightGradient;
  ctx.fill();
  ctx.restore();

  // Add extra brightness to the day side
  const dayLightX = planet.position.x - sunDirX * planet.radius * 0.5;
  const dayLightY = planet.position.y - sunDirY * planet.radius * 0.5;
  const dayLightGradient = ctx.createRadialGradient(
    dayLightX,
    dayLightY,
    planet.radius * 0.3,
    dayLightX,
    dayLightY,
    planet.radius * 1.2
  );
  dayLightGradient.addColorStop(0, 'rgba(255, 240, 200, 0.4)');
  dayLightGradient.addColorStop(0.6, 'rgba(255, 220, 150, 0.1)');
  dayLightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = dayLightGradient;
  ctx.beginPath();
  ctx.arc(planet.position.x, planet.position.y, planet.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Draw orbit reference lines
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.15)';
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

    // Slow rotation for debris
    const rotation = (time * 0.001 + orb.id) % (Math.PI * 2);
    const size = orb.radius; // Use actual debris radius for varied sizes

    ctx.save();
    ctx.translate(orb.position.x, orb.position.y);
    ctx.rotate(rotation);

    // Draw warning glow (debris is hazardous)
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.3);
    gradient.addColorStop(0, 'rgba(255, 100, 50, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Draw debris fragment (angular metallic shape)
    ctx.fillStyle = '#C0C0C0'; // Silver/metallic
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1;

    // Irregular polygon shape for debris
    ctx.beginPath();
    ctx.moveTo(size * 0.8, 0);
    ctx.lineTo(size * 0.3, size * 0.5);
    ctx.lineTo(-size * 0.2, size * 0.6);
    ctx.lineTo(-size * 0.7, size * 0.1);
    ctx.lineTo(-size * 0.5, -size * 0.4);
    ctx.lineTo(size * 0.1, -size * 0.7);
    ctx.lineTo(size * 0.6, -size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Add some detail lines for depth
    ctx.strokeStyle = '#A0A0A0';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.5, size * 0.2);
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.3, -size * 0.2);
    ctx.stroke();

    // Add a small highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(size * 0.3, -size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
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
  const { satellite, sunAngle, planet } = gameState;
  const size = GAME_CONFIG.satelliteSize;
  const moduleWidth = size * 1.2;
  const moduleHeight = size * 0.7;

  // Calculate sun direction
  const sunDirX = Math.cos(sunAngle);
  const sunDirY = Math.sin(sunAngle);

  // Calculate satellite position relative to sun
  const satToSunX = satellite.position.x - planet.position.x;
  const satToSunY = satellite.position.y - planet.position.y;

  // Normalize
  const satDist = Math.sqrt(satToSunX * satToSunX + satToSunY * satToSunY);
  const satDirX = satToSunX / satDist;
  const satDirY = satToSunY / satDist;

  // Dot product to determine if satellite is on lit side or shadow side
  // Positive = lit side, Negative = shadow side
  const lightFactor = -(satDirX * sunDirX + satDirY * sunDirY);

  // Check if satellite is in Earth's shadow cone
  const distFromPlanet = Math.sqrt(
    Math.pow(satellite.position.x - planet.position.x, 2) +
    Math.pow(satellite.position.y - planet.position.y, 2)
  );
  const inEarthShadow = lightFactor < -0.3 && distFromPlanet > planet.radius;

  // Map lightFactor (-1 to 1) to lighting (0 = dark, 1 = bright)
  let lighting = (lightFactor + 1) / 2; // 0 to 1 range

  // If in Earth's shadow, make it much darker
  if (inEarthShadow) {
    lighting = Math.min(lighting, 0.15); // Maximum 15% brightness in shadow
  }

  ctx.save();
  ctx.translate(satellite.position.x, satellite.position.y);
  ctx.rotate(satellite.rotation);

  // Draw thrust flames based on which thrusters are active with realistic animation
  // Only show thrust if battery available AND solar panels are NOT deployed
  const canUseThrust = !gameState.solarPanelsDeployed;
  if (satellite.battery > 0 && canUseThrust) {
    const time = Date.now();
    const flicker = Math.sin(time * 0.02) * 0.15 + 0.85; // Flickering effect
    const flicker2 = Math.sin(time * 0.03 + 1) * 0.1 + 0.9;
    const baseFlameSize = size * 0.8;
    const flameSize = baseFlameSize * flicker;

    // Forward thrust (up key) - main engine flame at back
    if (thrustInputs.up) {
      // Outer flame layer (red-orange)
      ctx.fillStyle = 'rgba(255, 80, 20, 0.7)';
      ctx.beginPath();
      ctx.moveTo(-moduleWidth / 2, 0);
      ctx.lineTo(-moduleWidth / 2 - flameSize * flicker2, -moduleHeight / 3);
      ctx.lineTo(-moduleWidth / 2 - flameSize * 1.1, 0);
      ctx.lineTo(-moduleWidth / 2 - flameSize * flicker2, moduleHeight / 3);
      ctx.closePath();
      ctx.fill();

      // Middle flame layer (orange)
      ctx.fillStyle = 'rgba(255, 150, 50, 0.85)';
      ctx.beginPath();
      ctx.moveTo(-moduleWidth / 2, 0);
      ctx.lineTo(-moduleWidth / 2 - flameSize * 0.75, -moduleHeight / 4);
      ctx.lineTo(-moduleWidth / 2 - flameSize * 0.85, 0);
      ctx.lineTo(-moduleWidth / 2 - flameSize * 0.75, moduleHeight / 4);
      ctx.closePath();
      ctx.fill();

      // Inner bright core (white-yellow)
      ctx.fillStyle = 'rgba(255, 255, 220, 0.95)';
      ctx.beginPath();
      ctx.moveTo(-moduleWidth / 2, 0);
      ctx.lineTo(-moduleWidth / 2 - flameSize * 0.4 * flicker, -moduleHeight / 6);
      ctx.lineTo(-moduleWidth / 2 - flameSize * 0.5, 0);
      ctx.lineTo(-moduleWidth / 2 - flameSize * 0.4 * flicker, moduleHeight / 6);
      ctx.closePath();
      ctx.fill();

      // Add glow effect
      ctx.shadowColor = 'rgba(255, 150, 50, 0.8)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(255, 200, 100, 0.4)';
      ctx.beginPath();
      ctx.moveTo(-moduleWidth / 2, 0);
      ctx.lineTo(-moduleWidth / 2 - flameSize * 0.6, -moduleHeight / 4);
      ctx.lineTo(-moduleWidth / 2 - flameSize * 0.6, moduleHeight / 4);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Reverse thrust (down key)
    if (thrustInputs.down) {
      const smallFlame = flameSize * 0.5;

      // Outer flame
      ctx.fillStyle = 'rgba(255, 100, 30, 0.7)';
      ctx.beginPath();
      ctx.moveTo(moduleWidth / 2 + smallFlame * flicker2, -moduleHeight / 4);
      ctx.lineTo(moduleWidth / 2, -moduleHeight / 5);
      ctx.lineTo(moduleWidth / 2, -moduleHeight / 3);
      ctx.closePath();
      ctx.fill();

      // Inner core
      ctx.fillStyle = 'rgba(255, 220, 180, 0.9)';
      ctx.beginPath();
      ctx.moveTo(moduleWidth / 2 + smallFlame * 0.5 * flicker, -moduleHeight / 4);
      ctx.lineTo(moduleWidth / 2, -moduleHeight / 5);
      ctx.lineTo(moduleWidth / 2, -moduleHeight / 3);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = 'rgba(255, 150, 50, 0.6)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
      ctx.fillRect(moduleWidth / 2, -moduleHeight / 3, smallFlame * 0.3, moduleHeight / 12);
      ctx.shadowBlur = 0;
    }

    // Left thruster (left key)
    if (thrustInputs.left) {
      const sideFlame = flameSize * 0.5;

      // Outer flame
      ctx.fillStyle = 'rgba(255, 100, 30, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, moduleHeight / 2 + sideFlame * flicker2);
      ctx.lineTo(-moduleHeight / 5, moduleHeight / 2);
      ctx.lineTo(moduleHeight / 5, moduleHeight / 2);
      ctx.closePath();
      ctx.fill();

      // Inner core
      ctx.fillStyle = 'rgba(255, 220, 180, 0.9)';
      ctx.beginPath();
      ctx.moveTo(0, moduleHeight / 2 + sideFlame * 0.5 * flicker);
      ctx.lineTo(-moduleHeight / 6, moduleHeight / 2);
      ctx.lineTo(moduleHeight / 6, moduleHeight / 2);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = 'rgba(255, 150, 50, 0.6)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
      ctx.fillRect(-moduleHeight / 8, moduleHeight / 2, moduleHeight / 4, sideFlame * 0.3);
      ctx.shadowBlur = 0;
    }

    // Right thruster (right key)
    if (thrustInputs.right) {
      const sideFlame = flameSize * 0.5;

      // Outer flame
      ctx.fillStyle = 'rgba(255, 100, 30, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, -moduleHeight / 2 - sideFlame * flicker2);
      ctx.lineTo(-moduleHeight / 5, -moduleHeight / 2);
      ctx.lineTo(moduleHeight / 5, -moduleHeight / 2);
      ctx.closePath();
      ctx.fill();

      // Inner core
      ctx.fillStyle = 'rgba(255, 220, 180, 0.9)';
      ctx.beginPath();
      ctx.moveTo(0, -moduleHeight / 2 - sideFlame * 0.5 * flicker);
      ctx.lineTo(-moduleHeight / 6, -moduleHeight / 2);
      ctx.lineTo(moduleHeight / 6, -moduleHeight / 2);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = 'rgba(255, 150, 50, 0.6)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
      ctx.fillRect(-moduleHeight / 8, -moduleHeight / 2 - sideFlame * 0.3, moduleHeight / 4, sideFlame * 0.3);
      ctx.shadowBlur = 0;
    }
  }

  // Draw solar panels (large arrays) - animated based on deployment state
  const panelWidth = size * 0.6; // Increased from 0.4
  const panelHeight = size * 2.4; // Increased from 1.8

  // Use deployment progress for smooth animation
  const deploymentProgress = (gameState as any).solarPanelDeployment || 0.3;
  const effectivePanelWidth = panelWidth * (0.3 + 0.7 * deploymentProgress);
  const effectivePanelHeight = panelHeight * (0.7 + 0.3 * deploymentProgress);

  // Color interpolation based on deployment progress and sun lighting
  const baseBrightness = 13 + deploymentProgress * 13; // 13 to 26
  const lightAdjustedBrightness = Math.floor(baseBrightness * (0.3 + lighting * 0.7)); // Adjust by lighting
  const panelFillColor = `#1a${lightAdjustedBrightness.toString(16).padStart(2, '0')}${(0x45 + Math.floor(deploymentProgress * 0x45 * (0.3 + lighting * 0.7))).toString(16).padStart(2, '0')}`;
  const panelStrokeColor = `#0${Math.floor(lightAdjustedBrightness * 0.8).toString(16).padStart(2, '0')}${(0x1f + Math.floor(deploymentProgress * 0x31 * (0.3 + lighting * 0.7))).toString(16).padStart(2, '0')}`;

  // Left solar panel
  ctx.fillStyle = panelFillColor;
  ctx.fillRect(-moduleWidth / 2 - effectivePanelWidth - 2, -effectivePanelHeight / 2, effectivePanelWidth, effectivePanelHeight);
  ctx.strokeStyle = panelStrokeColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(-moduleWidth / 2 - effectivePanelWidth - 2, -effectivePanelHeight / 2, effectivePanelWidth, effectivePanelHeight);

  // Solar panel grid pattern (fade in as panels deploy)
  if (deploymentProgress > 0.4) {
    ctx.strokeStyle = `rgba(40, 53, 147, ${(deploymentProgress - 0.4) / 0.6})`;
    ctx.lineWidth = 0.5;
    const gridLines = Math.floor(2 + deploymentProgress * 4); // 2 to 6 lines
    for (let i = 1; i < gridLines; i++) {
      const y = -effectivePanelHeight / 2 + (effectivePanelHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(-moduleWidth / 2 - effectivePanelWidth - 2, y);
      ctx.lineTo(-moduleWidth / 2 - 2, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let i = 1; i < 3; i++) {
      const x = -moduleWidth / 2 - effectivePanelWidth - 2 + (effectivePanelWidth / 3) * i;
      ctx.beginPath();
      ctx.moveTo(x, -effectivePanelHeight / 2);
      ctx.lineTo(x, effectivePanelHeight / 2);
      ctx.stroke();
    }
  }

  // Add glow effect when sufficiently deployed (>80%) and charging AND in sunlight
  if (deploymentProgress > 0.8 && lighting > 0.6) {
    const glowIntensity = (deploymentProgress - 0.8) / 0.2 * lighting; // Adjust by lighting
    ctx.shadowColor = `rgba(100, 180, 255, ${glowIntensity * 0.6})`;
    ctx.shadowBlur = 8 * glowIntensity;
    ctx.strokeStyle = `rgba(64, 128, 255, ${glowIntensity})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(-moduleWidth / 2 - effectivePanelWidth - 2, -effectivePanelHeight / 2, effectivePanelWidth, effectivePanelHeight);
    ctx.shadowBlur = 0;
  }

  // Right solar panel (mirror of left)
  ctx.fillStyle = panelFillColor;
  ctx.fillRect(moduleWidth / 2 + 2, -effectivePanelHeight / 2, effectivePanelWidth, effectivePanelHeight);
  ctx.strokeStyle = panelStrokeColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(moduleWidth / 2 + 2, -effectivePanelHeight / 2, effectivePanelWidth, effectivePanelHeight);

  // Solar panel grid pattern (fade in as panels deploy)
  if (deploymentProgress > 0.4) {
    ctx.strokeStyle = `rgba(40, 53, 147, ${(deploymentProgress - 0.4) / 0.6})`;
    ctx.lineWidth = 0.5;
    const gridLines = Math.floor(2 + deploymentProgress * 4);
    for (let i = 1; i < gridLines; i++) {
      const y = -effectivePanelHeight / 2 + (effectivePanelHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(moduleWidth / 2 + 2, y);
      ctx.lineTo(moduleWidth / 2 + effectivePanelWidth + 2, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let i = 1; i < 3; i++) {
      const x = moduleWidth / 2 + 2 + (effectivePanelWidth / 3) * i;
      ctx.beginPath();
      ctx.moveTo(x, -effectivePanelHeight / 2);
      ctx.lineTo(x, effectivePanelHeight / 2);
      ctx.stroke();
    }
  }

  // Add glow effect when sufficiently deployed (>80%) and charging AND in sunlight
  if (deploymentProgress > 0.8 && lighting > 0.6) {
    const glowIntensity = (deploymentProgress - 0.8) / 0.2 * lighting; // Adjust by lighting
    ctx.shadowColor = `rgba(100, 180, 255, ${glowIntensity * 0.6})`;
    ctx.shadowBlur = 8 * glowIntensity;
    ctx.strokeStyle = `rgba(64, 128, 255, ${glowIntensity})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(moduleWidth / 2 + 2, -effectivePanelHeight / 2, effectivePanelWidth, effectivePanelHeight);
    ctx.shadowBlur = 0;

    // Add deployment indicator particles/sparks during deployment (only in sunlight)
    if (deploymentProgress < 1.0) {
      const sparkCount = 3;
      for (let i = 0; i < sparkCount; i++) {
        const sparkX = moduleWidth / 2 + 2 + Math.random() * effectivePanelWidth;
        const sparkY = -effectivePanelHeight / 2 + Math.random() * effectivePanelHeight;
        ctx.fillStyle = `rgba(100, 200, 255, ${Math.random() * 0.8 * lighting})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Draw main cylindrical module body
  ctx.fillStyle = '#E8E8E8'; // Light gray/white
  ctx.fillRect(-moduleWidth / 2, -moduleHeight / 2, moduleWidth, moduleHeight);
  ctx.strokeStyle = '#B0B0B0';
  ctx.lineWidth = 1;
  ctx.strokeRect(-moduleWidth / 2, -moduleHeight / 2, moduleWidth, moduleHeight);

  // Add cylindrical appearance with shading
  const bodyGradient = ctx.createLinearGradient(0, -moduleHeight / 2, 0, moduleHeight / 2);
  bodyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  bodyGradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.1)');
  bodyGradient.addColorStop(1, 'rgba(150, 150, 150, 0.3)');
  ctx.fillStyle = bodyGradient;
  ctx.fillRect(-moduleWidth / 2, -moduleHeight / 2, moduleWidth, moduleHeight);

  // Draw module details (panels/sections)
  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 3; i++) {
    const x = -moduleWidth / 2 + (moduleWidth / 3) * i;
    ctx.beginPath();
    ctx.moveTo(x, -moduleHeight / 2);
    ctx.lineTo(x, moduleHeight / 2);
    ctx.stroke();
  }

  // Draw windows/ports
  ctx.fillStyle = '#4080B0';
  const windowSize = size * 0.12;
  ctx.fillRect(moduleWidth / 4 - windowSize / 2, -windowSize / 2, windowSize, windowSize);
  ctx.fillRect(-moduleWidth / 6 - windowSize / 2, -windowSize / 2, windowSize, windowSize);

  // Draw battery level indicator on spaceship
  const batteryPercentage = (satellite.battery / 100);
  const batteryBarWidth = moduleWidth * 0.6;
  const batteryBarHeight = 3;
  const batteryBarX = -batteryBarWidth / 2;
  const batteryBarY = moduleHeight / 2 - batteryBarHeight - 2;

  // Battery bar background (frame)
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(batteryBarX, batteryBarY, batteryBarWidth, batteryBarHeight);

  // Battery bar fill with color gradient based on level
  const batteryFillWidth = batteryBarWidth * batteryPercentage;
  let batteryColor;
  if (batteryPercentage > 0.5) {
    // Green to yellow gradient
    const greenToYellow = (1 - batteryPercentage) * 2; // 0 to 1 as battery goes from 100% to 50%
    const r = Math.floor(greenToYellow * 255);
    const g = 255;
    batteryColor = `rgb(${r}, ${g}, 0)`;
  } else {
    // Yellow to red gradient
    const yellowToRed = batteryPercentage * 2; // 0 to 1 as battery goes from 0% to 50%
    const g = Math.floor(yellowToRed * 255);
    batteryColor = `rgb(255, ${g}, 0)`;
  }

  ctx.fillStyle = batteryColor;
  ctx.fillRect(batteryBarX, batteryBarY, batteryFillWidth, batteryBarHeight);

  // Draw direction indicator (docking port at front)
  ctx.fillStyle = '#C0C0C0';
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(moduleWidth / 2, 0, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Docking port detail
  ctx.fillStyle = '#404040';
  ctx.beginPath();
  ctx.arc(moduleWidth / 2, 0, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Add communication antenna on top
  ctx.strokeStyle = '#B0B0B0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-moduleWidth / 4, -moduleHeight / 2);
  ctx.lineTo(-moduleWidth / 4, -moduleHeight / 2 - size * 0.4);
  ctx.stroke();

  // Antenna dish
  ctx.fillStyle = '#D0D0D0';
  ctx.beginPath();
  ctx.ellipse(-moduleWidth / 4, -moduleHeight / 2 - size * 0.4, size * 0.15, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Add smaller antenna on bottom
  ctx.beginPath();
  ctx.moveTo(moduleWidth / 4, moduleHeight / 2);
  ctx.lineTo(moduleWidth / 4, moduleHeight / 2 + size * 0.25);
  ctx.stroke();

  // Add engine nozzles at back
  ctx.fillStyle = '#606060';
  const nozzleRadius = size * 0.08;
  ctx.beginPath();
  ctx.arc(-moduleWidth / 2, -moduleHeight / 4, nozzleRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#404040';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-moduleWidth / 2, moduleHeight / 4, nozzleRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Add RCS thruster ports on sides
  ctx.fillStyle = '#505050';
  const thrusterSize = size * 0.05;
  // Top thruster
  ctx.fillRect(-thrusterSize / 2, -moduleHeight / 2 - thrusterSize, thrusterSize, thrusterSize);
  // Bottom thruster
  ctx.fillRect(-thrusterSize / 2, moduleHeight / 2, thrusterSize, thrusterSize);

  // Add identification markings
  ctx.fillStyle = '#FF6B00'; // Orange stripe
  ctx.fillRect(-moduleWidth / 3, -moduleHeight / 2 + 1, moduleWidth / 6, 2);
  ctx.fillRect(-moduleWidth / 3, moduleHeight / 2 - 3, moduleWidth / 6, 2);

  // Add mission number/identifier
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 4px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('SC-01', 0, moduleHeight / 4);

  // Apply sun lighting highlight to satellite (only brightening, no darkening)
  const satelliteBounds = Math.max(moduleWidth + effectivePanelWidth * 2 + 4, effectivePanelHeight);

  // Only add bright highlight when in sunlight
  if (lighting > 0.5) {
    const brightIntensity = (lighting - 0.5) * 2; // 0 to 1, where 1 is brightest

    // Create directional light gradient from sun direction
    const lightOffsetX = -sunDirX * satelliteBounds * 0.5;
    const lightOffsetY = -sunDirY * satelliteBounds * 0.5;

    const lightGradient = ctx.createRadialGradient(
      lightOffsetX,
      lightOffsetY,
      0,
      lightOffsetX,
      lightOffsetY,
      satelliteBounds
    );
    lightGradient.addColorStop(0, `rgba(255, 240, 200, ${brightIntensity * 0.4})`);
    lightGradient.addColorStop(0.5, `rgba(255, 230, 180, ${brightIntensity * 0.2})`);
    lightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = lightGradient;
    ctx.fillRect(-satelliteBounds, -satelliteBounds, satelliteBounds * 2, satelliteBounds * 2);
  }

  ctx.restore();
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  stars: Array<{ x: number; y: number; size: number; opacity: number }>,
  thrustInputs: ThrustInputs,
  time: number,
  backgroundImage: HTMLImageElement | null,
  earthImage: HTMLImageElement | null,
  zoom: number = 1,
  cameraMode: 'earth' | 'satellite' = 'earth'
) {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  // Clear canvas
  ctx.fillStyle = '#000814';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Save the context state
  ctx.save();

  // Determine camera center based on mode
  const cameraCenter = cameraMode === 'satellite'
    ? gameState.satellite.position
    : gameState.planet.position;

  // Apply camera transformation: center on selected object and zoom
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  ctx.translate(centerX, centerY);
  ctx.scale(zoom, zoom);
  ctx.translate(-cameraCenter.x, -cameraCenter.y);

  // Draw space background image
  if (backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth > 0) {
    // Scale image to cover the zoomed viewport
    const scale = Math.max(
      (canvasWidth / zoom) / backgroundImage.width,
      (canvasHeight / zoom) / backgroundImage.height
    ) * 2;
    const width = backgroundImage.width * scale;
    const height = backgroundImage.height * scale;
    const x = cameraCenter.x - width / 2;
    const y = cameraCenter.y - height / 2;

    ctx.drawImage(backgroundImage, x, y, width, height);
  } else {
    // Draw starfield in world space
    drawStarfield(ctx, stars);
  }

  // Draw game objects
  drawPlanet(ctx, gameState, earthImage);
  if (gameState.showTrajectoryPrediction) {
    drawTrajectoryPrediction(ctx, gameState);
  }
  drawOrbs(ctx, gameState, time);
  drawSatellite(ctx, gameState, thrustInputs);
  drawCollectionEffects(ctx, gameState);
  drawCrashBurst(ctx, gameState);

  // Restore context
  ctx.restore();
}

export function generateStars(count: number, canvasWidth?: number, canvasHeight?: number): Array<{ x: number; y: number; size: number; opacity: number }> {
  const width = canvasWidth || GAME_CONFIG.canvasWidth;
  const height = canvasHeight || GAME_CONFIG.canvasHeight;
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    });
  }
  return stars;
}
