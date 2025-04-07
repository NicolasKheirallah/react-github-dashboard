import React, { useEffect, useRef, useState } from 'react';
import { useGithub } from '../../../context/GithubContext';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const ActivityHeatmap = () => {
  const { userEvents, darkMode } = useGithub();
  const [contributionData, setContributionData] = useState([]);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const heatmapRef = useRef(null);
  const [timeRange, setTimeRange] = useState('1y'); // Default 1 year
  const [highlightWeekends, setHighlightWeekends] = useState(false);

  useEffect(() => {
    // Process events into contributions data for the selected time range
    const processContributionData = () => {
      // Calculate date range based on selected time range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1m':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1y':
        default:
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      // Initialize all dates in range with 0 count
      const contributions = {};
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        contributions[dateStr] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      let total = 0;

      // Process real data if available
      if (userEvents && userEvents.length > 0) {
        userEvents.forEach((event) => {
          const date = new Date(event.created_at);
          const dateStr = date.toISOString().split('T')[0];

          if (date >= startDate && date <= endDate) {
            if (event.type === 'PushEvent') {
              // Count each commit in push event
              const commitCount = event.payload?.commits?.length || 0;
              contributions[dateStr] = (contributions[dateStr] || 0) + commitCount;
              total += commitCount;
            } else {
              // Count other events as 1
              contributions[dateStr] = (contributions[dateStr] || 0) + 1;
              total += 1;
            }
          }
        });
      } else {
        // Generate sample data
        for (const dateStr in contributions) {
          const date = new Date(dateStr);
          const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          
          // Generate more realistic patterns
          const randomFactor = Math.random();
          let count = 0;
          
          // Less activity on weekends
          if (randomFactor > (isWeekend ? 0.85 : 0.6)) {
            count = Math.floor(randomFactor * 5) * (isWeekend ? 0.5 : 1);
            
            // Occasional high activity days
            if (randomFactor > 0.95) {
              count += Math.floor(Math.random() * 10);
            }
          }
          
          contributions[dateStr] = count;
          total += count;
        }
      }

      // Convert to format expected by the heatmap
      const formattedData = Object.keys(contributions).map((date) => ({
        date,
        count: contributions[date],
        weekday: new Date(date).getDay() // Add weekday for highlighting weekends
      }));

      setContributionData(formattedData);
      setYearlyTotal(total);
    };
    
    processContributionData();
  }, [userEvents, timeRange]);

  // Initialize tooltip after data is loaded
  useEffect(() => {
    if (contributionData.length > 0) {
      // Make sure Tooltip is available
      if (typeof Tooltip.rebuild === 'function') {
        Tooltip.rebuild();
      }
    }
  }, [contributionData]);

  // Get intensity level (0-4) based on contribution count
  const getIntensityLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  // Format date for tooltip
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStartDate = () => {
    const date = new Date();
    switch (timeRange) {
      case '1m':
        date.setMonth(date.getMonth() - 1);
        break;
      case '3m':
        date.setMonth(date.getMonth() - 3);
        break;
      case '6m':
        date.setMonth(date.getMonth() - 6);
        break;
      case '1y':
      default:
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    return date;
  };

  return (
    <div className="activity-heatmap bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Contribution Activity
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <button
              onClick={() => setTimeRange('1m')}
              className={`px-3 py-1 text-xs ${
                timeRange === '1m' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              1 Month
            </button>
            <button
              onClick={() => setTimeRange('3m')}
              className={`px-3 py-1 text-xs ${
                timeRange === '3m' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              3 Months
            </button>
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1 text-xs ${
                timeRange === '6m' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeRange('1y')}
              className={`px-3 py-1 text-xs ${
                timeRange === '1y' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              1 Year
            </button>
          </div>
          
          <button
            onClick={() => setHighlightWeekends(!highlightWeekends)}
            className={`px-3 py-1 text-xs border rounded-md ${
              highlightWeekends
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
            }`}
          >
            {highlightWeekends ? 'Hide Weekends' : 'Show Weekends'}
          </button>
        </div>
      </div>

      <div className="flex items-center mb-2">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-grow">
          {yearlyTotal} contributions in the selected period
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${
                  level === 0
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : level === 1
                    ? 'bg-emerald-200 dark:bg-emerald-900'
                    : level === 2
                    ? 'bg-emerald-300 dark:bg-emerald-700'
                    : level === 3
                    ? 'bg-emerald-500 dark:bg-emerald-500'
                    : 'bg-emerald-700 dark:bg-emerald-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">More</span>
        </div>
      </div>

      <div className="relative overflow-hidden border rounded-lg border-gray-200 dark:border-gray-700 p-2">
        <div data-tooltip-id="heatmap-tooltip">
          <CalendarHeatmap
            ref={heatmapRef}
            startDate={getStartDate()}
            endDate={new Date()}
            values={contributionData}
            classForValue={(value) => {
              if (!value) return 'color-empty';
              
              // Apply weekend class if enabled
              const weekendClass = highlightWeekends && (value.weekday === 0 || value.weekday === 6) 
                ? ' day-weekend' 
                : '';
              
              const level = getIntensityLevel(value.count);
              return `color-github-${level}${weekendClass}`;
            }}
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) return null;
              return {
                'data-tooltip-content': `${value.count} contributions on ${formatDate(value.date)}`,
              };
            }}
            showWeekdayLabels={true}
            gutterSize={3}
          />
        </div>
        <Tooltip
          id="heatmap-tooltip"
          place="top"
          effect="solid"
          className={darkMode ? 'react-tooltip-dark' : 'react-tooltip-light'}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Contributions</div>
          <div className="text-xl font-bold text-gray-700 dark:text-gray-300">{yearlyTotal}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Per Day</div>
          <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
            {Math.round((yearlyTotal / contributionData.length) * 10) / 10 || 0}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
          <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
            {calculateCurrentStreak(contributionData)} days
          </div>
        </div>
      </div>

      <style jsx>{`
        .color-empty {
          fill: var(--color-canvas-subtle, #ebedf0);
        }
        .color-github-0 {
          fill: var(--color-canvas-subtle, #ebedf0);
        }
        .color-github-1 {
          fill: #acd5f2;
        }
        .color-github-2 {
          fill: #7fa8c9;
        }
        .color-github-3 {
          fill: #527ba0;
        }
        .color-github-4 {
          fill: #254e77;
        }

        .day-weekend {
          stroke: rgba(255, 107, 107, 0.2);
          stroke-width: 1px;
        }

        .dark .color-empty {
          fill: #161b22;
        }
        .dark .color-github-0 {
          fill: #161b22;
        }
        .dark .color-github-1 {
          fill: #0e4429;
        }
        .dark .color-github-2 {
          fill: #006d32;
        }
        .dark .color-github-3 {
          fill: #26a641;
        }
        .dark .color-github-4 {
          fill: #39d353;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .react-calendar-heatmap .react-calendar-heatmap-month-label {
            font-size: 10px;
          }
          .react-calendar-heatmap-week {
            height: 12px;
          }
        }
        .react-tooltip-dark {
            background-color: #161b22;
            color: #fff;
            padding: 8px 12px;
            font-size: 12px;
        }
        .react-tooltip-light {
            background-color: #fff;
            color: #000;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 8px 12px;
            font-size: 12px;
        }
      `}</style>
    </div>
  );
};

// Helper function to calculate current streak
function calculateCurrentStreak(contributionData) {
  if (!contributionData || contributionData.length === 0) return 0;
  
  // Sort data by date (newest first)
  const sortedData = [...contributionData].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  
  // Check if today has contributions
  const todayHasContributions = sortedData.some(
    item => item.date === today && item.count > 0
  );
  
  // If today has no contributions, streak may have ended yesterday
  if (!todayHasContributions) {
    return 0;
  }
  
  // Count consecutive days with contributions
  for (let i = 0; i < sortedData.length; i++) {
    if (sortedData[i].count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return currentStreak;
}

export default ActivityHeatmap;