import type { ForexData, DetectedPattern } from '../types';

// --- Helper Functions ---
const isBearish = (candle: ForexData) => candle.close < candle.open;
const isBullish = (candle: ForexData) => candle.close > candle.open;
const body = (candle: ForexData) => Math.abs(candle.open - candle.close);
const upperWick = (candle: ForexData) => candle.high - Math.max(candle.open, candle.close);
const lowerWick = (candle: ForexData) => Math.min(candle.open, candle.close) - candle.low;
const isLongBody = (candle: ForexData, allCandles: ForexData[]) => {
    const avgBody = allCandles.slice(-10).reduce((acc, c) => acc + body(c), 0) / 10;
    return body(candle) > avgBody;
};
const isShortBody = (candle: ForexData, allCandles: ForexData[]) => {
    const avgBody = allCandles.slice(-10).reduce((acc, c) => acc + body(c), 0) / 10;
    return body(candle) < avgBody;
};
const isDownTrend = (candles: ForexData[]) => {
    return candles.length >= 3 && candles[0].high > candles[1].high && candles[1].high > candles[2].high;
};
const isUpTrend = (candles: ForexData[]) => {
    return candles.length >= 3 && candles[0].low < candles[1].low && candles[1].low < candles[2].low;
};

// --- Single & Double Candle Patterns ---
const isBullishEngulfing = (current: ForexData, previous: ForexData): boolean => {
    return isBearish(previous) && isBullish(current) &&
           current.open < previous.close && current.close > previous.open;
};
const isBearishEngulfing = (current: ForexData, previous: ForexData): boolean => {
    return isBullish(previous) && isBearish(current) &&
           current.open > previous.close && current.close < previous.open;
};
const isDoji = (candle: ForexData): boolean => {
    const totalHeight = candle.high - candle.low;
    return totalHeight > 0 && body(candle) / totalHeight < 0.1;
};
const isHammer = (candle: ForexData): boolean => {
    const b = body(candle);
    const lw = lowerWick(candle);
    const uw = upperWick(candle);
    return b > 0 && lw > b * 2 && uw < b * 0.5;
};
const isPiercingLine = (current: ForexData, previous: ForexData): boolean => {
    const previousMidpoint = previous.open - body(previous) / 2;
    return isBearish(previous) && isBullish(current) &&
           current.open < previous.low && current.close > previousMidpoint && current.close < previous.open;
};
const isDarkCloudCover = (current: ForexData, previous: ForexData): boolean => {
    const previousMidpoint = previous.open + body(previous) / 2;
    return isBullish(previous) && isBearish(current) &&
           current.open > previous.high && current.close < previousMidpoint && current.close > previous.open;
};

// --- Triple Candle Patterns ---
const isMorningStar = (c1: ForexData, c2: ForexData, c3: ForexData, allCandles: ForexData[]): boolean => {
    const thirdMidpoint = c1.open - body(c1) / 2;
    return isBearish(c1) && isLongBody(c1, allCandles) &&
           isShortBody(c2, allCandles) && c2.close < c1.close &&
           isBullish(c3) && c3.open > c2.close && c3.close > thirdMidpoint;
};
const isEveningStar = (c1: ForexData, c2: ForexData, c3: ForexData, allCandles: ForexData[]): boolean => {
    const thirdMidpoint = c1.open + body(c1) / 2;
    return isBullish(c1) && isLongBody(c1, allCandles) &&
           isShortBody(c2, allCandles) && c2.close > c1.close &&
           isBearish(c3) && c3.open < c2.close && c3.close < thirdMidpoint;
};
const isThreeWhiteSoldiers = (c1: ForexData, c2: ForexData, c3: ForexData, allCandles: ForexData[]): boolean => {
    return isBullish(c1) && isLongBody(c1, allCandles) && upperWick(c1) < body(c1) * 0.3 &&
           isBullish(c2) && isLongBody(c2, allCandles) && c2.open > c1.open && c2.close > c1.close && upperWick(c2) < body(c2) * 0.3 &&
           isBullish(c3) && isLongBody(c3, allCandles) && c3.open > c2.open && c3.close > c2.close && upperWick(c3) < body(c3) * 0.3;
};
const isThreeBlackCrows = (c1: ForexData, c2: ForexData, c3: ForexData, allCandles: ForexData[]): boolean => {
    return isBearish(c1) && isLongBody(c1, allCandles) && lowerWick(c1) < body(c1) * 0.3 &&
           isBearish(c2) && isLongBody(c2, allCandles) && c2.open < c1.open && c2.close < c1.close && lowerWick(c2) < body(c2) * 0.3 &&
           isBearish(c3) && isLongBody(c3, allCandles) && c3.open < c2.open && c3.close < c2.close && lowerWick(c3) < body(c3) * 0.3;
};

// --- Main Detection Function ---
export const detectPatterns = (data: ForexData[]): DetectedPattern[] => {
    const patterns: DetectedPattern[] = [];
    if (data.length < 3) return patterns;

    for (let i = 2; i < data.length; i++) {
        const c3 = data[i];     // Current candle
        const c2 = data[i-1];   // Previous candle
        const c1 = data[i-2];   // Two candles ago
        
        // Simple patterns on the current candle (c3)
        if (isDoji(c3)) patterns.push({ time: c3.time, name: 'Doji', type: 'neutral' });
        if (isDownTrend(data.slice(i-3, i)) && isHammer(c3)) patterns.push({ time: c3.time, name: 'Hammer', type: 'bullish' });

        // Two-candle patterns using c2 and c3
        if (isDownTrend(data.slice(i-3, i)) && isBullishEngulfing(c3, c2)) patterns.push({ time: c3.time, name: 'Bullish Engulfing', type: 'bullish' });
        if (isUpTrend(data.slice(i-3, i)) && isBearishEngulfing(c3, c2)) patterns.push({ time: c3.time, name: 'Bearish Engulfing', type: 'bearish' });
        if (isDownTrend(data.slice(i-3, i)) && isPiercingLine(c3, c2)) patterns.push({ time: c3.time, name: 'Piercing Line', type: 'bullish' });
        if (isUpTrend(data.slice(i-3, i)) && isDarkCloudCover(c3, c2)) patterns.push({ time: c3.time, name: 'Dark Cloud Cover', type: 'bearish' });

        // Three-candle patterns using c1, c2, and c3
        if (isDownTrend(data.slice(i-4, i-1)) && isMorningStar(c1, c2, c3, data.slice(0, i+1))) patterns.push({ time: c3.time, name: 'Morning Star', type: 'bullish' });
        if (isUpTrend(data.slice(i-4, i-1)) && isEveningStar(c1, c2, c3, data.slice(0, i+1))) patterns.push({ time: c3.time, name: 'Evening Star', type: 'bearish' });
        if (isDownTrend(data.slice(i-4, i-1)) && isThreeWhiteSoldiers(c1, c2, c3, data.slice(0, i+1))) patterns.push({ time: c3.time, name: 'Three White Soldiers', type: 'bullish' });
        if (isUpTrend(data.slice(i-4, i-1)) && isThreeBlackCrows(c1, c2, c3, data.slice(0, i+1))) patterns.push({ time: c3.time, name: 'Three Black Crows', type: 'bearish' });
    }
    
    return patterns;
};