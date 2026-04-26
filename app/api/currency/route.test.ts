const MOCK_RATES = { USD: 1, EUR: 0.9, GBP: 0.78 };

beforeEach(() => {
  jest.resetModules();
  process.env.EXCHANGE_RATE_API_KEY = 'test-key';
  process.env.EXCHANGE_RATE_CACHE_DURATION = '86400000';
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: () => Promise.resolve({ conversion_rates: MOCK_RATES }),
  } as any);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('GET /api/currency', () => {
  it('fetches rates from the external API when cache is empty and returns them', async () => {
    const { GET } = await import('./route');

    const response = await GET(new Request('http://localhost/api/currency'));

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(MOCK_RATES);
  });

  it('returns cached rates without re-fetching on a subsequent call within cache duration', async () => {
    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/currency');

    await GET(req);
    await GET(req);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('re-fetches from the API when the cache has expired', async () => {
    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/currency');

    const t0 = 1_000_000;
    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(t0)
      .mockReturnValueOnce(t0 + 86_400_001);

    await GET(req);
    await GET(req);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('returns a 500 response when the exchange rate API throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network error'));
    const { GET } = await import('./route');

    const response = await GET(new Request('http://localhost/api/currency'));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('Failed to fetch exchange rates');
  });
});
