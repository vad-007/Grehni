import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { SpendingPieChart } from './SpendingPieChart';
import { ForecastChart } from './ForecastChart';
import { TaxEstimator } from './TaxEstimator';

interface AnalyticsDashboardProps {
  transactions: Transaction[];
}

type DateRange = '30d' | '90d' | 'all';

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ transactions }) => {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const filteredTransactions = useMemo(() => {
    if (dateRange === 'all') {
      return transactions;
    }
    const now = new Date();
    const days = dateRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.setDate(now.getDate() - days));
    
    return transactions.filter(t => new Date(t.date) >= cutoffDate);
  }, [transactions, dateRange]);

  if (transactions.length === 0) {
    return (
       <div className="text-center py-16 px-6 bg-white rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">No Analytics Data</h3>
          <p className="text-gray-500 mt-2">Sync your bank account to generate insights about your spending.</p>
        </div>
    );
  }

  const renderDateFilter = () => (
    <div className="flex justify-center sm:justify-start mb-6">
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        {(['30d', '90d', 'all'] as DateRange[]).map(range => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              dateRange === range
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'All Time'}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderDateFilter()}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main column */}
        <div className="lg:col-span-3 space-y-6">
          <SpendingPieChart transactions={filteredTransactions} />
        </div>
        {/* Side column */}
        <div className="lg:col-span-2 space-y-6">
          <ForecastChart transactions={transactions} />
          <TaxEstimator transactions={filteredTransactions} />
        </div>
      </div>
    </div>
  );
};
