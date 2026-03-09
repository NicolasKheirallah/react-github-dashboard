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
    switch (activeTab) {
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
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
              Detailed Activity
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Inspect the current workload</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Search within the active surface, then narrow by owner, repository, time, or sort.
          </p>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-5 flex flex-col gap-4">
          <ul className="flex flex-wrap gap-2 text-sm font-medium" id="tabs">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  className={`inline-flex items-center rounded-full px-4 py-2.5 transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                  }`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <span>{tab.label}</span>
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {tab.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40 xl:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.8fr))]">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              Search this view
              <div className="relative">
                <input 
                  type="text" 
                  id="searchInput" 
                  placeholder={`Filter ${activeTab.replace('-', ' ')}...`}
                  value={searchQuery}
                  onChange={onSearchChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-slate-900 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                />
                <svg className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </label>
            <select
              value={ownerScope}
              onChange={onOwnerScopeChange}
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
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
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
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
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
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
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </select>
          </div>
        </div>
        <div id="tabContent">
          {renderTabContent()}
        </div>
      </div>
    </section>
  );
};

export default TabsSection;
