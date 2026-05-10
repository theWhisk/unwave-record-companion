import React from 'react';

interface StarRatingProps {
    count: number;
    average: number;
}

function StarSvg({ size, color }: { size: number; color: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden={true}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
        </svg>
    );
}

const StarRating: React.FC<StarRatingProps> = ({ count, average }) => {
    if (!count) {
        return <span style={{ fontSize: 12, color: 'var(--muted)' }}>No reviews</span>;
    }

    const size = 14;
    const rounded = Math.min(5, Math.max(0, Math.round(average * 2) / 2));

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <div
                style={{ display: 'inline-flex', gap: 1 }}
                aria-label={`${average} out of 5`}
                role="img"
            >
                {[0, 1, 2, 3, 4].map(i => {
                    const fill = Math.max(0, Math.min(1, rounded - i));
                    return (
                        <span
                            key={i}
                            style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}
                        >
                            <StarSvg size={size} color="#dcd6c8" />
                            <span style={{
                                position: 'absolute', left: 0, top: 0,
                                width: `${fill * 100}%`, height: '100%', overflow: 'hidden',
                            }}>
                                <StarSvg size={size} color="var(--star)" />
                            </span>
                        </span>
                    );
                })}
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                {average.toFixed(1)}{' '}
                <span style={{ opacity: 0.65 }}>· {count.toLocaleString()}</span>
            </span>
        </div>
    );
};

export default StarRating;
