'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { findRelease, ReleaseData } from '@/app/search/search-service';
import { Condition } from '@/types/discogs';
import { resizeImage } from './resize-image';

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

const MAX_FILE_SIZE = 52_428_800; // 50 MB — hard cap before canvas resize

const VALID_CONDITIONS = new Set<string>(Object.values(Condition));

function parseCondition(raw: string | null | undefined): Condition | null {
  if (!raw) return null;
  return VALID_CONDITIONS.has(raw) ? (raw as Condition) : null;
}

export async function handleCameraCapture(
  file: File | null | undefined,
  onRecordSearch: (_data: ReleaseData, _condition: Condition | null) => void,
  setLoading: (_loading: boolean) => void,
  setError: (_error: string) => void,
  onLoadingChange?: (_loading: boolean) => void,
) {
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    setError('Image is too large — try a closer shot');
    return;
  }

  setLoading(true);
  onLoadingChange?.(true);

  let query: string;
  let condition: Condition | null = null;
  try {
    const resized = await resizeImage(file);
    const compressed = new File([resized], file.name, { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', compressed);

    const res = await fetch('/api/identify', { method: 'POST', body: formData });

    if (!res.ok) {
      setError('Could not reach the server — try again');
      setLoading(false);
      onLoadingChange?.(false);
      return;
    }

    const body = await res.json();

    if (body.error) {
      setError('Could not reach the server — try again');
      setLoading(false);
      onLoadingChange?.(false);
      return;
    }

    query = body.query as string;
    condition = parseCondition(body.condition ?? null);
  } catch {
    setError('Network error — check your connection');
    setLoading(false);
    onLoadingChange?.(false);
    return;
  }

  if (query === 'UNKNOWN') {
    setError("Couldn't identify this cover — try better lighting or search manually");
    setLoading(false);
    onLoadingChange?.(false);
    return;
  }

  try {
    const data = await findRelease(query);
    onRecordSearch(data, condition);
  } catch {
    setError("Couldn't find this record in the database — try searching manually");
    setLoading(false);
    onLoadingChange?.(false);
    return;
  }

  setLoading(false);
  onLoadingChange?.(false);
}

interface CameraButtonProps {
  onRecordSearch: (_data: ReleaseData, _condition: Condition | null) => void;
  onLoadingChange?: (_loading: boolean) => void;
}

function CameraGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 8h3l2-2.5h6L17 8h3v11H4z" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  );
}

export default function CameraButton({ onRecordSearch, onLoadingChange }: CameraButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');
    handleCameraCapture(file, onRecordSearch, setLoading, setError, onLoadingChange);
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
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        style={{
          height: 52, background: 'var(--ink)', color: '#fff',
          boxShadow: 'none', border: 'none',
          fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em',
          textTransform: 'uppercase', cursor: loading ? 'default' : 'pointer',
          borderRadius: 2, opacity: loading ? 0.6 : 1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
      >
        <CameraGlyph />
        {loading ? 'Identifying cover…' : 'Scan a cover'}
      </button>
      <p className="hidden md:block text-xs text-center text-base-content/40 mt-1">
        Opens a file picker on desktop
      </p>
      {/* Loading skeleton retained for test coverage */}
      {loading && (
        <div className="animate-pulse" style={{ marginTop: 8 }}>
          <div style={{
            height: 6, background: 'var(--hairline)', borderRadius: 999,
            width: '60%', margin: '0 auto',
          }} />
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
