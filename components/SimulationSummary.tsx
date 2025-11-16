import React from 'react';
import type { SimulationResult } from '../types';

interface SimulationSummaryProps {
  results: SimulationResult;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
};

export const SimulationSummary: React.FC<SimulationSummaryProps> = ({ results }) => {
    const baseEnd = results.baseCase[results.baseCase.length - 1].netWorth;
    const scenarioEnd = results.scenarioCase[results.scenarioCase.length - 1].netWorth;
    const difference = scenarioEnd - baseEnd;

    const getStatColor = (value: number) => value >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">5-Year Projection Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-500">Current Path Net Worth</p>
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(baseEnd)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">New Scenario Net Worth</p>
                    <p className="text-2xl font-bold text-indigo-600">{formatCurrency(scenarioEnd)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Net Difference</p>
                    <p className={`text-2xl font-bold ${getStatColor(difference)}`}>
                        {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
                    </p>
                </div>
            </div>
        </div>
    );
};