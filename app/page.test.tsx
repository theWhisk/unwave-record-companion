/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';

jest.mock('@/components/Header', () => () => <div />);
jest.mock('@/components/Footer', () => () => <div />);
jest.mock('@/app/search/search-service', () => ({ findRelease: jest.fn() }));
jest.mock('@/app/search/components/AlbumTile', () => () => <div />);
jest.mock('@/components/CurrencySelector', () => ({ CurrencySelector: () => <div /> }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('Home page', () => {
  it('renders the camera "Scan a cover" button', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /scan a cover/i })).toBeInTheDocument();
  });

  it('renders the album search text input', () => {
    render(<Home />);
    expect(screen.getByLabelText(/album search/i)).toBeInTheDocument();
  });
});
