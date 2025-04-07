import React, { useEffect, useRef, useState } from 'react';
import { useGithub } from '../../../context/GithubContext';

const CommitFrequencyChart = ({ size = 'medium' }) => {
  const { contributions, repositories, darkMode } = useGithub();
  const containerRef = useRef(null);
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [yearOffset, setYearOffset] = useState(0);
  
  // Calculate size based on prop
  const getSize = () => {
    switch (size) {
      case 'small': return { cellSize: 10, margin: 2 };
      case 'large': return { cellSize: 16, margin: 4 };
      case 'medium':
      default: return { cellSize: 12, margin: 3 };
    }
  };

  useEffect(() => {
    if (!contributions || !contributions.commits || contributions.commits.length === 0) {
      return;
    }

    // Get all commits
    let commits = contributions.commits;
    
    // Filter by repository if selected
    if (selectedRepo !== 'all') {
      commits = commits.filter(commit => 
        commit.repository && commit.repository.name === selectedRepo
      );
    }

    renderHeatmap(commits);
  }, [contributions, darkMode, selectedRepo, yearOffset]);

  const renderHeatmap = (commits) => {
    if (!containerRef.current) return;
    
    // Clear previous content
    containerRef.current.innerHTML = '';
    
    // Create data structure for heatmap
    const commitsByDate = {};
    
    // Process commits and count by date
    commits.forEach(commit => {
      if (!commit.commit || !commit.commit.author || !commit.commit.author.date) return;
      
      const date = new Date(commit.commit.author.date);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!commitsByDate[dateStr]) {
        commitsByDate[dateStr] = 0;
      }
      commitsByDate[dateStr]++;
    });
    
    // Calculate date ranges
    const now = new Date();
    const currentYear = now.getFullYear() - yearOffset;
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    
    // Calculate maximum commits in a day (for color intensity)
    const maxCommits = Math.max(1, ...Object.values(commitsByDate));
    
    // Create SVG element
    const { cellSize, margin } = getSize();
    const width = 53 * (cellSize + margin); // 53 weeks in worst case
    const height = 7 * (cellSize + margin); // 7 days in a week
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("class", "commit-heatmap");
    
    // Add title
    const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
    title.textContent = `Commit Activity: ${currentYear}`;
    title.setAttribute("x", "0");
    title.setAttribute("y", "-10");
    title.setAttribute("class", "chart-title");
    title.setAttribute("fill", darkMode ? "#e5e7eb" : "#374151");
    title.setAttribute("font-size", "14px");
    
    // Generate all days in the year
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Group by week
    const weeks = {};
    days.forEach(date => {
      const weekNum = getWeekNumber(date);
      if (!weeks[weekNum]) {
        weeks[weekNum] = [];
      }
      weeks[weekNum].push(date);
    });
    
    // Create week groups
    Object.entries(weeks).forEach(([weekNum, daysInWeek], weekIndex) => {
      // Create week group
      const weekGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      weekGroup.setAttribute("transform", `translate(${weekIndex * (cellSize + margin)}, 0)`);
      
      // Add day cells
      daysInWeek.forEach(date => {
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0];
        const commitCount = commitsByDate[dateStr] || 0;
        
        // Calculate color based on commit count
        const opacity = commitCount > 0 ? 0.3 + (commitCount / maxCommits * 0.7) : 0;
        const color = darkMode ? `rgba(56, 189, 248, ${opacity})` : `rgba(59, 130, 246, ${opacity})`;
        
        // Create day cell
        const dayCell = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        dayCell.setAttribute("width", cellSize);
        dayCell.setAttribute("height", cellSize);
        dayCell.setAttribute("x", 0);
        dayCell.setAttribute("y", dayOfWeek * (cellSize + margin));
        dayCell.setAttribute("rx", 2);
        dayCell.setAttribute("ry", 2);
        dayCell.setAttribute("fill", color);
        dayCell.setAttribute("stroke", darkMode ? "#1f2937" : "#f3f4f6");
        dayCell.setAttribute("stroke-width", "1");
        
        // Add tooltip
        const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "title");
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        });
        tooltip.textContent = `${formattedDate}: ${commitCount} commits`;
        dayCell.appendChild(tooltip);
        
        weekGroup.appendChild(dayCell);
      });
      
      svg.appendChild(weekGroup);
    });
    
    // Add month labels at the top
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach((month, index) => {
      const firstDayOfMonth = new Date(currentYear, index, 1);
      const weekNum = getWeekNumber(firstDayOfMonth);
      const weekIndex = Object.keys(weeks).indexOf(weekNum.toString());
      
      if (weekIndex >= 0) {
        const monthLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        monthLabel.textContent = month;
        monthLabel.setAttribute("x", weekIndex * (cellSize + margin));
        monthLabel.setAttribute("y", -5);
        monthLabel.setAttribute("font-size", "10px");
        monthLabel.setAttribute("fill", darkMode ? "#9ca3af" : "#6b7280");
        svg.appendChild(monthLabel);
      }
    });
    
    // Add day labels on the left
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayLabels.forEach((day, index) => {
      if (index % 2 === 0) { // Show every other day to save space
        const dayLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        dayLabel.textContent = day.charAt(0); // Just the first letter
        dayLabel.setAttribute("x", -15);
        dayLabel.setAttribute("y", index * (cellSize + margin) + cellSize - 2);
        dayLabel.setAttribute("font-size", "10px");
        dayLabel.setAttribute("text-anchor", "end");
        dayLabel.setAttribute("fill", darkMode ? "#9ca3af" : "#6b7280");
        svg.appendChild(dayLabel);
      }
    });
    
    // Append to container
    containerRef.current.appendChild(svg);
  };

  // Helper function to get week number from date
  const getWeekNumber = (date) => {
    const onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  };

  const getContainerHeight = () => {
    switch (size) {
      case 'small': return 'h-32';
      case 'large': return 'h-48';
      case 'medium':
      default: return 'h-40';
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select 
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="text-sm p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="all">All Repositories</option>
            {repositories && repositories.map(repo => (
              <option key={repo.id} value={repo.name}>{repo.name}</option>
            ))}
          </select>
          
          <select 
            value={yearOffset}
            onChange={(e) => setYearOffset(Number(e.target.value))}
            className="text-sm p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value={0}>This Year</option>
            <option value={1}>Last Year</option>
            <option value={2}>Two Years Ago</option>
          </select>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Based on available commit data
        </div>
      </div>
      
      <div className={`w-full ${getContainerHeight()} overflow-auto relative`}>
        {contributions && contributions.commits && contributions.commits.length > 0 ? (
          <div className="pl-4 pt-6" ref={containerRef}></div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No commit data available
          </div>
        )}
      </div>
      
      <div className="mt-2 flex items-center justify-end text-xs text-gray-600 dark:text-gray-400">
        <span className="mr-1">Less</span>
        <div className="flex items-center space-x-1">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map(opacity => (
            <div 
              key={opacity}
              className="w-3 h-3 rounded"
              style={{ 
                backgroundColor: darkMode 
                  ? `rgba(56, 189, 248, ${opacity})` 
                  : `rgba(59, 130, 246, ${opacity})`,
                border: darkMode 
                  ? '1px solid #1f2937' 
                  : '1px solid #f3f4f6'
              }}
            ></div>
          ))}
        </div>
        <span className="ml-1">More</span>
      </div>
    </div>
  );
};

export default CommitFrequencyChart;