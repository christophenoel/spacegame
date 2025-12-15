import { GameState } from '../types/game';
import {
  updateSatellitePosition,
  checkCollisionWithPlanet,
  checkOutOfBounds,
  checkOrbCollection,
  applyThrust,
  createVector,
  rotateVector,
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
  deltaTime: number
): GameState {
  if (gameState.isPaused || gameState.gameStatus !== 'playing') {
    return gameState;
  }

  let { satellite } = gameState;

  // Apply thrust based on inputs (in satellite-relative coordinates)
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

  // Update satellite position with gravity
  satellite = updateSatellitePosition(satellite, gameState.planet, deltaTime);

  // Update rotation to face direction of movement
  if (satellite.velocity.x !== 0 || satellite.velocity.y !== 0) {
    satellite.rotation = Math.atan2(satellite.velocity.y, satellite.velocity.x);
  }

  // Check for orb collection
  const collectedOrbIds = checkOrbCollection(satellite, gameState.orbs);
  let newScore = gameState.score;
  const newOrbs = gameState.orbs.map((orb) => {
    if (collectedOrbIds.includes(orb.id)) {
      newScore += GAME_CONFIG.pointsPerOrb;
      return { ...orb, collected: true };
    }
    return orb;
  });

  // Check win condition
  const allOrbsCollected = newOrbs.every((orb) => orb.collected);
  let gameStatus: 'playing' | 'won' | 'lost' = gameState.gameStatus;

  if (allOrbsCollected) {
    gameStatus = 'won';
    // Bonus points for remaining fuel
    newScore += Math.floor(satellite.fuel * 10);
  }

  // Check loss conditions
  if (checkCollisionWithPlanet(satellite, gameState.planet)) {
    gameStatus = 'lost';
  }

  if (checkOutOfBounds(satellite)) {
    gameStatus = 'lost';
  }

  return {
    ...gameState,
    satellite,
    orbs: newOrbs,
    score: newScore,
    gameStatus,
  };
}
