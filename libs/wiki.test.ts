jest.mock('wikipedia', () => ({
  __esModule: true,
  default: {
    summary: jest.fn(),
    search: jest.fn(),
  },
}));

jest.mock('@/libs/axiom-logger', () => ({ log: { error: jest.fn(), info: jest.fn() }, flushAxiom: jest.fn() }));

import wiki from 'wikipedia';
import { log } from '@/libs/axiom-logger';
import { getWikiSummary, searchWiki } from './wiki';

const mockWiki = wiki as jest.Mocked<typeof wiki>;
const mockLog = log as any;

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

  it('logs the error with log.error when wiki.summary throws', async () => {
    const err = new Error('page not found');
    mockWiki.summary.mockRejectedValueOnce(err);

    await expect(getWikiSummary('Nonexistent Album')).rejects.toThrow();
    expect(mockLog.error).toHaveBeenCalledWith('wiki summary lookup failed', expect.objectContaining({
      error: { name: err.name, message: err.message, cause: undefined },
    }));
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

  it('logs the error with log.error when wiki.search throws', async () => {
    const err = new Error('network failure');
    mockWiki.search.mockRejectedValueOnce(err);

    await expect(searchWiki('Abbey Road Beatles')).rejects.toThrow();
    expect(mockLog.error).toHaveBeenCalledWith('wiki search failed', expect.objectContaining({
      error: { name: err.name, message: err.message, cause: undefined },
    }));
  });
});
