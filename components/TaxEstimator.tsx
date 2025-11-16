import React, { useMemo } from 'react';
import type { Transaction } from '../types';
import { Icon } from './Icon';

interface TaxEstimatorProps {
  transactions: Transaction[];
}

// Basic rules for potential US tax deductions. This is a simplified list.
const DEDUCTIBLE_CATEGORIES = ['Health'];

export const TaxEstimator: React.FC<TaxEstimatorProps> = ({ transactions }) => {
  const { totalDeductions, includedCategories } = useMemo(() => {
    let total = 0;
    const included = new Set<string>();

    transactions.forEach(tx => {
      if (tx.amount < 0 && DEDUCTIBLE_CATEGORIES.includes(tx.category.key)) {
        total += Math.abs(tx.amount);
        included.add(tx.category.label);
      }
    });

    return { totalDeductions: total, includedCategories: Array.from(included) };
  }, [transactions]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-start">
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
            <Icon name="Dollar" className="w-5 h-5"/>
        </div>
        <div className="ml-4">
            <h3 className="text-lg font-bold text-gray-700">Potential Tax Deductions</h3>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
                ${totalDeductions.toFixed(2)}
            </p>
            {includedCategories.length > 0 && (
                 <p className="text-xs text-gray-500 mt-1">
                    From categories: {includedCategories.join(', ')}
                </p>
            )}
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-400">
        <p>
            <strong>Disclaimer:</strong> This is an estimate for informational purposes only. Not financial advice. Consult a tax professional for guidance.
        </p>
      </div>
    </div>
  );
};
