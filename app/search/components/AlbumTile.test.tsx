/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import AlbumTile from './AlbumTile';
import { Condition, ConditionValues } from '@/types/discogs';
import { Currency } from '@/types/currency';
import { ReleaseData } from '@/app/search/search-service';

jest.mock('@/app/currency-provider', () => ({
  useCurrency: jest.fn(),
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ alt }: { alt: string }) {
    return <img alt={alt} />; // eslint-disable-line @next/next/no-img-element
  },
}));
jest.mock('@/components/StarRating', () => ({
  __esModule: true,
  default: function StarRating(): null { return null; },
}));

import { useCurrency } from '@/app/currency-provider';

const MOCK_CONDITIONS: ConditionValues = {
  [Condition.Mint]: { currency: 'USD', value: 50 },
  [Condition.NearMint]: { currency: 'USD', value: 40 },
  [Condition.VeryGoodPlus]: { currency: 'USD', value: 30 },
  [Condition.VeryGood]: { currency: 'USD', value: 20 },
  [Condition.GoodPlus]: { currency: 'USD', value: 15 },
  [Condition.Good]: { currency: 'USD', value: 10 },
  [Condition.Fair]: { currency: 'USD', value: 5 },
  [Condition.Poor]: { currency: 'USD', value: 1 },
};

const MOCK_RELEASE: ReleaseData = {
  image: 'https://example.com/cover.jpg',
  title: 'The Dark Side of the Moon',
  artists: ['Pink Floyd'],
  year: 1973,
  noOfTracks: 10,
  noForSale: 42,
  originalPriceSuggestion: MOCK_CONDITIONS,
  latestPriceSuggestion: 0,
  genres: ['Rock'],
  summary: null,
  rating: { count: 1000, average: 4.9 },
};

beforeEach(() => {
  (useCurrency as jest.Mock).mockReturnValue({
    rates: { USD: 1, EUR: 0.9 },
    loading: false,
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('AlbumTile', () => {
  it('defaults condition slider to VG+ when no estimatedCondition is provided', () => {
    render(<AlbumTile findRecordResponse={MOCK_RELEASE} selectedCurrency={Currency.USD} />);
    // VG+ value = 30, USD rate = 1 → $30
    expect(screen.getByText('$30')).toBeInTheDocument();
  });

  it('positions condition slider at estimated condition when estimatedCondition is provided', () => {
    render(<AlbumTile findRecordResponse={MOCK_RELEASE} selectedCurrency={Currency.USD} estimatedCondition={Condition.VeryGood} />);
    // VeryGood value = 20, USD rate = 1 → $20
    expect(screen.getByText('$20')).toBeInTheDocument();
  });

  it('defaults condition slider to VG+ when estimatedCondition is null', () => {
    render(<AlbumTile findRecordResponse={MOCK_RELEASE} selectedCurrency={Currency.USD} estimatedCondition={null} />);
    // VG+ value = 30, USD rate = 1 → $30
    expect(screen.getByText('$30')).toBeInTheDocument();
  });

  it('renders no condition slider when originalPriceSuggestion is null', () => {
    const releaseNoPrice = { ...MOCK_RELEASE, originalPriceSuggestion: null } as unknown as ReleaseData;
    render(<AlbumTile findRecordResponse={releaseNoPrice} selectedCurrency={Currency.USD} />);
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });
});
