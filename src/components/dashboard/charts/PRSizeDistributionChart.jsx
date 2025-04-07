import React, { useEffect, useRef } from 'react';
import { useGithub } from '../../../context/GithubContext';
import Chart from 'chart.js/auto';

const PRSizeDistributionChart = ({ size = 'medium' }) => {
  const { pullRequests, darkMode } = useGithub();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);


  useEffect(() => {
    if (!pullRequests || pullRequests.length === 0 || !chartRef.current) {
      return;
    }

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    const PR_SIZE_THRESHOLDS = {
      'XS': 10,    // 0-10 lines
      'S': 50,     // 11-50 lines
      'M': 250,    // 51-250 lines
      'L': 1000,   // 251-1000 lines
      'XL': Infinity // 1000+ lines
    };
  
    // Process pull requests to categorize by size
    const prSizes = {
      'XS': 0,
      'S': 0,
      'M': 0,
      'L': 0,
      'XL': 0
    };

    pullRequests.forEach(pr => {
      // Calculate total lines changed (additions + deletions)
      const linesChanged = (pr.additions || 0) + (pr.deletions || 0);

      // Categorize by size
      if (linesChanged <= PR_SIZE_THRESHOLDS.XS) {
        prSizes.XS++;
      } else if (linesChanged <= PR_SIZE_THRESHOLDS.S) {
        prSizes.S++;
      } else if (linesChanged <= PR_SIZE_THRESHOLDS.M) {
        prSizes.M++;
      } else if (linesChanged <= PR_SIZE_THRESHOLDS.L) {
        prSizes.L++;
      } else {
        prSizes.XL++;
      }
    });

    // Prepare chart data
    const labels = Object.keys(prSizes);
    const data = Object.values(prSizes);

    // Create color palette with custom hues
    const colors = {
      'XS': '#10B981', // green
      'S': '#3B82F6', // blue
      'M': '#F59E0B', // amber
      'L': '#EF4444', // red
      'XL': '#8B5CF6'  // purple
    };

    // Chart theme
    const isDarkMode = darkMode;
    const textColor = isDarkMode ? '#c9d1d9' : '#24292f';

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: labels.map(label => colors[label]),
          borderColor: isDarkMode ? '#1f2937' : '#ffffff',
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
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const meta = chart.getDatasetMeta(0);
                    const style = meta.controller.getStyle(i);
                    
                    return {
                      text: `${label} (${getLinesDescription(label)}): ${data.datasets[0].data[i]}`,
                      fillStyle: style.backgroundColor,
                      strokeStyle: style.borderColor,
                      lineWidth: style.borderWidth,
                      hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                      index: i
                    };
                  });
                }
                return [];
              },
              color: textColor,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const sizeCategory = context.label;
                const count = context.raw;
                const percentage = Math.round(count / pullRequests.length * 100);
                return `${sizeCategory} PRs: ${count} (${percentage}%)`;
              },
              afterLabel: function(context) {
                const sizeCategory = context.label;
                return getLinesDescription(sizeCategory);
              }
            }
          },
          title: {
            display: true,
            text: 'Pull Request Size Distribution',
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
  }, [pullRequests, darkMode]);

  // Helper function to get description for each PR size
  const getLinesDescription = (sizeCategory) => {
    switch (sizeCategory) {
      case 'XS': return '0-10 lines';
      case 'S': return '11-50 lines';
      case 'M': return '51-250 lines';
      case 'L': return '251-1000 lines';
      case 'XL': return '1000+ lines';
      default: return '';
    }
  };

  const getChartHeight = () => {
    switch (size) {
      case 'small': return 'h-48';
      case 'large': return 'h-96';
      case 'medium':
      default: return 'h-64';
    }
  };

  return (
    <div className={`w-full ${getChartHeight()}`}>
      {pullRequests && pullRequests.length > 0 ? (
        <canvas ref={chartRef}></canvas>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          No pull request data available
        </div>
      )}
    </div>
  );
};

export default PRSizeDistributionChart;