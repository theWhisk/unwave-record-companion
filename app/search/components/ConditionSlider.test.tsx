/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConditionSlider from './ConditionSlider';
import { Condition, ConditionValues } from '@/types/discogs';
import { Currency } from '@/types/currency';

jest.mock('@/app/currency-provider', () => ({
  useCurrency: jest.fn(),
}));

import { useCurrency } from '@/app/currency-provider';

const mockConditionValues: ConditionValues = {
  [Condition.Mint]: { currency: 'USD', value: 50 },
  [Condition.NearMint]: { currency: 'USD', value: 40 },
  [Condition.VeryGoodPlus]: { currency: 'USD', value: 30 },
  [Condition.VeryGood]: { currency: 'USD', value: 20 },
  [Condition.GoodPlus]: { currency: 'USD', value: 15 },
  [Condition.Good]: { currency: 'USD', value: 10 },
  [Condition.Fair]: { currency: 'USD', value: 5 },
  [Condition.Poor]: { currency: 'USD', value: 1 },
};

beforeEach(() => {
  (useCurrency as jest.Mock).mockReturnValue({
    rates: { USD: 1, GBP: 0.79 },
    loading: false,
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('ConditionSlider', () => {
  it('shows the VG+ price by default', () => {
    render(<ConditionSlider conditionValues={mockConditionValues} selectedCurrency={Currency.USD} />);
    expect(screen.getByText('$30')).toBeInTheDocument();
  });

  it('renders "Poor" label at the left end of the slider', () => {
    render(<ConditionSlider conditionValues={mockConditionValues} selectedCurrency={Currency.USD} />);
    expect(screen.getByText('Poor')).toBeInTheDocument();
  });

  it('renders "Mint" label at the right end of the slider', () => {
    render(<ConditionSlider conditionValues={mockConditionValues} selectedCurrency={Currency.USD} />);
    expect(screen.getByText('Mint')).toBeInTheDocument();
  });

  it('renders a "Condition" label above the slider', () => {
    render(<ConditionSlider conditionValues={mockConditionValues} selectedCurrency={Currency.USD} />);
    expect(screen.getByText('Condition')).toBeInTheDocument();
  });

  it('updates price when slider moves to index 0 (Poor)', () => {
    render(<ConditionSlider conditionValues={mockConditionValues} selectedCurrency={Currency.USD} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0' } });
    expect(screen.getByText('$1')).toBeInTheDocument();
  });

  it('updates price when slider moves to index 7 (Mint)', () => {
    render(<ConditionSlider conditionValues={mockConditionValues} selectedCurrency={Currency.USD} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '7' } });
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('applies currency conversion to the displayed price', () => {
    render(<ConditionSlider conditionValues={mockConditionValues} selectedCurrency={Currency.GBP} />);
    // VG+ value=30, GBP rate=0.79: Math.round(30 * 0.79) = 24
    expect(screen.getByText('£24')).toBeInTheDocument();
  });
});
