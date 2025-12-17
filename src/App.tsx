import React, { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import TutorialScreen from './components/TutorialScreen';
import './App.css';

type Screen = 'home' | 'game' | 'tutorial' | 'end';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [finalScore, setFinalScore] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);

  const handleStartGame = () => {
    setCurrentScreen('game');
  };

  const handleStartTutorial = () => {
    setCurrentScreen('tutorial');
  };

  const handleGameEnd = (score: number, won: boolean) => {
    setFinalScore(score);
    setGameWon(won);
    setCurrentScreen('end');
  };

  const handleRestart = () => {
    setCurrentScreen('game');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('home');
  };

  return (
    <div className="App">
      {currentScreen === 'home' && (
        <HomeScreen onStart={handleStartGame} onStartTutorial={handleStartTutorial} />
      )}
      {currentScreen === 'game' && <GameScreen onGameEnd={handleGameEnd} />}
      {currentScreen === 'tutorial' && <TutorialScreen onComplete={handleBackToMenu} />}
      {currentScreen === 'end' && (
        <EndScreen
          score={finalScore}
          won={gameWon}
          onRestart={handleRestart}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
}

export default App;
