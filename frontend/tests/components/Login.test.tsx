import React from 'react';
import { it, expect, describe, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Login from '../../src/components/login/Login';

const mockGoogleLogin = vi.fn();
const mockOnLogin = vi.fn();

vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: vi.fn(() => mockGoogleLogin)
}));

global.fetch = vi.fn();

describe('Login', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render login page with correct elements', () => {
    render(<Login onLogin={mockOnLogin} />);
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Startup Network Finder');

    const loginButton = screen.getByRole('button', { name: /sign in/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('should call Google login function when button is clicked', () => {
    render(<Login onLogin={mockOnLogin} />);
    const loginButton = screen.getByRole('button', { name: /sign in /i });
    fireEvent.click(loginButton);
    expect(mockGoogleLogin).toHaveBeenCalled();
  });
});