const MOCK_TEXT_BLOCK = { type: 'text', text: 'Pink Floyd - The Dark Side of the Moon' };

let mockCreate: jest.Mock;

function makeRequest(file?: File): Request {
  const formData = new FormData();
  if (file) formData.append('image', file);
  return new Request('http://localhost/api/identify', { method: 'POST', body: formData });
}

function makeFile(type = 'image/jpeg', size = 1024): File {
  return new File([new ArrayBuffer(size)], 'cover.jpg', { type });
}

beforeEach(() => {
  jest.resetModules();
  process.env.ANTHROPIC_API_KEY = 'test-key';
  mockCreate = jest.fn().mockResolvedValue({ content: [MOCK_TEXT_BLOCK] });
  jest.doMock('@anthropic-ai/sdk', () => ({
    __esModule: true,
    default: jest.fn(() => ({ messages: { create: mockCreate } })),
  }));
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('POST /api/identify', () => {
  it('returns 200 and { query } when Claude identifies the album', async () => {
    const { POST } = await import('./route');
    const res = await POST(makeRequest(makeFile()));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ query: 'Pink Floyd - The Dark Side of the Moon' });
  });

  it('trims whitespace from Claude response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '  Pink Floyd - The Dark Side of the Moon  \n' }],
    });

    const { POST } = await import('./route');
    const res = await POST(makeRequest(makeFile()));

    expect(await res.json()).toEqual({ query: 'Pink Floyd - The Dark Side of the Moon' });
  });

  it('calls Anthropic with model claude-haiku-4-5 and base64 image source', async () => {
    const { POST } = await import('./route');
    await POST(makeRequest(makeFile()));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-haiku-4-5',
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.arrayContaining([
              expect.objectContaining({ type: 'image', source: expect.objectContaining({ type: 'base64' }) }),
            ]),
          }),
        ]),
      }),
    );
  });

  it('includes cache_control ephemeral on the system prompt block', async () => {
    const { POST } = await import('./route');
    await POST(makeRequest(makeFile()));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.arrayContaining([
          expect.objectContaining({ cache_control: { type: 'ephemeral' } }),
        ]),
      }),
    );
  });

  it('returns 200 + { query: "UNKNOWN" } when Claude returns "UNKNOWN"', async () => {
    mockCreate.mockResolvedValueOnce({ content: [{ type: 'text', text: 'UNKNOWN' }] });

    const { POST } = await import('./route');
    const res = await POST(makeRequest(makeFile()));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ query: 'UNKNOWN' });
  });

  it('returns 200 + { query: "UNKNOWN" } when Claude response has no text block', async () => {
    mockCreate.mockResolvedValueOnce({ content: [] });

    const { POST } = await import('./route');
    const res = await POST(makeRequest(makeFile()));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ query: 'UNKNOWN' });
  });

  it('returns 400 when no image field in FormData', async () => {
    const { POST } = await import('./route');
    const formData = new FormData();
    formData.append('other', 'value');
    const req = new Request('http://localhost/api/identify', { method: 'POST', body: formData });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when FormData is empty', async () => {
    const { POST } = await import('./route');
    const res = await POST(makeRequest());

    expect(res.status).toBe(400);
  });

  it('returns 500 when Anthropic SDK throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API error'));

    const { POST } = await import('./route');
    const res = await POST(makeRequest(makeFile()));

    expect(res.status).toBe(500);
  });

  it('calls console.error on Anthropic SDK failure', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API error'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { POST } = await import('./route');
    await POST(makeRequest(makeFile()));

    expect(spy).toHaveBeenCalled();
  });

  it('passes media_type image/png through when file type is PNG', async () => {
    const { POST } = await import('./route');
    await POST(makeRequest(makeFile('image/png')));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.arrayContaining([
              expect.objectContaining({
                source: expect.objectContaining({ media_type: 'image/png' }),
              }),
            ]),
          }),
        ]),
      }),
    );
  });
});
