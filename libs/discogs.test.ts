import { getDiscogsMasterRelease, searchDiscogs, getPriceSuggestion, getRating } from './discogs';

beforeEach(() => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: jest.fn().mockResolvedValue({}),
  } as any);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getDiscogsMasterRelease', () => {
  it('returns the parsed JSON response', async () => {
    const mockMaster = { id: 42, title: 'Test Master' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockMaster),
    });

    const result = await getDiscogsMasterRelease(42);

    expect(result).toEqual(mockMaster);
  });

  it('constructs the URL with the correct master ID', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce({}) });

    await getDiscogsMasterRelease(9999);

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/masters/9999');
  });
});

describe('searchDiscogs', () => {
  it('returns the parsed JSON response', async () => {
    const mockResults = { results: [], pagination: { page: 1, pages: 1, per_page: 10, items: 0, urls: {} } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResults),
    });

    const result = await searchDiscogs('Beatles', 'Abbey Road', 'release', 'vinyl');

    expect(result).toEqual(mockResults);
  });

  it('encodes title and artist as query parameters in the request URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce({}) });

    await searchDiscogs('Beatles', 'Abbey Road', 'release', 'vinyl');

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    const params = new URL(calledUrl).searchParams;
    expect(params.get('artist')).toBe('Beatles');
    expect(params.get('title')).toBe('Abbey Road');
  });

  it('rethrows as "Error searching Discogs" when fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network error'));

    await expect(searchDiscogs('Artist', 'Title', 'release', 'vinyl')).rejects.toThrow('Error searching Discogs');
  });
});

describe('getPriceSuggestion', () => {
  it('throws "No Discogs ID provided" when id is falsy', async () => {
    await expect(getPriceSuggestion(0)).rejects.toThrow('No Discogs ID provided');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns the parsed JSON response', async () => {
    const mockData = { 'Mint (M)': { currency: 'USD', value: 50 } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockData),
    });

    const result = await getPriceSuggestion(123);

    expect(result).toEqual(mockData);
  });

  it('rethrows as "Error getting price suggestion" when fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network error'));

    await expect(getPriceSuggestion(123)).rejects.toThrow('Error getting price suggestion');
  });
});

describe('getRating', () => {
  it('throws "No Discogs ID provided" when id is falsy', async () => {
    await expect(getRating(0)).rejects.toThrow('No Discogs ID provided');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns the parsed JSON response', async () => {
    const mockData = { rating: { count: 100, average: 4.2 } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockData),
    });

    const result = await getRating(456);

    expect(result).toEqual(mockData);
  });

  it('rethrows as "Error getting rating" when fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network error'));

    await expect(getRating(456)).rejects.toThrow('Error getting rating');
  });
});
