import React, { useMemo, useEffect, useRef } from 'react';
import type { Transaction } from '../types';
import { Icon } from './Icon';

// Leaflet is loaded from CDN, so we declare it here to satisfy TypeScript
declare const L: any;

interface EcoDashboardProps {
  transactions: Transaction[];
}

export const EcoDashboard: React.FC<EcoDashboardProps> = ({ transactions }) => {
    
    const { totalCo2, ecoScore, treesEarned, highImpactTransactions } = useMemo(() => {
        const monthlyCo2 = transactions
            .filter(t => t.co2 && t.co2 > 0)
            .reduce((sum, t) => sum + t.co2!, 0);

        const TARGET_MONTHLY_CO2 = 200; // kg CO2e, a reasonable target for a conscious individual
        const score = Math.max(0, Math.round(100 - (monthlyCo2 / TARGET_MONTHLY_CO2) * 50));
        
        const trees = score > 95 ? 2 : score > 85 ? 1 : 0;
        
        const highImpact = transactions
            .filter(t => t.co2 && t.co2 > 20) // over 20kg is high impact
            .sort((a, b) => (b.co2 ?? 0) - (a.co2 ?? 0));

        return {
            totalCo2: monthlyCo2,
            ecoScore: score,
            treesEarned: trees,
            highImpactTransactions: highImpact
        };
    }, [transactions]);
    
    if (transactions.length === 0) {
        return (
           <div className="text-center py-16 px-6 bg-white rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">No Eco Data</h3>
              <p className="text-gray-500 mt-2">Sync your bank account to track your carbon footprint.</p>
            </div>
        );
    }

  return (
    <div className="space-y-6">
        <EcoScoreCard totalCo2={totalCo2} ecoScore={ecoScore} treesEarned={treesEarned} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImpactMap transactions={transactions.filter(t => t.location)} />
            <HighImpactList transactions={highImpactTransactions} />
        </div>
    </div>
  );
};

// --- Sub-components ---

const EcoScoreCard: React.FC<{totalCo2: number, ecoScore: number, treesEarned: number}> = ({ totalCo2, ecoScore, treesEarned }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (ecoScore / 100) * circumference;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center">
                <div className="relative w-28 h-28">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                        <circle 
                            className="text-teal-500"
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45" cx="50" cy="50"
                            transform="rotate(-90 50 50)"
                            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-teal-600">{ecoScore}</span>
                        <span className="text-sm text-gray-500">Eco Score</span>
                    </div>
                </div>
                <div className="ml-6">
                    <h3 className="text-xl font-bold text-gray-800">Your Monthly Eco Report</h3>
                    <p className="text-gray-500">Based on your recent spending.</p>
                </div>
            </div>
            <div className="flex gap-6 mt-4 sm:mt-0 text-center">
                <div>
                    <p className="text-2xl font-bold text-gray-700">{totalCo2.toFixed(1)} <span className="text-base font-medium text-gray-500">kg</span></p>
                    <p className="text-sm text-gray-500">CO₂ Footprint</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-700">{treesEarned} <span className="text-2xl">🌳</span></p>
                    <p className="text-sm text-gray-500">Trees Planted</p>
                </div>
            </div>
        </div>
    );
};


const ImpactMap: React.FC<{transactions: Transaction[]}> = ({ transactions }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null); // To hold Leaflet map instance

    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([39.8283, -98.5795], 4); // Centered on US
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);
        }

        // Add markers
        if (mapInstance.current) {
            // Clear existing markers
            mapInstance.current.eachLayer((layer: any) => {
                if (layer instanceof L.Marker) {
                    mapInstance.current.removeLayer(layer);
                }
            });

            transactions.forEach(tx => {
                if (tx.location) {
                    const marker = L.marker([tx.location.lat, tx.location.lng]).addTo(mapInstance.current);
                    marker.bindPopup(`<b>${tx.description}</b><br>${tx.co2?.toFixed(1)} kg CO₂e`);
                }
            });
        }
    }, [transactions]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Impact Map</h3>
            <div ref={mapRef} className="h-80 rounded-lg z-0" />
        </div>
    );
};


const HighImpactList: React.FC<{transactions: Transaction[]}> = ({ transactions }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-700 mb-4">High-Impact Transactions</h3>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {transactions.length > 0 ? transactions.map(tx => (
                <div key={tx.id} className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-800">{tx.description}</p>
                            <p className="text-sm text-gray-600">{tx.category.label}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-orange-600">{tx.co2?.toFixed(1)} kg</p>
                            <p className="text-xs text-gray-500">CO₂e</p>
                        </div>
                    </div>
                    {tx.ecoSuggestion && (
                        <div className="mt-2 pt-2 border-t border-orange-200">
                             <p className="text-sm text-green-700">
                                <Icon name="Leaf" className="w-4 h-4 inline-block mr-1" />
                                <strong>Suggestion:</strong> {tx.ecoSuggestion.text} and save ~{tx.ecoSuggestion.co2Saved} kg CO₂e.
                            </p>
                        </div>
                    )}
                </div>
            )) : <p className="text-gray-500">No high-impact transactions this month. Great job!</p>}
        </div>
    </div>
);
