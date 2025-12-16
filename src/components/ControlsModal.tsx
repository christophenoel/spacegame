import React, { useEffect } from 'react';
import './ControlsModal.css';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isOpen && (e.key === 'Escape' || e.key === 'h' || e.key === 'H' || e.key === '?')) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="controls-modal-overlay" onClick={onClose}>
      <div className="controls-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="controls-modal-header">
          <h2>Controls</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="controls-modal-body">
          <h3 className="controls-section-title">Basic Controls</h3>
          <div className="control-grid-modal">
            <div className="control-item-modal">
              <span className="key-compact">↑/W</span>
              <span className="control-desc-compact">Thrust Forward</span>
            </div>
            <div className="control-item-modal">
              <span className="key-compact">↓/S</span>
              <span className="control-desc-compact">Thrust Backward</span>
            </div>
            <div className="control-item-modal">
              <span className="key-compact">←/A</span>
              <span className="control-desc-compact">Thrust Left</span>
            </div>
            <div className="control-item-modal">
              <span className="key-compact">→/D</span>
              <span className="control-desc-compact">Thrust Right</span>
            </div>
            <div className="control-item-modal">
              <span className="key-compact">P</span>
              <span className="control-desc-compact">Deploy/Retract Solar Panels</span>
            </div>
            <div className="control-item-modal">
              <span className="key-compact">SPACE</span>
              <span className="control-desc-compact">Pause/Resume</span>
            </div>
          </div>

          <h3 className="controls-section-title">Advanced Controls</h3>
          <div className="control-grid-modal">
            <div className="control-item-modal">
              <span className="key-compact">T</span>
              <span className="control-desc-compact">Toggle Trajectory Line</span>
            </div>
            <div className="control-item-modal">
              <span className="key-compact">C</span>
              <span className="control-desc-compact">Toggle Camera Mode</span>
            </div>
            <div className="control-item-modal">
              <span className="key-compact">+</span>
              <span className="control-desc-compact">Zoom In</span>
            </div>
            <div className="control-item-modal">
              <span className="key-compact">-</span>
              <span className="control-desc-compact">Zoom Out</span>
            </div>
            <div className="control-item-modal">
              <span className="key-compact">H/?</span>
              <span className="control-desc-compact">Toggle Help</span>
            </div>
          </div>

          <div className="controls-footer">
            Press <span className="key-hint">ESC</span>, <span className="key-hint">H</span>, or <span className="key-hint">?</span> to close
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlsModal;
