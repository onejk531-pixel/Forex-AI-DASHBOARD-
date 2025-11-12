import React, { useState, useEffect } from 'react';
import type { DetectedPattern } from '../types';

interface PatternAlertProps {
    pattern: DetectedPattern | null;
    onDismiss: () => void;
}

const PatternAlert: React.FC<PatternAlertProps> = ({ pattern, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (pattern) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                // Allow time for fade-out animation before clearing the pattern
                setTimeout(onDismiss, 300);
            }, 5000); // Alert is visible for 5 seconds

            return () => clearTimeout(timer);
        }
    }, [pattern, onDismiss]);

    if (!pattern) {
        return null;
    }

    const getStyles = () => {
        switch (pattern.type) {
            case 'bullish':
                return {
                    icon: '▲',
                    color: 'border-accent-green bg-green-900/50 text-accent-green',
                    textColor: 'text-accent-green'
                };
            case 'bearish':
                return {
                    icon: '▼',
                    color: 'border-accent-red bg-red-900/50 text-accent-red',
                    textColor: 'text-accent-red'
                };
            default:
                return {
                    icon: '●',
                    color: 'border-yellow-400 bg-yellow-900/50 text-yellow-400',
                    textColor: 'text-yellow-400'
                };
        }
    };

    const styles = getStyles();

    return (
        <div 
            className={`fixed top-8 right-8 z-50 flex items-center p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform ${styles.color} ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            role="alert"
        >
            <div className={`text-2xl mr-3 ${styles.textColor}`}>{styles.icon}</div>
            <div>
                <p className="font-bold text-text-primary">Pattern Detected</p>
                <p className={`text-sm ${styles.textColor}`}>{pattern.name}</p>
            </div>
            <button onClick={() => setVisible(false)} className="ml-4 -mr-2 p-1 text-text-secondary hover:text-text-primary focus:outline-none">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </button>
        </div>
    );
};

export default PatternAlert;
