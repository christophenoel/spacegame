import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types/game';
import { initializeGame } from '../game/physics';
import { updateGameState, ThrustInputs } from '../game/engine';
import { renderGame, generateStars } from '../game/renderer';
import { KEYS } from '../game/constants';
import './TutorialScreen.css';

interface TutorialScreenProps {
  onComplete: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  condition?: (state: GameState, actions: UserActions) => boolean;
  onEnter?: (state: GameState) => GameState;
}

interface UserActions {
  thrustUsed: boolean;
  panelsDeployed: boolean;
  trajectoryToggled: boolean;
  cameraToggled: boolean;
  zoomUsed: boolean;
  debrisCollected: number;
}

const TutorialScreen: React.FC<TutorialScreenProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const gameStateRef = useRef<GameState | null>(null);
  const gameInitializedRef = useRef(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userActions, setUserActions] = useState<UserActions>({
    thrustUsed: false,
    panelsDeployed: false,
    trajectoryToggled: false,
    cameraToggled: false,
    zoomUsed: false,
    debrisCollected: 0,
  });

  const thrustInputsRef = useRef<ThrustInputs>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; opacity: number }>>([]);
  const [zoom, setZoom] = useState<number>(1);
  const [cameraMode, setCameraMode] = useState<'earth' | 'satellite'>('earth');
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const earthImageRef = useRef<HTMLImageElement | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const [notification, setNotification] = useState<string>('');
  const initialStateRef = useRef<GameState | null>(null);

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

  // Initialize game once when dimensions are set
  useEffect(() => {
    if (canvasDimensions.width > 0 && canvasDimensions.height > 0 && !gameInitializedRef.current) {
      const initialState = initializeGame(canvasDimensions.width, canvasDimensions.height);
      const velocityScale = 0.4; // Slow down satellite to 40% speed
      // Start tutorial with no debris, panels retracted, slower satellite, smaller Earth, and adapted gravity
      const tutorialState = {
        ...initialState,
        satellite: {
          ...initialState.satellite,
          velocity: {
            x: initialState.satellite.velocity.x * velocityScale,
            y: initialState.satellite.velocity.y * velocityScale,
          },
        },
        planet: {
          ...initialState.planet,
          radius: initialState.planet.radius * 0.6, // Make Earth smaller for tutorial
          mass: initialState.planet.mass * (velocityScale * velocityScale), // Adapt gravity to match slower orbit
        },
        orbs: [],
        solarPanelsDeployed: false,
        showTrajectoryPrediction: false,
      };
      initialStateRef.current = tutorialState;
      setGameState(tutorialState);
      const newStars = generateStars(150, canvasDimensions.width, canvasDimensions.height);
      setStars(newStars);
      gameInitializedRef.current = true;
    }
  }, [canvasDimensions]);

  // Function to reset orbit
  const resetOrbit = (message: string = 'Orbit Reset') => {
    if (initialStateRef.current && gameState) {
      setGameState({
        ...initialStateRef.current,
        orbs: gameState.orbs, // Keep current orbs
        score: gameState.score, // Keep score
      });
      setNotification(message);
      setTimeout(() => setNotification(''), 2000);
    }
  };

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

  // Define tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      id: 0,
      title: 'Welcome, Human Onboard Software',
      description: 'You are the HUMAN ONBOARD SOFTWARE controlling this satellite. The AI system has detected multiple debris fragments threatening Earth. You must guide the satellite to collect all debris.',
    },
    {
      id: 1,
      title: 'Basic Thrust Controls',
      description: 'Use ARROW KEYS or WASD to thrust in any direction. The satellite will continue moving due to inertia. Try moving around now.',
      condition: (_, actions) => actions.thrustUsed,
    },
    {
      id: 2,
      title: 'Understanding Orbit',
      description: 'Notice how Earth\'s gravity pulls you toward it. Your momentum keeps you in orbit. Maintain a stable orbit to avoid collision with Earth.',
    },
    {
      id: 3,
      title: 'Mission: Debris Collection',
      description: 'Debris fragments are now appearing. Fly close to debris to collect it. Collect the debris fragment to proceed.',
      condition: (_, actions) => actions.debrisCollected > 0,
      onEnter: (state) => {
        // Add one debris on enter
        const centerX = 400;
        const centerY = 300;
        const orbitalRadius = 250;
        const angle = Math.PI / 4;
        return {
          ...state,
          orbs: [{
            id: 1,
            position: {
              x: centerX + Math.cos(angle) * orbitalRadius,
              y: centerY + Math.sin(angle) * orbitalRadius,
            },
            velocity: {
              x: -Math.sin(angle) * 10,
              y: Math.cos(angle) * 10,
            },
            radius: 15,
            collected: false,
          }],
        };
      },
    },
    {
      id: 4,
      title: 'Battery Management',
      description: 'Your thrusters consume battery power. When battery runs low, you can\'t use thrusters. Notice the battery indicator on your satellite.',
    },
    {
      id: 5,
      title: 'Solar Panel Deployment',
      description: 'Press P to deploy solar panels. Panels recharge your battery when in sunlight, but you CANNOT use thrusters while panels are deployed. Try deploying panels now.',
      condition: (_, actions) => actions.panelsDeployed,
    },
    {
      id: 6,
      title: 'Advanced: Trajectory Prediction',
      description: 'Press T to toggle the trajectory prediction line. This shows your predicted path for the next 2 seconds. Try it now.',
      condition: (_, actions) => actions.trajectoryToggled,
    },
    {
      id: 7,
      title: 'Advanced: Camera Controls',
      description: 'Press C to toggle between Earth-centered and Satellite-centered camera views. Press + or - to zoom in/out. Try these controls.',
      condition: (_, actions) => actions.cameraToggled || actions.zoomUsed,
    },
    {
      id: 8,
      title: 'Training Complete',
      description: 'You\'re ready for the mission! Remember: collect all debris, manage your battery, avoid Earth collision. Press SPACE to pause anytime. Good luck, Human OSBW!',
    },
  ];

  const currentTutorialStep = tutorialSteps[currentStep];

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Check if step condition is met
  useEffect(() => {
    if (!gameState) return;
    if (currentTutorialStep.condition && currentTutorialStep.condition(gameState, userActions)) {
      // Wait a moment before advancing
      const timer = setTimeout(() => {
        if (currentStep < tutorialSteps.length - 1) {
          setCurrentStep(currentStep + 1);
          resetOrbit('Advancing to next step');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, userActions, currentStep, currentTutorialStep]);

  // Execute onEnter callback when step changes
  useEffect(() => {
    if (!gameState || !currentTutorialStep.onEnter) return;
    setGameState((prev) => {
      if (!prev) return prev;
      return currentTutorialStep.onEnter!(prev);
    });
  }, [currentStep, currentTutorialStep]);

  // Track debris collection
  useEffect(() => {
    if (!gameState) return;
    const collectedCount = gameState.orbs.filter(orb => orb.collected).length;
    if (collectedCount > userActions.debrisCollected) {
      setUserActions(prev => ({ ...prev, debrisCollected: collectedCount }));
    }
  }, [gameState?.orbs, userActions.debrisCollected, gameState]);

  // Detect crashes and reset orbit
  useEffect(() => {
    if (!gameState) return;
    if (gameState.gameStatus === 'lost') {
      // Wait for crash burst animation to complete before resetting
      if (gameState.crashBurst) {
        const animationDuration = 1000; // Wait 1 second for burst animation
        const timer = setTimeout(() => {
          resetOrbit('Crashed! Resetting orbit...');
        }, animationDuration);
        return () => clearTimeout(timer);
      } else {
        resetOrbit('Crashed! Resetting orbit...');
      }
    }
  }, [gameState?.gameStatus, gameState?.crashBurst]);

  // Keyboard input handling
  useEffect(() => {
    // Handle keyboard input for tutorial
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS.UP.includes(e.key)) {
        thrustInputsRef.current.up = true;
        setUserActions(prev => ({ ...prev, thrustUsed: true }));
      }
      if (KEYS.DOWN.includes(e.key)) {
        thrustInputsRef.current.down = true;
        setUserActions(prev => ({ ...prev, thrustUsed: true }));
      }
      if (KEYS.LEFT.includes(e.key)) {
        thrustInputsRef.current.left = true;
        setUserActions(prev => ({ ...prev, thrustUsed: true }));
      }
      if (KEYS.RIGHT.includes(e.key)) {
        thrustInputsRef.current.right = true;
        setUserActions(prev => ({ ...prev, thrustUsed: true }));
      }

      // Handle solar panel toggle
      if (KEYS.SOLAR_PANELS.includes(e.key)) {
        setGameState((prevState) => {
          if (prevState === null) return null;
          return {
            ...prevState,
            solarPanelsDeployed: !prevState.solarPanelsDeployed,
          };
        });
        setUserActions(prev => ({ ...prev, panelsDeployed: true }));
      }

      // Handle trajectory prediction toggle
      if (KEYS.TRAJECTORY.includes(e.key)) {
        setGameState((prevState) => {
          if (prevState === null) return null;
          return {
            ...prevState,
            showTrajectoryPrediction: !prevState.showTrajectoryPrediction,
          };
        });
        setUserActions(prev => ({ ...prev, trajectoryToggled: true }));
      }

      if (KEYS.CAMERA.includes(e.key)) {
        setCameraMode(prev => prev === 'earth' ? 'satellite' : 'earth');
        setUserActions(prev => ({ ...prev, cameraToggled: true }));
      }

      if (KEYS.ZOOM_IN.includes(e.key)) {
        setZoom(prev => Math.min(3.0, prev + 0.2));
        setUserActions(prev => ({ ...prev, zoomUsed: true }));
      }

      if (KEYS.ZOOM_OUT.includes(e.key)) {
        setZoom(prev => Math.max(0.5, prev - 0.2));
        setUserActions(prev => ({ ...prev, zoomUsed: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (KEYS.UP.includes(e.key)) thrustInputsRef.current.up = false;
      if (KEYS.DOWN.includes(e.key)) thrustInputsRef.current.down = false;
      if (KEYS.LEFT.includes(e.key)) thrustInputsRef.current.left = false;
      if (KEYS.RIGHT.includes(e.key)) thrustInputsRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop - only starts after images are loaded
  useEffect(() => {
    if (!imagesLoaded || !gameState) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const gameLoop = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const cappedDeltaTime = Math.min(deltaTime, 0.1);

      // Update game state using ref to get current state
      if (gameStateRef.current) {
        const newState = updateGameState(
          gameStateRef.current,
          thrustInputsRef.current,
          cappedDeltaTime,
          canvas.width,
          canvas.height
        );
        setGameState(newState);

        // Render using the new state
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

      requestIdRef.current = requestAnimationFrame(gameLoop);
    };

    requestIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestIdRef.current !== null) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [imagesLoaded, zoom, cameraMode]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      resetOrbit('Next step');
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!gameState) {
    return <div className="tutorial-screen">Loading tutorial...</div>;
  }

  return (
    <div className="tutorial-screen">
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className="game-canvas"
      />

      <div className="tutorial-overlay">
        <div className="tutorial-panel">
          <div className="tutorial-header">
            <span className="tutorial-progress">
              STEP {currentStep + 1} / {tutorialSteps.length}
            </span>
            <button className="tutorial-skip-button" onClick={handleSkip}>
              SKIP TUTORIAL
            </button>
          </div>

          <h2 className="tutorial-title">{currentTutorialStep.title}</h2>
          <p className="tutorial-description">{currentTutorialStep.description}</p>

          {currentTutorialStep.condition && !currentTutorialStep.condition(gameState, userActions) && (
            <div className="tutorial-waiting">
              <span className="tutorial-waiting-text">Complete the action to continue...</span>
            </div>
          )}

          {(!currentTutorialStep.condition || currentTutorialStep.condition(gameState, userActions)) && (
            <button className="tutorial-next-button" onClick={handleNext}>
              {currentStep < tutorialSteps.length - 1 ? 'NEXT' : 'START MISSION'}
            </button>
          )}
        </div>
      </div>

      {/* HUD similar to game screen */}
      <div className="tutorial-hud">
        <div className="hud-section">
          <span className="hud-label">Debris</span>
          <span className="hud-value">
            {gameState.orbs.filter(o => o.collected).length} / {gameState.orbs.length}
          </span>
        </div>
        <div className="hud-section">
          <span className="hud-label">Battery</span>
          <span className="hud-value">{Math.floor(gameState.satellite.battery)}%</span>
        </div>
      </div>

      {/* Notification for orbit reset */}
      {notification && (
        <div className="tutorial-notification">
          {notification}
        </div>
      )}
    </div>
  );
};

export default TutorialScreen;
