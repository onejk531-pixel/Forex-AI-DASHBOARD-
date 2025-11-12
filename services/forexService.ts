import type { ForexData } from '../types';

const INITIAL_PRICE = 1.0855;
const VOLATILITY = 0.00015;
const TIME_INTERVAL_MS = 2000; // 2 seconds for a more "real-time" feel

// This function is now internal to the service
const getNextDataPoint = (lastPoint: ForexData): ForexData => {
    const open = lastPoint.close;
    const change = (Math.random() - 0.5) * VOLATILITY * 2;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * VOLATILITY;
    const low = Math.min(open, close) - Math.random() * VOLATILITY;
    
    return {
        time: (lastPoint.time as number) + TIME_INTERVAL_MS / 1000,
        open,
        high,
        low,
        close
    };
};

// Generates the initial set of data for the chart
export const generateInitialData = (dataPoints: number = 50): ForexData[] => {
    const data: ForexData[] = [];
    let lastClose = INITIAL_PRICE;
    const startTime = Date.now() - (dataPoints * TIME_INTERVAL_MS);

    for (let i = 0; i < dataPoints; i++) {
        const open = lastClose;
        const change = (Math.random() - 0.5) * VOLATILITY * 2;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * VOLATILITY;
        const low = Math.min(open, close) - Math.random() * VOLATILITY;

        data.push({
            time: (startTime + (i * TIME_INTERVAL_MS)) / 1000,
            open,
            high,
            low,
            close
        });
        lastClose = close;
    }
    return data;
};


// Simulates a WebSocket connection
let lastDataPoint: ForexData | null = null;
export const connect = (onMessage: (data: ForexData) => void): number => {
    // Initialize with the last point of a generated series to ensure continuity
    if (!lastDataPoint) {
        const initialData = generateInitialData(1);
        lastDataPoint = initialData[0];
    }

    const intervalId = setInterval(() => {
        const nextPoint = getNextDataPoint(lastDataPoint!);
        lastDataPoint = nextPoint;
        onMessage(nextPoint);
    }, TIME_INTERVAL_MS);

    return intervalId as unknown as number; // Return interval ID for cleanup
};

export const disconnect = (connectionId: number) => {
    clearInterval(connectionId);
    lastDataPoint = null; // Reset for next connection
};