'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/solid';
import { findRelease, ReleaseData } from '@/app/search/search-service';
import { resizeImage } from './resize-image';

const MAX_FILE_SIZE = 52_428_800; // 50 MB — hard cap before canvas resize

export async function handleCameraCapture(
  file: File | null | undefined,
  onRecordSearch: (data: ReleaseData) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string) => void,
) {
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    setError('Image is too large — try a closer shot');
    return;
  }

  setLoading(true);

  let query: string;
  try {
    const resized = await resizeImage(file);
    const compressed = new File([resized], file.name, { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', compressed);

    const res = await fetch('/api/identify', { method: 'POST', body: formData });

    if (!res.ok) {
      setError('Could not reach the server — try again');
      setLoading(false);
      return;
    }

    const body = await res.json();

    if (body.error) {
      setError('Could not reach the server — try again');
      setLoading(false);
      return;
    }

    query = body.query as string;
  } catch {
    setError('Network error — check your connection');
    setLoading(false);
    return;
  }

  if (query === 'UNKNOWN') {
    setError("Couldn't identify this cover — try better lighting or search manually");
    setLoading(false);
    return;
  }

  try {
    const data = await findRelease(query);
    onRecordSearch(data);
  } catch {
    setError("Couldn't find this record in the database — try searching manually");
    setLoading(false);
    return;
  }

  setLoading(false);
}

interface CameraButtonProps {
  onRecordSearch: (data: ReleaseData) => void;
}

export default function CameraButton({ onRecordSearch }: CameraButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');
    handleCameraCapture(file, onRecordSearch, setLoading, setError);
    e.target.value = '';
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        className="btn btn-primary w-full gap-2"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? <span className="loading loading-spinner" /> : <CameraIcon className="h-5 w-5" />}
        {loading ? 'Identifying cover…' : 'Scan a cover'}
      </button>
      <p className="hidden md:block text-xs text-center text-base-content/40 mt-1">
        Opens a file picker on desktop
      </p>
      {loading && (
        <div className="card bg-base-200 animate-pulse mt-2">
          <figure className="h-48 bg-base-300 rounded-t-2xl" />
          <div className="card-body gap-3">
            <div className="h-5 bg-base-300 rounded w-3/4" />
            <div className="h-4 bg-base-300 rounded w-1/2" />
            <div className="h-4 bg-base-300 rounded w-1/3" />
          </div>
        </div>
      )}
      {error && (
        <div role="alert" className="alert alert-error mt-2">
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
