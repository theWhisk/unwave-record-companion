jest.mock('wikipedia', () => ({
  __esModule: true,
  default: {
    summary: jest.fn(),
    search: jest.fn(),
  },
}));

import wiki from 'wikipedia';
import { getWikiSummary, searchWiki } from './wiki';

const mockWiki = wiki as jest.Mocked<typeof wiki>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getWikiSummary', () => {
  it('returns the summary from wikipedia', async () => {
    const mockSummary = { extract: 'A great album about life on the road.' };
    mockWiki.summary.mockResolvedValueOnce(mockSummary as any);

    const result = await getWikiSummary('Abbey Road');

    expect(result).toEqual(mockSummary);
    expect(mockWiki.summary).toHaveBeenCalledWith('Abbey Road');
  });

  it('rethrows as "Error searching Wikipedia" when wiki.summary throws', async () => {
    mockWiki.summary.mockRejectedValueOnce(new Error('page not found'));

    await expect(getWikiSummary('Nonexistent Album')).rejects.toThrow('Error searching Wikipedia');
  });
});

describe('searchWiki', () => {
  it('returns search results from wikipedia', async () => {
    const mockResults = { results: [{ title: 'Abbey Road (album)', pageid: 1 }] };
    mockWiki.search.mockResolvedValueOnce(mockResults as any);

    const result = await searchWiki('Abbey Road Beatles');

    expect(result).toEqual(mockResults);
    expect(mockWiki.search).toHaveBeenCalledWith('Abbey Road Beatles');
  });

  it('rethrows as "Error searching Wikipedia" when wiki.search throws', async () => {
    mockWiki.search.mockRejectedValueOnce(new Error('network failure'));

    await expect(searchWiki('Abbey Road Beatles')).rejects.toThrow('Error searching Wikipedia');
  });
});
