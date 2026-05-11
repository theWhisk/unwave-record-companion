import { handleCameraCapture } from './CameraButton';
import { findRelease, ReleaseData } from '@/app/search/search-service';
import { Condition } from '@/types/discogs';

jest.mock('@/app/search/search-service', () => ({ findRelease: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('./resize-image', () => ({
  resizeImage: jest.fn().mockResolvedValue(new Blob(['tiny'], { type: 'image/jpeg' })),
}));

const mockFindRelease = findRelease as jest.MockedFunction<typeof findRelease>;

const MOCK_RELEASE: ReleaseData = {
  image: 'https://example.com/cover.jpg',
  title: 'The Dark Side of the Moon',
  artists: ['Pink Floyd'],
  year: 1973,
  noOfTracks: 10,
  noForSale: 42,
  originalPriceSuggestion: null,
  latestPriceSuggestion: 0,
  genres: ['Rock'],
  summary: 'A classic album.',
  rating: { count: 1000, average: 4.9 },
};

function makeFile(size = 1024, type = 'image/jpeg'): File {
  return new File([new ArrayBuffer(size)], 'cover.jpg', { type });
}

let onRecordSearch: jest.Mock;
let setLoading: jest.Mock;
let setError: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  onRecordSearch = jest.fn();
  setLoading = jest.fn();
  setError = jest.fn();

  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ query: 'Pink Floyd - The Dark Side of the Moon', condition: 'Very Good (VG)' }),
  } as Response);

  mockFindRelease.mockResolvedValue(MOCK_RELEASE);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('handleCameraCapture', () => {
  it('returns immediately without fetching when file is undefined', async () => {
    await handleCameraCapture(undefined, onRecordSearch, setLoading, setError);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(setLoading).not.toHaveBeenCalled();
  });

  it('returns immediately without fetching when file is null', async () => {
    await handleCameraCapture(null, onRecordSearch, setLoading, setError);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(setLoading).not.toHaveBeenCalled();
  });

  it('sets "too large" error and skips fetch when file exceeds 50 MB', async () => {
    const bigFile = makeFile(52_428_801);

    await handleCameraCapture(bigFile, onRecordSearch, setLoading, setError);

    expect(setError).toHaveBeenCalledWith(expect.stringContaining('too large'));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('compresses image via resizeImage before uploading', async () => {
    const { resizeImage } = await import('./resize-image');

    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(resizeImage).toHaveBeenCalledWith(expect.any(File));
  });

  it('POSTs to /api/identify with FormData containing image field', async () => {
    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/identify',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const body = init.body as FormData;
    expect(body.get('image')).toBeInstanceOf(File);
  });

  it('calls setLoading(true) at start and setLoading(false) at end on success', async () => {
    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(setLoading.mock.calls[0]).toEqual([true]);
    expect(setLoading.mock.calls[setLoading.mock.calls.length - 1]).toEqual([false]);
  });

  it('calls setLoading(false) after a fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it('sets error and skips findRelease when API returns query "UNKNOWN"', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ query: 'UNKNOWN', condition: null }),
    } as Response);

    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(setError).toHaveBeenCalledWith(expect.stringContaining("Couldn't identify"));
    expect(mockFindRelease).not.toHaveBeenCalled();
  });

  it('sets "Network error" and skips findRelease when fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(setError).toHaveBeenCalledWith(expect.stringContaining('Network error'));
    expect(mockFindRelease).not.toHaveBeenCalled();
  });

  it('sets error and skips findRelease when response.ok is false', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);

    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(setError).toHaveBeenCalled();
    expect(mockFindRelease).not.toHaveBeenCalled();
  });

  it('sets error and skips findRelease when response body contains { error }', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ error: 'Something went wrong' }),
    } as Response);

    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(setError).toHaveBeenCalled();
    expect(mockFindRelease).not.toHaveBeenCalled();
  });

  it('calls findRelease with the query returned by the identify API', async () => {
    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(mockFindRelease).toHaveBeenCalledWith('Pink Floyd - The Dark Side of the Moon');
  });

  it('calls onRecordSearch with ReleaseData and parsed Condition when condition is valid', async () => {
    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(onRecordSearch).toHaveBeenCalledWith(MOCK_RELEASE, Condition.VeryGood);
  });

  it('calls onRecordSearch with null condition when API returns null condition', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ query: 'Pink Floyd - The Dark Side of the Moon', condition: null }),
    } as Response);

    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(onRecordSearch).toHaveBeenCalledWith(MOCK_RELEASE, null);
  });

  it('calls onRecordSearch with null condition when API returns unrecognised condition string', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ query: 'Pink Floyd - The Dark Side of the Moon', condition: 'Excellent' }),
    } as Response);

    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(onRecordSearch).toHaveBeenCalledWith(MOCK_RELEASE, null);
  });

  it('calls onRecordSearch with null condition when condition field is missing from API response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ query: 'Pink Floyd - The Dark Side of the Moon' }),
    } as Response);

    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(onRecordSearch).toHaveBeenCalledWith(MOCK_RELEASE, null);
  });

  it("sets \"Couldn't find this record\" error and skips onRecordSearch when findRelease throws", async () => {
    mockFindRelease.mockRejectedValueOnce(new Error('Not found'));

    await handleCameraCapture(makeFile(), onRecordSearch, setLoading, setError);

    expect(setError).toHaveBeenCalledWith(expect.stringContaining("Couldn't find this record"));
    expect(onRecordSearch).not.toHaveBeenCalled();
  });
});
