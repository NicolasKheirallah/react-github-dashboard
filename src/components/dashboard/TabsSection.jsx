// src/components/dashboard/TabsSection.jsx
import React from 'react';
import { useGithub } from '../../context/GithubContext';

// Import tab content components
import PullRequestsTab from './tabs/PullRequestsTab';
import IssuesTab from './tabs/IssuesTab';
import RepositoriesTab from './tabs/RepositoriesTab';
import OrganizationsTab from './tabs/OrganizationsTab';
import StarredTab from './tabs/StarredTab';

const TabsSection = ({ 
  activeTab, 
  onTabChange, 
  searchQuery, 
  onSearchChange,
  sortOption,
  onSortChange
}) => {
  const { 
    pullRequests, 
    issues, 
    repositories, 
    organizations, 
    starredRepos 
  } = useGithub();
  
  const tabs = [
    { id: 'pull-requests', label: 'Pull Requests', count: pullRequests.length },
    { id: 'issues', label: 'Issues', count: issues.length },
    { id: 'repositories', label: 'Repositories', count: repositories.length },
    { id: 'organizations', label: 'Organizations', count: organizations.length },
    { id: 'starred', label: 'Starred', count: starredRepos.length },
  ];
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'pull-requests':
        return <PullRequestsTab searchQuery={searchQuery} sortOption={sortOption} />;
      case 'issues':
        return <IssuesTab searchQuery={searchQuery} sortOption={sortOption} />;
      case 'repositories':
        return <RepositoriesTab searchQuery={searchQuery} sortOption={sortOption} />;
      case 'organizations':
        return <OrganizationsTab searchQuery={searchQuery} sortOption={sortOption} />;
      case 'starred':
        return <StarredTab searchQuery={searchQuery} sortOption={sortOption} />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };
  
  return (
    <div className="gh-card mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="gh-header p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detailed Activity</h2>
      </div>
      <div className="p-4">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 flex flex-wrap">
          <ul className="flex flex-wrap -mb-px text-sm font-medium" id="tabs">
            {tabs.map(tab => (
              <li className="mr-2" key={tab.id}>
                <a 
                  href="#" 
                  className={`inline-block p-4 ${
                    activeTab === tab.id 
                      ? 'tab-active border-b-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500 font-semibold' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border-b-2 border-transparent'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    onTabChange(tab.id);
                  }}
                >
                  {tab.label} <span className="ml-1 text-xs">{tab.count}</span>
                </a>
              </li>
            ))}
          </ul>
          
          {/* Sort & Filter Options */}
          <div className="ml-auto flex items-center space-x-2">
            <select 
              id="sortOptions" 
              value={sortOption}
              onChange={onSortChange}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </select>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input 
              type="text" 
              id="searchInput" 
              placeholder={`Filter ${activeTab.replace('-', ' ')}...`}
              value={searchQuery}
              onChange={onSearchChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
            />
            <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Tab Content */}
        <div id="tabContent">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default TabsSection;