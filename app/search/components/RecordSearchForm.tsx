'use client';

import { ReleaseData, findRelease } from '@/app/search/search-service';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

interface LookUpFormProps {
  onRecordSearch: (_data: ReleaseData) => void;
  onLoadingChange?: (_loading: boolean) => void;
}

interface FormData {
  term: string;
}

function SearchGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export default function LookUpForm({ onRecordSearch, onLoadingChange }: LookUpFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({ reValidateMode: 'onSubmit' });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!data.term.trim()) {
      setError('term', { type: 'manual', message: 'Search term is empty' });
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);
    try {
      const response = await findRelease(data.term.trim());
      onRecordSearch(response);
    } catch {
      setError('term', { type: 'manual', message: "Couldn't find release" });
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
        <input
          id="search"
          type="text"
          aria-label="Album search"
          placeholder="e.g. Rumours, or Abbey Road The Beatles"
          style={{
            flex: 1, minWidth: 0, height: 52, padding: '0 16px',
            fontFamily: 'var(--body)', fontSize: 16, color: 'var(--ink)',
            background: 'var(--bg)', border: 'none',
            boxShadow: 'inset 0 0 0 1px var(--hairline)',
            outline: 'none', borderRadius: 2,
          }}
          onFocus={(e) => { e.target.style.boxShadow = 'inset 0 0 0 1px var(--clay)'; }}
          onBlur={(e) => { e.target.style.boxShadow = 'inset 0 0 0 1px var(--hairline)'; }}
          {...register('term')}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            height: 52, padding: '0 22px',
            background: 'var(--clay)', color: '#fff', border: 'none',
            fontFamily: MONO, fontSize: 12, letterSpacing: '0.18em',
            textTransform: 'uppercase', cursor: loading ? 'default' : 'pointer',
            borderRadius: 2, opacity: loading ? 0.7 : 1,
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}
        >
          {loading ? (
            <span className="loading loading-spinner" style={{ width: 14, height: 14 }} />
          ) : (
            <>
              <SearchGlyph /> Find
            </>
          )}
        </button>
      </div>
      {errors.term && (
        <p style={{
          marginTop: 6, fontSize: 12, color: 'var(--clay)',
          fontFamily: MONO, letterSpacing: '0.08em',
        }}>
          {errors.term.message}
        </p>
      )}
    </form>
  );
}
