import React, { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import './App.css';

type Screen = 'home' | 'game' | 'end';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [finalScore, setFinalScore] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);

  const handleStartGame = () => {
    setCurrentScreen('game');
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
      {currentScreen === 'home' && <HomeScreen onStart={handleStartGame} />}
      {currentScreen === 'game' && <GameScreen onGameEnd={handleGameEnd} />}
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
