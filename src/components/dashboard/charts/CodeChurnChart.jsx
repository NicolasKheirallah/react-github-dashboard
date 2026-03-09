import React, { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useGithub } from '../../../context/GithubContext';
import { useTheme } from '../../../context/ThemeContext';

const CodeChurnChart = ({ size = 'medium' }) => {
  const { pullRequests } = useGithub();
  const { darkMode } = useTheme();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [viewMode, setViewMode] = useState('separate');

  const churnData = useMemo(() => {
    const aggregated = {};

    (pullRequests || [])
      .filter(
        (pr) =>
          pr.created_at &&
          typeof pr.additions === 'number' &&
          typeof pr.deletions === 'number'
      )
      .forEach((pr) => {
        const bucket = new Date(pr.created_at).toISOString().slice(0, 7);
        aggregated[bucket] = aggregated[bucket] || { additions: 0, deletions: 0 };
        aggregated[bucket].additions += pr.additions;
        aggregated[bucket].deletions += pr.deletions;
      });

    const labels = Object.keys(aggregated).sort();

    return {
      labels: labels.map((bucket) => {
        const [year, month] = bucket.split('-');
        return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
          'en-US',
          { month: 'short', year: 'numeric' }
        );
      }),
      additions: labels.map((bucket) => aggregated[bucket].additions),
      deletions: labels.map((bucket) => aggregated[bucket].deletions),
    };
  }, [pullRequests]);

  useEffect(() => {
    if (!chartRef.current || churnData.labels.length === 0) {
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const textColor = darkMode ? '#c9d1d9' : '#24292f';
    const gridColor = darkMode
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)';

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: churnData.labels,
        datasets:
          viewMode === 'separate'
            ? [
                {
                  label: 'Additions',
                  data: churnData.additions,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  fill: true,
                  tension: 0.35,
                },
                {
                  label: 'Deletions',
                  data: churnData.deletions,
                  borderColor: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  fill: true,
                  tension: 0.35,
                },
              ]
            : [
                {
                  label: 'Net Change',
                  data: churnData.additions.map(
                    (value, index) => value - churnData.deletions[index]
                  ),
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  fill: true,
                  tension: 0.35,
                },
              ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: gridColor,
              display: false,
            },
            ticks: {
              color: textColor,
            },
          },
          y: {
            beginAtZero: true,
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
          title: {
            display: true,
            text: 'Code Churn from Pull Request Stats',
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
  }, [churnData, darkMode, viewMode]);

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
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Code Churn Analysis
        </div>
        <div className="flex overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
          <button
            type="button"
            onClick={() => setViewMode('separate')}
            className={`px-3 py-1 text-xs ${
              viewMode === 'separate'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Additions/Deletions
          </button>
          <button
            type="button"
            onClick={() => setViewMode('net')}
            className={`px-3 py-1 text-xs ${
              viewMode === 'net'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Net
          </button>
        </div>
      </div>

      <div className={getChartHeight()}>
        {churnData.labels.length > 0 ? (
          <canvas ref={chartRef}></canvas>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Code churn requires pull request diff stats. The current GitHub search data does not include those values yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeChurnChart;
