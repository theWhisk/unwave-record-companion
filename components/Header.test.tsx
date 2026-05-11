/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders the Unwave wordmark', () => {
    render(<Header />);
    expect(screen.getByText('Unwave')).toBeInTheDocument();
  });

  it('renders the Network label', () => {
    render(<Header />);
    expect(screen.getByText('Network')).toBeInTheDocument();
  });

  it('renders a Tools navigation link', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /tools/i })).toBeInTheDocument();
  });

  it('renders an About navigation link', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
  });
});
