// src/components/dashboard/charts/LanguageChart.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useGithub } from '../../../context/GithubContext';
import Chart from 'chart.js/auto';

const LanguageChart = ({ size }) => {
  const { repositories, darkMode } = useGithub();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    if (!repositories || repositories.length === 0) return;
    
    // Count languages across repositories weighted by stars
    const languageStats = {};
    
    repositories.forEach(repo => {
      if (repo.language && !repo.isFork) {
        const lang = repo.language;
        // Weight by stars
        const weight = 1 + (0.1 * repo.stars);
        languageStats[lang] = (languageStats[lang] || 0) + weight;
      }
    });
    
    // Filter out languages with very small values and sort by value
    const threshold = 0.5;
    const filteredStats = Object.fromEntries(
      Object.entries(languageStats).filter(([, value]) => value >= threshold)
    );
    
    const sortedStats = Object.fromEntries(
      Object.entries(filteredStats).sort((a, b) => b[1] - a[1])
    );
    
    // Take top 10 languages
    const topLanguages = Object.fromEntries(
      Object.entries(sortedStats).slice(0, 10)
    );
    
    // Others category for the rest
    const otherLanguages = Object.entries(filteredStats)
      .filter(([key]) => !Object.keys(topLanguages).includes(key))
      .reduce((sum, [, value]) => sum + value, 0);
    
    if (otherLanguages > 0) {
      topLanguages['Other'] = otherLanguages;
    }
    
    // Generate colors for each language
    const languageColors = getLanguageColors(Object.keys(topLanguages));
    
    // Clean up previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(topLanguages),
        datasets: [{
          data: Object.values(topLanguages),
          backgroundColor: Object.keys(topLanguages).map(lang => languageColors[lang]),
          borderColor: darkMode ? '#1f2937' : '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: darkMode ? '#e5e7eb' : '#1f2937',
              font: {
                size: 11
              }
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
  }, [repositories, darkMode]);
  
  // Generate consistent colors for programming languages
  const getLanguageColors = (languages) => {
    // Common language colors (GitHub-like)
    const commonLanguageColors = {
      JavaScript: "#f1e05a",
      TypeScript: "#2b7489",
      Python: "#3572A5",
      Java: "#b07219",
      "C#": "#178600",
      PHP: "#4F5D95",
      "C++": "#f34b7d",
      C: "#555555",
      Shell: "#89e051",
      Ruby: "#701516",
      Go: "#00ADD8",
      Swift: "#ffac45",
      Kotlin: "#F18E33",
      Rust: "#dea584",
      Dart: "#00B4AB",
      HTML: "#e34c26",
      CSS: "#563d7c",
      "Jupyter Notebook": "#DA5B0B",
      Vue: "#2c3e50",
      R: "#198CE7",
      Other: "#8b8b8b",
    };

    const languageColors = {};

    for (const lang of languages) {
      if (lang in commonLanguageColors) {
        languageColors[lang] = commonLanguageColors[lang];
      } else {
        // Generate color based on language name hash for consistency
        let hash = 0;
        for (let i = 0; i < lang.length; i++) {
          hash = lang.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Generate RGB values
        const r = (hash & 0xFF) % 200 + 55;  // Avoid too dark/light
        const g = ((hash >> 8) & 0xFF) % 200 + 55;
        const b = ((hash >> 16) & 0xFF) % 200 + 55;
        
        languageColors[lang] = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    }

    return languageColors;
  };
  
  if (!repositories || repositories.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No language data available</p>
      </div>
    );
  }
  
  return (
    <div className="h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default LanguageChart;