// src/components/dashboard/charts/PerformanceMetrics.jsx
import React, { useEffect, useState } from 'react';
import { useGithub } from '../../../context/GithubContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PerformanceMetrics = () => {
  const { pullRequests, issues } = useGithub();
  const [metrics, setMetrics] = useState({
    prMergeTime: [],
    issueResolutionTime: [],
    reviewEfficiency: [],
    timeLabels: []
  });
  
  useEffect(() => {
    if (pullRequests.length > 0 || issues.length > 0) {
      // Group PRs and issues by month
      const last6Months = [];
      const today = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        
        const monthYear = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        last6Months.push({
          label: monthYear,
          startDate: new Date(d.getFullYear(), d.getMonth(), 1),
          endDate: new Date(d.getFullYear(), d.getMonth() + 1, 0),
          prs: [],
          issues: []
        });
      }
      
      // Filter PRs by month
      pullRequests.forEach(pr => {
        const prDate = new Date(pr.createdDateTime);
        
        for (const month of last6Months) {
          if (prDate >= month.startDate && prDate <= month.endDate) {
            month.prs.push(pr);
            break;
          }
        }
      });
      
      // Filter issues by month
      issues.forEach(issue => {
        const issueDate = new Date(issue.createdDateTime);
        
        for (const month of last6Months) {
          if (issueDate >= month.startDate && issueDate <= month.endDate) {
            month.issues.push(issue);
            break;
          }
        }
      });
      
      // Calculate metrics for each month
      const prMergeTime = [];
      const issueResolutionTime = [];
      const reviewEfficiency = [];
      const timeLabels = [];
      
      last6Months.forEach(month => {
        timeLabels.push(month.label);
        
        // Calculate average PR merge time (for merged PRs only)
        const mergedPRs = month.prs.filter(pr => pr.state === 'Merged' && pr.closedDateTime);
        
        if (mergedPRs.length > 0) {
          const totalMergeTime = mergedPRs.reduce((sum, pr) => {
            const createdDate = new Date(pr.createdDateTime);
            const closedDate = new Date(pr.closedDateTime);
            return sum + (closedDate - createdDate) / (1000 * 60 * 60 * 24); // Days
          }, 0);
          
          prMergeTime.push(parseFloat((totalMergeTime / mergedPRs.length).toFixed(1)));
        } else {
          prMergeTime.push(null);
        }
        
        // Calculate average issue resolution time (for closed issues only)
        const closedIssues = month.issues.filter(issue => issue.state === 'closed' && issue.closedDateTime);
        
        if (closedIssues.length > 0) {
          const totalResolutionTime = closedIssues.reduce((sum, issue) => {
            const createdDate = new Date(issue.createdDateTime);
            const closedDate = new Date(issue.closedDateTime);
            return sum + (closedDate - createdDate) / (1000 * 60 * 60 * 24); // Days
          }, 0);
          
          issueResolutionTime.push(parseFloat((totalResolutionTime / closedIssues.length).toFixed(1)));
        } else {
          issueResolutionTime.push(null);
        }
        
        // Calculate PR efficiency (ratio of merged to total)
        if (month.prs.length > 0) {
          const efficiency = (mergedPRs.length / month.prs.length) * 100;
          reviewEfficiency.push(parseFloat(efficiency.toFixed(1)));
        } else {
          reviewEfficiency.push(null);
        }
      });
      
      setMetrics({
        prMergeTime,
        issueResolutionTime,
        reviewEfficiency,
        timeLabels
      });
    }
  }, [pullRequests, issues]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value} days`
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label.includes('Efficiency')) {
                label += context.parsed.y + '%';
              } else {
                label += context.parsed.y + ' days';
              }
            }
            return label;
          }
        }
      }
    }
  };
  
  const chartData = {
    labels: metrics.timeLabels,
    datasets: [
      {
        label: 'PR Merge Time',
        data: metrics.prMergeTime,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Issue Resolution Time',
        data: metrics.issueResolutionTime,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.3,
        yAxisID: 'y',
      }
    ]
  };
  
  const efficiencyChartData = {
    labels: metrics.timeLabels,
    datasets: [
      {
        label: 'PR Merge Efficiency',
        data: metrics.reviewEfficiency,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        tension: 0.3,
      }
    ]
  };
  
  const efficiencyChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
        }
      }
    }
  };
  
  const hasSufficientData = metrics.timeLabels.length > 0;
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resolution Times</h3>
        {hasSufficientData ? (
          <div className="h-64">
            <Line options={chartOptions} data={chartData} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              Insufficient data to display chart.
            </p>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Review Efficiency</h3>
        {hasSufficientData ? (
          <div className="h-64">
            <Line options={efficiencyChartOptions} data={efficiencyChartData} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              Insufficient data to display chart.
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average PR Merge Time</h4>
          <p className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {hasSufficientData ? 
              `${metrics.prMergeTime.filter(Boolean).reduce((a, b) => a + b, 0) / 
                 metrics.prMergeTime.filter(Boolean).length || 0}d` : 
              'N/A'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Issue Resolution</h4>
          <p className="mt-2 text-2xl font-semibold text-green-600 dark:text-green-400">
            {hasSufficientData ? 
              `${metrics.issueResolutionTime.filter(Boolean).reduce((a, b) => a + b, 0) / 
                 metrics.issueResolutionTime.filter(Boolean).length || 0}d` : 
              'N/A'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">PR Success Rate</h4>
          <p className="mt-2 text-2xl font-semibold text-purple-600 dark:text-purple-400">
            {hasSufficientData ? 
              `${Math.round(metrics.reviewEfficiency.filter(Boolean).reduce((a, b) => a + b, 0) / 
                metrics.reviewEfficiency.filter(Boolean).length || 0)}%` : 
              'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;