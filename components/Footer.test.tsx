/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders the Unwave wordmark', () => {
    render(<Footer />);
    expect(screen.getAllByText('Unwave').length).toBeGreaterThan(0);
  });

  it('renders the Network label', () => {
    render(<Footer />);
    expect(screen.getByText('Network')).toBeInTheDocument();
  });

  it('renders a Terms of service link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
  });

  it('renders a Privacy policy link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
  });

  it('renders a Crate Mole tools link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /crate mole/i })).toBeInTheDocument();
  });
});
