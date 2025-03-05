import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders delivery app', () => {
  render(<App />);
  const linkElement = screen.getByText(/delivery/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders without crashing', () => {
  render(<App />);
  expect(document.body).toBeInTheDocument();
});
