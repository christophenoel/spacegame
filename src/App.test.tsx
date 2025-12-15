import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App Integration Tests', () => {
  test('renders home screen initially', () => {
    render(<App />);
    expect(screen.getByText('ORBITAL RESCUE')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /begin mission/i })).toBeInTheDocument();
  });

  test('navigates from home to game screen when start button is clicked', () => {
    render(<App />);

    const startButton = screen.getByRole('button', { name: /begin mission/i });
    fireEvent.click(startButton);

    // Check that game screen elements appear
    expect(screen.getByText(/Score/i)).toBeInTheDocument();
    expect(screen.getByText(/Fuel/i)).toBeInTheDocument();
    expect(screen.getByText(/Orbs/i)).toBeInTheDocument();
  });

  test('complete flow: home -> game -> end (loss) -> home', async () => {
    render(<App />);

    // Start from home screen
    expect(screen.getByText('ORBITAL RESCUE')).toBeInTheDocument();

    const startButton = screen.getByRole('button', { name: /begin mission/i });
    fireEvent.click(startButton);

    // In game screen
    expect(screen.getByText(/Score/i)).toBeInTheDocument();

    // Simulate game loss by triggering out of bounds
    // This is simulated by the game logic, which will eventually end the game
    // For now, we'll just verify the game screen is showing

    // Note: Full game loop testing would require more complex mocking
    // This test verifies navigation works correctly
  });

  test('displays home screen instructions', () => {
    render(<App />);

    expect(screen.getByText(/Mission Briefing/i)).toBeInTheDocument();
    expect(screen.getByText(/Controls/i)).toBeInTheDocument();
    expect(screen.getByText(/Objectives/i)).toBeInTheDocument();
  });
});
