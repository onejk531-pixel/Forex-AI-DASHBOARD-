import React, { useState, useEffect, useCallback } from 'react';
import { getPredictionAndSignal } from './services/geminiService';
import { generateInitialData, connect, disconnect } from './services/forexService';
import { detectPatterns } from './services/patternService';
import type { ForexData, Signal, TradeHistoryItem, Prediction, CurrencyPair, IndicatorSettings, Trendline, FibRetracement, GeminiSettings, DetectedPattern, PatternConfig, PatternFilter } from './types';
import { SignalType, CURRENCY_PAIRS, ALL_PATTERNS } from './constants';
import Header from './components/Header';
import CurrencySelector from './components/CurrencySelector';
import PriceTicker from './components/PriceTicker';
import SignalAlert from './components/SignalAlert';
import TradeHistory from './components/TradeHistory';
import TradingChart from './components/TradingChart';
import ChartControls from './components/ChartControls';
import Settings from './components/Settings';
import PatternAlert from './components/PatternAlert';
import { LineStyle } from 'lightweight-charts';

// Initialize pattern configuration with all patterns enabled
const initialPatternConfig = ALL_PATTERNS.reduce((acc, p) => {
    acc[p.name] = true;
    return acc;
}, {} as PatternConfig);

const App: React.FC = () => {
    const [selectedPair, setSelectedPair] = useState<CurrencyPair>(() => {
        const savedPair = localStorage.getItem('forexPair');
        return (savedPair ? JSON.parse(savedPair) : CURRENCY_PAIRS[0]) as CurrencyPair;
    });
    const [historicalData, setHistoricalData] = useState<ForexData[]>([]);
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [signal, setSignal] = useState<Signal | null>(null);
    const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>(() => {
        const savedHistory = localStorage.getItem('tradeHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for chart indicators and tools
    const [smaSettings, setSmaSettings] = useState<IndicatorSettings>(() => {
        const saved = localStorage.getItem('smaSettings');
        return saved ? JSON.parse(saved) : { enabled: false, period: 20, color: '#f6e05e', lineStyle: LineStyle.Solid };
    });
    const [rsiSettings, setRsiSettings] = useState<IndicatorSettings>(() => {
        const saved = localStorage.getItem('rsiSettings');
        return saved ? JSON.parse(saved) : { enabled: false, period: 14, color: '#4299e1', lineStyle: LineStyle.Solid };
    });
    const [drawingTool, setDrawingTool] = useState<'trendline' | 'fibonacci' | null>(null);
    const [trendlines, setTrendlines] = useState<Trendline[]>([]);
    const [fibRetracements, setFibRetracements] = useState<FibRetracement[]>([]);
    const [geminiSettings, setGeminiSettings] = useState<GeminiSettings>({ temperature: 0.5, historyLength: 50 });
    
    // Advanced pattern detection state
    const [patternConfig, setPatternConfig] = useState<PatternConfig>(initialPatternConfig);
    const [patternFilter, setPatternFilter] = useState<PatternFilter>({ bullish: true, bearish: true, neutral: true });
    const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([]);
    const [latestPatternAlert, setLatestPatternAlert] = useState<DetectedPattern | null>(null);

    const processNewDataPoint = useCallback(async (newData: ForexData[], currentPair: CurrencyPair, settings: GeminiSettings) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getPredictionAndSignal(newData, currentPair.name, settings);
            if (result) {
                const lastDataPoint = newData[newData.length - 1];
                const newPrediction: Prediction = {
                    time: (lastDataPoint.time as number) + 60000, 
                    price: result.predictedPrice
                };
                const newSignal: Signal = {
                    type: result.signal as SignalType,
                    rationale: result.rationale
                };
                
                setPrediction(newPrediction);
                setSignal(newSignal);

                const newTrade: TradeHistoryItem = {
                    id: Date.now(),
                    pair: currentPair.name,
                    time: new Date().toISOString(),
                    price: lastDataPoint.close,
                    signal: newSignal.type,
                };
                setTradeHistory(prev => [newTrade, ...prev.slice(0, 9)]);
            }
        } catch (e) {
            console.error("Failed to get prediction:", e);
            setError("Failed to get AI prediction. Please check your API key and try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initialize with historical data
        const initialData = generateInitialData(geminiSettings.historyLength);
        setHistoricalData(initialData);
        // Initial pattern detection is handled by the historicalData effect
        
        processNewDataPoint(initialData, selectedPair, geminiSettings);
        
        // Clear drawings on pair change
        setTrendlines([]); 
        setFibRetracements([]);
        
        // Connect to real-time data stream
        const connectionId = connect((newPoint) => {
            setHistoricalData(prevData => {
                const updatedData = [...prevData.slice(1), newPoint];
                
                // Process every few updates, not every single one, to avoid spamming API
                if (Date.now() % 4 < 2) { // Simple way to process roughly every 4th tick
                     processNewDataPoint(updatedData, selectedPair, geminiSettings);
                }
                return updatedData;
            });
        });

        return () => disconnect(connectionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPair, geminiSettings]); // Re-initialize and reconnect if pair or AI settings change

    useEffect(() => {
        if (historicalData.length === 0) return;

        const allPatterns = detectPatterns(historicalData);
        
        // Filter patterns based on user configuration
        const filteredPatterns = allPatterns.filter(p => {
            const isTypeEnabled = patternFilter[p.type];
            const isPatternEnabled = patternConfig[p.name];
            return isTypeEnabled && isPatternEnabled;
        });

        setDetectedPatterns(filteredPatterns);

        // Alert system: check if the very last data point completed a new pattern
        const lastDataTime = historicalData[historicalData.length - 1].time;
        const latestPattern = filteredPatterns.find(p => p.time === lastDataTime);

        if (latestPattern) {
            setLatestPatternAlert(latestPattern);
        }

    }, [historicalData, patternConfig, patternFilter]);

    useEffect(() => {
        localStorage.setItem('forexPair', JSON.stringify(selectedPair));
    }, [selectedPair]);

    useEffect(() => {
        localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));
    }, [tradeHistory]);

    useEffect(() => {
        localStorage.setItem('smaSettings', JSON.stringify(smaSettings));
    }, [smaSettings]);

    useEffect(() => {
        localStorage.setItem('rsiSettings', JSON.stringify(rsiSettings));
    }, [rsiSettings]);
    
    const handleAddTrendline = (line: Trendline) => {
        setTrendlines(prev => [...prev, line]);
        setDrawingTool(null); // Exit drawing mode after completing a line
    };

    const handleAddFibRetracement = (fib: FibRetracement) => {
        setFibRetracements(prev => [...prev, fib]);
        setDrawingTool(null);
    };

    const clearDrawings = () => {
        setTrendlines([]);
        setFibRetracements([]);
    };

    const currentPrice = historicalData.length > 0 ? historicalData[historicalData.length-1].close : 0;
    const prevPrice = historicalData.length > 1 ? historicalData[historicalData.length-2].close : 0;

    return (
        <div className="min-h-screen bg-background text-text-primary p-4 lg:p-8 font-sans">
            <Header />
            <PatternAlert pattern={latestPatternAlert} onDismiss={() => setLatestPatternAlert(null)} />
            <main className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 space-y-6">
                   <CurrencySelector selectedPair={selectedPair} setSelectedPair={setSelectedPair} />
                   <PriceTicker currentPrice={currentPrice} prevPrice={prevPrice} pair={selectedPair} />
                   <SignalAlert signal={signal} isLoading={isLoading} error={error} />
                   <Settings geminiSettings={geminiSettings} setGeminiSettings={setGeminiSettings} />
                </div>

                <div className="lg:col-span-9 space-y-6">
                    <ChartControls
                        smaSettings={smaSettings}
                        setSmaSettings={setSmaSettings}
                        rsiSettings={rsiSettings}
                        setRsiSettings={setRsiSettings}
                        drawingTool={drawingTool}
                        setDrawingTool={setDrawingTool}
                        clearDrawings={clearDrawings}
                        patternConfig={patternConfig}
                        setPatternConfig={setPatternConfig}
                        patternFilter={patternFilter}
                        setPatternFilter={setPatternFilter}
                    />
                    <TradingChart 
                        historicalData={historicalData}
                        prediction={prediction}
                        smaSettings={smaSettings}
                        rsiSettings={rsiSettings}
                        drawingTool={drawingTool}
                        trendlines={trendlines}
                        onAddTrendline={handleAddTrendline}
                        fibRetracements={fibRetracements}
                        onAddFibRetracement={handleAddFibRetracement}
                        detectedPatterns={detectedPatterns}
                    />
                </div>

                <div className="lg:col-span-12">
                   <TradeHistory history={tradeHistory} />
                </div>
            </main>
        </div>
    );
};

export default App;