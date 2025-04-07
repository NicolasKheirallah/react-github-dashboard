import React, { useEffect, useRef, useState } from 'react';
import { useGithub } from '../../../context/GithubContext';
import Chart from 'chart.js/auto';

const IssueResolutionChart = ({ size = 'medium' }) => {
  const { issues, darkMode } = useGithub();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (!issues || issues.length === 0 || !chartRef.current) {
      return;
    }

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Filter closed issues that have both created_at and closed_at dates
    const closedIssues = issues.filter(issue => 
      issue.state === 'closed' && issue.created_at && issue.closed_at
    );

    if (closedIssues.length === 0) {
      return;
    }

    // Calculate resolution time in days for each issue
    const issueData = closedIssues.map(issue => {
      const createdDate = new Date(issue.created_at);
      const closedDate = new Date(issue.closed_at);
      const resolutionDays = (closedDate - createdDate) / (1000 * 60 * 60 * 24);
      
      // Get the primary label (if exists)
      const primaryLabel = issue.labels && issue.labels.length > 0 
        ? issue.labels[0].name 
        : 'unlabeled';
      
      return {
        repo: issue.repository.name,
        number: issue.number,
        title: issue.title,
        resolutionDays,
        date: createdDate,
        label: primaryLabel
      };
    });

    // Filter data based on selected filter
    let filteredData = issueData;
    if (selectedFilter !== 'all') {
      const repoNames = [...new Set(issueData.map(issue => issue.repo))];
      if (repoNames.includes(selectedFilter)) {
        filteredData = issueData.filter(issue => issue.repo === selectedFilter);
      } else {
        // Assume it's a label filter
        filteredData = issueData.filter(issue => issue.label === selectedFilter);
      }
    }

    // Group by labels for comparing resolution times
    const labelGroups = {};
    filteredData.forEach(issue => {
      if (!labelGroups[issue.label]) {
        labelGroups[issue.label] = [];
      }
      labelGroups[issue.label].push(issue.resolutionDays);
    });

    // Calculate averages
    const labels = Object.keys(labelGroups);
    const averages = labels.map(label => {
      const times = labelGroups[label];
      return times.reduce((sum, time) => sum + time, 0) / times.length;
    });

    // Sort by average resolution time
    const sortedIndices = averages
      .map((avg, idx) => ({ avg, idx }))
      .sort((a, b) => a.avg - b.avg)
      .map(item => item.idx);
    
    const sortedLabels = sortedIndices.map(idx => labels[idx]);
    const sortedAverages = sortedIndices.map(idx => averages[idx]);

    // Chart theme
    const isDarkMode = darkMode;
    const textColor = isDarkMode ? '#c9d1d9' : '#24292f';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Create color palette
    const getColorForLabel = (index) => {
      const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
        '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6',
        '#f97316', '#84cc16', '#06b6d4', '#a855f7'
      ];
      return colors[index % colors.length];
    };

    const backgroundColor = sortedLabels.map((_, idx) => {
      const color = getColorForLabel(idx);
      return `${color}`;
    });

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedLabels,
        datasets: [{
          label: 'Average Resolution Time (days)',
          data: sortedAverages,
          backgroundColor,
          borderColor: backgroundColor,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',  // Horizontal bar chart
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Days',
              color: textColor
            },
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
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw.toFixed(1);
                return `Average: ${value} days`;
              }
            }
          },
          title: {
            display: true,
            text: `Issue Resolution Time by ${selectedFilter === 'all' ? 'Label' : 'Label in ' + selectedFilter}`,
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
  }, [issues, darkMode, selectedFilter]);

  // Generate filter options
  const filterOptions = React.useMemo(() => {
    if (!issues || issues.length === 0) return [{ value: 'all', label: 'All Issues' }];
    
    // Get unique repositories
    const repositories = [...new Set(issues.map(issue => issue.repository.name))];
    
    // Get unique labels
    const allLabels = issues
      .flatMap(issue => issue.labels?.map(label => label.name) || [])
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return [
      { value: 'all', label: 'All Issues' },
      ...repositories.map(repo => ({ value: repo, label: `Repo: ${repo}` })),
      ...allLabels.map(label => ({ value: label, label: `Label: ${label}` }))
    ];
  }, [issues]);

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
        <select 
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="text-sm p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          {filterOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className={`w-full ${getChartHeight()}`}>
        {issues && issues.length > 0 ? (
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

export default IssueResolutionChart;