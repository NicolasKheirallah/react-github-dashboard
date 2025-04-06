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

  useEffect(() => {
    if (userEvents && userEvents.length > 0) {
      // Process events into daily contribution counts
      const contributions = {};
      let total = 0;

      // Calculate date range (1 year ago to today)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);

      // Initialize all dates in range with 0 count
      const dateRange = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        contributions[dateStr] = 0;

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Count contributions by date
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

      // Convert to format expected by the heatmap
      const formattedData = Object.keys(contributions).map((date) => ({
        date,
        count: contributions[date],
      }));

      setContributionData(formattedData);
      setYearlyTotal(total);
    }
  }, [userEvents]);

  // removed this useEffect
  // useEffect(() => {
  //   // Initialize tooltip
  //   Tooltip.rebuild();
  // }, [contributionData]);

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="activity-heatmap">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {yearlyTotal} contributions in the last year
        </h3>
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

      <div className="relative overflow-hidden" data-tooltip-id="heatmap-tooltip">
        <CalendarHeatmap
          ref={heatmapRef}
          startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
          endDate={new Date()}
          values={contributionData}
          classForValue={(value) => {
            if (!value) return 'color-empty';
            const level = getIntensityLevel(value.count);
            return `color-github-${level}`;
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
        <Tooltip
          id="heatmap-tooltip"
          place="top"
          effect="solid"
          className={darkMode ? 'react-tooltip-dark' : 'react-tooltip-light'}
        />
      </div>

      <style jsx>{`
        .color-empty {
          fill: var(--color-canvas-subtle);
        }
        .color-github-0 {
          fill: var(--color-canvas-subtle);
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
        }
        .react-tooltip-dark {
            background-color: #161b22;
            color: #fff;
        }
        .react-tooltip-light {
            background-color: #fff;
            color: #000;
        }
      `}</style>
    </div>
  );
};

export default ActivityHeatmap;