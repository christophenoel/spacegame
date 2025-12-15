import { GameState } from '../types/game';
import {
  updateSatellitePosition,
  checkCollisionWithPlanet,
  checkOutOfBounds,
  checkOrbCollection,
  applyThrust,
  createVector,
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

  // Apply thrust based on inputs
  const thrustVector = createVector(0, 0);
  if (thrustInputs.up) thrustVector.y -= 1;
  if (thrustInputs.down) thrustVector.y += 1;
  if (thrustInputs.left) thrustVector.x -= 1;
  if (thrustInputs.right) thrustVector.x += 1;

  // Normalize diagonal movement
  const thrustMagnitude = Math.sqrt(
    thrustVector.x * thrustVector.x + thrustVector.y * thrustVector.y
  );
  if (thrustMagnitude > 0) {
    thrustVector.x /= thrustMagnitude;
    thrustVector.y /= thrustMagnitude;

    const thrustResult = applyThrust(satellite, thrustVector, deltaTime);
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
