import React from 'react';
import './HomeScreen.css';

interface HomeScreenProps {
  onStart: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  return (
    <div className="home-screen">
      <div className="stars-background"></div>
      <div className="home-content">
        <h1 className="game-title">ORBITAL RESCUE</h1>
        <div className="subtitle">A Satellite Space Adventure</div>

        <div className="instructions">
          <h2>Mission Briefing</h2>
          <p>
            Your satellite must collect all energy orbs while maintaining orbit around
            the planet. Use thrusters wisely - fuel is limited!
          </p>

          <div className="controls-section">
            <h3>Controls</h3>
            <div className="control-grid">
              <div className="control-item">
                <div className="key-display">↑ / W</div>
                <div className="control-desc">Thrust Up</div>
              </div>
              <div className="control-item">
                <div className="key-display">↓ / S</div>
                <div className="control-desc">Thrust Down</div>
              </div>
              <div className="control-item">
                <div className="key-display">← / A</div>
                <div className="control-desc">Thrust Left</div>
              </div>
              <div className="control-item">
                <div className="key-display">→ / D</div>
                <div className="control-desc">Thrust Right</div>
              </div>
              <div className="control-item">
                <div className="key-display">SPACE</div>
                <div className="control-desc">Pause/Resume</div>
              </div>
            </div>
          </div>

          <div className="objectives-section">
            <h3>Objectives</h3>
            <ul>
              <li>Collect all 8 energy orbs</li>
              <li>Avoid crashing into the planet</li>
              <li>Stay within the play area</li>
              <li>Conserve fuel for bonus points</li>
            </ul>
          </div>
        </div>

        <button className="start-button" onClick={onStart}>
          BEGIN MISSION
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
