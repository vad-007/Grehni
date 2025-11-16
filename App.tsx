import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { TransactionList } from './components/TransactionList';
import { Spinner } from './components/Spinner';
import { CategoryModal } from './components/CategoryModal';
import { BudgetDashboard } from './components/BudgetDashboard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { FamilyVaultDashboard } from './components/FamilyVaultDashboard';
import { EcoDashboard } from './components/EcoDashboard';
import { SimulatorDashboard } from './components/SimulatorDashboard';
import { SecureLogin } from './components/SecureLogin';
import { useAuth } from './hooks/useAuth';
import * as cryptoService from './services/cryptoService';
import * as blockchainService from './services/blockchainService';
import { fetchTransactions as mockFetchTransactions } from './services/plaidService';
import { categorizeTransactions } from './services/geminiService';
import { calculateCarbonFootprint } from './services/ecoService';
import type { Transaction } from './types';
import { CATEGORIES } from './constants';

type View = 'transactions' | 'budget' | 'analytics' | 'family' | 'eco' | 'simulator';

const App: React.FC = () => {
  const { isAuthenticated, encryptionKey, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [view, setView] = useState<View>('transactions');

  // Test vector to verify encryption/decryption
  useEffect(() => {
    if (isAuthenticated && encryptionKey) {
      console.log('--- RUNNING ENCRYPTION TEST VECTOR ---');
      const testData = { budget: '$1000 groceries' };
      const testDataString = JSON.stringify(testData);
      console.log('Original data:', testDataString);

      cryptoService.encrypt(testDataString, encryptionKey)
        .then(encrypted => {
          console.log('Encrypted:', encrypted);
          return cryptoService.decrypt(encrypted, encryptionKey);
        })
        .then(decrypted => {
          console.log('Decrypted:', decrypted);
          const decryptedObject = JSON.parse(decrypted);
          if (decryptedObject.budget === testData.budget) {
            console.log('✅ TEST VECTOR PASSED: Decrypted data matches original.');
          } else {
            console.error('❌ TEST VECTOR FAILED: Data mismatch.');
          }
        })
        .catch(err => {
          console.error('❌ TEST VECTOR FAILED:', err);
        });
      console.log('--- END OF TEST VECTOR ---');
    }
  }, [isAuthenticated, encryptionKey]);

  const handleSync = useCallback(async () => {
    if (!encryptionKey) {
      setError('Encryption key not available. Cannot sync.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch and categorize (plaintext descriptions sent to AI)
      const rawTransactions = await mockFetchTransactions();
      const descriptions = rawTransactions.map(t => t.description);
      const categorizedData = await categorizeTransactions(descriptions);
      
      const mergedTransactions: Transaction[] = rawTransactions.map(rawTx => {
        const categoryInfo = categorizedData.find(catTx => catTx.originalDescription === rawTx.description);
        let categoryKey = categoryInfo?.category ?? 'Miscellaneous';
        
        if (categoryKey === 'Dining Out') categoryKey = 'Dining';
        if (categoryKey === 'Health & Wellness') categoryKey = 'Health';

        const category = CATEGORIES.find(c => c.key === categoryKey) ?? CATEGORIES.find(c => c.key === 'Miscellaneous')!;

        return {
          ...rawTx,
          category: category,
        };
      });

      const ecoTransactions = await calculateCarbonFootprint(mergedTransactions);
      
      // 2. Encrypt the full transaction data before "storing"
      const encryptedTransactions = await Promise.all(
          ecoTransactions.map(tx => cryptoService.encrypt(JSON.stringify(tx), encryptionKey))
      );
      console.log("Encrypted data ready for server storage:", encryptedTransactions);

      // 3. Log action to blockchain audit trail
      const dataHash = cryptoService.hashData(JSON.stringify(ecoTransactions));
      await blockchainService.logAction('CurrentUser', 'SYNC_TRANSACTIONS', dataHash);

      // 4. Set local state with decrypted data for UI
      setTransactions(ecoTransactions);

    } catch (err) {
      console.error(err);
      setError('Failed to sync and categorize transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [encryptionKey]);

  const handleOpenCategoryModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleCloseCategoryModal = () => {
    setEditingTransaction(null);
  };

  const handleUpdateCategory = (transactionId: string, newCategoryKey: string) => {
    const updatedTransactions = transactions.map(t => {
        if (t.id === transactionId) {
          const newCategory = CATEGORIES.find(c => c.key === newCategoryKey) ?? CATEGORIES.find(c => c.key === 'Miscellaneous')!;
          return { ...t, category: newCategory };
        }
        return t;
      });
    
    setTransactions(updatedTransactions);

    // Log action to blockchain
    const dataHash = cryptoService.hashData(JSON.stringify({ transactionId, newCategoryKey }));
    blockchainService.logAction('CurrentUser', 'UPDATE_CATEGORY', dataHash);
    
    handleCloseCategoryModal();
  };

  if (!isAuthenticated) {
    return <SecureLogin />;
  }
  
  const renderView = () => {
    switch (view) {
        case 'budget':
            return <BudgetDashboard transactions={transactions} />;
        case 'analytics':
            return <AnalyticsDashboard transactions={transactions} />;
        case 'family':
            return <FamilyVaultDashboard />;
        case 'eco':
            return <EcoDashboard transactions={transactions} />;
        case 'simulator':
            return <SimulatorDashboard />;
        case 'transactions':
        default:
             return transactions.length > 0 ? (
                <TransactionList transactions={transactions} onEditCategory={handleOpenCategoryModal} />
            ) : (
                !isLoading && (
                    <div className="text-center py-16 px-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">No Transactions Yet</h3>
                    <p className="text-gray-500 mt-2">Click "Sync with Bank" to get started and see your categorized expenses.</p>
                    </div>
                )
            );
    }
  };

  return (
    <div className="min-h-screen text-gray-800">
      <Header isAuthenticated={isAuthenticated} onLogout={logout} />
      <main className="container mx-auto p-4 md:p-6 max-w-5xl">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-700">Your Finances</h2>
              <p className="text-gray-500 mt-1">Sync your bank account to see your latest activity.</p>
            </div>
            <button
              onClick={handleSync}
              disabled={isLoading}
              className="mt-4 sm:mt-0 w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Syncing...
                </>
              ) : (
                'Sync with Bank'
              )}
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
              <button
                onClick={() => setView('transactions')}
                className={`${
                  view === 'transactions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Transactions
              </button>
              <button
                onClick={() => setView('budget')}
                className={`${
                  view === 'budget'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Budget
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`${
                  view === 'analytics'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Analytics
              </button>
               <button
                onClick={() => setView('eco')}
                className={`${
                  view === 'eco'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Eco Tracker
              </button>
              <button
                onClick={() => setView('family')}
                className={`${
                  view === 'family'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Family Vault
              </button>
               <button
                onClick={() => setView('simulator')}
                className={`${
                  view === 'simulator'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Simulator
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {renderView()}
        
      </main>
      
      {editingTransaction && (
        <CategoryModal
          transaction={editingTransaction}
          onClose={handleCloseCategoryModal}
          onUpdateCategory={handleUpdateCategory}
        />
      )}
    </div>
  );
};

export default App;