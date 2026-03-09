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
  onSortChange,
  ownerScope,
  ownerOptions = [],
  onOwnerScopeChange,
  repoScope,
  onRepoScopeChange,
  timeRange,
  onTimeRangeChange,
  scopedData,
}) => {
  const { 
    repositories, 
    organizations
  } = useGithub();
  const scopedPullRequests = scopedData?.pullRequests ?? [];
  const scopedIssues = scopedData?.issues ?? [];
  const scopedRepositories = scopedData?.repositories ?? [];
  const scopedStarredRepos = scopedData?.starredRepos ?? [];
  const repositoryFilterOptions =
    scopedRepositories.length > 0 || repoScope !== 'all' ? scopedRepositories : repositories;
  
  const tabs = [
    { id: 'pull-requests', label: 'Pull Requests', count: scopedPullRequests.length },
    { id: 'issues', label: 'Issues', count: scopedIssues.length },
    { id: 'repositories', label: 'Repositories', count: scopedRepositories.length },
    { id: 'organizations', label: 'Organizations', count: organizations.length },
    { id: 'starred', label: 'Starred', count: scopedStarredRepos.length },
  ];
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'pull-requests':
        return <PullRequestsTab searchQuery={searchQuery} sortOption={sortOption} ownerScope={ownerScope} repoScope={repoScope} timeRange={timeRange} />;
      case 'issues':
        return <IssuesTab searchQuery={searchQuery} sortOption={sortOption} ownerScope={ownerScope} repoScope={repoScope} timeRange={timeRange} />;
      case 'repositories':
        return <RepositoriesTab searchQuery={searchQuery} sortOption={sortOption} ownerScope={ownerScope} repoScope={repoScope} timeRange={timeRange} />;
      case 'organizations':
        return <OrganizationsTab searchQuery={searchQuery} sortOption={sortOption} ownerScope={ownerScope} repoScope={repoScope} timeRange={timeRange} />;
      case 'starred':
        return <StarredTab searchQuery={searchQuery} sortOption={sortOption} ownerScope={ownerScope} repoScope={repoScope} timeRange={timeRange} />;
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
                <button // Changed from 'a' tag to button
                  className={`inline-block p-4 ${
                    activeTab === tab.id 
                      ? 'tab-active border-b-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500 font-semibold' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border-b-2 border-transparent'
                  }`}
                  onClick={() => onTabChange(tab.id)} // Removed e.preventDefault()
                >
                  {tab.label} <span className="ml-1 text-xs">{tab.count}</span>
                </button>
              </li>
            ))}
          </ul>
          
          {/* Sort & Filter Options */}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <select
              value={ownerScope}
              onChange={onOwnerScopeChange}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by owner scope"
            >
              <option value="all">All Owners</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
            <select
              value={repoScope}
              onChange={onRepoScopeChange}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by repository scope"
            >
              <option value="all">All Repositories</option>
              {repositoryFilterOptions.slice(0, 40).map((repo) => (
                <option key={repo.name} value={repo.name}>
                  {repo.name}
                </option>
              ))}
            </select>
            <select
              value={timeRange}
              onChange={onTimeRangeChange}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by time range"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="180d">Last 180 Days</option>
            </select>
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
