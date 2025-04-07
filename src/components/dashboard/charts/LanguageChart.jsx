import React, { useEffect, useRef, useState } from 'react';
import { useGithub } from '../../../context/GithubContext';
import Chart from 'chart.js/auto';

const LanguageChart = ({ size = 'medium' }) => {
  const { repositories, darkMode } = useGithub();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [languageData, setLanguageData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Process repositories to extract language data
    const processLanguageData = () => {
      if (!repositories || repositories.length === 0) {
        return null;
      }
      
      // Count languages across repositories weighted by stars
      const languageStats = {};
      
      repositories.forEach(repo => {
        if (repo.language && !repo.isFork) {
          const lang = repo.language;
          // Weight by stars
          const weight = 1 + (0.1 * (repo.stars || 0));
          languageStats[lang] = (languageStats[lang] || 0) + weight;
        }
      });

      // Skip if no language data was found
      if (Object.keys(languageStats).length === 0) {
        return null;
      }
      
      // Filter out languages with very small values
      const threshold = 0.5;
      const filteredStats = Object.fromEntries(
        Object.entries(languageStats).filter(([, value]) => value >= threshold)
      );
      
      // Sort by value
      const sortedStats = Object.fromEntries(
        Object.entries(filteredStats).sort((a, b) => b[1] - a[1])
      );
      
      // Take top 10 languages
      const topLanguages = Object.fromEntries(
        Object.entries(sortedStats).slice(0, 10)
      );
      
      // Calculate total for percentage conversion
      const totalValue = Object.values(topLanguages).reduce((sum, val) => sum + val, 0);
      
      // Convert to percentages with proper rounding
      const languagePercentages = {};
      Object.entries(topLanguages).forEach(([lang, value]) => {
        languagePercentages[lang] = Math.round((value / totalValue) * 1000) / 10; // Round to 1 decimal
      });
      
      // Others category for the rest
      const otherLanguages = Object.entries(filteredStats)
        .filter(([key]) => !Object.keys(topLanguages).includes(key))
        .reduce((sum, [, value]) => sum + value, 0);
      
      if (otherLanguages > 0) {
        const otherPercentage = Math.round((otherLanguages / (totalValue + otherLanguages)) * 1000) / 10;
        languagePercentages['Other'] = otherPercentage;
      }
      
      return {
        labels: Object.keys(languagePercentages),
        values: Object.values(languagePercentages),
        colors: Object.keys(languagePercentages).map(lang => getLanguageColor(lang))
      };
    };
    
    const data = processLanguageData();
    setLanguageData(data);
    setLoading(false);
  }, [repositories]);
  
  useEffect(() => {
    if (!chartRef.current || !languageData) {
      return;
    }
    
    // Clean up previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Chart theme colors
    const isDarkMode = darkMode;
    const textColor = isDarkMode ? '#e5e7eb' : '#1f2937';
    const backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: languageData.labels,
        datasets: [{
          data: languageData.values,
          backgroundColor: languageData.colors,
          borderColor: backgroundColor,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 20
          }
        },
        plugins: {
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              color: textColor,
              font: {
                size: 11
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
            titleColor: textColor,
            bodyColor: textColor,
            bodyFont: {
              size: 12
            },
            borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value.toFixed(1)}%`;
              }
            }
          },
          title: {
            display: true,
            text: 'Language Distribution',
            color: textColor,
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 15
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
  }, [languageData, darkMode]);
  
  // Generate consistent colors for programming languages
  const getLanguageColor = (language) => {
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
      PowerShell: "#012456",
      Other: "#8b8b8b",
    };

    if (language in commonLanguageColors) {
      return commonLanguageColors[language];
    } else {
      // Generate color based on language name hash for consistency
      let hash = 0;
      for (let i = 0; i < language.length; i++) {
        hash = language.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      // Generate RGB values
      const r = (hash & 0xFF) % 200 + 55;  // Avoid too dark/light
      const g = ((hash >> 8) & 0xFF) % 200 + 55;
      const b = ((hash >> 16) & 0xFF) % 200 + 55;
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  };
  
  const getChartHeight = () => {
    switch (size) {
      case 'small': return 'h-48';
      case 'large': return 'h-80';
      case 'medium':
      default: return 'h-64';
    }
  };
  
  if (loading) {
    return (
      <div className={`${getChartHeight()} flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!languageData) {
    return (
      <div className={`${getChartHeight()} flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg`}>
        <p className="text-gray-500 dark:text-gray-400">No language data available</p>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className={`${getChartHeight()} bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}>
        <canvas ref={chartRef}></canvas>
      </div>
      
      {/* Optional: Add a table view of the language data below the chart */}
      <div className="mt-4 overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Language</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Percentage</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {languageData.labels.map((language, index) => (
              <tr key={language}>
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-3 h-3 rounded-full" style={{ backgroundColor: languageData.colors[index] }}></div>
                    <div className="ml-4 text-sm font-medium text-gray-900 dark:text-gray-100">{language}</div>
                  </div>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                  {languageData.values[index].toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LanguageChart;