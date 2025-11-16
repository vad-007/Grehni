export interface Category {
  key: string;
  label: string;
  icon: string;
  color: string;
}

export interface RawTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export interface Transaction extends RawTransaction {
  category: Category;
  co2?: number; // kg CO2e
  ecoSuggestion?: {
    text: string;
    co2Saved: number;
  };
  location?: {
    lat: number;
    lng: number;
    name: string;
  }
}

// Budgeting System Types
export interface BudgetCategory {
    id: string;
    name: string;
    icon: string;
    budgeted: number;
    recurring: boolean;
}

export interface Goal {
    id: string;
    name: string;
    target: number;
    current: number;
    contribution: number; // monthly amount budgeted for this goal
}

export interface BudgetGroup {
    title: string;
    categories?: BudgetCategory[];
    goals?: Goal[];
}

export interface Budget {
    income: number;
    groups: BudgetGroup[];
}


// Family Vault Types
export type UserRole = 'Admin' | 'Contributor' | 'Viewer';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
}

export interface FamilyBudgetAllocation {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  allocated: number;
  proposals: { [userId: string]: number };
}

export interface FamilyBudget {
  [categoryId: string]: FamilyBudgetAllocation;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userName: string;
  action: string;
}

export interface ChatMessage {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  message: string;
}

export interface Vote {
  id: string;
  question: string;
  votes: { [userId: string]: 'yes' | 'no' | null };
  status: 'open' | 'closed';
}

// What-If Simulator Types
export interface SimulationInput {
  salaryChange: number; // annual change
  newMonthlyCosts: number; // new recurring costs
  oneTimeCost: number; // immediate one-time cost
}

export interface MonthlyProjection {
  month: number;
  netWorth: number;
}

export interface SimulationResult {
  baseCase: MonthlyProjection[];
  scenarioCase: MonthlyProjection[];
}