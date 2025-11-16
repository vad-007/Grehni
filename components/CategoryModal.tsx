
import React from 'react';
import type { Transaction } from '../types';
import { CATEGORIES } from '../constants';
import { Icon } from './Icon';

interface CategoryModalProps {
  transaction: Transaction;
  onClose: () => void;
  onUpdateCategory: (transactionId: string, newCategoryKey: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ transaction, onClose, onUpdateCategory }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Change Category</h3>
            <p className="text-sm text-gray-500 mt-1 truncate">For: {transaction.description}</p>
        </div>
        <div className="flex-grow overflow-y-auto p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORIES.map(category => (
                <button
                    key={category.key}
                    onClick={() => onUpdateCategory(transaction.id, category.key)}
                    className={`flex items-center text-left p-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 ${transaction.category.key === category.key ? 'bg-indigo-50' : ''}`}
                >
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${category.color}`}>
                        <Icon name={category.icon} className="w-4 h-4 text-white" />
                    </div>
                    <span className="ml-3 font-medium">{category.label}</span>
                    {transaction.category.key === category.key && (
                        <Icon name="Check" className="w-5 h-5 text-indigo-600 ml-auto" />
                    )}
                </button>
            ))}
            </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
             <button onClick={onClose} className="w-full py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};
