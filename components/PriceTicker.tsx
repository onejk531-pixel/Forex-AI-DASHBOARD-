import React from 'react';
import type { CurrencyPair } from '../types';
import Card from './Card';

interface PriceTickerProps {
    currentPrice: number;
    prevPrice: number;
    pair: CurrencyPair;
}

const PriceTicker: React.FC<PriceTickerProps> = ({ currentPrice, prevPrice, pair }) => {
    const priceChange = currentPrice - prevPrice;
    const priceChangePercent = prevPrice !== 0 ? (priceChange / prevPrice) * 100 : 0;
    const isUp = priceChange >= 0;

    const colorClass = isUp ? 'text-accent-green' : 'text-accent-red';
    const arrow = isUp ? '▲' : '▼';

    return (
        <Card>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-text-secondary">{pair.name} Current Price</p>
                    <p className="text-3xl font-bold text-text-primary">{currentPrice.toFixed(5)}</p>
                </div>
                <div className={`text-right ${colorClass}`}>
                    <p className="font-semibold">{arrow} {priceChange.toFixed(5)}</p>
                    <p className="text-sm">({priceChangePercent.toFixed(3)}%)</p>
                </div>
            </div>
        </Card>
    );
};

export default PriceTicker;