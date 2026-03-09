import { useMemo } from 'react';
import { useGithub } from '../context/GithubContext';
import { generateAnalytics } from '../services/dataProcessingService';
import { applyDashboardScopeFilters } from '../utils/dashboardFilters';

export const useScopedDashboardData = ({
  repoScope = 'all',
  ownerScope = 'all',
  timeRange = 'all',
}) => {
  const {
    pullRequests,
    issues,
    repositories,
    organizations,
    starredRepos,
    contributions,
  } = useGithub();

  return useMemo(() => {
    const scopedPullRequests = applyDashboardScopeFilters(pullRequests || [], {
      ownerScope,
      repoScope,
      timeRange,
    });
    const scopedIssues = applyDashboardScopeFilters(issues || [], {
      ownerScope,
      repoScope,
      timeRange,
    });
    const scopedRepositories = applyDashboardScopeFilters(repositories || [], {
      ownerScope,
      repoScope,
      timeRange,
    });
    const scopedStarredRepos = applyDashboardScopeFilters(starredRepos || [], {
      ownerScope,
      repoScope,
      timeRange,
    });

    return {
      pullRequests: scopedPullRequests,
      issues: scopedIssues,
      repositories: scopedRepositories,
      organizations: organizations || [],
      starredRepos: scopedStarredRepos,
      analytics: generateAnalytics({
        prs: scopedPullRequests,
        issues: scopedIssues,
        repos: scopedRepositories,
        contributions: {
          monthlyCommits: contributions?.monthlyCommits || {},
          eventCounts: contributions?.eventCounts || {},
          repoActivity: contributions?.repoActivity || {},
        },
      }),
    };
  }, [
    contributions,
    issues,
    organizations,
    ownerScope,
    pullRequests,
    repoScope,
    repositories,
    starredRepos,
    timeRange,
  ]);
};
