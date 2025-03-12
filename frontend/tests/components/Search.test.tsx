import React from 'react';
import { it, expect, describe, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// vi.mock('../../src/components/search/Search.css', () => ({}));

const TEST_API_URL = 'http://test-api.com';

vi.mock('import.meta.env', () => ({
  VITE_BACKEND_URL: TEST_API_URL,
}));

import Search from '../../src/components/search/Search';

global.fetch = vi.fn();

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Search Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('email', 'test@example.com');
    localStorage.setItem('userToken', 'test-token');
    fetch.mockResolvedValueOnce({
      json: async () => ({ code: 200, data:10 })
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should render search form with correct elements', async () => {
    render(<Search />);
    await waitFor(() => {
      expect(screen.getByText(/Credits/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Find Investors & Mentors/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Describe your startup and what you're looking for.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('should display credits correctly from the custom hook', async () => {
    render(<Search />);
    await waitFor(() => {
      expect(screen.getByText('Credits: 10')).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    const firstFetchCall = fetch.mock.calls[0];
    expect(firstFetchCall[0]).toContain('/user/credits');
    expect(firstFetchCall[1]).toEqual({
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
  });

  it('should handle credits fetch error', async () => {
    fetch.mockReset();
    fetch.mockResolvedValueOnce({
      json: async () => 
        ({ code:400, 
            message:"Failed to fetch credits" 
        })
    });
    render(<Search />);
    await waitFor(() => {
        expect(screen.getByText('Credits: 0')).toBeInTheDocument();
    });
  });

  it('should disable search button when query is empty', async () => {
    render(<Search />);
    await waitFor(() => {
      expect(screen.getByText(/Credits:/)).toBeInTheDocument();
    });
    const searchButton = screen.getByRole('button', { name: 'Search' });
    expect(searchButton).toBeDisabled();
  });

  it('should enable search button when query has content', async () => {
    render(<Search />);
    await waitFor(() => {
      expect(screen.getByText(/Credits:/)).toBeInTheDocument();
    });
    const textarea = screen.getByPlaceholderText("Describe your startup and what you're looking for...");
    fireEvent.change(textarea, { target: { value: 'My startup query' } });
    const searchButton = screen.getByRole('button', { name: 'Search' });
    expect(searchButton).not.toBeDisabled();
  });

  it('should handle successful search and display results', async () => {
    render(<Search />);
    await waitFor(() => {
      expect(screen.getByText(/Credits:/)).toBeInTheDocument();
    });
    fetch.mockReset();
    fetch.mockResolvedValueOnce({
      json: async () => ({
        code: 200,
        data: [{ text: '["Ria"]' }]
      })
    });
    
    fetch.mockResolvedValueOnce({
      json: async () => ({ code: 200, data: 9 })
    });
    const textarea = screen.getByPlaceholderText("Describe your startup and what you're looking for...");
    fireEvent.change(textarea, { target: { value: 'My startup query' } });
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);
    
    expect(screen.getByRole('button', { name: 'Searching...' })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Suggested Contacts:')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Ria')).toBeInTheDocument();
    
    expect(screen.getByText('Credits: 9')).toBeInTheDocument();
    
    expect(fetch).toHaveBeenCalledTimes(2);
    
    const searchCall = fetch.mock.calls[0];
    expect(searchCall[0]).toContain('/user/send-query');
    expect(searchCall[1]).toEqual({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ 
        query: 'My startup query', 
        email: 'test@example.com' 
      }),
    });
    
    const creditsCall = fetch.mock.calls[1];
    expect(creditsCall[0]).toContain('/user/credits');
  });

  it('should handle API error response', async () => {
    render(<Search />);
    await waitFor(() => {
      expect(screen.getByText(/Credits:/)).toBeInTheDocument();
    });
    fetch.mockReset();
    fetch.mockResolvedValueOnce({
      json: async () => ({
        code: 400,
        message: 'Invalid request'
      })
    });
    const textarea = screen.getByPlaceholderText("Describe your startup and what you're looking for...");
    fireEvent.change(textarea, { target: { value: 'My startup query' } });
    
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid request')).toBeInTheDocument();
    });
  });

  it('should handle credits exhausted error and refresh credits', async () => {
    render(<Search />);
    
    await waitFor(() => {
      expect(screen.getByText(/Credits:/)).toBeInTheDocument();
    });
    
    fetch.mockReset();
    fetch.mockResolvedValueOnce({
      json: async () => ({
        code: 400,
        message: 'Your credits are exhausted'
      })
    });
    
    fetch.mockResolvedValueOnce({
      json: async () => ({ code: 200, data: 0 })
    });
    
    const textarea = screen.getByPlaceholderText("Describe your startup and what you're looking for...");
    fireEvent.change(textarea, { target: { value: 'My startup query' } });
    
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('Your credits are exhausted')).toBeInTheDocument();
      expect(screen.getByText('Credits: 0')).toBeInTheDocument();
    });
  });
});