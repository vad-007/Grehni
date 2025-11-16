import type { Budget } from '../types';

/**
 * Sample budget data for a user with a $5,000 monthly income.
 * This is a zero-based budget, where income - budgeted amounts = 0.
 * Income: $5000
 * Bills: $2170
 * Variable Spending: $1500
 * Financial Goals: $1330
 * Total Budgeted: $5000
 */
export const sampleBudget: Budget = {
  income: 5000.00,
  groups: [
    {
      title: 'Monthly Bills',
      categories: [
        { id: 'b1', name: 'Rent/Mortgage', icon: 'Home', budgeted: 1800.00, recurring: true },
        { id: 'b2', name: 'Utilities', icon: 'Utilities', budgeted: 150.00, recurring: true },
        { id: 'b3', name: 'Internet', icon: 'Wifi', budgeted: 60.00, recurring: true },
        { id: 'b4', name: 'Car Insurance', icon: 'Car', budgeted: 120.00, recurring: true },
        { id: 'b5', name: 'Subscriptions', icon: 'Ticket', budgeted: 40.00, recurring: true },
      ],
    },
    {
      title: 'Variable Spending',
      categories: [
        { id: 'v1', name: 'Groceries', icon: 'ShoppingCart', budgeted: 600.00, recurring: true },
        { id: 'v2', name: 'Dining', icon: 'Restaurant', budgeted: 250.00, recurring: true },
        { id: 'v3', name: 'Transportation', icon: 'Car', budgeted: 200.00, recurring: true },
        { id: 'v4', name: 'Shopping', icon: 'ShoppingBag', budgeted: 300.00, recurring: false },
        { id: 'v5', name: 'Entertainment', icon: 'Ticket', budgeted: 150.00, recurring: false },
        { id: 'v6', name: 'Health', icon: 'Heart', budgeted: 50.00, recurring: false },
      ],
    },
    {
      title: 'Financial Goals',
      goals: [
        { id: 'g1', name: 'Credit Card Payoff', target: 5000.00, current: 2200.00, contribution: 500.00 },
        { id: 'g2', name: 'Vacation Fund', target: 2000.00, current: 750.00, contribution: 250.00 },
        { id: 'g3', name: 'Emergency Fund', target: 10000.00, current: 4500.00, contribution: 580.00 },
      ],
    },
  ],
};
