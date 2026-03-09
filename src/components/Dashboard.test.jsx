import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Dashboard from './Dashboard';

const { githubContextValue, fetchAllGithubData, processGithubData, generateAnalytics } = vi.hoisted(
  () => ({
    githubContextValue: {
      token: 'github_pat_test',
      userData: { name: 'Jane Doe', login: 'janedoe' },
      repositories: [{ name: 'openai/react-github-dashboard' }],
      pullRequests: [],
      issues: [],
      organizations: [],
      starredRepos: [],
      contributions: { monthlyCommits: {}, eventCounts: {}, repoActivity: {} },
      setUserData: vi.fn(),
      setRepositories: vi.fn(),
      setPullRequests: vi.fn(),
      setIssues: vi.fn(),
      setOrganizations: vi.fn(),
      setStarredRepos: vi.fn(),
      setContributions: vi.fn(),
      setAnalytics: vi.fn(),
      setUserEvents: vi.fn(),
      setFollowers: vi.fn(),
      setFollowing: vi.fn(),
      loading: false,
      setLoading: vi.fn(),
      error: null,
      setError: vi.fn(),
      darkMode: false,
    },
    fetchAllGithubData: vi.fn(),
    processGithubData: vi.fn(),
    generateAnalytics: vi.fn(() => ({})),
  })
);

vi.mock('../context/GithubContext', () => ({
  useGithub: () => githubContextValue,
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ darkMode: false, toggleDarkMode: vi.fn() }),
}));

vi.mock('../services/github/dashboard', () => ({
  fetchAllGithubData,
}));

vi.mock('../services/dataProcessingService', () => ({
  processGithubData,
  generateAnalytics,
}));

vi.mock('./dashboard/Overview', () => ({
  default: () => <div>Overview mock</div>,
}));

vi.mock('./dashboard/ChartsSection', () => ({
  default: () => <div>Charts mock</div>,
}));

vi.mock('./dashboard/TabsSection', () => ({
  default: ({ activeTab, onTabChange }) => (
    <div>
      <div data-testid="active-tab">{activeTab}</div>
      <button type="button" onClick={() => onTabChange('issues')}>
        Switch to issues
      </button>
    </div>
  ),
}));

vi.mock('./dashboard/tabs/ContributorsTab', () => ({
  default: () => <div>Contributors mock</div>,
}));

vi.mock('./dashboard/tabs/AnalyticsTab', () => ({
  default: () => <div>Analytics mock</div>,
}));

vi.mock('./dashboard/charts/PRReviewTimeChart', () => ({
  default: () => <div>PR review chart</div>,
}));

vi.mock('./dashboard/charts/IssueResolutionChart', () => ({
  default: () => <div>Issue resolution chart</div>,
}));

vi.mock('./dashboard/charts/CodeChurnChart', () => ({
  default: () => <div>Code churn chart</div>,
}));

vi.mock('./dashboard/charts/CommitFrequencyChart', () => ({
  default: () => <div>Commit frequency chart</div>,
}));

vi.mock('./dashboard/charts/PRSizeDistributionChart', () => ({
  default: () => <div>PR size chart</div>,
}));

vi.mock('./dashboard/charts/IssueTypesChart', () => ({
  default: () => <div>Issue types chart</div>,
}));

vi.mock('./dashboard/charts/ActivityHeatmap', () => ({
  default: () => <div>Activity heatmap</div>,
}));

vi.mock('./dashboard/charts/LanguageChart', () => ({
  default: () => <div>Language chart</div>,
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
};

const renderDashboard = (initialEntry = '/?tab=pull-requests') =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: {
              retry: false,
            },
          },
        })
      }
    >
      <MemoryRouter
        initialEntries={[initialEntry]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Dashboard />
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

describe('Dashboard routing', () => {
  beforeEach(() => {
    fetchAllGithubData.mockResolvedValue({});
    processGithubData.mockReturnValue({
      userData: githubContextValue.userData,
      processedPRs: [],
      processedIssues: [],
      processedRepos: [],
      processedOrgs: [],
      processedStarred: [],
      processedContributions: {},
      processedEvents: [],
      analytics: {},
    });
  });

  it('uses the query param tab when it is valid', async () => {
    renderDashboard('/?tab=repositories');

    expect(await screen.findByTestId('active-tab')).toHaveTextContent('repositories');
  });

  it('falls back to pull requests when the tab query is invalid', async () => {
    renderDashboard('/?tab=not-real');

    expect(await screen.findByTestId('active-tab')).toHaveTextContent('pull-requests');
  });

  it('syncs tab changes back into the query string', async () => {
    const user = userEvent.setup();
    renderDashboard('/?tab=repositories');

    await user.click(await screen.findByRole('button', { name: /switch to issues/i }));

    expect(screen.getByTestId('location-search')).toHaveTextContent('?tab=issues');
    expect(screen.getByTestId('active-tab')).toHaveTextContent('issues');
  });

  it('hydrates dashboard controls from query params', async () => {
    renderDashboard('/?tab=issues&view=analytics&repo=openai%2Freact-github-dashboard&range=90d');

    expect(await screen.findByLabelText(/dashboard view/i)).toHaveValue('analytics');
    expect(screen.getByLabelText(/repository scope/i)).toHaveValue(
      'openai/react-github-dashboard'
    );
    expect(screen.getByLabelText(/activity window/i)).toHaveValue('90d');
  });
});
