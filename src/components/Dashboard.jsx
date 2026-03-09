import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { useTheme } from '../context/ThemeContext';
import { useDashboardData } from '../hooks/useDashboardData';
import {
  DASHBOARD_PRESETS,
  useDashboardPreferences,
} from '../hooks/useDashboardPreferences';
import { useScopedDashboardData } from '../hooks/useScopedDashboardData';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import Overview from './dashboard/Overview';
import ChartsSection from './dashboard/ChartsSection';
import TabsSection from './dashboard/TabsSection';
import DashboardBriefing from './dashboard/DashboardBriefing';
import ContributorsTab from './dashboard/tabs/ContributorsTab';
import AnalyticsTab from './dashboard/tabs/AnalyticsTab';
import PRReviewTimeChart from './dashboard/charts/PRReviewTimeChart';
import IssueResolutionChart from './dashboard/charts/IssueResolutionChart';
import CodeChurnChart from './dashboard/charts/CodeChurnChart';
import CommitFrequencyChart from './dashboard/charts/CommitFrequencyChart';
import PRSizeDistributionChart from './dashboard/charts/PRSizeDistributionChart';
import IssueTypesChart from './dashboard/charts/IssueTypesChart';
import ActivityHeatmap from './dashboard/charts/ActivityHeatmap';
import LanguageChart from './dashboard/charts/LanguageChart';

