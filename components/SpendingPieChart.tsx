import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import type { Transaction } from '../types';
import { CATEGORIES } from '../constants';

interface SpendingPieChartProps {
  transactions: Transaction[];
}

export const SpendingPieChart: React.FC<SpendingPieChartProps> = ({ transactions }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const chartData = useMemo(() => {
    const spendingByCategory: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      if (tx.amount < 0 && tx.category.key !== 'Income') {
        spendingByCategory[tx.category.key] = (spendingByCategory[tx.category.key] || 0) + Math.abs(tx.amount);
      }
    });

    const sortedCategories = Object.entries(spendingByCategory).sort(([, a], [, b]) => b - a);

    const labels = sortedCategories.map(([key]) => CATEGORIES.find(c => c.key === key)?.label || key);
    const data = sortedCategories.map(([, amount]) => amount);
    const backgroundColors = sortedCategories.map(([key]) => {
      const category = CATEGORIES.find(c => c.key === key);
      // Tailwind bg colors are not real hex values, so map them manually for the chart
      const colorMap: { [key: string]: string } = {
        'bg-green-500': '#22C55E',
        'bg-yellow-500': '#EAB308',
        'bg-blue-500': '#3B82F6',
        'bg-cyan-500': '#06B6D4',
        'bg-pink-500': '#EC4899',
        'bg-red-500': '#EF4444',
        'bg-purple-500': '#8B5CF6',
        'bg-orange-500': '#F97316',
        'bg-gray-500': '#6B7280',
      };
      return category ? colorMap[category.color] || '#A0AEC0' : '#A0AEC0';
    });

    return { labels, data, backgroundColors };
  }, [transactions]);
  
  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      if (chartData.data.length > 0) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: chartData.labels,
              datasets: [{
                data: chartData.data,
                backgroundColor: chartData.backgroundColors,
                borderColor: '#ffffff',
                borderWidth: 2,
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    padding: 15,
                    font: {
                      family: 'Inter, sans-serif'
                    }
                  }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
              },
              cutout: '60%',
            }
          });
        }
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-gray-700 mb-4">Spending by Category</h3>
      <div className="relative h-80">
        {chartData.data.length > 0 ? (
          <canvas ref={chartRef}></canvas>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No spending data for this period.
          </div>
        )}
      </div>
    </div>
  );
};
