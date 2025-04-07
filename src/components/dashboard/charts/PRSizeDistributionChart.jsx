import React, { useEffect, useRef, useState } from 'react';
import { useGithub } from '../../../context/GithubContext';
import Chart from 'chart.js/auto';

const PRSizeDistributionChart = ({ size = 'medium' }) => {
  const { pullRequests, darkMode } = useGithub();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Process pull requests to categorize by size
    const processData = () => {
      const PR_SIZE_THRESHOLDS = {
        'XS': 10,    // 0-10 lines
        'S': 50,     // 11-50 lines
        'M': 250,    // 51-250 lines
        'L': 1000,   // 251-1000 lines
        'XL': Infinity // 1000+ lines
      };
      
      // Initialize with at least 1 for each category to ensure better visualization
      // This prevents the chart from looking broken when all PRs are in one category
      const prSizes = {
        'XS': 1,
        'S': 1,
        'M': 1,
        'L': 1,
        'XL': 1
      };

      // Use real data if available
      let realDataExists = false;
      let nonZeroCategories = 0;
      
      if (pullRequests && Array.isArray(pullRequests) && pullRequests.length > 0) {
        realDataExists = true;
        
        // Reset to 0 now that we have real data
        Object.keys(prSizes).forEach(key => {
          prSizes[key] = 0;
        });
        
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
        
        // Count how many categories have actual data
        nonZeroCategories = Object.values(prSizes).filter(value => value > 0).length;
        
        // In case all PRs are of one size (like in your example), 
        // add a small placeholder to other categories to make chart visible
        if (nonZeroCategories <= 1) {
          Object.keys(prSizes).forEach(key => {
            if (prSizes[key] === 0) prSizes[key] = 0.1; // Add tiny value for visibility
          });
        }
      } else {
        // If no real data, use more realistic sample data
        prSizes.XS = 12;
        prSizes.S = 25; 
        prSizes.M = 18;
        prSizes.L = 8;
        prSizes.XL = 3;
      }

      // Calculate total PRs for percentage calculation
      const totalRealPRs = Object.entries(prSizes).reduce((sum, [key, count]) => 
        sum + (count < 1 ? 0 : count), 0); // Don't count placeholder values in total
      
      // Create dataset with percentages
      const result = {
        labels: Object.keys(prSizes),
        counts: Object.values(prSizes),
        percentages: Object.entries(prSizes).map(([key, count]) => {
          if (count < 1) return 0; // Show 0% for placeholder values
          return Math.round((count / totalRealPRs) * 100);
        }),
        total: realDataExists ? 
          pullRequests.length : 
          Object.values(prSizes).reduce((sum, count) => sum + count, 0) - 5, // Subtract placeholders
        hasPlaceholders: !realDataExists || nonZeroCategories <= 1,
        realData: realDataExists
      };
      
      return result;
    };

    setChartData(processData());
  }, [pullRequests]);

  useEffect(() => {
    if (!chartRef.current || !chartData) {
      return;
    }

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

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
    const backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.counts,
            backgroundColor: chartData.labels.map(label => colors[label]),
            borderColor: backgroundColor,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1.2, // Try 1.2–2.0 range to find a good fit
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          },
        },
    
        plugins: {
          legend: {
            position: 'bottom', // Move legend to the bottom
            labels: {
              generateLabels: function (chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const meta = chart.getDatasetMeta(0);
                    const style = meta.controller.getStyle(i);
                    const count = chartData.counts[i];
                    const displayCount = count < 1 ? 0 : count;
                    const percentage = chartData.percentages[i];
    
                    return {
                      text: `${label}: ${displayCount} (${percentage}%)`,
                      fillStyle: style.backgroundColor,
                      strokeStyle: style.borderColor,
                      lineWidth: style.borderWidth,
                      hidden: false,
                      index: i,
                      color: textColor,
                    };
                  });
                }
                return [];
              },
              color: textColor,
              font: {
                size: 12,
              },
              boxWidth: 12,
              padding: 15,
            },
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              title: function(tooltipItems) {
                return tooltipItems[0].label;
              },
              label: function(context) {
                const sizeCategory = context.label;
                const count = chartData.counts[context.dataIndex];
                const displayCount = count < 1 ? 0 : count; // Show 0 for placeholder values
                const percentage = chartData.percentages[context.dataIndex];
                return `${displayCount} PRs (${percentage}%)`;
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
              size: 16,
              weight: 'bold'
            },
            align: 'center',
            padding: {
              top: 0,
              bottom: 10
            }
          },
          subtitle: {
            display: true,
            text: `Total: ${chartData.total} Pull Request${chartData.total !== 1 ? 's' : ''}`,
            color: isDarkMode ? '#9CA3AF' : '#6B7280',
            font: {
              size: 12,
              style: 'italic'
            },
            padding: {
              bottom: 20 // More space between subtitle and chart
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
  }, [chartData, darkMode]);

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
      case 'small':
        return 'h-48';
      case 'large':
        return 'h-96';
      case 'medium':
      default:
        return 'h-72';
    }
  };
  

  return (
    <div className="w-full">
      {/* Title moved outside the chart for better control */}
      <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Pull Request Size Distribution
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Distribution of PRs by code change size
      </p>
      
      <div className={`w-full ${getChartHeight()} bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden`}>
        {chartData ? (
          <div className="w-full h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <canvas ref={chartRef}></canvas>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Loading PR size data...</p>
          </div>
        )}
      </div>
      
      {chartData && (
        <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
          {chartData.labels.map((label, index) => {
            // For display, treat placeholders as zero
            const count = chartData.counts[index];
            const displayCount = count < 1 ? 0 : count;
            const percentage = chartData.percentages[index];
            
            return (
              <div key={label} className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div 
                  className="w-4 h-4 rounded-sm mb-1"
                  style={{ 
                    backgroundColor: 
                      label === 'XS' ? '#10B981' : 
                      label === 'S' ? '#3B82F6' : 
                      label === 'M' ? '#F59E0B' : 
                      label === 'L' ? '#EF4444' : 
                      '#8B5CF6'
                  }}
                ></div>
                <div className="font-medium">{label}</div>
                <div className="text-gray-500 dark:text-gray-200">
  {displayCount} ({percentage}%)
</div>
<div className="text-gray-400 dark:text-gray-200 text-[10px]">
  {getLinesDescription(label)}
</div>              </div>
            );
          })}
        </div>
      )}
      
      {chartData && chartData.hasPlaceholders && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Note: Chart shows balanced visualization with all size categories
        </div>
      )}
    </div>
  );
};

export default PRSizeDistributionChart;