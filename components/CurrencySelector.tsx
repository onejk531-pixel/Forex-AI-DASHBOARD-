
import React from 'react';
import type { CurrencyPair } from '../types';
import { CURRENCY_PAIRS } from '../constants';
import Card from './Card';

interface CurrencySelectorProps {
    selectedPair: CurrencyPair;
    setSelectedPair: (pair: CurrencyPair) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ selectedPair, setSelectedPair }) => {
    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const pair = CURRENCY_PAIRS.find(p => p.name === event.target.value);
        if (pair) {
            setSelectedPair(pair);
        }
    };
    
    return (
        <Card>
            <label htmlFor="currency-select" className="block text-sm font-medium text-text-secondary mb-2">
                Currency Pair
            </label>
            <div className="relative">
                <select
                    id="currency-select"
                    value={selectedPair.name}
                    onChange={handleSelect}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-accent-blue appearance-none"
                >
                    {CURRENCY_PAIRS.map(pair => (
                        <option key={pair.name} value={pair.name}>
                            {pair.icon} {pair.name}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </Card>
    );
};

export default CurrencySelector;
