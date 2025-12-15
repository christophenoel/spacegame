import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState } from '../types/game';
import { initializeGame } from '../game/physics';
import { updateGameState, ThrustInputs } from '../game/engine';
import { renderGame, generateStars } from '../game/renderer';
import { GAME_CONFIG, KEYS } from '../game/constants';
import './GameScreen.css';

interface GameScreenProps {
  onGameEnd: (finalScore: number, won: boolean) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());
  const [stars] = useState(() => generateStars(100));
  const gameStateRef = useRef<GameState>(gameState);
  const thrustInputsRef = useRef<ThrustInputs>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const togglePause = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (KEYS.PAUSE.includes(e.key)) {
        e.preventDefault();
        togglePause();
        return;
      }

      if (KEYS.UP.includes(e.key)) {
        thrustInputsRef.current.up = true;
        e.preventDefault();
      }
      if (KEYS.DOWN.includes(e.key)) {
        thrustInputsRef.current.down = true;
        e.preventDefault();
      }
      if (KEYS.LEFT.includes(e.key)) {
        thrustInputsRef.current.left = true;
        e.preventDefault();
      }
      if (KEYS.RIGHT.includes(e.key)) {
        thrustInputsRef.current.right = true;
        e.preventDefault();
      }
    },
    [togglePause]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (KEYS.UP.includes(e.key)) {
      thrustInputsRef.current.up = false;
    }
    if (KEYS.DOWN.includes(e.key)) {
      thrustInputsRef.current.down = false;
    }
    if (KEYS.LEFT.includes(e.key)) {
      thrustInputsRef.current.left = false;
    }
    if (KEYS.RIGHT.includes(e.key)) {
      thrustInputsRef.current.right = false;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Check for game end
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') {
      onGameEnd(gameState.score, gameState.gameStatus === 'won');
    }
  }, [gameState.gameStatus, gameState.score, onGameEnd]);

  // Game loop
  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = currentTime;

      // Cap delta time to prevent large jumps
      const cappedDeltaTime = Math.min(deltaTime, 0.1);

      // Update game state using ref to get current state
      const newState = updateGameState(
        gameStateRef.current,
        thrustInputsRef.current,
        cappedDeltaTime
      );
      setGameState(newState);

      // Render
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        const thrustActive =
          thrustInputsRef.current.up ||
          thrustInputsRef.current.down ||
          thrustInputsRef.current.left ||
          thrustInputsRef.current.right;

        renderGame(ctx, newState, stars, thrustActive, currentTime);
      }

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stars]); // Only depend on stars, which never changes

  const orbsCollected = gameState.orbs.filter((orb) => orb.collected).length;
  const totalOrbs = gameState.orbs.length;
  const fuelPercentage = (gameState.satellite.fuel / GAME_CONFIG.maxFuel) * 100;

  return (
    <div className="game-screen">
      <div className="hud">
        <div className="hud-section">
          <div className="hud-label">Score</div>
          <div className="hud-value">{gameState.score}</div>
        </div>

        <div className="hud-section">
          <div className="hud-label">Orbs</div>
          <div className="hud-value">
            {orbsCollected} / {totalOrbs}
          </div>
        </div>

        <div className="hud-section fuel-section">
          <div className="hud-label">Fuel</div>
          <div className="fuel-bar-container">
            <div
              className="fuel-bar"
              style={{
                width: `${fuelPercentage}%`,
                backgroundColor:
                  fuelPercentage > 50
                    ? '#00ff00'
                    : fuelPercentage > 25
                    ? '#ffaa00'
                    : '#ff0000',
              }}
            ></div>
          </div>
          <div className="hud-value">{Math.floor(gameState.satellite.fuel)}%</div>
        </div>

        {gameState.isPaused && (
          <div className="pause-indicator">PAUSED</div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.canvasWidth}
        height={GAME_CONFIG.canvasHeight}
        className="game-canvas"
      />

      <div className="game-controls-hint">
        Use Arrow Keys or WASD to control thrusters | SPACE to pause
      </div>
    </div>
  );
};

export default GameScreen;
