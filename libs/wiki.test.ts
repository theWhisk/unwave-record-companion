jest.mock('@/libs/axiom-logger', () => ({ log: { error: jest.fn(), info: jest.fn() }, flushAxiom: jest.fn() }));

import { log } from '@/libs/axiom-logger';
import { getWikiSummary, searchWiki } from './wiki';

const mockLog = log as any;

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe('searchWiki', () => {
  it('returns search results from the Wikipedia API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ query: { search: [{ title: 'Abbey Road (album)' }] } }),
    });

    const result = await searchWiki('Abbey Road Beatles');

    expect(result).toEqual({ results: [{ title: 'Abbey Road (album)' }] });
  });

  it('returns empty results when query field is absent', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ query: {} }),
    });

    const result = await searchWiki('no results query');

    expect(result).toEqual({ results: [] });
  });

  it('rethrows as "Error searching Wikipedia" when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 403 });

    await expect(searchWiki('Abbey Road Beatles')).rejects.toThrow('Error searching Wikipedia');
  });

  it('logs the error with log.error when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 403 });

    await expect(searchWiki('Abbey Road Beatles')).rejects.toThrow();
    expect(mockLog.error).toHaveBeenCalledWith('wiki search failed', expect.objectContaining({
      error: expect.objectContaining({ message: 'HTTP 403' }),
    }));
  });
});

describe('getWikiSummary', () => {
  it('returns the extract from the Wikipedia REST API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ extract: 'A great album about life on the road.' }),
    });

    const result = await getWikiSummary('Abbey Road (album)');

    expect(result).toEqual({ extract: 'A great album about life on the road.' });
  });

  it('rethrows as "Error searching Wikipedia" when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });

    await expect(getWikiSummary('Nonexistent Album')).rejects.toThrow('Error searching Wikipedia');
  });

  it('logs the error with log.error when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });

    await expect(getWikiSummary('Nonexistent Album')).rejects.toThrow();
    expect(mockLog.error).toHaveBeenCalledWith('wiki summary lookup failed', expect.objectContaining({
      error: expect.objectContaining({ message: 'HTTP 404' }),
    }));
  });
});
