
import type { Category, User, FamilyBudget } from './types';

export const CATEGORIES: Category[] = [
  { key: 'Groceries', label: 'Groceries', icon: 'ShoppingCart', color: 'bg-green-500' },
  { key: 'Dining', label: 'Dining Out', icon: 'Restaurant', color: 'bg-yellow-500' },
  { key: 'Transportation', label: 'Transportation', icon: 'Car', color: 'bg-blue-500' },
  { key: 'Utilities', label: 'Utilities', icon: 'Home', color: 'bg-cyan-500' },
  { key: 'Shopping', label: 'Shopping', icon: 'ShoppingBag', color: 'bg-pink-500' },
  { key: 'Health', label: 'Health & Wellness', icon: 'Heart', color: 'bg-red-500' },
  { key: 'Entertainment', label: 'Entertainment', icon: 'Ticket', color: 'bg-purple-500' },
  { key: 'Travel', label: 'Travel', icon: 'Plane', color: 'bg-orange-500' },
  { key: 'Income', label: 'Income', icon: 'Dollar', color: 'bg-emerald-500' },
  { key: 'Miscellaneous', label: 'Miscellaneous', icon: 'Dots', color: 'bg-gray-500' },
];

export const CATEGORY_KEYS = CATEGORIES.map(c => c.key);

export const USERS: User[] = [
  { id: 'u1', name: 'Dad', avatar: '👨', role: 'Admin' },
  { id: 'u2', name: 'Mom', avatar: '👩', role: 'Admin' },
  { id: 'u3', name: 'Teen', avatar: '🧑‍💻', role: 'Contributor' },
  { id: 'u4', name: 'Kid', avatar: '👧', role: 'Viewer' },
];

export const INITIAL_FAMILY_BUDGET: FamilyBudget = {
    'entertainment': {
        categoryId: 'entertainment',
        categoryName: 'Entertainment',
        icon: 'Ticket',
        color: 'bg-purple-500',
        allocated: 200,
        proposals: {
            'u1': 70,
            'u2': 70,
            'u3': 60,
        }
    },
    'dining': {
        categoryId: 'dining',
        categoryName: 'Dining Out',
        icon: 'Restaurant',
        color: 'bg-yellow-500',
        allocated: 300,
        proposals: {}
    },
    'groceries': {
        categoryId: 'groceries',
        categoryName: 'Groceries',
        icon: 'ShoppingCart',
        color: 'bg-green-500',
        allocated: 800,
        proposals: {}
    }
};
