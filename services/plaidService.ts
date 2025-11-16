import type { RawTransaction } from '../types';

const mockTransactions: RawTransaction[] = [
  { id: '1', date: '2024-07-28', description: 'TRADER JOES #123', amount: -85.43 },
  { id: '2', date: '2024-07-28', description: 'SHELL OIL 52612234', amount: -45.12 },
  { id: '3', date: '2024-07-27', description: 'NETFLIX.COM', amount: -15.49 },
  { id: '4', date: '2024-07-27', description: 'STARBUCKS STORE 0292', amount: -6.75 },
  { id: '5', date: '2024-07-26', description: 'AMAZON.COM*MK8EC3423', amount: -124.99 },
  { id: '6', date: '2024-07-26', description: 'PG&E UTILITIES', amount: -112.80 },
  { id: '7', date: '2024-07-25', description: 'PAYROLL DEPOSIT - ACME INC', amount: 2500.00 },
  { id: '8', date: '2024-07-24', description: 'THE CORNER BISTRO', amount: -62.50 },
  { id: '9', date: '2024-07-23', description: 'AMC THEATRES #2321', amount: -32.00 },
  { id: '10', date: '2024-07-22', description: 'CVS PHARMACY #0342', amount: -21.15 },
  { id: '11', date: '2024-07-21', description: 'UNITED AIRLINES FLIGHT SFO-JFK', amount: -453.21 },
  { id: '12', date: '2024-07-20', description: 'WALMART - GROUND BEEF', amount: -15.33 },
  { id: '13', date: '2024-07-20', description: 'SAFEWAY - VEGGIES & FRUIT', amount: -25.50},
  { id: '14', date: '2024-07-19', description: 'CHEVRON GAS', amount: -55.00},
];

export const fetchTransactions = (): Promise<RawTransaction[]> => {
  return new Promise(resolve => {
    // Simulate network delay
    setTimeout(() => {
      resolve(mockTransactions);
    }, 1500);
  });
};
