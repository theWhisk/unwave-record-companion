'use client'

import React, { useState } from 'react';
import { Condition, ConditionValues } from '@/types/discogs';
import { Currency, currencyOptions } from '@/types/currency';
import { useCurrency } from '@/app/currency-provider';
import { staatliches } from '@/styles/fonts';

const CONDITIONS = [
    { condition: Condition.Poor,         label: 'Poor' },
    { condition: Condition.Fair,         label: 'Fair' },
    { condition: Condition.Good,         label: 'Good' },
    { condition: Condition.GoodPlus,     label: 'Good+' },
    { condition: Condition.VeryGood,     label: 'Very Good' },
    { condition: Condition.VeryGoodPlus, label: 'Very Good+' },
    { condition: Condition.NearMint,     label: 'Near Mint' },
    { condition: Condition.Mint,         label: 'Mint' },
];

const DEFAULT_INDEX = 5; // Very Good+

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

interface ConditionSliderProps {
    conditionValues: ConditionValues | null;
    selectedCurrency: Currency;
}

export default function ConditionSlider({ conditionValues, selectedCurrency }: ConditionSliderProps) {
    const [selectedIndex, setSelectedIndex] = useState(DEFAULT_INDEX);
    const { rates } = useCurrency();

    if (!conditionValues) return null;

    const selected = CONDITIONS[selectedIndex];
    const rawPrice = conditionValues[selected.condition].value;
    const convertedPrice = Math.round(rawPrice * rates[selectedCurrency]);
    const symbol = currencyOptions[selectedCurrency].symbol;
    const pct = (selectedIndex / (CONDITIONS.length - 1)) * 100;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <div style={{
                    fontFamily: MONO,
                    fontSize: 10, letterSpacing: '0.16em',
                    textTransform: 'uppercase', color: 'var(--muted)',
                }}>Condition</div>
                <div style={{
                    fontFamily: staatliches.style.fontFamily,
                    fontSize: 24, lineHeight: 1,
                    color: 'var(--clay)', fontVariantNumeric: 'tabular-nums',
                }}>{symbol}{convertedPrice}</div>
            </div>
            <input
                type="range"
                min={0}
                max={CONDITIONS.length - 1}
                step={1}
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="cm-range"
                style={{ '--cm-fill': `${pct}%` } as React.CSSProperties}
                aria-label="Condition"
            />
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontFamily: MONO,
                fontSize: 9, letterSpacing: '0.14em',
                color: 'var(--muted)', textTransform: 'uppercase',
            }}>
                <span>Poor</span>
                <span>Mint</span>
            </div>
        </div>
    );
}
