/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import CameraButton from './CameraButton';

jest.mock('@/app/search/search-service', () => ({ findRelease: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

function makeFile(size = 1024): File {
  return new File([new ArrayBuffer(size)], 'cover.jpg', { type: 'image/jpeg' });
}

function getFileInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ query: 'Artist - Album' }),
  } as Response);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('CameraButton rendering', () => {
  it('renders a button with visible text label "Scan a cover"', () => {
    render(<CameraButton onRecordSearch={jest.fn()} />);
    expect(screen.getByRole('button', { name: /scan a cover/i })).toBeInTheDocument();
  });

  it('button has w-full class for full-width layout', () => {
    render(<CameraButton onRecordSearch={jest.fn()} />);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('renders a desktop hint about file picker', () => {
    render(<CameraButton onRecordSearch={jest.fn()} />);
    expect(screen.getByText(/opens a file picker on desktop/i)).toBeInTheDocument();
  });

  it('shows "Identifying cover…" label while loading', async () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));

    const { container } = render(<CameraButton onRecordSearch={jest.fn()} />);
    await act(async () => {
      fireEvent.change(getFileInput(container), { target: { files: [makeFile()] } });
    });

    expect(screen.getByRole('button', { name: /identifying cover/i })).toBeInTheDocument();
  });

  it('renders a loading skeleton while the pipeline is running', async () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}));

    const { container } = render(<CameraButton onRecordSearch={jest.fn()} />);
    await act(async () => {
      fireEvent.change(getFileInput(container), { target: { files: [makeFile()] } });
    });

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('displays error using a DaisyUI alert-error element, not a plain paragraph', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({}) } as Response);

    const { container } = render(<CameraButton onRecordSearch={jest.fn()} />);
    await act(async () => {
      fireEvent.change(getFileInput(container), { target: { files: [makeFile()] } });
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-error');
    expect(container.querySelector('p.text-red-500')).not.toBeInTheDocument();
  });
});
