import React, { useState } from 'react';
import { useGithub } from '../../../context/GithubContext';
import PRReviewTimeChart from '../charts/PRReviewTimeChart';
import IssueResolutionChart from '../charts/IssueResolutionChart';
import CodeChurnChart from '../charts/CodeChurnChart';
import CommitFrequencyChart from '../charts/CommitFrequencyChart';
import PRSizeDistributionChart from '../charts/PRSizeDistributionChart';
import IssueTypesChart from '../charts/IssueTypesChart';

const AnalyticsTab = () => {
  const { analytics, darkMode } = useGithub();
  const [activeSection, setActiveSection] = useState('pull-requests');

  const sections = [
    { id: 'pull-requests', label: 'Pull Requests' },
    { id: 'issues', label: 'Issues' },
    { id: 'code', label: 'Code Metrics' }
  ];

  const renderSection = () => {
    switch(activeSection) {
      case 'pull-requests':
        return (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pull Request Review Time
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Average time for pull requests to be reviewed and merged over time
                </p>
              </div>
              <div className="p-4">
                <PRReviewTimeChart size="medium" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pull Request Size Distribution
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Distribution of PRs by code change size
                  </p>
                </div>
                <div className="p-4">
                  <PRSizeDistributionChart />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    PR Status Overview
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current status of all your pull requests
                  </p>
                </div>
                <div className="p-4">
                  {/* Using the existing PRStatusChart component */}
                  <div className="h-64">
                    {analytics.prStateDistribution ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="grid grid-cols-3 gap-4 w-full">
                          <StatusCard 
                            label="Open" 
                            value={analytics.prStateDistribution.data[0]} 
                            color="#3b82f6"
                            darkMode={darkMode}
                          />
                          <StatusCard 
                            label="Closed" 
                            value={analytics.prStateDistribution.data[1]} 
                            color="#ef4444"
                            darkMode={darkMode}
                          />
                          <StatusCard 
                            label="Merged" 
                            value={analytics.prStateDistribution.data[2]} 
                            color="#10b981"
                            darkMode={darkMode}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        No PR status data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'issues':
        return (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Issue Resolution Time
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Average time to resolve issues by category
                </p>
              </div>
              <div className="p-4">
                <IssueResolutionChart size="medium" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Issue Types Breakdown
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Distribution of issues by label type
                </p>
              </div>
              <div className="p-4">
                <IssueTypesChart />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Monthly Issue Activity
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Issue creation and resolution over time
                </p>
              </div>
              <div className="p-4">
                {analytics && analytics.issueTimeline ? (
                  <div className="h-64">
                    {/* Simple placeholder for issue timeline */}
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Issue activity data will be visualized here as a timeline chart
                      </p>
                      <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 h-8 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        65% resolution rate
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    No issue timeline data available
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'code':
        return (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Commit Activity Heatmap
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Visualization of your commit frequency
                </p>
              </div>
              <div className="p-4">
                <CommitFrequencyChart size="large" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Code Churn Analysis
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Lines added and removed over time
                </p>
              </div>
              <div className="p-4">
                <CodeChurnChart />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Language Distribution
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Programming languages across your repositories
                </p>
              </div>
              <div className="p-4 h-64">
                {analytics && analytics.languageStats ? (
                  <div className="grid grid-cols-2 gap-6 h-full">
                    {/* Left side: Chart */}
                    <div className="relative h-full">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-40 w-40 rounded-full border-8 border-blue-500 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                              {analytics.languageStats.labels.length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Languages
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side: Top languages */}
                    <div className="flex flex-col justify-center">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Top Languages
                      </h4>
                      <div className="space-y-2">
                        {analytics.languageStats.labels.slice(0, 5).map((language, index) => (
                          <div key={language} className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: analytics.languageStats.colors[index] }}
                            ></div>
                            <div className="text-sm text-gray-800 dark:text-gray-200">
                              {language}
                            </div>
                            <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                              {analytics.languageStats.data[index]}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No language data available
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            Select a section to view analytics
          </div>
        );
    }
  };

  return (
    <div>
      {/* Section Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium">
          {sections.map(section => (
            <li className="mr-2" key={section.id}>
              <a 
                href="#" 
                className={`inline-block p-4 ${
                  activeSection === section.id 
                    ? 'border-b-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500 font-semibold' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border-b-2 border-transparent'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(section.id);
                }}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Section Content */}
      {renderSection()}
    </div>
  );
};

// Helper component for PR status cards
const StatusCard = ({ label, value, color, darkMode }) => {
  return (
    <div 
      className="border rounded-lg p-4 text-center"
      style={{ borderColor: color }}
    >
      <div 
        className="text-2xl font-bold"
        style={{ color }}
      >
        {value}
      </div>
      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </div>
    </div>
  );
};

export default AnalyticsTab;