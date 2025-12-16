export interface Vector2D {
  x: number;
  y: number;
}

export interface Satellite {
  position: Vector2D;
  velocity: Vector2D;
  rotation: number; // in radians
  battery: number;
}

export interface Planet {
  position: Vector2D;
  radius: number;
  mass: number;
}

export interface Orb {
  id: number;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  collected: boolean;
}

export interface CollectionEffect {
  position: Vector2D;
  startTime: number;
  points: number;
}

export interface GameState {
  satellite: Satellite;
  planet: Planet;
  orbs: Orb[];
  score: number;
  gameStatus: 'playing' | 'won' | 'lost';
  isPaused: boolean;
  collectionEffects: CollectionEffect[];
  solarPanelsDeployed: boolean;
  solarPanelDeployment: number; // 0 = retracted, 1 = fully deployed
  showTrajectoryPrediction: boolean;
  sunAngle: number; // Angle in radians for sun position (rotates slowly)
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  satelliteSize: number;
  maxBattery: number;
  thrustPower: number;
  batteryConsumptionRate: number;
  gravitationalConstant: number;
  orbRadius: number;
  numberOfOrbs: number;
  pointsPerOrb: number;
}
