import { ForexData } from '../types';
import { Time } from 'lightweight-charts';

interface IndicatorDataPoint {
    time: Time;
    value: number;
}

export const calculateSMA = (data: ForexData[], period: number): IndicatorDataPoint[] => {
    const smaData: IndicatorDataPoint[] = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
        smaData.push({
            time: data[i].time,
            value: sum / period,
        });
    }
    return smaData;
};

export const calculateRSI = (data: ForexData[], period: number): IndicatorDataPoint[] => {
    const rsiData: IndicatorDataPoint[] = [];
    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
        const change = data[i].close - data[i - 1].close;
        if (change > 0) {
            gains += change;
        } else {
            losses -= change; // losses are positive
        }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period; i < data.length; i++) {
        const time = data[i].time;
        
        let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        let rsi = 100 - (100 / (1 + rs));
        rsiData.push({ time, value: rsi });
        
        // Calculate for next period
        const change = data[i].close - data[i - 1].close;
        let currentGain = 0;
        let currentLoss = 0;

        if (change > 0) {
            currentGain = change;
        } else {
            currentLoss = -change;
        }

        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    }

    return rsiData;
};
