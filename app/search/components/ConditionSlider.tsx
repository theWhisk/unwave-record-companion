'use client'

import { useState } from 'react';
import { Condition, ConditionValues } from '@/types/discogs';
import { Currency, currencyOptions } from '@/types/currency';
import { useCurrency } from '@/app/currency-provider';

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

    return (
        <div className="flex flex-col items-center gap-2">
            <p className="text-center">
                <span className="text-lg font-bold">{symbol}{convertedPrice}</span>
                <br />
                <span className="text-xs text-gray-500">For an original copy</span>
            </p>
            <div className="flex w-full items-center gap-2">
                <span className="text-xs text-gray-500">Poor</span>
                <input
                    type="range"
                    min={0}
                    max={7}
                    step={1}
                    value={selectedIndex}
                    onChange={(e) => setSelectedIndex(Number(e.target.value))}
                    className="range range-xs flex-1"
                />
                <span className="text-xs text-gray-500">Mint</span>
            </div>
        </div>
    );
}
