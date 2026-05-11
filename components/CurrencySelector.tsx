import { Currency, currencyOptions } from "@/types/currency";
import React from "react";

interface CurrencySelectorProps {
    onCurrencyChange: (_currency: Currency) => void;
  }

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ onCurrencyChange }) => {
    const [selectedCurrency, setSelectedCurrency] = React.useState('USD'); // Default to USD
    
      const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrency = event.target.value as Currency;
        if (selectedCurrency) {
            setSelectedCurrency(selectedCurrency);
            onCurrencyChange(selectedCurrency);
        }
      };
    
      return (
        <select value={selectedCurrency} onChange={handleCurrencyChange} style={{ maxWidth: '100%' }}>
          {Object.values(Currency).map((currency) => (
            <option key={currency} value={currency}>
              {currencyOptions[currency].label} / {currencyOptions[currency].symbol}
            </option>
          ))}
        </select>
      );
}