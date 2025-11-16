
import React from 'react';
import { TransactionItem } from './TransactionItem';
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onEditCategory: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEditCategory }) => {
  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, tx) => {
    const date = new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-gray-500 px-2 mb-2">{date}</h3>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {groupedTransactions[date].map((transaction, index) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEditCategory={onEditCategory}
                isLast={index === groupedTransactions[date].length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
