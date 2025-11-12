import { GoogleGenAI, Type } from "@google/genai";
import type { ForexData, GeminiSettings } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY is not set in environment variables. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const predictionSchema = {
    type: Type.OBJECT,
    properties: {
        predictedPrice: {
            type: Type.NUMBER,
            description: "The predicted closing price for the next time interval.",
        },
        signal: {
            type: Type.STRING,
            description: "A trading signal, which must be one of: 'BUY', 'SELL', or 'HOLD'.",
        },
        rationale: {
            type: Type.STRING,
            description: "A brief, one-sentence rationale for the signal based on the price data.",
        },
    },
    required: ["predictedPrice", "signal", "rationale"],
};


export const getPredictionAndSignal = async (
    data: ForexData[],
    pair: string,
    settings: GeminiSettings
): Promise<{ predictedPrice: number; signal: string; rationale: string } | null> => {
    if (!API_KEY) {
        throw new Error("Gemini API key not configured.");
    }

    const historySlice = data.slice(-settings.historyLength);
    const priceHistory = historySlice.map(d => d.close.toFixed(5)).join(', ');
    
    const prompt = `
        You are an expert forex trading analyst. Your task is to predict the next price point and generate a clear trading signal.
        Analyze the following recent closing price history for the ${pair} currency pair: ${priceHistory}.
        Based on this data, predict the closing price for the very next interval and provide a trading signal ('BUY', 'SELL', or 'HOLD') along with a concise one-sentence rationale.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: predictionSchema,
                temperature: settings.temperature,
            }
        });

        const text = response.text.trim();
        const result = JSON.parse(text);

        // Validate signal
        if (!['BUY', 'SELL', 'HOLD'].includes(result.signal.toUpperCase())) {
            console.warn(`Invalid signal received: ${result.signal}. Defaulting to HOLD.`);
            result.signal = 'HOLD';
        }

        return {
            predictedPrice: result.predictedPrice,
            signal: result.signal.toUpperCase(),
            rationale: result.rationale
        };

    } catch (error) {
        console.error("Error fetching prediction from Gemini API:", error);
        throw error;
    }
};