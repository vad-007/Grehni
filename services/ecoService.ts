import type { Transaction } from '../types';

// This file simulates a backend service or a complex calculation engine.
// In a real-world scenario, this data would come from a dedicated API.
const CARBON_FOOTPRINT_DB = {
    // keyword: { co2_kg_per_unit, unit, suggestion? }
    'BEEF': { co2: 27, unit: 'kg', suggestion: { text: 'Switch to chicken', co2Saved: 20 } },
    'VEGGIES': { co2: 2, unit: 'kg' },
    'FRUIT': { co2: 1.1, unit: 'kg' },
    'GAS': { co2: 2.3, unit: 'gallon' },
    'SHELL': { co2: 2.3, unit: 'gallon' },
    'CHEVRON': { co2: 2.3, unit: 'gallon' },
    'UNITED AIRLINES': {
        co2: 500,
        unit: 'flight',
        suggestion: { text: 'Take the train next time', co2Saved: 450 },
        location: {
            'SFO-JFK': { lat: 37.6213, lng: -122.3790, name: 'San Francisco International Airport' }
        }
    },
};

const findMatch = (description: string) => {
    const upperDesc = description.toUpperCase();
    for (const key in CARBON_FOOTPRINT_DB) {
        if (upperDesc.includes(key)) {
            return { key, data: CARBON_FOOTPRINT_DB[key as keyof typeof CARBON_FOOTPRINT_DB] };
        }
    }
    return null;
}

export const calculateCarbonFootprint = (transactions: Transaction[]): Promise<Transaction[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const enrichedTransactions = transactions.map(tx => {
                const match = findMatch(tx.description);
                if (match && tx.amount < 0) {
                    const amount = Math.abs(tx.amount);
                    let co2 = 0;

                    // Simple estimation logic
                    if (match.data.unit === 'kg') {
                        // Assume average cost per kg to estimate weight
                        const avgCostPerKg = 15; // Example: $15/kg for beef
                        const estimatedKg = amount / avgCostPerKg;
                        co2 = estimatedKg * match.data.co2;
                    } else if (match.data.unit === 'gallon') {
                        const avgCostPerGallon = 4; // Example: $4/gallon
                        const estimatedGallons = amount / avgCostPerGallon;
                        co2 = estimatedGallons * match.data.co2;
                    } else if (match.data.unit === 'flight') {
                        co2 = match.data.co2;
                    }
                    
                    const newTx = { ...tx, co2: parseFloat(co2.toFixed(2)) };

                    // FIX: Property 'suggestion' does not exist on type '{ co2: number; unit: string;...}'.
                    // Use a type guard to check if 'suggestion' exists on the object before accessing it.
                    if ('suggestion' in match.data && match.data.suggestion) {
                        newTx.ecoSuggestion = match.data.suggestion;
                    }
                    
                    // FIX: Property 'location' does not exist on type '{ co2: number; unit: string;...}'.
                    // Use a type guard to check if 'location' exists on the object before accessing it.
                    if (match.key === 'UNITED AIRLINES' && 'location' in match.data && match.data.location) {
                       const flightMatch = tx.description.match(/([A-Z]{3})-([A-Z]{3})/);
                       if (flightMatch) {
                           const routeKey = `${flightMatch[1]}-${flightMatch[2]}`;
                           const locData = match.data.location[routeKey as keyof typeof match.data.location];
                           if(locData) {
                                newTx.location = locData;
                           }
                       }
                    }

                    return newTx;
                }
                return tx;
            });
            resolve(enrichedTransactions);
        }, 1000); // Simulate API call
    });
};