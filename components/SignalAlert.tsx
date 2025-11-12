
import React from 'react';
import type { Signal } from '../types';
import { SignalType } from '../constants';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';

interface SignalAlertProps {
    signal: Signal | null;
    isLoading: boolean;
    error: string | null;
}

const SignalAlert: React.FC<SignalAlertProps> = ({ signal, isLoading, error }) => {
    const getSignalStyles = (type: SignalType | undefined) => {
        switch (type) {
            case SignalType.BUY:
                return {
                    bg: 'bg-accent-green',
                    text: 'text-white',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    )
                };
            case SignalType.SELL:
                return {
                    bg: 'bg-accent-red',
                    text: 'text-white',
                    icon: (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                    )
                };
            default:
                return {
                    bg: 'bg-gray-600',
                    text: 'text-text-primary',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
        }
    };

    const styles = getSignalStyles(signal?.type);

    return (
        <Card>
            <h3 className="text-sm font-medium text-text-secondary mb-2">AI Signal</h3>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-24">
                    <LoadingSpinner />
                    <p className="text-text-secondary mt-2">Analyzing market...</p>
                </div>
            ) : error ? (
                <div className="flex items-center text-accent-red bg-red-900/50 p-3 rounded-lg">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm">{error}</p>
                </div>
            ) : signal && (
                <div>
                    <div className={`${styles.bg} ${styles.text} font-bold text-xl rounded-lg p-4 flex items-center justify-center`}>
                        {styles.icon}
                        <span>{signal.type}</span>
                    </div>
                    <p className="text-text-secondary text-center mt-3 text-sm italic">
                        "{signal.rationale}"
                    </p>
                </div>
            )}
        </Card>
    );
};

export default SignalAlert;
