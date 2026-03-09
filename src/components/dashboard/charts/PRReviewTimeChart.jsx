import React, { useEffect, useMemo, useRef } from 'react';
import { useGithub } from '../../../context/GithubContext';
import { useTheme } from '../../../context/ThemeContext';
import Chart from 'chart.js/auto';

const PRReviewTimeChart = ({ size = 'medium', pullRequestsData }) => {
  const { pullRequests: contextPullRequests } = useGithub();
  const { darkMode } = useTheme();
  const pullRequests = pullRequestsData ?? contextPullRequests;
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const prReviewData = useMemo(() => {
    return (pullRequests || [])
      .filter((pr) => pr.state === 'merged' && pr.created_at && pr.closed_at)
      .map((pr) => {
        const createdDate = new Date(pr.created_at);
        const mergedDate = new Date(pr.closed_at);

        return {
          date: createdDate,
          reviewTimeHours: (mergedDate - createdDate) / (1000 * 60 * 60),
        };
      })
      .sort((a, b) => a.date - b.date);
  }, [pullRequests]);

  useEffect(() => {
    if (!chartRef.current || prReviewData.length === 0) {
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const monthlyData = {};

    prReviewData.forEach((pr) => {
      const month = pr.date.toISOString().substring(0, 7);
      monthlyData[month] = monthlyData[month] || [];
      monthlyData[month].push(pr.reviewTimeHours);
    });

    const months = Object.keys(monthlyData).sort();
    const averageReviewTimes = months.map((month) => {
      const times = monthlyData[month];
      return times.reduce((sum, time) => sum + time, 0) / times.length;
    });

    const formattedMonths = months.map((month) => {
      const [year, monthNum] = month.split('-');
      return new Date(year, Number(monthNum) - 1, 1).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
    });

    const textColor = darkMode ? '#c9d1d9' : '#24292f';
    const gridColor = darkMode
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)';

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
            pointHoverRadius: 6,
          },
        ],
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
              color: textColor,
            },
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
            },
          },
          x: {
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = Number(context.raw || 0);
                const hours = Math.floor(value);
                const minutes = Math.round((value - hours) * 60);
                return `Average: ${hours}h ${minutes}m`;
              },
            },
          },
          title: {
            display: true,
            text: 'Pull Request Review Time Trend',
            color: textColor,
            font: {
              size: 16,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [darkMode, prReviewData]);

  const getChartHeight = () => {
    switch (size) {
      case 'small':
        return 'h-48';
      case 'large':
        return 'h-96';
      case 'medium':
      default:
        return 'h-64';
    }
  };

  return (
    <div className={`w-full ${getChartHeight()}`}>
      {prReviewData.length > 0 ? (
        <canvas ref={chartRef}></canvas>
      ) : (
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          Review-time analytics require merged pull requests with created and closed timestamps.
        </div>
      )}
    </div>
  );
};

export default PRReviewTimeChart;
