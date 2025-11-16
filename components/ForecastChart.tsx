import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import type { Transaction } from '../types';
import { simpleLinearRegression } from '../utils/analytics';

interface ForecastChartProps {
  transactions: Transaction[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ transactions }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const forecastData = useMemo(() => {
    const monthlySpending: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      if (tx.amount < 0 && tx.category.key !== 'Income') {
        const date = new Date(tx.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
        monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + Math.abs(tx.amount);
      }
    });

    const sortedMonths = Object.keys(monthlySpending).sort();
    
    if (sortedMonths.length < 2) {
        return { labels: [], historical: [], forecast: [] }; // Not enough data for regression
    }

    const regressionData: [number, number][] = sortedMonths.map((monthKey, index) => [index, monthlySpending[monthKey]]);
    
    const { slope, intercept } = simpleLinearRegression(regressionData);

    const labels = [];
    const historical = [];
    const forecastLine = [];
    const lastMonthIndex = sortedMonths.length - 1;

    // Generate labels and data for historical and future months
    for (let i = 0; i < sortedMonths.length + 3; i++) {
        const monthKey = sortedMonths[i] || (() => {
            const lastDate = new Date(sortedMonths[lastMonthIndex]);
            lastDate.setMonth(lastDate.getMonth() + (i - lastMonthIndex));
            return `${lastDate.getFullYear()}-${String(lastDate.getMonth()).padStart(2, '0')}`;
        })();
        
        const date = new Date(monthKey + '-02'); // Use day 2 to avoid timezone issues
        labels.push(date.toLocaleString('default', { month: 'short', year: '2-digit' }));

        if(i <= lastMonthIndex) {
            historical.push(monthlySpending[monthKey]);
            forecastLine.push(null); // No forecast for historical data points
        } else {
            if (i === lastMonthIndex + 1) {
                // Connect forecast line to the last historical point
                forecastLine.push(monthlySpending[sortedMonths[lastMonthIndex]]);
            }
            const predictedValue = slope * i + intercept;
            forecastLine.push(predictedValue > 0 ? predictedValue : 0);
        }
    }
    
    return { labels, historical, forecast: forecastLine };
  }, [transactions]);
  
  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      if (forecastData.labels.length > 0) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: forecastData.labels,
              datasets: [{
                label: 'Historical Spending',
                data: forecastData.historical,
                borderColor: '#4F46E5',
                backgroundColor: '#4F46E5',
                tension: 0.1,
                fill: false
              }, {
                label: 'Forecast',
                data: forecastData.forecast,
                borderColor: '#F97316',
                backgroundColor: '#F97316',
                borderDash: [5, 5],
                tension: 0.1,
                fill: false
              }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                         callbacks: {
                            label: (context) => `Spending: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.raw as number)}`
                         }
                    }
                },
                scales: {
                    y: { ticks: { callback: (value) => `$${Number(value) / 1000}k` } }
                }
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
  }, [forecastData]);
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-gray-700 mb-4">3-Month Spending Forecast</h3>
      <div className="relative h-64">
        {forecastData.labels.length > 0 ? (
          <canvas ref={chartRef}></canvas>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-center text-gray-500 p-4">
            Not enough monthly data to create a forecast.
          </div>
        )}
      </div>
    </div>
  );
};
