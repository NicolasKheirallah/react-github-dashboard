import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useGithub } from '../../../context/GithubContext';

const CodeChurnChart = ({ size = 'medium', config = {} }) => {
  const { darkMode } = useGithub();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartType, setChartType] = useState('line');
  const [viewMode, setViewMode] = useState('separate'); // 'separate' or 'net'

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Generate more realistic sample data if we don't have real data
    // This is just for visualization - should be replaced with real data
    const generateSampleData = () => {
      const now = new Date();
      const weeks = 12; // Show 12 weeks of data
      const processedData = [];
      
      // Create data with more realistic patterns
      for (let i = 0; i < weeks; i++) {
        const date = new Date();
        date.setDate(now.getDate() - (i * 7)); // Go back by weeks
        
        // Generate realistic patterns:
        // - More activity on middle weeks
        // - Random spikes
        // - More additions than deletions generally
        const weekFactor = Math.sin((i / weeks) * Math.PI); // Higher in middle weeks
        const randomFactor = Math.random() * 0.5 + 0.5; // Random between 0.5-1
        const spikeFactor = Math.random() > 0.8 ? 3 : 1; // Occasional spikes
        
        const baseAdditions = 200 + (weekFactor * 400);
        const baseDeletions = 100 + (weekFactor * 250);
        
        processedData.push({
          date,
          dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          additions: Math.floor(baseAdditions * randomFactor * spikeFactor),
          deletions: Math.floor(baseDeletions * randomFactor * spikeFactor)
        });
      }
      
      // Sort by date (oldest first)
      return processedData.sort((a, b) => a.date - b.date);
    };
    
    const processedData = generateSampleData();
    
    // Prepare chart data
    const labels = processedData.map(d => d.dateString);
    const additionsData = processedData.map(d => d.additions);
    const deletionsData = processedData.map(d => d.deletions);
    const netChangesData = processedData.map(d => d.additions - d.deletions);
    
    // Chart theme
    const isDarkMode = darkMode;
    const textColor = isDarkMode ? '#c9d1d9' : '#24292f';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const backgroundColor = isDarkMode ? '#0d1117' : '#ffffff';
    
    // Calculate background gradient for additions
    const ctx = chartRef.current.getContext('2d');
    const additionsGradient = ctx.createLinearGradient(0, 0, 0, 300);
    additionsGradient.addColorStop(0, isDarkMode ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.1)');
    additionsGradient.addColorStop(1, isDarkMode ? 'rgba(16, 185, 129, 0)' : 'rgba(16, 185, 129, 0)');
    
    // Calculate background gradient for deletions
    const deletionsGradient = ctx.createLinearGradient(0, 0, 0, 300);
    deletionsGradient.addColorStop(0, isDarkMode ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.1)');
    deletionsGradient.addColorStop(1, isDarkMode ? 'rgba(239, 68, 68, 0)' : 'rgba(239, 68, 68, 0)');
    
    // Calculate background gradient for net changes
    const netGradient = ctx.createLinearGradient(0, 0, 0, 300);
    netGradient.addColorStop(0, isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.1)');
    netGradient.addColorStop(1, isDarkMode ? 'rgba(59, 130, 246, 0)' : 'rgba(59, 130, 246, 0)');

    // Define datasets based on view mode
    let datasets = [];
    
    if (viewMode === 'separate') {
      datasets = [
        {
          label: 'Additions',
          data: additionsData,
          borderColor: '#10b981', // Green
          backgroundColor: chartType === 'line' ? additionsGradient : 'rgba(16, 185, 129, 0.7)',
          fill: chartType === 'line',
          tension: 0.4,
          pointRadius: chartType === 'line' ? 3 : 0,
          pointHoverRadius: 5,
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Deletions',
          data: deletionsData,
          borderColor: '#ef4444', // Red
          backgroundColor: chartType === 'line' ? deletionsGradient : 'rgba(239, 68, 68, 0.7)',
          fill: chartType === 'line',
          tension: 0.4,
          pointRadius: chartType === 'line' ? 3 : 0,
          pointHoverRadius: 5,
          borderWidth: 2,
          yAxisID: 'y'
        }
      ];
    } else {
      // Net changes view
      datasets = [
        {
          label: 'Net Changes',
          data: netChangesData,
          borderColor: '#3b82f6', // Blue
          backgroundColor: (context) => {
            const value = context.raw;
            return value >= 0 ? 
              'rgba(16, 185, 129, 0.7)' : // Green for positive
              'rgba(239, 68, 68, 0.7)';   // Red for negative
          },
          fill: chartType === 'line',
          tension: 0.4,
          pointRadius: chartType === 'line' ? 3 : 0,
          pointHoverRadius: 5,
          borderWidth: 2
        }
      ];
    }

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels,
        datasets
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
            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
            borderWidth: 1,
            callbacks: {
              title: function(tooltipItems) {
                return tooltipItems[0].label;
              },
              label: function(context) {
                const value = context.raw;
                if (context.dataset.label === 'Additions') {
                  return `${value.toLocaleString()} lines added`;
                } else if (context.dataset.label === 'Deletions') {
                  return `${value.toLocaleString()} lines deleted`;
                } else {
                  return value >= 0 
                    ? `+${value.toLocaleString()} net lines` 
                    : `${value.toLocaleString()} net lines`;
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
  }, [darkMode, chartType, viewMode]);

  const getChartHeight = () => {
    switch (size) {
      case 'small': return 'h-48';
      case 'large': return 'h-96';
      case 'medium':
      default: return 'h-64';
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Code Churn Analysis
        </div>
        <div className="flex space-x-2">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('separate')}
              className={`px-3 py-1 text-xs ${
                viewMode === 'separate'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Additions/Deletions
            </button>
            <button
              onClick={() => setViewMode('net')}
              className={`px-3 py-1 text-xs ${
                viewMode === 'net'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Net Changes
            </button>
          </div>
          
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-xs ${
                chartType === 'line'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs ${
                chartType === 'bar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>
      
      <div className={`${getChartHeight()} bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4`}>
        <canvas ref={chartRef}></canvas>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Additions</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">+24.5k</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Deletions</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400">-16.2k</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">Net Change</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">+8.3k</div>
        </div>
      </div>
    </div>
  );
};

export default CodeChurnChart;