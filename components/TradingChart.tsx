import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineStyle, UTCTimestamp, IPriceLine, MouseEventParams, SeriesMarker } from 'lightweight-charts';
import type { ForexData, Prediction, IndicatorSettings, Trendline, TrendlinePoint, FibRetracement, DetectedPattern } from '../types';
import { calculateSMA, calculateRSI } from '../services/indicatorService';
import Card from './Card';

interface TradingChartProps {
    historicalData: ForexData[];
    prediction: Prediction | null;
    smaSettings: IndicatorSettings;
    rsiSettings: IndicatorSettings;
    drawingTool: 'trendline' | 'fibonacci' | null;
    trendlines: Trendline[];
    onAddTrendline: (line: Trendline) => void;
    fibRetracements: FibRetracement[];
    onAddFibRetracement: (fib: FibRetracement) => void;
    detectedPatterns: DetectedPattern[];
}

const TradingChart: React.FC<TradingChartProps> = ({
    historicalData,
    prediction,
    smaSettings,
    rsiSettings,
    drawingTool,
    trendlines,
    onAddTrendline,
    fibRetracements,
    onAddFibRetracement,
    detectedPatterns,
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const predictionSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const trendlineSeriesRefs = useRef<Map<number, ISeriesApi<'Line'>>>(new Map());
    const fibRetracementRefs = useRef<Map<number, IPriceLine[]>>(new Map());
    
    const [trendlineStartPoint, setTrendlineStartPoint] = useState<TrendlinePoint | null>(null);
    const [fibStartPoint, setFibStartPoint] = useState<TrendlinePoint | null>(null);
    const isInitialLoadRef = useRef(true);

    const [tooltipContent, setTooltipContent] = useState('');
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, visible: false });


    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current || chartRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { color: '#2d3748' },
                textColor: '#a0aec0',
            },
            grid: {
                vertLines: { color: '#4a5568' },
                horzLines: { color: '#4a5568' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: true,
            handleScale: true,
            crosshair: {
                vertLine: { labelVisible: false },
                horzLine: { labelVisible: false },
            },
        });
        
        chartRef.current = chart;
        candlestickSeriesRef.current = chart.addCandlestickSeries({
            upColor: '#38a169',
            downColor: '#e53e3e',
            borderDownColor: '#e53e3e',
            borderUpColor: '#38a169',
            wickDownColor: '#e53e3e',
            wickUpColor: '#38a169',
        });

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        const handleChartClick = (param: MouseEventParams) => {
            if (!drawingTool || !param.point || !param.time) return;
            const price = candlestickSeriesRef.current!.coordinateToPrice(param.point.y)!;
            const time = param.time;
            
            if (drawingTool === 'trendline') {
                if (!trendlineStartPoint) {
                    setTrendlineStartPoint({ time, price });
                } else {
                    onAddTrendline({ id: Date.now(), start: trendlineStartPoint, end: { time, price } });
                    setTrendlineStartPoint(null);
                }
            } else if (drawingTool === 'fibonacci') {
                if (!fibStartPoint) {
                    setFibStartPoint({ time, price });
                } else {
                    onAddFibRetracement({ id: Date.now(), start: fibStartPoint, end: { time, price } });
                    setFibStartPoint(null);
                }
            }
        };
        chart.subscribeClick(handleChartClick);

        chart.subscribeCrosshairMove(param => {
            if (!param.point || !param.time || !chartContainerRef.current) {
                setTooltipPosition(prev => ({ ...prev, visible: false }));
                return;
            }

            let content = '';
            const hoveredTime = param.time as number;

            const candleData = param.seriesData.get(candlestickSeriesRef.current!);
            if (candleData) {
                const ohlc = candleData as ForexData;
                const date = new Date((ohlc.time as number) * 1000);
                content += `<div class="font-bold">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>`;
                content += `<div class="flex justify-between"><span class="text-text-secondary">O:</span> <span>${ohlc.open.toFixed(5)}</span></div>`;
                content += `<div class="flex justify-between"><span class="text-text-secondary">H:</span> <span>${ohlc.high.toFixed(5)}</span></div>`;
                content += `<div class="flex justify-between"><span class="text-text-secondary">L:</span> <span>${ohlc.low.toFixed(5)}</span></div>`;
                content += `<div class="flex justify-between"><span class="text-text-secondary">C:</span> <span>${ohlc.close.toFixed(5)}</span></div>`;
            }
        
            if (smaSettings.enabled && smaSeriesRef.current) {
                const smaData = param.seriesData.get(smaSeriesRef.current);
                if (smaData) {
                    content += `<div style="color: ${smaSettings.color}" class="border-t border-gray-600 mt-1 pt-1 flex justify-between"><span style="color: ${smaSettings.color}">SMA(${smaSettings.period}):</span> <span>${(smaData as any).value.toFixed(5)}</span></div>`;
                }
            }
        
            if (rsiSettings.enabled && rsiSeriesRef.current) {
                const rsiData = param.seriesData.get(rsiSeriesRef.current);
                if (rsiData) {
                    content += `<div style="color: ${rsiSettings.color}" class="flex justify-between"><span style="color: ${rsiSettings.color}">RSI(${rsiSettings.period}):</span> <span>${(rsiData as any).value.toFixed(2)}</span></div>`;
                }
            }
        
            trendlines.forEach((line) => {
                const startTime = Math.min(line.start.time as number, line.end.time as number);
                const endTime = Math.max(line.start.time as number, line.end.time as number);

                if (hoveredTime >= startTime && hoveredTime <= endTime) {
                    const timeDiff = (line.end.time as number) - (line.start.time as number);
                    if (timeDiff !== 0) {
                        const priceDiff = line.end.price - line.start.price;
                        const slope = priceDiff / timeDiff;
                        const interpolatedPrice = line.start.price + slope * (hoveredTime - (line.start.time as number));
                        content += `<div class="border-t border-gray-600 mt-1 pt-1 flex justify-between"><span class="text-text-secondary">Trendline:</span> <span>${interpolatedPrice.toFixed(5)}</span></div>`;
                    }
                }
            });

            const hoveredPattern = detectedPatterns.find(p => p.time === hoveredTime);
            if (hoveredPattern) {
                const color = hoveredPattern.type === 'bullish' ? 'text-accent-green' : hoveredPattern.type === 'bearish' ? 'text-accent-red' : 'text-yellow-400';
                content += `<div class="border-t border-gray-600 mt-1 pt-1 flex justify-between items-center"><span class="text-text-secondary">Pattern:</span> <span class="font-bold ${color}">${hoveredPattern.name}</span></div>`;
            }

            if (content) {
                setTooltipContent(content);
                const chartWidth = chartContainerRef.current.clientWidth;
                const tooltipWidth = 180; // Estimated width of the tooltip
                let newX = param.point.x + 20;
                if (newX + tooltipWidth > chartWidth) {
                    newX = param.point.x - tooltipWidth - 20;
                }
                setTooltipPosition({ x: newX, y: param.point.y + 20, visible: true });
            } else {
                 setTooltipPosition(prev => ({ ...prev, visible: false }));
            }
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.unsubscribeClick(handleChartClick);
            chart.remove();
            chartRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trendlines, detectedPatterns]); // Re-subscribe when trendlines or patterns change to get the latest data

    // Update main historical data efficiently
    useEffect(() => {
        if (candlestickSeriesRef.current && historicalData.length > 0) {
            if (isInitialLoadRef.current) {
                candlestickSeriesRef.current.setData(historicalData);
                chartRef.current?.timeScale().fitContent();
                isInitialLoadRef.current = false;
            } else {
                candlestickSeriesRef.current.update(historicalData[historicalData.length - 1]);
            }
        }
    }, [historicalData]);

    // Update prediction line
    useEffect(() => {
        if (!chartRef.current) return;
        if (prediction && historicalData.length > 0) {
            if (!predictionSeriesRef.current) {
                predictionSeriesRef.current = chartRef.current.addLineSeries({
                    color: '#9f7aea',
                    lineWidth: 2,
                    lineStyle: LineStyle.Dashed,
                    priceLineVisible: false,
                    lastValueVisible: false,
                });
            }
            const lastDataPoint = historicalData[historicalData.length - 1];
            predictionSeriesRef.current.setData([
                { time: lastDataPoint.time, value: lastDataPoint.close },
                { time: prediction.time / 1000 as UTCTimestamp, value: prediction.price },
            ]);
        }
    }, [prediction, historicalData]);

    // Update SMA
    useEffect(() => {
        if (!chartRef.current) return;
        
        const smaData = smaSettings.enabled && historicalData.length >= smaSettings.period 
            ? calculateSMA(historicalData, smaSettings.period) 
            : [];

        if (smaData.length > 0) {
            if (!smaSeriesRef.current) {
                smaSeriesRef.current = chartRef.current.addLineSeries({ 
                    color: smaSettings.color, 
                    lineWidth: 1, 
                    lineStyle: smaSettings.lineStyle 
                });
            } else {
                smaSeriesRef.current.applyOptions({
                    color: smaSettings.color,
                    lineStyle: smaSettings.lineStyle
                });
            }
            
            if (smaSeriesRef.current.data()?.length === 0) {
                smaSeriesRef.current.setData(smaData);
            } else {
                 smaSeriesRef.current.update(smaData[smaData.length - 1]);
            }

        } else if (smaSeriesRef.current) {
            chartRef.current.removeSeries(smaSeriesRef.current);
            smaSeriesRef.current = null;
        }
    }, [smaSettings, historicalData]);

    // Update RSI
    useEffect(() => {
        if (!chartRef.current) return;

        const rsiData = rsiSettings.enabled && historicalData.length >= rsiSettings.period
            ? calculateRSI(historicalData, rsiSettings.period)
            : [];

        if (rsiData.length > 0) {
            const isPaneVisible = !!rsiSeriesRef.current;
            if (!rsiSeriesRef.current) {
                rsiSeriesRef.current = chartRef.current.addLineSeries({
                    color: rsiSettings.color,
                    lineWidth: 1,
                    lineStyle: rsiSettings.lineStyle,
                    pane: 1,
                });
            } else {
                rsiSeriesRef.current.applyOptions({
                    color: rsiSettings.color,
                    lineStyle: rsiSettings.lineStyle,
                });
            }
            
            if (!isPaneVisible) {
                 chartRef.current.applyOptions({ height: 500 });
            }

            if (rsiSeriesRef.current.data()?.length === 0) {
                 rsiSeriesRef.current.setData(rsiData);
            } else {
                 rsiSeriesRef.current.update(rsiData[rsiData.length - 1]);
            }
           
        } else if (rsiSeriesRef.current) {
            chartRef.current.removeSeries(rsiSeriesRef.current);
            rsiSeriesRef.current = null;
            chartRef.current.applyOptions({ height: 400 });
        }
    }, [rsiSettings, historicalData]);

    // Draw trendlines
    useEffect(() => {
        if (!chartRef.current) return;
        trendlineSeriesRefs.current.forEach((series, id) => {
            if (!trendlines.find(t => t.id === id)) {
                chartRef.current!.removeSeries(series);
                trendlineSeriesRefs.current.delete(id);
            }
        });
        trendlines.forEach(line => {
            if (!trendlineSeriesRefs.current.has(line.id)) {
                const lineSeries = chartRef.current!.addLineSeries({
                    color: '#edf2f7',
                    lineWidth: 1,
                    lineStyle: LineStyle.Solid,
                    lastValueVisible: false,
                    priceLineVisible: false,
                });
                trendlineSeriesRefs.current.set(line.id, lineSeries);
            }
            const series = trendlineSeriesRefs.current.get(line.id);
            series?.setData([
                { time: line.start.time, value: line.start.price },
                { time: line.end.time, value: line.end.price },
            ]);
        });
    }, [trendlines]);

    // Draw Fibonacci Retracements
    useEffect(() => {
        if (!candlestickSeriesRef.current) return;
        const series = candlestickSeriesRef.current;
        fibRetracementRefs.current.forEach((lines, id) => {
            if (!fibRetracements.find(f => f.id === id)) {
                lines.forEach(line => series.removePriceLine(line));
                fibRetracementRefs.current.delete(id);
            }
        });
        fibRetracements.forEach(fib => {
            if (fibRetracementRefs.current.has(fib.id)) return;
            const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
            const priceDiff = fib.end.price - fib.start.price;
            const priceLines: IPriceLine[] = [];
            const colors: { [key: number]: string } = {
                0: '#e53e3e', 0.236: '#ed8936', 0.382: '#f6e05e', 0.5: '#48bb78',
                0.618: '#4299e1', 0.786: '#9f7aea', 1: '#e53e3e'
            };
            levels.forEach(level => {
                const price = fib.start.price + priceDiff * level;
                const priceLine = series.createPriceLine({
                    price, color: colors[level] || '#a0aec0', lineWidth: 1,
                    lineStyle: (level === 0 || level === 1) ? LineStyle.Solid : LineStyle.Dashed,
                    axisLabelVisible: true, title: `${(level * 100).toFixed(1)}%`,
                });
                priceLines.push(priceLine);
            });
            fibRetracementRefs.current.set(fib.id, priceLines);
        });
    }, [fibRetracements]);

    // Show/hide pattern markers
    useEffect(() => {
        if (!candlestickSeriesRef.current) return;

        const markers: SeriesMarker<any>[] = detectedPatterns.map(p => {
            let marker: SeriesMarker<any> = {
                time: p.time,
                text: p.name.split(' ').map(s => s[0]).join(''),
                position: 'aboveBar',
                color: '#e53e3e',
                shape: 'arrowDown',
            };
            if (p.type === 'bullish') {
                marker = { ...marker, position: 'belowBar', color: '#38a169', shape: 'arrowUp' };
            } else if (p.type === 'neutral') {
                marker = { ...marker, position: 'inBar', color: '#f6e05e', shape: 'circle' };
            }
            return marker;
        });

        candlestickSeriesRef.current.setMarkers(markers);
    }, [detectedPatterns]);

    return (
        <Card className="relative">
             <h2 className="text-xl font-bold text-text-primary mb-4">Price Action vs. AI Prediction</h2>
             {tooltipPosition.visible && (
                <div
                    style={{
                        position: 'absolute',
                        top: tooltipPosition.y,
                        left: tooltipPosition.x,
                        zIndex: 1000,
                        pointerEvents: 'none',
                        width: '180px',
                    }}
                    className="bg-background/80 backdrop-blur-sm border border-gray-600 p-2 rounded-md shadow-lg text-xs space-y-1"
                    dangerouslySetInnerHTML={{ __html: tooltipContent }}
                />
            )}
             <div ref={chartContainerRef} className="h-96 w-full" />
        </Card>
    );
};

export default TradingChart;