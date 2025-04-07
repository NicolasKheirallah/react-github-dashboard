import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const RepoCommitChart = ({ commitStats, darkMode }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!commitStats || !chartRef.current) {
      return;
    }

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Get the weekly commit counts
    const weeklyData = commitStats.all || [];
    
    // Generate labels for the last 52 weeks
    const today = new Date();
    const labels = [];
    
    for (let i = 51; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      const label = `Week ${52 - i}`;
      labels.push(label);
    }
    
    // Ensure we have 52 weeks of data, padding with zeros if needed
    const paddedData = Array(52).fill(0);
    weeklyData.slice(-52).forEach((value, index) => {
      paddedData[paddedData.length - weeklyData.slice(-52).length + index] = value;
    });
    
    // Chart theme
    const isDarkMode = darkMode;
    const textColor = isDarkMode ? '#c9d1d9' : '#24292f';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Calculate background gradient
    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.1)');
    gradient.addColorStop(1, isDarkMode ? 'rgba(59, 130, 246, 0)' : 'rgba(59, 130, 246, 0)');

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Commits',
            data: paddedData,
            borderColor: '#3b82f6',
            backgroundColor: gradient,
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: '#3b82f6'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              precision: 0
            }
          },
          x: {
            grid: {
              color: gridColor,
              display: false
            },
            ticks: {
              color: textColor,
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: function(tooltipItems) {
                return tooltipItems[0].label;
              },
              label: function(context) {
                return `${context.parsed.y} commits`;
              }
            }
          }
        }
      }
    });

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [commitStats, darkMode]);

  return (
    <div className="w-full h-full">
      {commitStats ? (
        <canvas ref={chartRef}></canvas>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          No commit statistics available
        </div>
      )}
    </div>
  );
};

export default RepoCommitChart;