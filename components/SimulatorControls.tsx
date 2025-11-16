import React from 'react';
import type { SimulationInput } from '../types';

interface SimulatorControlsProps {
    input: SimulationInput;
    onInputChange: (newInput: SimulationInput) => void;
    onRunSimulation: () => void;
    isLoading: boolean;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({ input, onInputChange, onRunSimulation, isLoading }) => {
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onInputChange({ ...input, [e.target.name]: Number(e.target.value) });
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         onInputChange({ ...input, [e.target.name]: e.target.value === '' ? 0 : parseInt(e.target.value, 10) });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-700">Define Your Scenario</h3>
                <p className="text-sm text-gray-500">Adjust the sliders to model a decision.</p>
            </div>

            {/* Salary Change */}
            <div className="space-y-2">
                <label htmlFor="salaryChange" className="block font-medium text-gray-700">
                    Annual Salary Change
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        id="salaryChange"
                        name="salaryChange"
                        min="-50000"
                        max="100000"
                        step="1000"
                        value={input.salaryChange}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className={`font-semibold w-24 text-right ${input.salaryChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {input.salaryChange >= 0 ? '+' : '-'}${Math.abs(input.salaryChange) / 1000}k
                    </span>
                </div>
            </div>

            {/* New Monthly Costs */}
            <div className="space-y-2">
                <label htmlFor="newMonthlyCosts" className="block font-medium text-gray-700">
                    New Monthly Recurring Costs
                </label>
                 <div className="flex items-center gap-4">
                    <input
                        type="range"
                        id="newMonthlyCosts"
                        name="newMonthlyCosts"
                        min="0"
                        max="2000"
                        step="50"
                        value={input.newMonthlyCosts}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-semibold w-24 text-right text-gray-800">
                        +${input.newMonthlyCosts}
                    </span>
                </div>
                 <p className="text-xs text-gray-400">e.g., higher rent, mortgage, commute.</p>
            </div>

            {/* One-Time Cost */}
             <div className="space-y-2">
                <label htmlFor="oneTimeCost" className="block font-medium text-gray-700">
                    One-Time Cost / Investment
                </label>
                <div className="relative">
                     <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                     <input
                        type="number"
                        id="oneTimeCost"
                        name="oneTimeCost"
                        value={input.oneTimeCost === 0 ? '' : input.oneTimeCost}
                        onChange={handleNumberChange}
                        className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0"
                    />
                </div>
                <p className="text-xs text-gray-400">e.g., down payment, moving expenses.</p>
            </div>

            <button
              onClick={onRunSimulation}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Calculating...' : 'Run Simulation'}
            </button>
        </div>
    );
};