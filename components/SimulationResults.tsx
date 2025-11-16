import React from 'react';
import type { SimulationResult } from '../types';
import { SimulationSummary } from './SimulationSummary';
import { SimulationResultsChart } from './SimulationResultsChart';

interface SimulationResultsProps {
    results: SimulationResult | null;
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({ results }) => {

    if (!results) {
        return (
            <div className="text-center text-gray-500">
                <p className="text-lg font-semibold">Ready to look into your future?</p>
                <p className="mt-2">Adjust the controls and click "Run Simulation" to see a 5-year forecast of your decision.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SimulationSummary results={results} />
            <SimulationResultsChart results={results} />
        </div>
    );
};