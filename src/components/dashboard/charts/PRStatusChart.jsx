// src/components/dashboard/charts/PRStatusChart.jsx
import React, { useEffect, useRef } from 'react';
import { useGithub } from '../../../context/GithubContext';
import Chart from 'chart.js/auto';

const PRStatusChart = ({ size }) => {
  const { pullRequests, darkMode } = useGithub();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    if (!pullRequests || pullRequests.length === 0) return;
    
    // Count PRs by state
    const stateCounts = { 'Open': 0, 'Closed': 0, 'Merged': 0 };
    
    pullRequests.forEach(pr => {
      if (pr.state in stateCounts) {
        stateCounts[pr.state]++;
      }
    });
    
    // Define chart colors
    const colors = ['#10b981', '#ef4444', '#8b5cf6']; // Green, Red, Purple
    
    // Clean up previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(stateCounts),
        datasets: [{
          data: Object.values(stateCounts),
          backgroundColor: colors,
          borderColor: darkMode ? '#1f2937' : '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: darkMode ? '#e5e7eb' : '#1f2937',
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round(value / total * 100);
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    
    // Clean up on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [pullRequests, darkMode]);
  
  if (!pullRequests || pullRequests.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No pull request data available</p>
      </div>
    );
  }
  
  return (
    <div className="h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default PRStatusChart;