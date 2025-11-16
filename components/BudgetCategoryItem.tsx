import React from 'react';
import type { BudgetCategory } from '../types';
import { Icon } from './Icon';

interface BudgetCategoryItemProps {
  category: BudgetCategory;
  spent: number;
}

export const BudgetCategoryItem: React.FC<BudgetCategoryItemProps> = ({ category, spent }) => {
  const remaining = category.budgeted - spent;
  const progress = category.budgeted > 0 ? (spent / category.budgeted) * 100 : 0;

  let progressBarColor = 'bg-indigo-500';
  if (progress > 100) {
    progressBarColor = 'bg-red-500';
  } else if (progress > 80) {
    progressBarColor = 'bg-yellow-500';
  }

  const remainingColor = remaining >= 0 ? 'text-gray-500' : 'text-red-500';

  return (
    <div className="p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center mb-2">
        <Icon name={category.icon} className="w-5 h-5 text-gray-500" />
        <p className="ml-3 font-semibold text-gray-800 flex-grow">{category.name}</p>
        <div className="text-right">
            <p className="font-semibold text-sm text-gray-700">${spent.toFixed(2)} / <span className="text-gray-500">${category.budgeted.toFixed(2)}</span></p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
          <div
            className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <div className="w-28 text-right">
             <p className={`text-sm font-medium ${remainingColor}`}>
                {remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}
            </p>
        </div>
      </div>
    </div>
  );
};
