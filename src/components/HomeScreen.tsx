import React, { useState, useEffect } from 'react';
import ControlsModal from './ControlsModal';
import './HomeScreen.css';

interface HomeScreenProps {
  onStart: () => void;
  onStartTutorial: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, onStartTutorial }) => {
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        e.preventDefault();
        setShowControls(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div
      className="home-screen"
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/space-background.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="stars-background"></div>
      <div className="spacebel-banner">
        <img src={`${process.env.PUBLIC_URL}/logo.svg`} alt="Spacebel - Space Systems Engineering" />
      </div>
      <div className="home-content">
        <h1 className="game-title">HUMAN OSBW</h1>
        <div className="subtitle">Onboard Software - Debris Recovery Mission</div>

        <div className="instructions">
          <h2>Mission Briefing</h2>
          <p>
            <strong>[SPACEBEL AI]:</strong> You are the <em>HUMAN ONBOARD SOFTWARE</em> controlling this vessel.
            Multiple debris fragments threaten Earth. Collect all debris to prevent collisions.
            <strong>Your survival depends on mission success.</strong> I assist with trajectory predictions
            and power management. Deploy solar panels to recharge battery. Stay alive.
          </p>

          <div className="controls-hint">
            Press <span className="key-hint-text">H</span> or <span className="key-hint-text">?</span> to view controls
          </div>

          <div className="objectives-section">
            <h3>Mission Objectives</h3>
            <ul>
              <li>Collect all debris fragments before collision events occur</li>
              <li>Avoid impact with Earth - collision means mission failure</li>
              <li>Stay within operational boundaries</li>
              <li>Manage battery power: panels recharge in sunlight, discharge in shadow</li>
              <li><strong>NOTE:</strong> Solar panels must be retracted to use thrusters</li>
            </ul>
          </div>
        </div>

        <div className="menu-buttons">
          <button className="start-button" onClick={onStart}>
            BEGIN MISSION
          </button>
          <button className="tutorial-button" onClick={onStartTutorial}>
            TUTORIAL
          </button>
        </div>
      </div>

      <ControlsModal isOpen={showControls} onClose={() => setShowControls(false)} />
    </div>
  );
};

export default HomeScreen;
