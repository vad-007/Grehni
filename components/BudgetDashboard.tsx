import React, { useMemo } from 'react';
import { sampleBudget } from '../data/budgetData';
import type { Transaction, BudgetGroup } from '../types';
import { BudgetCategoryItem } from './BudgetCategoryItem';
import { GoalItem } from './GoalItem';
import { Icon } from './Icon';

interface BudgetDashboardProps {
  transactions: Transaction[];
}

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({ transactions }) => {
  const { totalBudgeted, spendingByCategory } = useMemo(() => {
    let totalBudgeted = 0;
    const spendingByCategory: Record<string, number> = {};

    sampleBudget.groups.forEach(group => {
      if (group.categories) {
        group.categories.forEach(cat => {
          totalBudgeted += cat.budgeted;
          spendingByCategory[cat.name] = 0; // Initialize spending
        });
      }
      if (group.goals) {
        group.goals.forEach(goal => {
          totalBudgeted += goal.contribution;
        });
      }
    });
    
    // Calculate spending from transactions
    transactions.forEach(tx => {
        // Find a matching budget category for the transaction's category label
        // This is a simple name-based match. A more robust system might use IDs.
        const categoryKey = Object.keys(spendingByCategory).find(key => key.toLowerCase() === tx.category.label.toLowerCase());
        if(categoryKey && tx.amount < 0) {
            spendingByCategory[categoryKey] += Math.abs(tx.amount);
        }
    });

    return { totalBudgeted, spendingByCategory };
  }, [transactions]);

  const remainingToBudget = sampleBudget.income - totalBudgeted;

  const renderSummary = () => {
    let remainingColor = 'text-yellow-600';
    let remainingMessage = `$${remainingToBudget.toFixed(2)} left to budget`;
    
    if (remainingToBudget === 0) {
        remainingColor = 'text-green-600';
        remainingMessage = "You've budgeted every dollar!";
    } else if (remainingToBudget < 0) {
        remainingColor = 'text-red-600';
        remainingMessage = `Over-budgeted by $${Math.abs(remainingToBudget).toFixed(2)}`;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-500">Monthly Income</p>
                    <p className="text-2xl font-bold text-gray-800">${sampleBudget.income.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Budgeted</p>
                    <p className="text-2xl font-bold text-gray-800">${totalBudgeted.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Remaining</p>
                    <p className={`text-2xl font-bold ${remainingColor}`}>{remainingToBudget === 0 ? '✓ $0.00' : `$${remainingToBudget.toFixed(2)}`}</p>
                </div>
            </div>
             {remainingToBudget === 0 && (
                <p className="text-center text-green-600 font-medium mt-4 text-sm">
                    {remainingMessage}
                </p>
            )}
        </div>
    );
  };
  
  const handleExportPdf = () => {
    // Placeholder for PDF export functionality
    console.log("Export to PDF clicked. This would trigger a PDF generation process.");
    alert("PDF export functionality is not yet implemented.");
  };

  return (
    <div className="space-y-6">
        {renderSummary()}

        <div className="flex justify-end gap-4">
             <button className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
                Add Category
            </button>
            <button 
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
            >
                <Icon name="Pdf" className="w-4 h-4" />
                Export to PDF
            </button>
        </div>

        {sampleBudget.groups.map((group: BudgetGroup) => (
            <div key={group.title}>
                <h3 className="text-lg font-bold text-gray-700 px-2 mb-2">{group.title}</h3>
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {group.categories?.map((category) => (
                        <BudgetCategoryItem 
                            key={category.id} 
                            category={category} 
                            spent={spendingByCategory[category.name] ?? 0}
                        />
                    ))}
                    {group.goals?.map((goal) => (
                        <GoalItem key={goal.id} goal={goal} />
                    ))}
                </div>
            </div>
        ))}
    </div>
  );
};
