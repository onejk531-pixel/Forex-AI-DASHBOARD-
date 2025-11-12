import React, { useState } from 'react';
import type { IndicatorSettings, PatternConfig, PatternFilter } from '../types';
import Card from './Card';
import { LineStyle } from 'lightweight-charts';
import { ALL_PATTERNS } from '../constants';

interface ChartControlsProps {
    smaSettings: IndicatorSettings;
    setSmaSettings: (settings: IndicatorSettings) => void;
    rsiSettings: IndicatorSettings;
    setRsiSettings: (settings: IndicatorSettings) => void;
    drawingTool: 'trendline' | 'fibonacci' | null;
    setDrawingTool: (tool: 'trendline' | 'fibonacci' | null) => void;
    clearDrawings: () => void;
    patternConfig: PatternConfig;
    setPatternConfig: (config: PatternConfig) => void;
    patternFilter: PatternFilter;
    setPatternFilter: (filter: PatternFilter) => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({
    smaSettings,
    setSmaSettings,
    rsiSettings,
    setRsiSettings,
    drawingTool,
    setDrawingTool,
    clearDrawings,
    patternConfig,
    setPatternConfig,
    patternFilter,
    setPatternFilter
}) => {
    const [isPatternMenuOpen, setIsPatternMenuOpen] = useState(false);

    const handleIndicatorChange = (
        setter: (settings: IndicatorSettings) => void,
        currentSettings: IndicatorSettings,
        field: keyof IndicatorSettings,
        value: any
    ) => {
        let processedValue = value;
        if (field === 'period') {
            const period = parseInt(value, 10);
            if (period < 2) return;
            processedValue = period;
        }
        if (field === 'lineStyle') {
            processedValue = parseInt(value, 10) as LineStyle;
        }
        setter({ ...currentSettings, [field]: processedValue });
    };

    const getButtonClass = (isActive: boolean) => 
        `px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-accent-blue transition-colors ${
            isActive ? 'bg-accent-blue text-white' : 'bg-gray-700 hover:bg-gray-600 text-text-primary'
        }`;
    
    const inputClass = "w-16 bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue";

    return (
        <Card className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <h3 className="text-lg font-bold">Chart Tools</h3>
            
            {/* SMA Controls */}
            <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => handleIndicatorChange(setSmaSettings, smaSettings, 'enabled', !smaSettings.enabled)} className={getButtonClass(smaSettings.enabled)}>
                    SMA
                </button>
                {smaSettings.enabled && (
                    <>
                        <input type="number" value={smaSettings.period} onChange={(e) => handleIndicatorChange(setSmaSettings, smaSettings, 'period', e.target.value)} className={inputClass} min="2" />
                        <input type="color" value={smaSettings.color} onChange={(e) => handleIndicatorChange(setSmaSettings, smaSettings, 'color', e.target.value)} className="w-8 h-8 p-0 border-none rounded-md bg-transparent cursor-pointer" title="SMA Color" />
                        <select value={smaSettings.lineStyle} onChange={(e) => handleIndicatorChange(setSmaSettings, smaSettings, 'lineStyle', e.target.value)} className={inputClass + " w-24"}>
                            <option value={LineStyle.Solid}>Solid</option>
                            <option value={LineStyle.Dashed}>Dashed</option>
                            <option value={LineStyle.Dotted}>Dotted</option>
                        </select>
                    </>
                )}
            </div>
            
            {/* RSI Controls */}
            <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => handleIndicatorChange(setRsiSettings, rsiSettings, 'enabled', !rsiSettings.enabled)} className={getButtonClass(rsiSettings.enabled)}>
                    RSI
                </button>
                {rsiSettings.enabled && (
                    <>
                        <input type="number" value={rsiSettings.period} onChange={(e) => handleIndicatorChange(setRsiSettings, rsiSettings, 'period', e.target.value)} className={inputClass} min="2" />
                        <input type="color" value={rsiSettings.color} onChange={(e) => handleIndicatorChange(setRsiSettings, rsiSettings, 'color', e.target.value)} className="w-8 h-8 p-0 border-none rounded-md bg-transparent cursor-pointer" title="RSI Color" />
                        <select value={rsiSettings.lineStyle} onChange={(e) => handleIndicatorChange(setRsiSettings, rsiSettings, 'lineStyle', e.target.value)} className={inputClass + " w-24"}>
                            <option value={LineStyle.Solid}>Solid</option>
                            <option value={LineStyle.Dashed}>Dashed</option>
                            <option value={LineStyle.Dotted}>Dotted</option>
                        </select>
                    </>
                )}
            </div>

            {/* Pattern Detection */}
            <div className="relative">
                <button onClick={() => setIsPatternMenuOpen(!isPatternMenuOpen)} className={getButtonClass(Object.values(patternConfig).some(v => v))}>
                    Patterns
                </button>
                {isPatternMenuOpen && (
                    <div className="absolute top-full mt-2 z-20 w-80 bg-card border border-gray-600 rounded-lg shadow-xl p-4 text-sm">
                        <h4 className="font-bold mb-3">Pattern Filters</h4>
                        <div className="flex items-center justify-between mb-4">
                            {Object.keys(patternFilter).map(type => (
                                <label key={type} className="flex items-center capitalize space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={patternFilter[type as keyof PatternFilter]} onChange={(e) => setPatternFilter({ ...patternFilter, [type]: e.target.checked })} className="form-checkbox h-4 w-4 rounded bg-gray-700 border-gray-500 text-accent-blue focus:ring-accent-blue" />
                                    <span>{type}</span>
                                </label>
                            ))}
                        </div>
                        <h4 className="font-bold mb-2 border-t border-gray-600 pt-2">Enabled Patterns</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-h-48 overflow-y-auto">
                            {ALL_PATTERNS.map(p => (
                                <label key={p.name} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={patternConfig[p.name]} onChange={(e) => setPatternConfig({ ...patternConfig, [p.name]: e.target.checked })} className="form-checkbox h-4 w-4 rounded bg-gray-700 border-gray-500 text-accent-blue focus:ring-accent-blue" />
                                    <span className="truncate">{p.name}</span>
                                </label>
                            ))}
                        </div>
                         <button onClick={() => setIsPatternMenuOpen(false)} className="mt-4 w-full text-center py-1.5 text-xs bg-gray-600 hover:bg-gray-500 rounded-md">Close</button>
                    </div>
                )}
            </div>

            {/* Drawing Tools */}
            <div className="flex items-center gap-2 flex-wrap">
                 <button onClick={() => setDrawingTool(drawingTool === 'trendline' ? null : 'trendline')} className={getButtonClass(drawingTool === 'trendline')}>
                    Trendline
                </button>
                 <button onClick={() => setDrawingTool(drawingTool === 'fibonacci' ? null : 'fibonacci')} className={getButtonClass(drawingTool === 'fibonacci')}>
                    Fib Retracement
                </button>
                <button onClick={clearDrawings} className={getButtonClass(false) + " bg-accent-red/50 hover:bg-accent-red/80"}>
                    Clear Drawings
                </button>
            </div>
        </Card>
    );
};

export default ChartControls;