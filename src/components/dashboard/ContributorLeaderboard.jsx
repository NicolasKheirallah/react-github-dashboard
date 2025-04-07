import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ContributorLeaderboard = ({ contributorStats, darkMode }) => {
  const [sortBy, setSortBy] = useState('commits');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  // Process contributor data for display and sorting
  const processContributors = () => {
    if (!contributorStats || !Array.isArray(contributorStats)) {
      return [];
    }
    
    return contributorStats.map(contributor => {
      // Calculate total contribution metrics
      const totalCommits = contributor.total || 0;
      const totalAdditions = contributor.weeks?.reduce((sum, week) => sum + (week.a || 0), 0) || 0;
      const totalDeletions = contributor.weeks?.reduce((sum, week) => sum + (week.d || 0), 0) || 0;
      const totalCodeDelta = totalAdditions + totalDeletions;
      
      return {
        id: contributor.author?.id,
        login: contributor.author?.login || 'Unknown',
        avatar: contributor.author?.avatar_url || '',
        url: contributor.author?.html_url || '#',
        commits: totalCommits,
        additions: totalAdditions,
        deletions: totalDeletions,
        codeDelta: totalCodeDelta
      };
    }).sort((a, b) => b[sortBy] - a[sortBy]);
  };
  
  // Create visualization chart
  useEffect(() => {
    if (!contributorStats || !Array.isArray(contributorStats) || contributorStats.length === 0 || !chartRef.current) {
      return;
    }
    
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Process top contributors
    const contributors = processContributors();
    const topContributors = contributors.slice(0, 10);
    
    // Prepare chart data
    const labels = topContributors.map(c => c.login);
    
    // Based on sort type, prepare the dataset
    let dataset;
    switch (sortBy) {
      case 'commits':
        dataset = {
          label: 'Commits',
          data: topContributors.map(c => c.commits),
          backgroundColor: '#3b82f6',
        };
        break;
      case 'additions':
        dataset = {
          label: 'Additions',
          data: topContributors.map(c => c.additions),
          backgroundColor: '#10b981',
        };
        break;
      case 'deletions':
        dataset = {
          label: 'Deletions',
          data: topContributors.map(c => c.deletions),
          backgroundColor: '#ef4444',
        };
        break;
      case 'codeDelta':
        dataset = {
          label: 'Code Changes',
          data: topContributors.map(c => c.codeDelta),
          backgroundColor: '#8b5cf6',
        };
        break;
      default:
        dataset = {
          label: 'Commits',
          data: topContributors.map(c => c.commits),
          backgroundColor: '#3b82f6',
        };
    }
    
    // Chart theme
    const isDarkMode = darkMode;
    const textColor = isDarkMode ? '#c9d1d9' : '#24292f';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [dataset]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
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
          },
          y: {
            grid: {
              display: false
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
                let value = context.raw;
                if (sortBy === 'commits') {
                  return `${value} commits`;
                } else if (sortBy === 'additions') {
                  return `${value.toLocaleString()} lines added`;
                } else if (sortBy === 'deletions') {
                  return `${value.toLocaleString()} lines deleted`;
                } else {
                  return `${value.toLocaleString()} lines of code changed`;
                }
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
  }, [contributorStats, sortBy, darkMode]);
  
  // For the table display
  const contributors = processContributors();
  
  return (
    <div className="space-y-6">
      {/* Chart controls */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Contributors</h3>
        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-1 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm"
          >
            <option value="commits">Commits</option>
            <option value="additions">Additions</option>
            <option value="deletions">Deletions</option>
            <option value="codeDelta">Total Code Changes</option>
          </select>
        </div>
      </div>
      
      {/* Visualization for top 10 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="h-64">
          {contributors.length > 0 ? (
            <canvas ref={chartRef}></canvas>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No contributor statistics available
            </div>
          )}
        </div>
      </div>
      
      {/* Contributors table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Contributor
              </th>
              <th 
                scope="col" 
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  sortBy === 'commits' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300'
                }`}
                onClick={() => setSortBy('commits')}
              >
                Commits
              </th>
              <th 
                scope="col" 
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  sortBy === 'additions' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300'
                }`}
                onClick={() => setSortBy('additions')}
              >
                Additions
              </th>
              <th 
                scope="col" 
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  sortBy === 'deletions' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300'
                }`}
                onClick={() => setSortBy('deletions')}
              >
                Deletions
              </th>
              <th 
                scope="col" 
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  sortBy === 'codeDelta' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300'
                }`}
                onClick={() => setSortBy('codeDelta')}
              >
                Total Changes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {contributors.length > 0 ? (
              contributors.map((contributor, index) => (
                <tr key={contributor.id || index} className={index % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-700'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <img className="h-8 w-8 rounded-full" src={contributor.avatar || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'} alt={contributor.login} />
                      </div>
                      <div className="ml-4">
                        <a 
                          href={contributor.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {contributor.login}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {contributor.commits.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="text-green-600 dark:text-green-400">
                      +{contributor.additions.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="text-red-600 dark:text-red-400">
                      -{contributor.deletions.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {contributor.codeDelta.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No contributor data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContributorLeaderboard;