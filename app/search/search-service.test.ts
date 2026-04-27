import { findRelease } from './search-service';
import { Condition, ConditionValues, DiscogsMaster, DiscogsPaginatedSearchResult, DiscogsRatingResponse } from '@/types/discogs';

jest.mock('@/libs/discogs');
jest.mock('@/libs/wiki');
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

import { searchDiscogs, getDiscogsMasterRelease, getPriceSuggestion, getRating } from '@/libs/discogs';
import { searchWiki, getWikiSummary } from '@/libs/wiki';
import { revalidatePath } from 'next/cache';

const mockSearchDiscogs = searchDiscogs as jest.MockedFunction<typeof searchDiscogs>;
const mockGetDiscogsMasterRelease = getDiscogsMasterRelease as jest.MockedFunction<typeof getDiscogsMasterRelease>;
const mockGetPriceSuggestion = getPriceSuggestion as jest.MockedFunction<typeof getPriceSuggestion>;
const mockGetRating = getRating as jest.MockedFunction<typeof getRating>;
const mockSearchWiki = searchWiki as jest.MockedFunction<typeof searchWiki>;
const mockGetWikiSummary = getWikiSummary as jest.MockedFunction<typeof getWikiSummary>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;

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

const mockMaster: DiscogsMaster = {
  id: 1001,
  main_release: 5001,
  most_recent_release: 5002,
  resource_url: 'https://api.discogs.com/masters/1001',
  uri: '/masters/1001',
  versions_url: 'https://api.discogs.com/masters/1001/versions',
  main_release_url: 'https://api.discogs.com/releases/5001',
  most_recent_release_url: 'https://api.discogs.com/releases/5002',
  num_for_sale: 42,
  lowest_price: 9.99,
  images: [{ type: 'primary', uri: 'https://img.discogs.com/cover.jpg', resource_url: '', uri150: '', width: 600, height: 600 }],
  genres: ['Rock', 'Pop'],
  styles: ['Indie Rock', 'Alternative'],
  year: 1991,
  tracklist: [
    { position: 'A1', type_: 'track', title: 'Track One', extraartists: [], duration: '3:45' },
    { position: 'A2', type_: 'track', title: 'Track Two', extraartists: [], duration: '4:00' },
    { position: 'B1', type_: 'track', title: 'Track Three', extraartists: [], duration: '3:30' },
  ],
  artists: [
    { name: 'Artist A', anv: '', join: '', role: '', tracks: '', id: 101, resource_url: '', thumbnail_url: '' },
    { name: 'Artist B', anv: '', join: '', role: '', tracks: '', id: 102, resource_url: '', thumbnail_url: '' },
  ],
  title: 'Test Album',
  data_quality: 'Correct',
  videos: [],
};

const mockSearchResult: DiscogsPaginatedSearchResult = {
  pagination: { page: 1, pages: 1, per_page: 10, items: 1, urls: {} },
  results: [
    {
      country: 'US', year: '1991', format: ['Vinyl'], label: ['Test Label'], type: 'release',
      genre: ['Rock'], style: ['Indie'], id: 9001, barcode: [], user_data: { in_wantlist: false, in_collection: false },
      master_id: 1001, master_url: '', uri: '', catno: '', title: 'Test Album - Artist A',
      thumb: '', cover_image: '', resource_url: '', community: { want: 0, have: 0 },
      format_quantity: 1, formats: [],
    },
  ],
};

const mockRating: DiscogsRatingResponse = { rating: { count: 250, average: 4.5 } };

const mockWikiSearch = { results: [{ title: 'Test Album (album)' }] };
const mockWikiSummary = { extract: 'A great album.' };

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchDiscogs.mockResolvedValue(mockSearchResult);
  mockGetDiscogsMasterRelease.mockResolvedValue(mockMaster);
  mockGetPriceSuggestion.mockResolvedValue(mockConditionValues);
  mockGetRating.mockResolvedValue(mockRating);
  mockSearchWiki.mockResolvedValue(mockWikiSearch as any);
  mockGetWikiSummary.mockResolvedValue(mockWikiSummary as any);
});

