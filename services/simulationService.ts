import type { SimulationInput, SimulationResult } from '../types';
import { sampleBudget } from '../data/budgetData';

const SIMULATION_MONTHS = 60; // 5 years
const INITIAL_NET_WORTH = 15000; // Assume a starting net worth for the user
const VOLATILITY = 0.08; // Represents market/investment volatility for Monte Carlo

/**
 * Runs a Monte Carlo simulation to forecast net worth.
 * @param input The user's what-if scenario.
 * @param inflationForecast An array of annual inflation rates.
 * @returns A promise that resolves to the simulation results.
 */
export const runMonteCarloSimulation = (
  input: SimulationInput,
  inflationForecast: number[]
): Promise<SimulationResult> => {
  return new Promise(resolve => {
    // Calculate base monthly income and expenses from the sample budget
    const baseMonthlyIncome = sampleBudget.income;
    const baseMonthlyExpenses = sampleBudget.groups.reduce((total, group) => {
      const categoryExpenses = group.categories?.reduce((sum, cat) => sum + cat.budgeted, 0) || 0;
      const goalContributions = group.goals?.reduce((sum, goal) => sum + goal.contribution, 0) || 0;
      return total + categoryExpenses + goalContributions;
    }, 0);

    const baseCase = projectPath(
      baseMonthlyIncome,
      baseMonthlyExpenses,
      0, // oneTimeCost
      inflationForecast
    );
    
    const scenarioCase = projectPath(
      baseMonthlyIncome + input.salaryChange / 12,
      baseMonthlyExpenses + input.newMonthlyCosts,
      input.oneTimeCost,
      inflationForecast
    );

    resolve({ baseCase, scenarioCase });
  });
};

/**
 * Helper function to project a single financial path.
 */
const projectPath = (
    monthlyIncome: number,
    monthlyExpenses: number,
    oneTimeCost: number,
    inflationForecast: number[]
) => {
    const projections = [];
    let currentNetWorth = INITIAL_NET_WORTH - oneTimeCost;

    for (let month = 0; month <= SIMULATION_MONTHS; month++) {
        if (month === 0) {
            projections.push({ month: 0, netWorth: currentNetWorth });
            continue;
        }

        const yearIndex = Math.floor((month - 1) / 12);
        const annualInflation = inflationForecast[Math.min(yearIndex, inflationForecast.length - 1)];
        const monthlyInflation = (1 + annualInflation) ** (1/12) - 1;

        const inflatedExpenses = monthlyExpenses * ((1 + monthlyInflation) ** month);
        
        // Monte Carlo: Add some randomness to savings to simulate investment returns/losses
        const randomFactor = 1 + (Math.random() - 0.5) * VOLATILITY;
        const monthlySavings = (monthlyIncome - inflatedExpenses) * randomFactor;
        
        currentNetWorth += monthlySavings;
        projections.push({ month, netWorth: currentNetWorth });
    }
    return projections;
};