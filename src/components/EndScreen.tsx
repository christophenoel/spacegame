import React from 'react';
import './EndScreen.css';

interface EndScreenProps {
  score: number;
  won: boolean;
  onRestart: () => void;
  onBackToMenu: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ score, won, onRestart, onBackToMenu }) => {
  return (
    <div
      className="end-screen"
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/space-background.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="end-content">
        <div className={`result-header ${won ? 'victory' : 'defeat'}`}>
          {won ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
        </div>

        <div className="result-message">
          {won ? (
            <>
              <p>Outstanding! All debris collected and Earth's orbit is 0.0001% cleaner.</p>
              <p>Spacebel management is moderately impressed. You might even get a bonus... someday.</p>
            </>
          ) : (
            <>
              <p>Well, this is awkward. You became part of the debris problem.</p>
              <p>Spacebel's insurance department has been notified. Please try again before they send the bill.</p>
            </>
          )}
        </div>

        <div className="score-display">
          <div className="score-label">Final Score</div>
          <div className="score-value">{score}</div>
        </div>

        <div className="score-breakdown">
          {won && (
            <div className="breakdown-note">
              Score includes bonus points for fuel efficiency
            </div>
          )}
        </div>

        <div className="end-buttons">
          <button className="retry-button" onClick={onRestart}>
            RETRY MISSION
          </button>
          <button className="menu-button" onClick={onBackToMenu}>
            BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndScreen;
