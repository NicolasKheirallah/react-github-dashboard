import React, { useEffect, useRef } from 'react';

// Calendar visualization of commits by day of week
const CommitCalendar = ({ commitActivity, darkMode }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!commitActivity || !Array.isArray(commitActivity) || !containerRef.current) {
      return;
    }
    
    // Clear previous content
    containerRef.current.innerHTML = '';
    
    // Process commit activity data
    // Format: array of objects where each object has days and total properties
    // days is an array of commit counts per day of week (0 = Sunday)
    const processedData = commitActivity.map((week) => {
      return {
        // Convert Unix timestamp (seconds) to JavaScript timestamp (milliseconds)
        timestamp: week.week * 1000,
        days: week.days || Array(7).fill(0),
        total: week.total || 0
      };
    });
    
    // Find the max commits in a day for color scaling
    const maxCommits = Math.max(
      ...processedData.flatMap(week => week.days),
      1 // Ensure we don't divide by zero
    );
    
    // Create a heatmap visualization
    const createHeatmap = () => {
      // Heatmap settings
      const cellSize = 12;
      const cellMargin = 2;
      const weekCount = processedData.length;
      const dayCount = 7;
      
      // Day labels
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Create SVG element
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const width = weekCount * (cellSize + cellMargin) + 50; // Extra space for labels
      const height = dayCount * (cellSize + cellMargin) + 20; // Extra space for labels
      
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // Add day labels on the left
      dayNames.forEach((day, i) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.textContent = day;
        text.setAttribute('x', 0);
        text.setAttribute('y', i * (cellSize + cellMargin) + cellSize / 2 + 20);
        text.setAttribute('font-size', '10px');
        text.setAttribute('text-anchor', 'start');
        text.setAttribute('alignment-baseline', 'middle');
        text.setAttribute('fill', darkMode ? '#9ca3af' : '#6b7280');
        svg.appendChild(text);
      });
      
      // Add cells for each day's commits
      processedData.forEach((week, weekIndex) => {
        const weekDate = new Date(week.timestamp);
        const weekLabel = weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Add week label (for some weeks)
        if (weekIndex % 4 === 0 || weekIndex === processedData.length - 1) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.textContent = weekLabel;
          text.setAttribute('x', 50 + weekIndex * (cellSize + cellMargin) + cellSize / 2);
          text.setAttribute('y', dayCount * (cellSize + cellMargin) + 15);
          text.setAttribute('font-size', '10px');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('fill', darkMode ? '#9ca3af' : '#6b7280');
          svg.appendChild(text);
        }
        
        // Add cells for each day
        week.days.forEach((commitCount, dayIndex) => {
          // Calculate color intensity based on commit count
          const intensity = commitCount / maxCommits;
          const color = getColorForIntensity(intensity, darkMode);
          
          const cell = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          cell.setAttribute('x', 50 + weekIndex * (cellSize + cellMargin));
          cell.setAttribute('y', dayIndex * (cellSize + cellMargin) + 20);
          cell.setAttribute('width', cellSize);
          cell.setAttribute('height', cellSize);
          cell.setAttribute('rx', 2);
          cell.setAttribute('ry', 2);
          cell.setAttribute('fill', color);
          cell.setAttribute('stroke', darkMode ? '#1f2937' : '#f3f4f6');
          cell.setAttribute('stroke-width', '1');
          
          // Add tooltip
          const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
          const date = new Date(week.timestamp);
          date.setDate(date.getDate() + dayIndex);
          const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          title.textContent = `${formattedDate}: ${commitCount} commits`;
          cell.appendChild(title);
          
          svg.appendChild(cell);
        });
      });
      
      // Add legend
      const legendX = width - 150;
      const legendY = 10;
      const legendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      legendText.textContent = 'Commits:';
      legendText.setAttribute('x', legendX);
      legendText.setAttribute('y', legendY);
      legendText.setAttribute('font-size', '10px');
      legendText.setAttribute('fill', darkMode ? '#9ca3af' : '#6b7280');
      svg.appendChild(legendText);
      
      // Add legend colors
      [0, 0.25, 0.5, 0.75, 1].forEach((intensity, i) => {
        const cell = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cell.setAttribute('x', legendX + 50 + i * 15);
        cell.setAttribute('y', legendY - 8);
        cell.setAttribute('width', 10);
        cell.setAttribute('height', 10);
        cell.setAttribute('rx', 2);
        cell.setAttribute('ry', 2);
        cell.setAttribute('fill', getColorForIntensity(intensity, darkMode));
        cell.setAttribute('stroke', darkMode ? '#1f2937' : '#f3f4f6');
        cell.setAttribute('stroke-width', '1');
        svg.appendChild(cell);
      });
      
      // Add legend labels
      const lowText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lowText.textContent = 'Low';
      lowText.setAttribute('x', legendX + 50);
      lowText.setAttribute('y', legendY + 12);
      lowText.setAttribute('font-size', '8px');
      lowText.setAttribute('fill', darkMode ? '#9ca3af' : '#6b7280');
      svg.appendChild(lowText);
      
      const highText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      highText.textContent = 'High';
      highText.setAttribute('x', legendX + 110);
      highText.setAttribute('y', legendY + 12);
      highText.setAttribute('font-size', '8px');
      highText.setAttribute('fill', darkMode ? '#9ca3af' : '#6b7280');
      svg.appendChild(highText);
      
      return svg;
    };
    
    // Helper function to get color based on intensity
    const getColorForIntensity = (intensity, isDarkMode) => {
      // Calculate color based on intensity (0-1)
      if (intensity === 0) {
        return isDarkMode ? '#1f2937' : '#f3f4f6';
      }
      
      if (isDarkMode) {
        // Dark mode: more saturated blue
        return `rgba(37, 99, 235, ${0.2 + intensity * 0.8})`;
      } else {
        // Light mode: lighter blue
        return `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`;
      }
    };
    
    // Create and append the heatmap
    const heatmap = createHeatmap();
    containerRef.current.appendChild(heatmap);
    
  }, [commitActivity, darkMode]);
  
  return (
    <div className="overflow-auto">
      {commitActivity && Array.isArray(commitActivity) && commitActivity.length > 0 ? (
        <div ref={containerRef} className="flex justify-center"></div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No commit activity data available
        </div>
      )}
    </div>
  );
};

export default CommitCalendar;