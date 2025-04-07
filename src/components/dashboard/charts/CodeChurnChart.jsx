import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const CodeChurnChart = ({ codeFrequency, darkMode }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!codeFrequency || !Array.isArray(codeFrequency) || codeFrequency.length === 0 || !chartRef.current) {
      return;
    }

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Process code frequency data
    // Format: array of arrays where each array is [timestamp, additions, deletions]
    // Deletions are negative numbers
    const processedData = codeFrequency.map(week => {
      // Convert Unix timestamp (seconds) to JavaScript timestamp (milliseconds)
      const date = new Date(week[0] * 1000);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const additions = week[1] || 0;
      const deletions = Math.abs(week[2] || 0); // Convert to positive for display
      
      return { date, dateString, additions, deletions };
    });
    
    // Sort by date (should already be sorted, but just in case)
    processedData.sort((a, b) => a.date - b.date);
    
    // Prepare chart data
    const labels = processedData.map(d => d.dateString);
    const additionsData = processedData.map(d => d.additions);
    const deletionsData = processedData.map(d => d.deletions);
    
    // Chart theme
    const isDarkMode = darkMode;
    const textColor = isDarkMode ? '#c9d1d9' : '#24292f';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Additions',
            data: additionsData,
            borderColor: '#10b981', // Green
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'Deletions',
            data: deletionsData,
            borderColor: '#ef4444', // Red
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderWidth: 2,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            grid: {
              color: gridColor,
              display: false
            },
            ticks: {
              color: textColor,
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 10
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              callback: function(value) {
                // Format large numbers
                if (value >= 1000) {
                  return (value / 1000).toFixed(1) + 'k';
                }
                return value;
              }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                return tooltipItems[0].label;
              },
              label: function(context) {
                const value = context.raw;
                if (context.dataset.label === 'Additions') {
                  return `${value.toLocaleString()} lines added`;
                } else {
                  return `${value.toLocaleString()} lines deleted`;
                }
              }
            }
          },
          title: {
            display: true,
            text: 'Code Changes Over Time',
            color: textColor,
            font: {
              size: 16
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
  }, [codeFrequency, darkMode]);

  return (
    <div className="w-full h-full">
      {codeFrequency && Array.isArray(codeFrequency) && codeFrequency.length > 0 ? (
        <canvas ref={chartRef}></canvas>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          No code frequency data available
        </div>
      )}
    </div>
  );
};

export default CodeChurnChart;