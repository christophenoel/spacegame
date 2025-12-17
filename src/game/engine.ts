import { GameState } from '../types/game';
import {
  updateSatellitePosition,
  checkCollisionWithPlanet,
  checkOutOfBounds,
  checkOrbCollection,
  applyThrust,
  createVector,
  rotateVector,
  updateOrbPosition,
} from './physics';
import { GAME_CONFIG } from './constants';

export interface ThrustInputs {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export function updateGameState(
  gameState: GameState,
  thrustInputs: ThrustInputs,
  deltaTime: number,
  canvasWidth?: number,
  canvasHeight?: number
): GameState {
  if (gameState.isPaused || gameState.gameStatus !== 'playing') {
    return gameState;
  }

  let { satellite } = gameState;

  // Apply thrust based on inputs (only if solar panels are NOT deployed)
  // Can't use thrusters when panels are deployed
  const canUseThrust = !gameState.solarPanelsDeployed;

  if (canUseThrust) {
    // In satellite local space: forward = (1, 0), left = (0, -1)
    const localThrustVector = createVector(0, 0);
    if (thrustInputs.up) localThrustVector.x += 1; // Forward
    if (thrustInputs.down) localThrustVector.x -= 1; // Backward
    if (thrustInputs.left) localThrustVector.y -= 1; // Left
    if (thrustInputs.right) localThrustVector.y += 1; // Right

    // Normalize diagonal movement
    const thrustMagnitude = Math.sqrt(
      localThrustVector.x * localThrustVector.x + localThrustVector.y * localThrustVector.y
    );
    if (thrustMagnitude > 0) {
      localThrustVector.x /= thrustMagnitude;
      localThrustVector.y /= thrustMagnitude;

      // Rotate thrust vector to world space based on satellite orientation
      const worldThrustVector = rotateVector(localThrustVector, satellite.rotation);

      const thrustResult = applyThrust(satellite, worldThrustVector, deltaTime);
      satellite = thrustResult.satellite;
    }
  }

  // Update satellite position with gravity
  satellite = updateSatellitePosition(satellite, gameState.planet, deltaTime);

  // Animate solar panel deployment/retraction
  let solarPanelDeployment = gameState.solarPanelDeployment;
  const deploymentSpeed = 1.0; // Full deployment in 1 second
  if (gameState.solarPanelsDeployed) {
    // Deploy panels
    solarPanelDeployment = Math.min(1.0, solarPanelDeployment + deploymentSpeed * deltaTime);
  } else {
    // Retract panels
    solarPanelDeployment = Math.max(0.3, solarPanelDeployment - deploymentSpeed * deltaTime);
  }

  // Calculate if satellite is in sunlight for solar panel charging
  const sunDirX = Math.cos(gameState.sunAngle);
  const sunDirY = Math.sin(gameState.sunAngle);
  const satToSunX = satellite.position.x - gameState.planet.position.x;
  const satToSunY = satellite.position.y - gameState.planet.position.y;
  const satDist = Math.sqrt(satToSunX * satToSunX + satToSunY * satToSunY);
  const satDirX = satToSunX / satDist;
  const satDirY = satToSunY / satDist;
  const lightFactor = -(satDirX * sunDirX + satDirY * sunDirY);
  const inSunlight = lightFactor > -0.3; // Satellite is on the sunlit side

  // Battery management with solar panels
  if (solarPanelDeployment > 0.8) {
    if (inSunlight && satellite.battery < GAME_CONFIG.maxBattery) {
      // Recharge when panels deployed AND in sunlight
      const rechargeRate = 2.0 * (solarPanelDeployment - 0.8) / 0.2; // Proportional to deployment
      satellite = {
        ...satellite,
        battery: Math.min(GAME_CONFIG.maxBattery, satellite.battery + rechargeRate * deltaTime),
      };
    } else if (!inSunlight && satellite.battery > 0) {
      // Passive discharge when panels deployed but NOT in sunlight (systems consumption)
      const passiveDischargeRate = 0.3; // Slower than thrust consumption
      satellite = {
        ...satellite,
        battery: Math.max(0, satellite.battery - passiveDischargeRate * deltaTime),
      };
    }
  } else if (satellite.battery > 0) {
    // Faster passive discharge when panels are NOT deployed (systems running without charging)
    const fastDischargeRate = 0.5; // Faster drain
    satellite = {
      ...satellite,
      battery: Math.max(0, satellite.battery - fastDischargeRate * deltaTime),
    };
  }

  // Update rotation to face direction of movement
  if (satellite.velocity.x !== 0 || satellite.velocity.y !== 0) {
    satellite.rotation = Math.atan2(satellite.velocity.y, satellite.velocity.x);
  }

  // Update sun angle (rotate very slowly - full rotation in ~5 minutes)
  const sunRotationSpeed = (Math.PI * 2) / 300; // radians per second
  let sunAngle = gameState.sunAngle + sunRotationSpeed * deltaTime;
  if (sunAngle > Math.PI * 2) {
    sunAngle -= Math.PI * 2;
  }

  // Update orb positions (debris orbiting around planet)
  const updatedOrbs = gameState.orbs.map((orb) =>
    updateOrbPosition(orb, gameState.planet, deltaTime)
  );

  // Check for orb collection
  const collectedOrbIds = checkOrbCollection(satellite, updatedOrbs);
  let newScore = gameState.score;
  const newCollectionEffects = [...gameState.collectionEffects];
  const currentTime = Date.now();

  const newOrbs = updatedOrbs.map((orb) => {
    if (collectedOrbIds.includes(orb.id)) {
      newScore += GAME_CONFIG.pointsPerOrb;

      // Add collection effect
      newCollectionEffects.push({
        position: { x: orb.position.x, y: orb.position.y },
        startTime: currentTime,
        points: GAME_CONFIG.pointsPerOrb,
      });

      return { ...orb, collected: true };
    }
    return orb;
  });

  // Remove old collection effects (older than 1 second)
  const activeEffects = newCollectionEffects.filter(
    (effect) => currentTime - effect.startTime < 1000
  );

  // Check win condition
  const allOrbsCollected = newOrbs.every((orb) => orb.collected);
  let gameStatus: 'playing' | 'won' | 'lost' = gameState.gameStatus;

  // Only win if there are orbs AND they're all collected (prevents instant win with 0 orbs)
  if (allOrbsCollected && newOrbs.length > 0) {
    gameStatus = 'won';
    // Bonus points for remaining battery
    newScore += Math.floor(satellite.battery * 10);
  }

  // Check loss conditions
  let crashBurst = gameState.crashBurst;

  if (checkCollisionWithPlanet(satellite, gameState.planet)) {
    gameStatus = 'lost';
    // Create crash burst effect at collision point
    if (!crashBurst) {
      crashBurst = {
        position: { ...satellite.position },
        startTime: currentTime,
      };
    }
  }

  if (checkOutOfBounds(satellite, canvasWidth || GAME_CONFIG.canvasWidth, canvasHeight || GAME_CONFIG.canvasHeight)) {
    gameStatus = 'lost';
  }

  return {
    ...gameState,
    satellite,
    orbs: newOrbs,
    score: newScore,
    gameStatus,
    collectionEffects: activeEffects,
    crashBurst,
    solarPanelDeployment,
    sunAngle,
  };
}
