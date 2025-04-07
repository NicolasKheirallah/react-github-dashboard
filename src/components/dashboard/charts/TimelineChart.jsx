// src/components/dashboard/charts/TimelineChart.jsx
import React, { useEffect, useRef } from 'react';
import { useGithub } from '../../../context/GithubContext';
import Chart from 'chart.js/auto';

const TimelineChart = ({ size }) => {
  const { pullRequests, userEvents, darkMode } = useGithub();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    if ((!pullRequests || pullRequests.length === 0) && 
        (!userEvents || userEvents.length === 0)) {
      return;
    }
    
    // Create a 12-month timeline
    const now = new Date();
    const months = [];
    const prTimelineData = {};
    const commitTimelineData = {};
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      const monthYear = date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      months.unshift(monthYear);
      prTimelineData[monthYear] = 0;
      commitTimelineData[monthYear] = 0;
    }
    
    // Process PR data
    if (pullRequests && pullRequests.length > 0) {
      pullRequests.forEach(pr => {
        const monthYear = new Date(pr.createdDateTime).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
        
        if (monthYear in prTimelineData) {
          prTimelineData[monthYear]++;
        }
      });
    }
    
    // Process commit data from events
    if (userEvents && userEvents.length > 0) {
      userEvents.forEach(event => {
        if (event.type === 'PushEvent' && event.created_at) {
          const monthYear = new Date(event.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          });
          
          if (monthYear in commitTimelineData) {
            const commitCount = event.payload?.commits?.length || 0;
            commitTimelineData[monthYear] += commitCount;
          }
        }
      });
    }
    
    // Clean up previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Pull Requests',
            data: months.map(month => prTimelineData[month]),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: true,
            tension: 0.1
          },
          {
            label: 'Commits',
            data: months.map(month => commitTimelineData[month]),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: darkMode ? '#e5e7eb' : '#1f2937'
            }
          },
          x: {
            grid: {
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: darkMode ? '#e5e7eb' : '#1f2937'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: darkMode ? '#e5e7eb' : '#1f2937'
            }
          }
        }
      }
    });
    
    // Clean up on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [pullRequests, userEvents, darkMode]);
  
  if ((!pullRequests || pullRequests.length === 0) && 
      (!userEvents || userEvents.length === 0)) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No timeline data available</p>
      </div>
    );
  }
  
  return (
    <div className="h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default TimelineChart;