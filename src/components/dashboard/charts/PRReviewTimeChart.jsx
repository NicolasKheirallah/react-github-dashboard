import React, { useEffect, useRef } from 'react';
import { useGithub } from '../../../context/GithubContext';
import Chart from 'chart.js/auto';

const PRReviewTimeChart = ({ size = 'medium' }) => {
  const { pullRequests, darkMode } = useGithub();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Process pull requests or use sample data if none available
    let prReviewData = [];
    
    if (pullRequests && Array.isArray(pullRequests) && pullRequests.length > 0) {
      // Try to use real data first
      const filteredPRs = pullRequests.filter(pr => pr.merged_at);
      
      if (filteredPRs.length > 0) {
        prReviewData = filteredPRs.map(pr => {
          const createdDate = new Date(pr.created_at);
          const mergedDate = new Date(pr.merged_at);
          const reviewTimeHours = (mergedDate - createdDate) / (1000 * 60 * 60);
          return {
            repo: pr.repository?.name || 'unknown',
            number: pr.number,
            title: pr.title,
            reviewTimeHours,
            date: createdDate
          };
        }).sort((a, b) => a.date - b.date);
      } else {
        // Generate sample data for visualization purposes
        // This would be removed in production
        const now = new Date();
        for (let i = 0; i < 6; i++) {
          const date = new Date();
          date.setMonth(now.getMonth() - i);
          prReviewData.push({
            repo: 'sample-repo',
            number: i,
            title: 'Sample PR',
            reviewTimeHours: Math.random() * 48 + 1, // 1-49 hours
            date: date
          });
        }
        prReviewData.reverse();
      }
    } else {
      // Generate sample data for visualization purposes
      // This would be removed in production
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        prReviewData.push({
          repo: 'sample-repo',
          number: i,
          title: 'Sample PR',
          reviewTimeHours: Math.random() * 48 + 1, // 1-49 hours
          date: date
        });
      }
      prReviewData.reverse();
    }

    // Group data by month
    const monthlyData = {};
    prReviewData.forEach(pr => {
      const month = pr.date.toISOString().substring(0, 7); // YYYY-MM format
      if (!monthlyData[month]) {
        monthlyData[month] = [];
      }
      monthlyData[month].push(pr.reviewTimeHours);
    });

    // Calculate average review time per month
    const months = Object.keys(monthlyData).sort();
    const averageReviewTimes = months.map(month => {
      const times = monthlyData[month];
      return times.reduce((sum, time) => sum + time, 0) / times.length;
    });

    // Format x-axis labels to be more readable
    const formattedMonths = months.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(year, parseInt(monthNum) - 1, 1);
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    });

    // Chart theme
    const isDarkMode = darkMode;
    const textColor = isDarkMode ? '#c9d1d9' : '#24292f';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: formattedMonths,
        datasets: [
          {
            label: 'Average Review Time (hours)',
            data: averageReviewTimes,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#2563eb',
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Hours',
              color: textColor
            },
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          },
          x: {
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
            labels: {
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw.toFixed(1);
                const hours = Math.floor(value);
                const minutes = Math.round((value - hours) * 60);
                return `Average: ${hours}h ${minutes}m`;
              }
            }
          },
          title: {
            display: true,
            text: 'Pull Request Review Time Trend',
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
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default PRReviewTimeChart;