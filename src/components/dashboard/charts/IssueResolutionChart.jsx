import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGithub } from '../../../context/GithubContext';
import { useTheme } from '../../../context/ThemeContext';
import Chart from 'chart.js/auto';

const parseLabelNames = (issue) => {
  if (Array.isArray(issue.labelNames) && issue.labelNames.length > 0) {
    return issue.labelNames;
  }

  if (typeof issue.labels === 'string' && issue.labels.trim()) {
    return issue.labels.split(',').map((label) => label.trim()).filter(Boolean);
  }

  return ['unlabeled'];
};

const IssueResolutionChart = ({ size = 'medium', issuesData }) => {
  const { issues: contextIssues } = useGithub();
  const { darkMode } = useTheme();
  const issues = issuesData ?? contextIssues;
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const issueData = useMemo(() => {
    return (issues || [])
      .filter((issue) => issue.state === 'closed' && issue.created_at && issue.closed_at)
      .map((issue) => {
        const createdDate = new Date(issue.created_at);
        const closedDate = new Date(issue.closed_at);

        return {
          repo: issue.repository || 'unknown',
          resolutionDays: (closedDate - createdDate) / (1000 * 60 * 60 * 24),
          labels: parseLabelNames(issue),
        };
      });
  }, [issues]);

  const filterOptions = useMemo(() => {
    if (issueData.length === 0) {
      return [{ value: 'all', label: 'All Issues' }];
    }

    const repos = Array.from(new Set(issueData.map((issue) => issue.repo))).map((repo) => ({
      value: repo,
      label: `Repo: ${repo}`,
    }));
    const labels = Array.from(
      new Set(issueData.flatMap((issue) => issue.labels))
    ).map((label) => ({
      value: label,
      label: `Label: ${label}`,
    }));

    return [{ value: 'all', label: 'All Issues' }, ...repos, ...labels];
  }, [issueData]);

  useEffect(() => {
    if (!chartRef.current || issueData.length === 0) {
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const filteredIssues =
      selectedFilter === 'all'
        ? issueData
        : issueData.filter(
            (issue) => issue.repo === selectedFilter || issue.labels.includes(selectedFilter)
          );

    if (filteredIssues.length === 0) {
      return;
    }

    const labelGroups = {};
    filteredIssues.forEach((issue) => {
      issue.labels.forEach((label) => {
        labelGroups[label] = labelGroups[label] || [];
        labelGroups[label].push(issue.resolutionDays);
      });
    });

    const labels = Object.keys(labelGroups);
    const averages = labels.map((label) => {
      const times = labelGroups[label];
      return times.reduce((sum, time) => sum + time, 0) / times.length;
    });

    const sortedIndices = averages
      .map((avg, idx) => ({ avg, idx }))
      .sort((a, b) => a.avg - b.avg)
      .map((item) => item.idx);

    const sortedLabels = sortedIndices.map((idx) => labels[idx]);
    const sortedAverages = sortedIndices.map((idx) => averages[idx]);
    const textColor = darkMode ? '#c9d1d9' : '#24292f';
    const gridColor = darkMode
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)';

    const palette = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
      '#14b8a6',
      '#6366f1',
    ];
    const backgroundColor = sortedLabels.map((_, idx) => palette[idx % palette.length]);

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedLabels,
        datasets: [
          {
            label: 'Average Resolution Time (days)',
            data: sortedAverages,
            backgroundColor,
            borderColor: backgroundColor,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Days',
              color: textColor,
            },
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
            },
          },
          y: {
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
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Average: ${Number(context.raw || 0).toFixed(1)} days`;
              },
            },
          },
          title: {
            display: true,
            text: `Issue Resolution Time by ${
              selectedFilter === 'all' ? 'Label' : selectedFilter
            }`,
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
  }, [darkMode, issueData, selectedFilter]);

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
        <label
          htmlFor="issue-resolution-filter"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Resolution filter
        </label>
        <select
          id="issue-resolution-filter"
          value={selectedFilter}
          onChange={(event) => setSelectedFilter(event.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className={getChartHeight()}>
        {issueData.length > 0 ? (
          <canvas ref={chartRef}></canvas>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Resolution-time analytics require closed issues with created and closed timestamps.
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueResolutionChart;
