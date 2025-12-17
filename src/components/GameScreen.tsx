import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState } from '../types/game';
import { initializeGame } from '../game/physics';
import { updateGameState, ThrustInputs } from '../game/engine';
import { renderGame, generateStars } from '../game/renderer';
import { KEYS } from '../game/constants';
import ControlsModal from './ControlsModal';
import './GameScreen.css';

interface GameScreenProps {
  onGameEnd: (finalScore: number, won: boolean) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number }>>([]);
  const [zoom, setZoom] = useState(1);
  const [cameraMode, setCameraMode] = useState<'earth' | 'satellite'>('earth');
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const earthImageRef = useRef<HTMLImageElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const gameStateRef = useRef<GameState | null>(null);
  const gameInitializedRef = useRef(false);
  const thrustInputsRef = useRef<ThrustInputs>({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Set up canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setCanvasDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize game once when dimensions are first set
  useEffect(() => {
    if (canvasDimensions.width > 0 && canvasDimensions.height > 0 && !gameInitializedRef.current) {
      setGameState(initializeGame(canvasDimensions.width, canvasDimensions.height));
      setStars(generateStars(150, canvasDimensions.width, canvasDimensions.height));
      gameInitializedRef.current = true;
    }
  }, [canvasDimensions]);

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const bgImg = new Image();
      const earthImg = new Image();

      bgImg.src = `${process.env.PUBLIC_URL}/space-background.jpg`;
      earthImg.src = `${process.env.PUBLIC_URL}/earth.jpg`;

      try {
        await Promise.all([
          new Promise((resolve, reject) => {
            bgImg.onload = resolve;
            bgImg.onerror = reject;
            setTimeout(reject, 2000); // Timeout after 2 seconds
          }),
          new Promise((resolve, reject) => {
            earthImg.onload = resolve;
            earthImg.onerror = reject;
            setTimeout(reject, 2000); // Timeout after 2 seconds
          }),
        ]);

        backgroundImageRef.current = bgImg;
        earthImageRef.current = earthImg;
      } catch (error) {
        console.warn('Failed to load some images, using fallback graphics');
      } finally {
        setImagesLoaded(true); // Start game even if images fail
      }
    };

    loadImages();
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        isPaused: !prev.isPaused,
      };
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Handle controls modal toggle
      if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        e.preventDefault();
        setShowControls(true);
        return;
      }

      if (KEYS.PAUSE.includes(e.key)) {
        e.preventDefault();
        togglePause();
        return;
      }

      // Handle camera mode toggle
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCameraMode((prev) => prev === 'earth' ? 'satellite' : 'earth');
        return;
      }

      // Handle solar panel toggle
      if (KEYS.SOLAR_PANELS.includes(e.key)) {
        e.preventDefault();
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            solarPanelsDeployed: !prev.solarPanelsDeployed,
          };
        });
        return;
      }

      // Handle trajectory prediction toggle
      if (KEYS.TRAJECTORY.includes(e.key)) {
        e.preventDefault();
        setGameState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            showTrajectoryPrediction: !prev.showTrajectoryPrediction,
          };
        });
        return;
      }

      // Handle zoom controls
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((prev) => Math.min(prev + 0.2, 3));
        return;
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom((prev) => Math.max(prev - 0.2, 0.5));
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
    if (gameState && gameState.gameStatus !== 'playing') {
      // If there's a crash burst, wait for animation to complete before showing end screen
      if (gameState.crashBurst) {
        const animationDuration = 1000; // Wait 1 second for burst animation
        const timer = setTimeout(() => {
          onGameEnd(gameState.score, gameState.gameStatus === 'won');
        }, animationDuration);
        return () => clearTimeout(timer);
      } else {
        // No crash burst, transition immediately
        onGameEnd(gameState.score, gameState.gameStatus === 'won');
      }
    }
  }, [gameState?.gameStatus, gameState?.score, gameState?.crashBurst, onGameEnd]);

  // Game loop
  useEffect(() => {
    if (!imagesLoaded || !gameState) return;

    const gameLoop = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = currentTime;

      // Cap delta time to prevent large jumps
      const cappedDeltaTime = Math.min(deltaTime, 0.1);

      // Update game state using ref to get current state
      if (gameStateRef.current) {
        const newState = updateGameState(
          gameStateRef.current,
          thrustInputsRef.current,
          cappedDeltaTime,
          canvasDimensions.width,
          canvasDimensions.height
        );
        setGameState(newState);

        // Render
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas && imagesLoaded) {
          renderGame(
            ctx,
            newState,
            stars,
            thrustInputsRef.current,
            currentTime,
            backgroundImageRef.current,
            earthImageRef.current,
            zoom,
            cameraMode
          );
        }
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
  }, [stars, imagesLoaded, canvasDimensions, zoom, cameraMode]);

  if (!gameState) {
    return <div className="game-screen">Loading...</div>;
  }

  const orbsCollected = gameState.orbs.filter((orb) => orb.collected).length;
  const totalOrbs = gameState.orbs.length;
  const batteryPercentage = (gameState.satellite.battery / 100) * 100;

  return (
    <div className="game-screen">
      <div className="hud">
        <div className="hud-section">
          <div className="hud-label">Score</div>
          <div className="hud-value">{gameState.score}</div>
        </div>

        <div className="hud-section">
          <div className="hud-label">Debris</div>
          <div className="hud-value">
            {orbsCollected} / {totalOrbs}
          </div>
        </div>

        <div className="hud-section fuel-section">
          <div className="hud-label">Battery</div>
          <div className="fuel-bar-container">
            <div
              className="fuel-bar"
              style={{
                width: `${batteryPercentage}%`,
                backgroundColor:
                  batteryPercentage > 50
                    ? '#00ff00'
                    : batteryPercentage > 25
                    ? '#ffaa00'
                    : '#ff0000',
              }}
            ></div>
          </div>
          <div className="hud-value">{Math.floor(gameState.satellite.battery)}%</div>
        </div>

        {gameState.isPaused && (
          <div className="pause-indicator">PAUSED</div>
        )}
      </div>

      <div className="spacebel-logo">
        <img src={`${process.env.PUBLIC_URL}/logo.svg`} alt="Spacebel" />
      </div>

      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className="game-canvas"
      />

      <div className="game-controls-hint">
        H:controls | +/-:zoom | C:camera | P:solar panels | T:trajectory | SPACE:pause
      </div>

      <ControlsModal isOpen={showControls} onClose={() => setShowControls(false)} />
    </div>
  );
};

export default GameScreen;
