import React, { useEffect, useMemo, useRef } from 'react';
import { useGithub } from '../../../context/GithubContext';
import { useTheme } from '../../../context/ThemeContext';
import Chart from 'chart.js/auto';

const PR_SIZE_THRESHOLDS = {
  XS: 10,
  S: 50,
  M: 250,
  L: 1000,
  XL: Infinity,
};

const getLinesDescription = (sizeCategory) => {
  switch (sizeCategory) {
    case 'XS':
      return '0-10 lines';
    case 'S':
      return '11-50 lines';
    case 'M':
      return '51-250 lines';
    case 'L':
      return '251-1000 lines';
    case 'XL':
      return '1000+ lines';
    default:
      return '';
  }
};

const PRSizeDistributionChart = ({ size = 'medium' }) => {
  const { pullRequests } = useGithub();
  const { darkMode } = useTheme();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const chartData = useMemo(() => {
    const measurablePRs = (pullRequests || []).filter(
      (pr) => typeof pr.additions === 'number' && typeof pr.deletions === 'number'
    );

    if (measurablePRs.length === 0) {
      return null;
    }

    const counts = {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
    };

    measurablePRs.forEach((pr) => {
      const linesChanged = pr.additions + pr.deletions;
      if (linesChanged <= PR_SIZE_THRESHOLDS.XS) counts.XS += 1;
      else if (linesChanged <= PR_SIZE_THRESHOLDS.S) counts.S += 1;
      else if (linesChanged <= PR_SIZE_THRESHOLDS.M) counts.M += 1;
      else if (linesChanged <= PR_SIZE_THRESHOLDS.L) counts.L += 1;
      else counts.XL += 1;
    });

    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const total = values.reduce((sum, value) => sum + value, 0);

    return {
      labels,
      counts: values,
      percentages: values.map((value) => Math.round((value / total) * 100)),
      total,
    };
  }, [pullRequests]);

  useEffect(() => {
    if (!chartRef.current || !chartData) {
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const textColor = darkMode ? '#c9d1d9' : '#24292f';
    const backgroundColor = darkMode ? '#1f2937' : '#ffffff';
    const colors = {
      XS: '#10B981',
      S: '#3B82F6',
      M: '#F59E0B',
      L: '#EF4444',
      XL: '#8B5CF6',
    };

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.counts,
            backgroundColor: chartData.labels.map((label) => colors[label]),
            borderColor: backgroundColor,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const count = chartData.counts[context.dataIndex];
                const percentage = chartData.percentages[context.dataIndex];
                return `${count} PRs (${percentage}%)`;
              },
              afterLabel: function (context) {
                return getLinesDescription(context.label);
              },
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
  }, [chartData, darkMode]);

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
      <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
        Pull Request Size Distribution
      </h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Distribution of PRs by code change size
      </p>

      <div
        className={`w-full ${getChartHeight()} overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800`}
      >
        {chartData ? (
          <canvas ref={chartRef}></canvas>
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500 dark:text-gray-400">
            PR size analytics require additions and deletions counts, which are not available in the current GitHub search response.
          </div>
        )}
      </div>

      {chartData && (
        <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
          {chartData.labels.map((label, index) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800"
            >
              <div
                className="mb-1 h-4 w-4 rounded-sm"
                style={{
                  backgroundColor:
                    label === 'XS'
                      ? '#10B981'
                      : label === 'S'
                        ? '#3B82F6'
                        : label === 'M'
                          ? '#F59E0B'
                          : label === 'L'
                            ? '#EF4444'
                            : '#8B5CF6',
                }}
              />
              <div className="font-medium">{label}</div>
              <div className="text-gray-500 dark:text-gray-200">
                {chartData.counts[index]} ({chartData.percentages[index]}%)
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-200">
                {getLinesDescription(label)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PRSizeDistributionChart;
