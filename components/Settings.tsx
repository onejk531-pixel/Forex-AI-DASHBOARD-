import React from 'react';
import type { GeminiSettings } from '../types';
import Card from './Card';

interface SettingsProps {
    geminiSettings: GeminiSettings;
    setGeminiSettings: (settings: GeminiSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ geminiSettings, setGeminiSettings }) => {

    const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGeminiSettings({ ...geminiSettings, temperature: parseFloat(e.target.value) });
    };

    const handleHistoryLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const length = parseInt(e.target.value, 10);
        if (length >= 20 && length <= 100) {
            setGeminiSettings({ ...geminiSettings, historyLength: length });
        }
    };

    return (
        <Card>
            <h3 className="text-lg font-bold text-text-primary mb-4">AI Settings</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-text-secondary mb-1">
                        Model Temperature: <span className="font-mono text-text-primary">{geminiSettings.temperature.toFixed(1)}</span>
                    </label>
                    <input
                        id="temperature"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={geminiSettings.temperature}
                        onChange={handleTemperatureChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent-blue"
                    />
                    <p className="text-xs text-text-secondary mt-1">Lower is more predictable, higher is more creative.</p>
                </div>
                <div>
                    <label htmlFor="historyLength" className="block text-sm font-medium text-text-secondary mb-1">
                        Analysis History Length
                    </label>
                    <input
                        id="historyLength"
                        type="number"
                        min="20"
                        max="100"
                        step="5"
                        value={geminiSettings.historyLength}
                        onChange={handleHistoryLengthChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                     <p className="text-xs text-text-secondary mt-1">Number of data points to send for analysis.</p>
                </div>
            </div>
        </Card>
    );
};

export default Settings;