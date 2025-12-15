import { GameConfig } from '../types/game';

export const GAME_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  satelliteSize: 20,
  maxFuel: 100,
  thrustPower: 0.3,
  fuelConsumptionRate: 0.5,
  gravitationalConstant: 5000,
  orbRadius: 15,
  numberOfOrbs: 8,
  pointsPerOrb: 100,
};

export const KEYS = {
  UP: ['ArrowUp', 'w', 'W'],
  DOWN: ['ArrowDown', 's', 'S'],
  LEFT: ['ArrowLeft', 'a', 'A'],
  RIGHT: ['ArrowRight', 'd', 'D'],
  PAUSE: [' ', 'Escape'],
};
