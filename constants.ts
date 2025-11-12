import { CurrencyPair, PatternName } from './types';

export enum SignalType {
    BUY = 'BUY',
    SELL = 'SELL',
    HOLD = 'HOLD',
}

export const CURRENCY_PAIRS: CurrencyPair[] = [
    { name: 'EUR/USD', icon: '🇪🇺/🇺🇸' },
    { name: 'USD/JPY', icon: '🇺🇸/🇯🇵' },
    { name: 'GBP/USD', icon: '🇬🇧/🇺🇸' },
    { name: 'USD/CHF', icon: '🇺🇸/🇨🇭' },
    { name: 'AUD/USD', icon: '🇦🇺/🇺🇸' },
];

export const ALL_PATTERNS: { name: PatternName; type: 'bullish' | 'bearish' | 'neutral' }[] = [
    { name: 'Bullish Engulfing', type: 'bullish' },
    { name: 'Bearish Engulfing', type: 'bearish' },
    { name: 'Doji', type: 'neutral' },
    { name: 'Hammer', type: 'bullish' },
    { name: 'Morning Star', type: 'bullish' },
    { name: 'Evening Star', type: 'bearish' },
    { name: 'Piercing Line', type: 'bullish' },
    { name: 'Dark Cloud Cover', type: 'bearish' },
    { name: 'Three White Soldiers', type: 'bullish' },
    { name: 'Three Black Crows', type: 'bearish' },
];