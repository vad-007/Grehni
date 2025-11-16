import React from 'react';
import type { Goal } from '../types';
import { Icon } from './Icon';

interface GoalItemProps {
  goal: Goal;
}

export const GoalItem: React.FC<GoalItemProps> = ({ goal }) => {
  const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
  
  return (
    <div className="p-4 border-b border-gray-100 last:border-b-0 flex items-center space-x-4">
        {/* Thermometer */}
        <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-8 h-32 bg-gray-200 rounded-full overflow-hidden relative flex justify-center items-end">
                <div 
                    className="bg-green-500 w-full absolute bottom-0 transition-all duration-500"
                    style={{ height: `${progress}%` }}
                ></div>
                <span className="relative text-white text-xs font-bold drop-shadow-sm pb-1">{Math.round(progress)}%</span>
            </div>
            <Icon name="PiggyBank" className="w-6 h-6 text-gray-500 mt-2" />
        </div>

        {/* Goal Details */}
        <div className="flex-grow">
            <h4 className="font-bold text-gray-800">{goal.name}</h4>
            <p className="text-sm text-gray-500">
                Saved <span className="font-semibold text-gray-700">${goal.current.toFixed(2)}</span> of <span className="font-semibold text-gray-700">${goal.target.toFixed(2)}</span>
            </p>
            <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">This month's contribution:</p>
                <p className="font-semibold text-green-600 text-lg">+${goal.contribution.toFixed(2)}</p>
            </div>
        </div>
    </div>
  );
};
