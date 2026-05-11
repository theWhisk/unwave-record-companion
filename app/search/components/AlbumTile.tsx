'use client'

import React from 'react';
import Image from 'next/image';
import { ReleaseData } from '../search-service';
import StarRating from '@/components/StarRating';
import { Currency } from '@/types/currency';
import ConditionSlider from './ConditionSlider';
import { staatliches } from '@/styles/fonts';

interface AlbumTileProps {
    findRecordResponse: ReleaseData;
    selectedCurrency: Currency;
}

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'clay' }) {
    const base: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center',
        height: 24, padding: '0 10px',
        borderRadius: 999, fontSize: 12, letterSpacing: 0.1,
    };
    const toneStyle: React.CSSProperties = tone === 'clay'
        ? { background: 'var(--clay-soft)', color: 'var(--clay-ink)' }
        : { background: 'transparent', color: 'var(--ink)', boxShadow: 'inset 0 0 0 1px var(--hairline)' };
    return <span style={{ ...base, ...toneStyle }}>{children}</span>;
}

export default function AlbumTile({ findRecordResponse: data, selectedCurrency }: AlbumTileProps) {
    return (
        <div style={{
            borderRadius: 4, overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 1px 0 var(--hairline), 0 12px 28px -16px rgba(60,50,40,0.25)',
        }}>
            <div className="cm-tile-inner">
                {/* Cover art */}
                <div className="cm-tile-cover">
                    <Image
                        src={data.image}
                        alt={`Album art for ${data.title}`}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>

                {/* Right column */}
                <div className="cm-tile-info">
                    {/* Year · tracks meta */}
                    <div style={{
                        fontFamily: MONO, fontSize: 10,
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        color: 'var(--muted)',
                    }}>
                        {data.year} · {data.noOfTracks} tracks
                    </div>

                    {/* Title + artist */}
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontFamily: staatliches.style.fontFamily,
                            fontWeight: 400, fontSize: 32, lineHeight: 0.95, letterSpacing: 0.4,
                        }}>
                            {data.title}
                        </h2>
                        <div style={{ marginTop: 4, fontSize: 14, color: 'var(--dark)' }}>
                            {data.artists.join(', ')}
                        </div>
                    </div>

                    {/* Genre pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {data.genres.map((genre, i) => (
                            <Pill key={i} tone={i === 0 ? 'clay' : 'neutral'}>{genre}</Pill>
                        ))}
                    </div>

                    {/* Star rating */}
                    <StarRating average={data.rating.average} count={data.rating.count} />

                    {/* Compact condition slider */}
                    <ConditionSlider
                        conditionValues={data.originalPriceSuggestion}
                        selectedCurrency={selectedCurrency}
                    />
                </div>
            </div>

            {/* Wikipedia strip */}
            {data.summary && (
                <>
                    <div style={{ background: 'var(--hairline)', height: 1 }} />
                    <div style={{ padding: '16px 22px', background: 'var(--soft)' }}>
                        <div style={{
                            fontFamily: MONO, fontSize: 10,
                            letterSpacing: '0.18em', textTransform: 'uppercase',
                            color: 'var(--muted)', marginBottom: 8,
                        }}>From Wikipedia</div>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--dark)' }}>
                            {data.summary}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
