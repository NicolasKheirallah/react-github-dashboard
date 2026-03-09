import { useMemo, useState } from 'react';
import { readStorageValue, writeStorageValue } from '../utils/storage';

const VALID_TABS = new Set([
  'pull-requests',
  'issues',
  'repositories',
  'organizations',
  'starred',
]);
const DASHBOARD_VIEW_KEY = 'github-dashboard-view';

export const DASHBOARD_PRESETS = [
  {
    id: 'review-queue',
    label: 'Review Queue',
    description: 'Open pull requests and short-term review load.',
    view: 'default',
    tab: 'pull-requests',
    range: '30d',
    owner: 'all',
    repo: 'all',
  },
  {
    id: 'repo-health',
    label: 'Repo Health',
    description: 'Issue backlog, repo mix, and operational signals.',
    view: 'analytics',
    tab: 'issues',
    range: '90d',
    owner: 'all',
    repo: 'all',
  },
  {
    id: 'contributor-pulse',
    label: 'Contributor Pulse',
    description: 'Collaboration focus for the last quarter.',
    view: 'contributors',
    tab: 'repositories',
    range: '90d',
    owner: 'all',
    repo: 'all',
  },
  {
    id: 'code-watch',
    label: 'Code Watch',
    description: 'Recent code churn and language movement.',
    view: 'code',
    tab: 'repositories',
    range: '30d',
    owner: 'all',
    repo: 'all',
  },
];

export const useDashboardPreferences = (searchParams, setSearchParams) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const repoScope = searchParams.get('repo') || 'all';
  const ownerScope = searchParams.get('owner') || 'all';
  const timeRange = searchParams.get('range') || 'all';
  const dashboardView =
    searchParams.get('view') || readStorageValue(DASHBOARD_VIEW_KEY, 'default') || 'default';
  const activePreset = searchParams.get('preset') || 'custom';

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab') || 'pull-requests';
    return VALID_TABS.has(tab) ? tab : 'pull-requests';
  }, [searchParams]);

  const updateDashboardParams = (updates) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (
        !value ||
        value === 'all' ||
        value === 'custom' ||
        (key === 'view' && value === 'default')
      ) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    setSearchParams(nextParams);
  };

  const handleTabChange = (tabId) => {
    updateDashboardParams({ tab: tabId });
    setSearchQuery('');
  };

  const changeDashboardView = (view) => {
    writeStorageValue(DASHBOARD_VIEW_KEY, view);
    updateDashboardParams({ view, preset: 'custom' });
  };

  const setRepoScope = (repo) => updateDashboardParams({ repo, preset: 'custom' });
  const setOwnerScope = (owner) =>
    updateDashboardParams({ owner, repo: 'all', preset: 'custom' });

  const setTimeRange = (range) => updateDashboardParams({ range, preset: 'custom' });
  const applyDashboardPreset = (presetId) => {
    const preset = DASHBOARD_PRESETS.find((candidate) => candidate.id === presetId);

    if (!preset) {
      return;
    }

    writeStorageValue(DASHBOARD_VIEW_KEY, preset.view);
    updateDashboardParams({
      preset: preset.id,
      view: preset.view,
      tab: preset.tab,
      range: preset.range,
      owner: preset.owner,
      repo: preset.repo,
    });
    setSearchQuery('');
  };
  const resetDashboardView = () => {
    writeStorageValue(DASHBOARD_VIEW_KEY, 'default');
    updateDashboardParams({
      preset: 'custom',
      view: 'default',
      tab: 'pull-requests',
      range: 'all',
      owner: 'all',
      repo: 'all',
    });
  };

  return {
    activeTab,
    activePreset,
    dashboardView,
    changeDashboardView,
    applyDashboardPreset,
    resetDashboardView,
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
  };
};
