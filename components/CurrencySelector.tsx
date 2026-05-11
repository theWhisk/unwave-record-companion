import { Currency } from "@/types/currency";
import React from "react";

interface CurrencySelectorProps {
  onCurrencyChange: (_currency: Currency) => void;
  selectStyle?: React.CSSProperties;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ onCurrencyChange, selectStyle }) => {
  const [selectedCurrency, setSelectedCurrency] = React.useState<Currency>(Currency.EUR);

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as Currency;
    if (value) {
      setSelectedCurrency(value);
      onCurrencyChange(value);
    }
  };

  return (
    <select
      value={selectedCurrency}
      onChange={handleCurrencyChange}
      style={{ maxWidth: '100%', ...selectStyle }}
    >
      {Object.values(Currency).map((currency) => (
        <option key={currency} value={currency}>{currency}</option>
      ))}
    </select>
  );
};