describe('findRelease', () => {
  it('returns fully populated ReleaseData on happy path', async () => {
    const result = await findRelease('Test Album Artist A');

    expect(result.title).toBe('Test Album');
    expect(result.year).toBe(1991);
    expect(result.image).toBe('https://img.discogs.com/cover.jpg');
    expect(result.originalPriceSuggestion).toBe(mockConditionValues);
    expect(result.summary).toBe('A great album.');
    expect(result.rating).toEqual({ count: 250, average: 4.5 });
    expect(result.noForSale).toBe(42);
  });

  it('passes the raw query string to searchDiscogs', async () => {
    await findRelease('Test Album Artist A');

    expect(mockSearchDiscogs).toHaveBeenCalledWith('Test Album Artist A', expect.any(String), expect.any(String));
  });

  it('concatenates discogs genres and styles into genres', async () => {
    const result = await findRelease('Test Album Artist A');

    expect(result.genres).toEqual(['Rock', 'Pop', 'Indie Rock', 'Alternative']);
  });

  it('maps artist objects to an array of name strings', async () => {
    const result = await findRelease('Test Album Artist A');

    expect(result.artists).toEqual(['Artist A', 'Artist B']);
  });

  it('derives track count from the tracklist length', async () => {
    const result = await findRelease('Test Album Artist A');

    expect(result.noOfTracks).toBe(3);
  });

  it('throws when Discogs search returns no results', async () => {
    mockSearchDiscogs.mockResolvedValueOnce({ ...mockSearchResult, results: [] });

    await expect(findRelease('Unknown Nobody')).rejects.toThrow('No releases found');
  });

  it('throws when no search result has a master_id', async () => {
    const noMasterResult = { ...mockSearchResult, results: [{ ...mockSearchResult.results[0], master_id: 0 }] };
    mockSearchDiscogs.mockResolvedValueOnce(noMasterResult);

    await expect(findRelease('Test Album Artist A')).rejects.toThrow('No valid master ID found in search results');
  });

  it('sets originalPriceSuggestion to null and skips getPriceSuggestion when main_release is falsy', async () => {
    mockGetDiscogsMasterRelease.mockResolvedValueOnce({ ...mockMaster, main_release: 0 });

    const result = await findRelease('Test Album Artist A');

    expect(mockGetPriceSuggestion).not.toHaveBeenCalled();
    expect(result.originalPriceSuggestion).toBeNull();
  });

  it('sets rating count and average to null when rating is missing from response', async () => {
    mockGetRating.mockResolvedValueOnce({} as DiscogsRatingResponse);

    const result = await findRelease('Test Album Artist A');

    expect(result.rating).toEqual({ count: null, average: null });
  });

  it('sets image to null when the master release has no images', async () => {
    mockGetDiscogsMasterRelease.mockResolvedValueOnce({ ...mockMaster, images: [] });

    const result = await findRelease('Test Album Artist A');

    expect(result.image).toBeNull();
  });

  it('sets summary to null when Wikipedia returns no results', async () => {
    mockSearchWiki.mockResolvedValueOnce({ results: [] } as any);

    const result = await findRelease('Test Album Artist A');

    expect(result.summary).toBeNull();
    expect(mockGetWikiSummary).not.toHaveBeenCalled();
  });

  it('sets summary to null when searchWiki throws', async () => {
    mockSearchWiki.mockRejectedValueOnce(new Error('wiki credentials error'));

    const result = await findRelease('Test Album Artist A');

    expect(result.summary).toBeNull();
  });

  it('sets summary to null when getWikiSummary throws', async () => {
    mockGetWikiSummary.mockRejectedValueOnce(new Error('wiki summary error'));

    const result = await findRelease('Test Album Artist A');

    expect(result.summary).toBeNull();
  });

  it('calls revalidatePath("/") on success', async () => {
    await findRelease('Test Album Artist A');

    expect(mockRevalidatePath).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/');
  });
});
