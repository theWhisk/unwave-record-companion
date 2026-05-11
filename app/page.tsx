'use client'

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AlbumTile from '@/app/search/components/AlbumTile';
import LookUpForm from '@/app/search/components/RecordSearchForm';
import CameraButton from '@/app/search/components/CameraButton';
import { ReleaseData } from '@/app/search/search-service';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Currency } from '@/types/currency';
import { staatliches } from '@/styles/fonts';

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

type ResultState = 'empty' | 'loading' | 'result';

function Hero() {
  return (
    <section style={{ padding: '40px 0 28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 10 }}>
        <span style={{
          fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'var(--clay)',
        }}>
          Unwave Network — Tool 01
        </span>
        <div style={{ flex: 1, background: 'var(--hairline)', height: 1 }} />
        <span style={{
          fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'var(--muted)',
        }}>
          v0.4 · Beta
        </span>
      </div>

      <h1 style={{
        margin: 0,
        fontFamily: staatliches.style.fontFamily,
        fontWeight: 400,
        fontSize: 'clamp(72px, 12vw, 132px)',
        lineHeight: 0.9,
        letterSpacing: '0.01em',
      }}>
        Crate Mole
      </h1>

      <div style={{ marginTop: 18, maxWidth: 620 }}>
        <p style={{
          margin: 0, fontSize: 17, lineHeight: 1.5, color: 'var(--dark)',
        }}>
          A quick read on any record in your hands — enough to decide whether to
          listen, ask, or move on. Built to get out of your way and back to the crates.
        </p>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div style={{
      background: '#fff',
      boxShadow: '0 1px 0 var(--hairline)',
      padding: '48px 32px', textAlign: 'center',
      overflow: 'hidden',
    }}>
      <span style={{
        fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: 'var(--muted)',
      }}>
        No record yet
      </span>
      <p style={{
        margin: '12px auto 0', maxWidth: 360, fontSize: 14,
        lineHeight: 1.55, color: 'var(--muted)',
      }}>
        Search a title, or point your camera at a sleeve. Results land here
        with pricing across condition, label history, and notes.
      </p>
      <div style={{
        marginTop: 22, display: 'flex', gap: 8, flexWrap: 'wrap',
        justifyContent: 'center', width: '100%',
      }}>
        {['Rumours', 'Kind of Blue', 'Songs in the Key of Life', 'Pet Sounds'].map(t => (
          <span key={t} style={{
            display: 'inline-flex', alignItems: 'center', height: 26,
            padding: '0 12px', borderRadius: 999, fontSize: 12,
            color: 'var(--dark)', background: 'var(--soft)',
          }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  const skel = (h: number, w: string): React.CSSProperties => ({
    height: h, width: w, background: 'var(--hairline)',
    borderRadius: 2,
    animation: 'cm-pulse 1.4s ease-in-out infinite',
  });

  return (
    <div style={{
      background: '#fff',
      boxShadow: '0 1px 0 var(--hairline)',
      padding: 22,
      display: 'grid', gridTemplateColumns: '200px 1fr', gap: 22,
      overflow: 'hidden',
    }}>
      <div style={{
        height: 200,
        background: 'repeating-linear-gradient(135deg, #eceae3 0 12px, #f1efe8 12px 24px)',
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{
          fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--clay)',
        }}>
          Looking up release…
        </span>
        <div style={skel(28, '60%')} />
        <div style={skel(14, '40%')} />
        <div style={{ background: 'var(--hairline)', height: 1, margin: '8px 0' }} />
        <div style={skel(16, '90%')} />
        <div style={skel(16, '80%')} />
        <div style={skel(16, '70%')} />
      </div>
    </div>
  );
}

export default function Home() {
  const [resultState, setResultState] = useState<ResultState>('empty');
  const [findRecordResponse, setRecordResponse] = useState<ReleaseData | undefined>();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(Currency.USD);

  const handleRecordSearch = (data: ReleaseData) => {
    setRecordResponse(data);
    setResultState('result');
  };

  const handleLoadingChange = (loading: boolean) => {
    if (loading) {
      setResultState('loading');
    } else if (resultState === 'loading') {
      setResultState('empty');
    }
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '0 32px 24px' }}>
        <Hero />

        <div className="cm-layout">
          <div className="cm-search-col">
            <section style={{
              background: '#fff',
              boxShadow: '0 1px 0 var(--hairline), 0 12px 28px -22px rgba(60,50,40,0.25)',
              padding: '28px 32px',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14,
              }}>
                <span style={{
                  fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: 'var(--muted)',
                }}>
                  Search · by title or artist
                </span>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px',
                  boxShadow: 'inset 0 0 0 1px var(--hairline)',
                  borderRadius: 2,
                  maxWidth: '100%',
                }}>
                  <span style={{
                    fontFamily: MONO, fontSize: 9, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: 'var(--muted)',
                    flexShrink: 0,
                  }}>
                    Currency
                  </span>
                  <CurrencySelector onCurrencyChange={setSelectedCurrency} />
                </div>
              </div>

              <LookUpForm
                onRecordSearch={handleRecordSearch}
                onLoadingChange={handleLoadingChange}
              />

              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0',
              }}>
                <div style={{ flex: 1, background: 'var(--hairline)', height: 1 }} />
                <span style={{
                  fontFamily: MONO, fontSize: 10, letterSpacing: '0.24em',
                  textTransform: 'uppercase', color: 'var(--muted)',
                }}>
                  or
                </span>
                <div style={{ flex: 1, background: 'var(--hairline)', height: 1 }} />
              </div>

              <CameraButton
                onRecordSearch={handleRecordSearch}
                onLoadingChange={handleLoadingChange}
              />
            </section>

            <div style={{
              marginTop: 14,
              fontFamily: MONO, fontSize: 10,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--muted)',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>Data · Discogs API</span>
              <span>Notes · Wikipedia</span>
            </div>
          </div>

          <div className="cm-result-col">
            {resultState === 'empty' && <EmptyState />}
            {resultState === 'loading' && <LoadingState />}
            {resultState === 'result' && findRecordResponse && (
              <AlbumTile
                findRecordResponse={findRecordResponse}
                selectedCurrency={selectedCurrency}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
