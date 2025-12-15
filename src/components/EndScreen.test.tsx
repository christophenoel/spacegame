import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EndScreen from './EndScreen';

describe('EndScreen', () => {
  test('renders victory message when won', () => {
    const mockOnRestart = jest.fn();
    const mockOnBackToMenu = jest.fn();

    render(
      <EndScreen
        score={1500}
        won={true}
        onRestart={mockOnRestart}
        onBackToMenu={mockOnBackToMenu}
      />
    );

    expect(screen.getByText('MISSION ACCOMPLISHED')).toBeInTheDocument();
    expect(screen.getByText(/Outstanding work/i)).toBeInTheDocument();
  });

  test('renders defeat message when lost', () => {
    const mockOnRestart = jest.fn();
    const mockOnBackToMenu = jest.fn();

    render(
      <EndScreen
        score={300}
        won={false}
        onRestart={mockOnRestart}
        onBackToMenu={mockOnBackToMenu}
      />
    );

    expect(screen.getByText('MISSION FAILED')).toBeInTheDocument();
    expect(screen.getByText(/Mission terminated/i)).toBeInTheDocument();
  });

  test('displays final score', () => {
    const mockOnRestart = jest.fn();
    const mockOnBackToMenu = jest.fn();

    render(
      <EndScreen
        score={1234}
        won={true}
        onRestart={mockOnRestart}
        onBackToMenu={mockOnBackToMenu}
      />
    );

    expect(screen.getByText('Final Score')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  test('shows fuel efficiency bonus note when won', () => {
    const mockOnRestart = jest.fn();
    const mockOnBackToMenu = jest.fn();

    render(
      <EndScreen
        score={1500}
        won={true}
        onRestart={mockOnRestart}
        onBackToMenu={mockOnBackToMenu}
      />
    );

    expect(screen.getByText(/fuel efficiency/i)).toBeInTheDocument();
  });

  test('does not show fuel efficiency bonus note when lost', () => {
    const mockOnRestart = jest.fn();
    const mockOnBackToMenu = jest.fn();

    render(
      <EndScreen
        score={300}
        won={false}
        onRestart={mockOnRestart}
        onBackToMenu={mockOnBackToMenu}
      />
    );

    expect(screen.queryByText(/fuel efficiency/i)).not.toBeInTheDocument();
  });

  test('renders retry button', () => {
    const mockOnRestart = jest.fn();
    const mockOnBackToMenu = jest.fn();

    render(
      <EndScreen
        score={1000}
        won={true}
        onRestart={mockOnRestart}
        onBackToMenu={mockOnBackToMenu}
      />
    );

    expect(screen.getByRole('button', { name: /retry mission/i })).toBeInTheDocument();
  });

  test('renders back to menu button', () => {
    const mockOnRestart = jest.fn();
    const mockOnBackToMenu = jest.fn();

    render(
      <EndScreen
        score={1000}
        won={true}
        onRestart={mockOnRestart}
        onBackToMenu={mockOnBackToMenu}
      />
    );

    expect(screen.getByRole('button', { name: /back to menu/i })).toBeInTheDocument();
  });

  test('calls onRestart when retry button is clicked', () => {
    const mockOnRestart = jest.fn();
    const mockOnBackToMenu = jest.fn();

    render(
      <EndScreen
        score={1000}
        won={true}
        onRestart={mockOnRestart}
        onBackToMenu={mockOnBackToMenu}
      />
    );

    const retryButton = screen.getByRole('button', { name: /retry mission/i });
    fireEvent.click(retryButton);

    expect(mockOnRestart).toHaveBeenCalledTimes(1);
  });

  test('calls onBackToMenu when back to menu button is clicked', () => {
    const mockOnRestart = jest.fn();
    const mockOnBackToMenu = jest.fn();

    render(
      <EndScreen
        score={1000}
        won={true}
        onRestart={mockOnRestart}
        onBackToMenu={mockOnBackToMenu}
      />
    );

    const menuButton = screen.getByRole('button', { name: /back to menu/i });
    fireEvent.click(menuButton);

    expect(mockOnBackToMenu).toHaveBeenCalledTimes(1);
  });
});
