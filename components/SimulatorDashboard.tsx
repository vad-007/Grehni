import React, { useState, useCallback } from 'react';
import { SimulatorControls } from './SimulatorControls';
import { SimulationResults } from './SimulationResults';
import { Spinner } from './Spinner';
import { Icon } from './Icon';
import * as simulationService from '../services/simulationService';
import * as fedApiService from '../services/fedApiService';
import type { SimulationInput, SimulationResult } from '../types';

// Demo scenario: Job switch adding $20K salary but +commute costs.
const defaultInput: SimulationInput = {
    salaryChange: 20000,
    newMonthlyCosts: 350,
    oneTimeCost: 1000
};

export const SimulatorDashboard: React.FC = () => {
    const [input, setInput] = useState<SimulationInput>(defaultInput);
    const [results, setResults] = useState<SimulationResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleRunSimulation = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const inflationForecast = await fedApiService.fetchInflationForecast();
            const simulationResults = await simulationService.runMonteCarloSimulation(input, inflationForecast);
            setResults(simulationResults);
        } catch (err) {
            console.error("Simulation failed:", err);
            setError("Could not run the simulation. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [input]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                        <Icon name="Beaker" className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">What-If Simulator</h2>
                        <p className="text-gray-500 mt-1">Forecast the financial impact of big life decisions.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <SimulatorControls
                        input={input}
                        onInputChange={setInput}
                        onRunSimulation={handleRunSimulation}
                        isLoading={isLoading}
                    />
                </div>
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl shadow-md min-h-[400px] flex flex-col justify-center">
                        {isLoading && (
                            <div className="flex flex-col items-center text-gray-500">
                                <Spinner />
                                <span className="mt-2">Running complex financial models...</span>
                            </div>
                        )}
                        {error && <p className="text-center text-red-500">{error}</p>}
                        
                        {!isLoading && (
                             <SimulationResults results={results} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};