import React, { useEffect, useRef } from 'react';
import { useGithub } from '../../context/GithubContext';
import Chart from 'chart.js/auto';

const ChartsSection = () => {
  const { analytics, darkMode } = useGithub();
  
  // Chart references
  const timelineChartRef = useRef(null);
  const languageChartRef = useRef(null);
  const dayOfWeekChartRef = useRef(null);
  const timeOfDayChartRef = useRef(null);
  const prStatusChartRef = useRef(null);
  const repoVisibilityChartRef = useRef(null);
  const repoOriginChartRef = useRef(null);
  
  // Chart instances refs for cleanup
  const chartInstances = useRef({});
  
  // Helper function to destroy chart if it exists
  const destroyChart = (chartRef) => {
    if (chartInstances.current[chartRef]) {
      chartInstances.current[chartRef].destroy();
      delete chartInstances.current[chartRef];
    }
  };
  
  // Initialize charts when data is available and when dark mode changes
  useEffect(() => {
    if (!analytics || !analytics.prTimeline || !analytics.languageStats) {
      return;
    }
    
    // Chart theme
    const isDarkMode = darkMode;
    const textColor = isDarkMode ? '#c9d1d9' : '#24292f';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Set global chart defaults
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;
    
    // 1. Contribution Timeline Chart
    const timelineCtx = timelineChartRef.current.getContext('2d');
    destroyChart('timeline');
    
    chartInstances.current.timeline = new Chart(timelineCtx, {
      type: 'line',
      data: {
        labels: analytics.prTimeline.labels,
        datasets: [
          {
            label: 'Pull Requests',
            data: analytics.prTimeline.data,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: false,
            tension: 0.1
          },
          {
            label: 'Commits',
            data: analytics.monthlyCommits.data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: false,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    // 2. Language Distribution Chart
    const languageCtx = languageChartRef.current.getContext('2d');
    destroyChart('language');
    
    chartInstances.current.language = new Chart(languageCtx, {
      type: 'doughnut',
      data: {
        labels: analytics.languageStats.labels,
        datasets: [{
          data: analytics.languageStats.data,
          backgroundColor: analytics.languageStats.colors,
          borderColor: isDarkMode ? '#0d1117' : '#ffffff',
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
              color: textColor
            }
          }
        }
      }
    });
    
    // 3. Day of Week Activity Chart
    const dayOfWeekCtx = dayOfWeekChartRef.current.getContext('2d');
    destroyChart('dayOfWeek');
    
    chartInstances.current.dayOfWeek = new Chart(dayOfWeekCtx, {
      type: 'bar',
      data: {
        labels: analytics.dayOfWeekActivity.labels,
        datasets: [
          {
            label: 'PR Activity',
            data: analytics.dayOfWeekActivity.prData,
            backgroundColor: '#f59e0b'
          },
          {
            label: 'Issue Activity',
            data: analytics.dayOfWeekActivity.issueData,
            backgroundColor: '#ef4444'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          }
        }
      }
    });
    
    // 4. Time of Day Activity Chart
    const timeOfDayCtx = timeOfDayChartRef.current.getContext('2d');
    destroyChart('timeOfDay');
    
    chartInstances.current.timeOfDay = new Chart(timeOfDayCtx, {
      type: 'bar',
      data: {
        labels: analytics.timeOfDay.labels,
        datasets: [
          {
            label: 'PR Activity',
            data: analytics.timeOfDay.prData,
            backgroundColor: '#34d399'
          },
          {
            label: 'Issue Activity',
            data: analytics.timeOfDay.issueData,
            backgroundColor: '#f87171'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          }
        }
      }
    });
    
    // 5. PR Status Chart
    const prStatusCtx = prStatusChartRef.current.getContext('2d');
    destroyChart('prStatus');
    
    chartInstances.current.prStatus = new Chart(prStatusCtx, {
      type: 'doughnut',
      data: {
        labels: analytics.prStateDistribution.labels,
        datasets: [{
          data: analytics.prStateDistribution.data,
          backgroundColor: analytics.prStateDistribution.colors,
          borderColor: isDarkMode ? '#0d1117' : '#ffffff',
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
              color: textColor,
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
    
    // 6. Repository Visibility Chart
    const repoVisibilityCtx = repoVisibilityChartRef.current.getContext('2d');
    destroyChart('repoVisibility');
    
    chartInstances.current.repoVisibility = new Chart(repoVisibilityCtx, {
      type: 'doughnut',
      data: {
        labels: analytics.repoTypeDistribution.visibility.labels,
        datasets: [{
          data: analytics.repoTypeDistribution.visibility.data,
          backgroundColor: analytics.repoTypeDistribution.visibility.colors,
          borderColor: isDarkMode ? '#0d1117' : '#ffffff',
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
              color: textColor
            }
          }
        }
      }
    });
    
    // 7. Repository Origin Chart
    const repoOriginCtx = repoOriginChartRef.current.getContext('2d');
    destroyChart('repoOrigin');
    
    chartInstances.current.repoOrigin = new Chart(repoOriginCtx, {
      type: 'doughnut',
      data: {
        labels: analytics.repoTypeDistribution.origin.labels,
        datasets: [{
          data: analytics.repoTypeDistribution.origin.data,
          backgroundColor: analytics.repoTypeDistribution.origin.colors,
          borderColor: isDarkMode ? '#0d1117' : '#ffffff',
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
              color: textColor
            }
          }
        }
      }
    });
    
    // Cleanup on unmount
    return () => {
      Object.keys(chartInstances.current).forEach(key => {
        if (chartInstances.current[key]) {
          chartInstances.current[key].destroy();
        }
      });
    };
  }, [analytics, darkMode]);
  
  if (!analytics || !analytics.prTimeline) {
    return <div className="text-center py-8">No analytics data available</div>;
  }
  
  return (
    <div className="gh-card mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="gh-header p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Activity Overview</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* PR/Issue Timeline Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contribution Timeline</h3>
            </div>
            <div className="p-4">
              <div className="h-64">
                <canvas ref={timelineChartRef}></canvas>
              </div>
            </div>
          </div>
          
          {/* Language Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Language Distribution</h3>
            </div>
            <div className="p-4">
              <div className="h-64">
                <canvas ref={languageChartRef}></canvas>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Day of Week Activity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity by Day of Week</h3>
            </div>
            <div className="p-4">
              <div className="h-64">
                <canvas ref={dayOfWeekChartRef}></canvas>
              </div>
            </div>
          </div>
          
          {/* Time of Day Activity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity by Time of Day</h3>
            </div>
            <div className="p-4">
              <div className="h-64">
                <canvas ref={timeOfDayChartRef}></canvas>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PR Status Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pull Request Status</h3>
            </div>
            <div className="p-4">
              <div className="h-64">
                <canvas ref={prStatusChartRef}></canvas>
              </div>
            </div>
          </div>
          
          {/* Repository Type Charts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Repository Types</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-40">
                  <canvas ref={repoVisibilityChartRef}></canvas>
                </div>
                <div className="h-40">
                  <canvas ref={repoOriginChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;