const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const getTimeRangeCutoff = (timeRange) => {
  if (timeRange === 'all') {
    return null;
  }

  const days =
    timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : timeRange === '180d' ? 180 : null;

  if (!days) {
    return null;
  }

  return Date.now() - days * DAY_IN_MS;
};

export const itemMatchesRepoScope = (item, repoScope) => {
  if (repoScope === 'all') {
    return true;
  }

  const repositoryValue = item.repository || item.name || '';
  return repositoryValue === repoScope;
};

export const getItemOwner = (item) => {
  const repositoryValue = item.repository || item.name || '';

  if (!repositoryValue.includes('/')) {
    return item.login || '';
  }

  return repositoryValue.split('/')[0];
};

export const itemMatchesOwnerScope = (item, ownerScope) => {
  if (ownerScope === 'all') {
    return true;
  }

  return getItemOwner(item) === ownerScope;
};

export const itemMatchesTimeRange = (item, timeRange) => {
  const cutoff = getTimeRangeCutoff(timeRange);

  if (!cutoff) {
    return true;
  }

  const candidateDate =
    item.updated || item.created || item.created_at || item.closed_at || item.createdDateTime;

  if (!candidateDate) {
    return true;
  }

  return new Date(candidateDate).getTime() >= cutoff;
};

export const applyDashboardScopeFilters = (
  items,
  { repoScope = 'all', ownerScope = 'all', timeRange = 'all' }
) =>
  items.filter(
    (item) =>
      itemMatchesOwnerScope(item, ownerScope) &&
      itemMatchesRepoScope(item, repoScope) &&
      itemMatchesTimeRange(item, timeRange)
  );
