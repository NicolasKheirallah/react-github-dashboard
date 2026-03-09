export const CATEGORY_OPTIONS = [
  { id: 'all', name: 'All' },
  { id: 'repositories', name: 'Repositories' },
  { id: 'pull-requests', name: 'Pull Requests' },
  { id: 'issues', name: 'Issues' },
  { id: 'organizations', name: 'Organizations' },
  { id: 'starred', name: 'Starred Repos' },
];

export const TIME_RANGE_OPTIONS = [
  { id: 'all', name: 'All Time' },
  { id: 'day', name: 'Last 24 Hours' },
  { id: 'week', name: 'Last Week' },
  { id: 'month', name: 'Last Month' },
  { id: 'year', name: 'Last Year' },
];

export const isWithinUnifiedSearchTimeRange = (dateString, timeRange) => {
  if (!dateString || timeRange === 'all') {
    return true;
  }

  const date = new Date(dateString);
  const now = new Date();
  const diffDays = (now - date) / (1000 * 60 * 60 * 24);

  switch (timeRange) {
    case 'day':
      return diffDays <= 1;
    case 'week':
      return diffDays <= 7;
    case 'month':
      return diffDays <= 30;
    case 'year':
      return diffDays <= 365;
    default:
      return true;
  }
};

const limitResults = (results, limit) => results.slice(0, limit);

export const buildUnifiedSearchResults = ({
  repositories = [],
  pullRequests = [],
  issues = [],
  organizations = [],
  starredRepos = [],
  query = '',
  selectedCategory = 'all',
  timeRange = 'all',
}) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const results = [];

  if (selectedCategory === 'all' || selectedCategory === 'repositories') {
    results.push(
      ...limitResults(
        repositories
          .filter(
            (repo) =>
              (repo.name.toLowerCase().includes(normalizedQuery) ||
                repo.description?.toLowerCase().includes(normalizedQuery)) &&
              isWithinUnifiedSearchTimeRange(repo.updated, timeRange)
          )
          .map((repo) => ({
            id: `repo-${repo.name}`,
            title: repo.name,
            description: repo.description || 'No description',
            category: 'Repository',
            icon: 'repo',
            url: repo.url,
            meta: `★ ${repo.stars} • ${repo.language || 'Unknown'}`,
            updated: repo.updated,
          })),
        5
      )
    );
  }

  if (selectedCategory === 'all' || selectedCategory === 'starred') {
    results.push(
      ...limitResults(
        starredRepos
          .filter(
            (repo) =>
              (repo.name.toLowerCase().includes(normalizedQuery) ||
                repo.description?.toLowerCase().includes(normalizedQuery)) &&
              isWithinUnifiedSearchTimeRange(repo.updated, timeRange)
          )
          .map((repo) => ({
            id: `starred-${repo.name}`,
            title: repo.name,
            description: repo.description || 'No description',
            category: 'Starred',
            icon: 'repo',
            url: repo.url,
            meta: `★ ${repo.stars} • ${repo.language || 'Unknown'}`,
            updated: repo.updated,
          })),
        5
      )
    );
  }

  if (selectedCategory === 'all' || selectedCategory === 'pull-requests') {
    results.push(
      ...limitResults(
        pullRequests
          .filter(
            (pullRequest) =>
              (pullRequest.title.toLowerCase().includes(normalizedQuery) ||
                pullRequest.repository.toLowerCase().includes(normalizedQuery) ||
                pullRequest.labels?.toLowerCase().includes(normalizedQuery)) &&
              isWithinUnifiedSearchTimeRange(pullRequest.updated, timeRange)
          )
          .map((pullRequest) => ({
            id: `pr-${pullRequest.repository}-${pullRequest.number}`,
            title: `#${pullRequest.number} ${pullRequest.title}`,
            description: pullRequest.repository,
            category: 'Pull Request',
            icon: 'pr',
            url: pullRequest.url,
            meta: `${pullRequest.stateLabel || pullRequest.state} • Updated ${new Date(
              pullRequest.updated
            ).toLocaleDateString()}`,
            updated: pullRequest.updated,
          })),
        4
      )
    );
  }

  if (selectedCategory === 'all' || selectedCategory === 'issues') {
    results.push(
      ...limitResults(
        issues
          .filter(
            (issue) =>
              (issue.title.toLowerCase().includes(normalizedQuery) ||
                issue.repository.toLowerCase().includes(normalizedQuery) ||
                issue.labels?.toLowerCase().includes(normalizedQuery)) &&
              isWithinUnifiedSearchTimeRange(issue.updated, timeRange)
          )
          .map((issue) => ({
            id: `issue-${issue.repository}-${issue.number}`,
            title: `#${issue.number} ${issue.title}`,
            description: issue.repository,
            category: 'Issue',
            icon: 'issue',
            url: issue.url,
            meta: `${issue.state} • Updated ${new Date(issue.updated).toLocaleDateString()}`,
            updated: issue.updated,
          })),
        4
      )
    );
  }

  if (selectedCategory === 'all' || selectedCategory === 'organizations') {
    results.push(
      ...limitResults(
        organizations
          .filter(
            (organization) =>
              organization.name?.toLowerCase().includes(normalizedQuery) ||
              organization.login?.toLowerCase().includes(normalizedQuery) ||
              organization.description?.toLowerCase().includes(normalizedQuery)
          )
          .map((organization) => ({
            id: `org-${organization.login}`,
            title: organization.name || organization.login,
            description: organization.description || 'No description',
            category: 'Organization',
            icon: 'org',
            url: organization.url,
            meta: `@${organization.login}`,
          })),
        4
      )
    );
  }

  return results.sort((a, b) => {
    const aExact = a.title.toLowerCase() === normalizedQuery;
    const bExact = b.title.toLowerCase() === normalizedQuery;

    if (aExact && !bExact) {
      return -1;
    }

    if (!aExact && bExact) {
      return 1;
    }

    if (a.updated && b.updated) {
      return new Date(b.updated) - new Date(a.updated);
    }

    return a.title.localeCompare(b.title);
  });
};