const Dashboard = () => {
  const {
    token,
    userData,
    setUserData,
    setRepositories,
    repositories,
    setPullRequests,
    setIssues,
    setOrganizations,
    setStarredRepos,
    setContributions,
    setAnalytics,
    setUserEvents,
    setFollowers,
    setFollowing,
    loading,
    setLoading,
    error,
    setError,
  } = useGithub();
  const { darkMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const dataLoaded = useDashboardData({
    token,
    setUserData,
    setRepositories,
    setPullRequests,
    setIssues,
    setOrganizations,
    setStarredRepos,
    setContributions,
    setAnalytics,
    setUserEvents,
    setFollowers,
    setFollowing,
    setLoading,
    setError,
  });
  const {
    activeTab,
    dashboardView,
    changeDashboardView,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    ownerScope,
    setOwnerScope,
    repoScope,
    setRepoScope,
    timeRange,
    setTimeRange,
    handleTabChange,
    activePreset,
    applyDashboardPreset,
    resetDashboardView,
  } = useDashboardPreferences(searchParams, setSearchParams);
  const scopedDashboardData = useScopedDashboardData({ ownerScope, repoScope, timeRange });
  const ownerOptions = useMemo(() => {
    const owners = new Set();

    repositories.forEach((repo) => {
      if (repo?.name?.includes('/')) {
        owners.add(repo.name.split('/')[0]);
      }
    });

    if (userData?.login) {
      owners.add(userData.login);
    }

    return Array.from(owners).sort((left, right) => left.localeCompare(right));
  }, [repositories, userData?.login]);
  const repositoryOptions = useMemo(() => {
    const scopedRepositoriesForOwner =
      ownerScope === 'all'
        ? repositories
        : repositories.filter((repo) => repo.name.startsWith(`${ownerScope}/`));

    return scopedRepositoriesForOwner.slice().sort((left, right) => left.name.localeCompare(right.name));
  }, [ownerScope, repositories]);

  useEffect(() => {
    if (
      repoScope !== 'all' &&
      !repositoryOptions.some((repository) => repository.name === repoScope)
    ) {
      setRepoScope('all');
    }
  }, [repoScope, repositoryOptions, setRepoScope]);

  if (loading && !dataLoaded) {
    return <Loader message="Loading your GitHub data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!userData) {
    return <ErrorMessage message="Could not load user data." />;
  }

  const renderHeader = () => (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
            Standard Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {userData?.name ? `${userData.name}'s GitHub Workspace` : 'GitHub Workspace'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Review what needs attention, switch analytical lenses quickly, and jump into the
            repo or workflow that deserves the next decision.
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/50">
            <p className="font-medium text-slate-800 dark:text-slate-200">Current focus</p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              {dashboardView === 'default'
                ? 'Overview, active work, and review/resolution signals'
                : dashboardView === 'contributors'
                  ? 'Collaboration hotspots and contributor activity'
                  : dashboardView === 'analytics'
                    ? 'Patterns, trends, and operational health'
                    : 'Repository change volume and code metrics'}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {ownerScope === 'all' ? 'All owners' : ownerScope}
              {' · '}
              {repoScope === 'all' ? 'All repositories' : repoScope}
              {' · '}
              {timeRange === 'all'
                ? 'All time'
                : timeRange === '30d'
                  ? 'Last 30 days'
                  : timeRange === '90d'
                    ? 'Last 90 days'
                    : 'Last 180 days'}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {DASHBOARD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyDashboardPreset(preset.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  activePreset === preset.id
                    ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={resetDashboardView}
              className="rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[34rem]">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Dashboard view
            <select
              value={dashboardView}
              onChange={(event) => changeDashboardView(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="default">Standard View</option>
              <option value="contributors">Contributors View</option>
              <option value="analytics">Analytics View</option>
              <option value="code">Code Metrics View</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Owner scope
            <select
              value={ownerScope}
              onChange={(event) => setOwnerScope(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">All owners</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Repository scope
            <select
              value={repoScope}
              onChange={(event) => setRepoScope(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">All repositories</option>
              {repositoryOptions.slice(0, 40).map((repo) => (
                <option key={repo.name} value={repo.name}>
                  {repo.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Activity window
            <select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">All time</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="180d">Last 180 days</option>
            </select>
          </label>
        </div>
      </div>
      <DashboardBriefing
        activeTab={activeTab}
        onJumpToTab={handleTabChange}
        ownerScope={ownerScope}
        repoScope={repoScope}
        timeRange={timeRange}
        scopedData={scopedDashboardData}
      />
    </>
  );

  const renderDashboard = () => {
    switch (dashboardView) {
      case 'contributors':
        return (
          <>
            {renderHeader()}
            <Overview
              scopedData={scopedDashboardData}
              ownerScope={ownerScope}
              repoScope={repoScope}
              timeRange={timeRange}
              onJumpToTab={handleTabChange}
            />
            <div className="mb-8 rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="rounded-t-lg border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Contributors Overview
                </h2>
              </div>
              <div className="p-4">
                <ContributorsTab
                  searchQuery={searchQuery}
                  sortOption={sortOption === 'newest' ? 'most-active' : sortOption}
                  ownerScope={ownerScope}
                  repoScope={repoScope}
                />
              </div>
            </div>
            <div className="mb-8">
              <ActivityHeatmap />
            </div>
          </>
        );

      case 'analytics':
        return (
          <>
            {renderHeader()}
            <Overview
              scopedData={scopedDashboardData}
              ownerScope={ownerScope}
              repoScope={repoScope}
              timeRange={timeRange}
              onJumpToTab={handleTabChange}
            />
            <div className="mb-8 rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="rounded-t-lg border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Advanced Analytics
                </h2>
              </div>
              <div className="p-4">
                <AnalyticsTab
                  analytics={scopedDashboardData.analytics}
                  pullRequests={scopedDashboardData.pullRequests}
                  issues={scopedDashboardData.issues}
                  repoScope={repoScope}
                  timeRange={timeRange}
                />
              </div>
            </div>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pull Request Review Time
                  </h3>
                </div>
                <div className="p-4">
                  <PRReviewTimeChart
                    size="medium"
                    pullRequestsData={scopedDashboardData.pullRequests}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Issue Resolution
                  </h3>
                </div>
                <div className="p-4">
                  <IssueResolutionChart
                    size="medium"
                    issuesData={scopedDashboardData.issues}
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 'code':
        return (
          <>
            {renderHeader()}
            <Overview
              scopedData={scopedDashboardData}
              ownerScope={ownerScope}
              repoScope={repoScope}
              timeRange={timeRange}
              onJumpToTab={handleTabChange}
            />
            <div className="mb-8 rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="rounded-t-lg border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Code Metrics
                </h2>
              </div>
              <div className="space-y-8 p-4">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Code Churn Analysis
                    </h3>
                  </div>
                  <div className="p-4">
                    <CodeChurnChart size="medium" />
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Commit Activity
                    </h3>
                  </div>
                  <div className="p-4">
                    <CommitFrequencyChart size="large" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Language Distribution
                      </h3>
                    </div>
                    <div className="p-4">
                      <LanguageChart size="small" />
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-4">
                      <PRSizeDistributionChart size="large" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return (
          <>
            {renderHeader()}
            <Overview
              scopedData={scopedDashboardData}
              repoScope={repoScope}
              timeRange={timeRange}
              onJumpToTab={handleTabChange}
            />
            <ChartsSection
              analytics={scopedDashboardData.analytics}
              ownerScope={ownerScope}
              repoScope={repoScope}
              timeRange={timeRange}
            />
            <TabsSection
              activeTab={activeTab}
              onTabChange={handleTabChange}
              searchQuery={searchQuery}
              onSearchChange={(event) => setSearchQuery(event.target.value)}
              sortOption={sortOption}
              onSortChange={(event) => setSortOption(event.target.value)}
              ownerScope={ownerScope}
              ownerOptions={ownerOptions}
              onOwnerScopeChange={(event) => setOwnerScope(event.target.value)}
              repoScope={repoScope}
              onRepoScopeChange={(event) => setRepoScope(event.target.value)}
              timeRange={timeRange}
              onTimeRangeChange={(event) => setTimeRange(event.target.value)}
              scopedData={scopedDashboardData}
            />
            <div className="mb-8">
              <ActivityHeatmap />
            </div>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Issue Types
                  </h3>
                </div>
                <div className="p-4">
                  <IssueTypesChart size="medium" />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Language Distribution
                  </h3>
                </div>
                <div className="p-4">
                  <LanguageChart size="medium" />
                </div>
              </div>
            </div>

            <div className="mb-8 rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="rounded-t-lg border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Review & Resolution Analytics
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">
                <PRReviewTimeChart
                  size="small"
                  pullRequestsData={scopedDashboardData.pullRequests}
                />
                <IssueResolutionChart
                  size="small"
                  issuesData={scopedDashboardData.issues}
                />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div
      className={`container mx-auto max-w-7xl px-4 py-8 ${
        darkMode ? 'bg-gray-900' : 'bg-slate-100'
      }`}
    >
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
