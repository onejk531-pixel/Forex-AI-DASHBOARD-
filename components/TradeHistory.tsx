import React from 'react';
import type { TradeHistoryItem } from '../types';
import { SignalType } from '../constants';
import Card from './Card';

interface TradeHistoryProps {
    history: TradeHistoryItem[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ history }) => {
    const getSignalClass = (signal: SignalType) => {
        switch (signal) {
            case SignalType.BUY:
                return 'text-accent-green';
            case SignalType.SELL:
                return 'text-accent-red';
            default:
                return 'text-text-secondary';
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-bold text-text-primary mb-4">Trade Signal History</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700 text-text-secondary text-sm">
                            <th className="p-3">Time</th>
                            <th className="p-3">Pair</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Signal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center p-4 text-text-secondary">No history yet.</td>
                            </tr>
                        )}
                        {history.map((trade) => (
                            <tr key={trade.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                                <td className="p-3">{new Date(trade.time).toLocaleString()}</td>
                                <td className="p-3">{trade.pair}</td>
                                <td className="p-3">{trade.price.toFixed(5)}</td>
                                <td className={`p-3 font-bold ${getSignalClass(trade.signal)}`}>
                                    {trade.signal}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default TradeHistory;