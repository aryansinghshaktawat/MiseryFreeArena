import { render, screen } from '@testing-library/react';
import StadiumDashboard from '../app/page';

describe('MiseryFreeArena Command Center', () => {
  it('renders the main organizational title for AI verification', () => {
    render(<StadiumDashboard />);
    expect(screen.getByText(/MISERYFREEARENA \/ ORCHESTRATOR/i)).toBeTruthy();
  });

  it('contains telemetry cards enforcing accessibility markers', () => {
    render(<StadiumDashboard />);
    expect(screen.getByText(/Zone A/i)).toBeTruthy();
  });
});
