import React, { useEffect, useRef, useState } from 'react';
import { useGithub } from '../../../context/GithubContext';
import Chart from 'chart.js/auto';

const IssueTypesChart = ({ size = 'medium' }) => {
  const { issues, darkMode } = useGithub();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartType, setChartType] = useState('doughnut');

  useEffect(() => {
    if (!issues || !Array.isArray(issues) || issues.length === 0 || !chartRef.current) {
      return;
    }

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Process issue data to categorize by label
    const issueTypes = {};
    const commonLabels = [
      'bug', 'feature', 'enhancement', 'documentation', 'question', 
      'help wanted', 'good first issue', 'invalid', 'wontfix', 'duplicate'
    ];
    
    // Initialize with common categories
    commonLabels.forEach(label => {
      issueTypes[label] = 0;
    });
    issueTypes['unlabeled'] = 0;
    issueTypes['other'] = 0;

    // Count issues by label
    issues.forEach(issue => {
      if (!issue) return; // Skip null/undefined issues
      
      if (!issue.labels || !Array.isArray(issue.labels) || issue.labels.length === 0) {
        issueTypes['unlabeled']++;
        return;
      }

      // Check if issue has any of our predefined common labels
      let foundCommonLabel = false;
      
      for (const label of issue.labels) {
        if (!label || !label.name) continue; // Skip invalid labels
        
        const lowercaseName = label.name.toLowerCase();
        
        // Check for common label names or variations
        for (const commonLabel of commonLabels) {
          if (lowercaseName.includes(commonLabel)) {
            issueTypes[commonLabel]++;
            foundCommonLabel = true;
            break;
          }
        }
        
        if (foundCommonLabel) break;
      }
      
      // If no common label was found, count it as "other" and use first label
      if (!foundCommonLabel) {
        issueTypes['other']++;
      }
    });

    // Remove empty categories
    Object.keys(issueTypes).forEach(key => {
      if (issueTypes[key] === 0) {
        delete issueTypes[key];
      }
    });

    // Prepare chart data
    const labels = Object.keys(issueTypes);
    const data = Object.values(issueTypes);

    // Create color palette with semantic colors
    const getColorForLabel = (label) => {
      const colorMap = {
        'bug': '#EF4444', // red
        'feature': '#10B981', // green
        'enhancement': '#3B82F6', // blue
        'documentation': '#8B5CF6', // purple
        'question': '#F59E0B', // amber
        'help wanted': '#EC4899', // pink
        'good first issue': '#06B6D4', // cyan
        'invalid': '#6B7280', // gray
        'wontfix': '#1F2937', // dark gray
        'duplicate': '#D97706', // amber-600
        'unlabeled': '#9CA3AF', // gray-400
        'other': '#6366F1' // indigo
      };
      
      return colorMap[label] || '#6366F1'; // Default to indigo
    };

    const backgroundColor = labels.map(label => getColorForLabel(label));

    // Chart theme
    const isDarkMode = darkMode;
    const textColor = isDarkMode ? '#c9d1d9' : '#24292f';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    
    // Chart configuration based on selected chart type
    const config = {
      type: chartType,
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor,
          borderColor: isDarkMode ? '#1f2937' : '#ffffff',
          borderWidth: chartType === 'doughnut' ? 2 : 0,
          borderRadius: chartType === 'bar' ? 4 : 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: chartType === 'doughnut' ? 'right' : 'top',
            labels: {
              color: textColor,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          },
          title: {
            display: true,
            text: 'Issue Types Breakdown',
            color: textColor,
            font: {
              size: 16
            }
          }
        }
      }
    };
    
    // Additional configuration for bar chart
    if (chartType === 'bar') {
      config.options.indexAxis = 'y'; // Horizontal bar chart
      config.options.scales = {
        x: {
          beginAtZero: true,
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor
          }
        },
        y: {
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor
          }
        }
      };
    }

    try {
      chartInstance.current = new Chart(ctx, config);
    } catch (error) {
      console.error('Error creating chart:', error);
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [issues, darkMode, chartType]);

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
      <div className="mb-4 flex justify-end">
        <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
          <button
            className={`px-3 py-1 text-xs ${
              chartType === 'doughnut' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setChartType('doughnut')}
          >
            Doughnut
          </button>
          <button
            className={`px-3 py-1 text-xs ${
              chartType === 'bar' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setChartType('bar')}
          >
            Bar
          </button>
        </div>
      </div>
      
      <div className={`w-full ${getChartHeight()}`}>
        {issues && Array.isArray(issues) && issues.length > 0 ? (
          <canvas ref={chartRef}></canvas>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No issue data available
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueTypesChart;