import { SignalType } from './constants';
import { Time, LineStyle } from 'lightweight-charts';

export interface ForexData {
    time: Time;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface Prediction {
    time: number;
    price: number;
}

export interface Signal {
    type: SignalType;
    rationale: string;
}

export interface TradeHistoryItem {
    id: number;
    pair: string;
    time: string;
    price: number;
    signal: SignalType;
}

export interface CurrencyPair {
    name: string;
    icon: string;
}

export interface IndicatorSettings {
    enabled: boolean;
    period: number;
    color: string;
    lineStyle: LineStyle;
}

export interface TrendlinePoint {
    time: Time;
    price: number;
}

export interface Trendline {
    id: number;
    start: TrendlinePoint;
    end: TrendlinePoint;
}

export interface FibRetracement {
    id: number;
    start: TrendlinePoint;
    end: TrendlinePoint;
}

export interface GeminiSettings {
    temperature: number;
    historyLength: number;
}

export type PatternName = 
    | 'Bullish Engulfing' 
    | 'Bearish Engulfing' 
    | 'Doji' 
    | 'Hammer' 
    | 'Morning Star'
    | 'Evening Star'
    | 'Piercing Line'
    | 'Dark Cloud Cover'
    | 'Three White Soldiers'
    | 'Three Black Crows';

export interface DetectedPattern {
    time: Time;
    name: PatternName;
    type: 'bullish' | 'bearish' | 'neutral';
}

export type PatternConfig = Record<PatternName, boolean>;

export interface PatternFilter {
    bullish: boolean;
    bearish: boolean;
    neutral: boolean;
}