import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { SimulationResult } from '../types';

interface SimulationResultsChartProps {
  results: SimulationResult;
}

export const SimulationResultsChart: React.FC<SimulationResultsChartProps> = ({ results }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const labels = results.baseCase.map(p => `Year ${Math.floor(p.month / 12)}`);
      // Display a label for every 12 months (each year)
      const filteredLabels = labels.map((label, index) => index % 12 === 0 ? label : '');

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: filteredLabels,
            datasets: [
              {
                label: 'Current Path',
                data: results.baseCase.map(p => p.netWorth),
                borderColor: '#6B7280', // Gray
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
              },
              {
                label: 'New Scenario',
                data: results.scenarioCase.map(p => p.netWorth),
                borderColor: '#4F46E5', // Indigo
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
              },
              tooltip: {
                callbacks: {
                  label: (context) => `Net Worth: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.raw as number)}`
                }
              }
            },
            scales: {
              y: {
                ticks: {
                  callback: (value) => `$${Number(value) / 1000}k`
                }
              },
              x: {
                grid: {
                    display: false,
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [results]);
  
  return (
    <div className="relative h-80 mt-6">
        <canvas ref={chartRef}></canvas>
    </div>
  );
};