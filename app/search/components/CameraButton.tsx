'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/solid';
import { findRelease, ReleaseData } from '@/app/search/search-service';

const MAX_FILE_SIZE = 10_485_760;

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
    const formData = new FormData();
    formData.append('image', file);

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
        className="btn btn-primary flex items-center justify-center"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? (
          <span className="loading loading-spinner" />
        ) : (
          <CameraIcon className="h-5 w-5" />
        )}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
