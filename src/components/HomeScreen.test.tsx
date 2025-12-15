import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeScreen from './HomeScreen';

describe('HomeScreen', () => {
  test('renders game title', () => {
    const mockOnStart = jest.fn();
    render(<HomeScreen onStart={mockOnStart} />);

    expect(screen.getByText('ORBITAL RESCUE')).toBeInTheDocument();
  });

  test('renders mission briefing', () => {
    const mockOnStart = jest.fn();
    render(<HomeScreen onStart={mockOnStart} />);

    expect(screen.getByText('Mission Briefing')).toBeInTheDocument();
    expect(screen.getByText(/collect all energy orbs/i)).toBeInTheDocument();
  });

  test('renders control instructions', () => {
    const mockOnStart = jest.fn();
    render(<HomeScreen onStart={mockOnStart} />);

    expect(screen.getByText('Controls')).toBeInTheDocument();
    expect(screen.getByText('Thrust Up')).toBeInTheDocument();
    expect(screen.getByText('Thrust Down')).toBeInTheDocument();
    expect(screen.getByText('Thrust Left')).toBeInTheDocument();
    expect(screen.getByText('Thrust Right')).toBeInTheDocument();
    expect(screen.getByText('Pause/Resume')).toBeInTheDocument();
  });

  test('renders objectives', () => {
    const mockOnStart = jest.fn();
    render(<HomeScreen onStart={mockOnStart} />);

    expect(screen.getByText('Objectives')).toBeInTheDocument();
    expect(screen.getByText(/Collect all 8 energy orbs/i)).toBeInTheDocument();
    expect(screen.getByText(/Avoid crashing into the planet/i)).toBeInTheDocument();
  });

  test('renders start button', () => {
    const mockOnStart = jest.fn();
    render(<HomeScreen onStart={mockOnStart} />);

    const startButton = screen.getByRole('button', { name: /begin mission/i });
    expect(startButton).toBeInTheDocument();
  });

  test('calls onStart when start button is clicked', () => {
    const mockOnStart = jest.fn();
    render(<HomeScreen onStart={mockOnStart} />);

    const startButton = screen.getByRole('button', { name: /begin mission/i });
    fireEvent.click(startButton);

    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });
});
