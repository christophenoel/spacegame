import { GameConfig } from '../types/game';

export const GAME_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  satelliteSize: 20,
  maxBattery: 100,
  thrustPower: 150, // Increased for more responsive controls
  batteryConsumptionRate: 0.8,
  gravitationalConstant: 8000, // Increased for more noticeable gravity
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
  SOLAR_PANELS: ['p', 'P'],
  TRAJECTORY: ['t', 'T'],
  CAMERA: ['c', 'C'],
  ZOOM_IN: ['+', '='],
  ZOOM_OUT: ['-', '_'],
};
