export const normalizeText = (value) => String(value || '').toLowerCase();

export const parseSearchQuery = (query) => {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  const filters = {};
  const freeText = [];

  tokens.forEach((token) => {
    const [rawKey, ...rawValueParts] = token.split(':');
    const value = rawValueParts.join(':');

    if (!value) {
      freeText.push(token);
      return;
    }

    switch (rawKey.toLowerCase()) {
      case 'language':
      case 'state':
      case 'type':
      case 'author':
      case 'repo':
        filters[rawKey.toLowerCase()] = value.toLowerCase();
        break;
      case 'stars':
        filters.stars = value;
        break;
      default:
        freeText.push(token);
        break;
    }
  });

  return {
    filters,
    freeText: freeText.join(' ').toLowerCase(),
  };
};

export const matchesStarsFilter = (item, filterValue) => {
  if (typeof item.stars !== 'number' || !filterValue) {
    return true;
  }

  const match = filterValue.match(/^(>=|<=|>|<|=)?(\d+)$/);

  if (!match) {
    return true;
  }

  const [, operator = '=', numericValue] = match;
  const target = Number(numericValue);

  switch (operator) {
    case '>':
      return item.stars > target;
    case '>=':
      return item.stars >= target;
    case '<':
      return item.stars < target;
    case '<=':
      return item.stars <= target;
    default:
      return item.stars === target;
  }
};

export const matchesCondition = (item, condition) => {
  const currentValue = item[condition.field];

  if (typeof currentValue === 'undefined' || currentValue === null) {
    return false;
  }

  switch (condition.operator) {
    case 'contains':
      return normalizeText(currentValue).includes(normalizeText(condition.value));
    case 'eq':
      return normalizeText(currentValue) === normalizeText(condition.value);
    case 'gt':
      return Number(currentValue) > Number(condition.value);
    case 'lt':
      return Number(currentValue) < Number(condition.value);
    case 'before':
      return new Date(currentValue) < new Date(condition.value);
    case 'after':
      return new Date(currentValue) > new Date(condition.value);
    default:
      return true;
  }
};

export const getRelevanceScore = (item, queryText) => {
  if (!queryText) {
    return 1;
  }

  let score = 0;
  const haystacks = [
    item.title,
    item.description,
    item.repository,
    item.language,
    item.owner,
  ].map(normalizeText);

  haystacks.forEach((value) => {
    if (value === queryText) {
      score += 10;
    } else if (value.startsWith(queryText)) {
      score += 6;
    } else if (value.includes(queryText)) {
      score += 3;
    }
  });

  if (typeof item.stars === 'number') {
    score += Math.min(item.stars / 100, 5);
  }

  return score;
};

export const buildSearchItems = ({
  repositories = [],
  pullRequests = [],
  issues = [],
  organizations = [],
  starredRepos = [],
}) => {
  return [
    ...repositories.map((repo) => ({
      id: `repo-${repo.name}`,
      type: 'repositories',
      title: repo.name,
      description: repo.description || 'No description',
      repository: repo.name,
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      updated: repo.updated,
      url: repo.url,
      private: Boolean(repo.private || repo.isPrivate),
      owner: repo.name.split('/')[0],
    })),
    ...starredRepos.map((repo) => ({
      id: `starred-${repo.name}`,
      type: 'starred',
      title: repo.name,
      description: repo.description || 'No description',
      repository: repo.name,
      language: repo.language,
      stars: repo.stars,
      updated: repo.updated,
      url: repo.url,
      owner: repo.name.split('/')[0],
    })),
    ...pullRequests.map((pr) => ({
      id: `pr-${pr.repository}-${pr.number}`,
      type: 'pull-requests',
      title: `#${pr.number} ${pr.title}`,
      description: pr.labels || 'Pull request',
      repository: pr.repository,
      state: pr.state,
      updated: pr.updated,
      url: pr.url,
      owner: pr.repository?.split('/')[0],
    })),
    ...issues.map((issue) => ({
      id: `issue-${issue.repository}-${issue.number}`,
      type: 'issues',
      title: `#${issue.number} ${issue.title}`,
      description: issue.labels || 'Issue',
      repository: issue.repository,
      state: issue.state,
      updated: issue.updated,
      url: issue.url,
      owner: issue.repository?.split('/')[0],
    })),
    ...organizations.map((organization) => ({
      id: `org-${organization.login}`,
      type: 'organizations',
      title: organization.name || organization.login,
      description: organization.description || 'Organization',
      repository: '',
      updated: '',
      url: organization.url,
      owner: organization.login,
    })),
  ];
};

export const filterSearchItems = (items, { queryParts, filters = [], userLogin }) => {
  const { freeText, filters: queryFilters } = queryParts;

  return items
    .filter((item) => {
      const matchesFreeText =
        !freeText ||
        [item.title, item.description, item.repository, item.language, item.owner]
          .map(normalizeText)
          .some((value) => value.includes(freeText));

      const matchesType =
        !queryFilters.type || normalizeText(item.type) === queryFilters.type;
      const matchesLanguage =
        !queryFilters.language ||
        normalizeText(item.language) === queryFilters.language;
      const matchesState =
        !queryFilters.state || normalizeText(item.state) === queryFilters.state;
      const matchesRepo =
        !queryFilters.repo || normalizeText(item.repository).includes(queryFilters.repo);
      const matchesAuthor =
        !queryFilters.author ||
        normalizeText(item.owner || userLogin).includes(queryFilters.author);

      return (
        matchesFreeText &&
        matchesType &&
        matchesLanguage &&
        matchesState &&
        matchesRepo &&
        matchesAuthor &&
        matchesStarsFilter(item, queryFilters.stars) &&
        filters.every((condition) => matchesCondition(item, condition))
      );
    })
    .map((item) => ({
      ...item,
      relevanceScore: getRelevanceScore(item, freeText),
    }));
};

export const getSearchLanguages = (items) => {
  const uniqueLanguages = new Set(items.map((item) => item.language).filter(Boolean));
  return ['all', ...Array.from(uniqueLanguages).sort((a, b) => a.localeCompare(b))];
};

export const sortSearchItems = (items, sortBy) => {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.updated || 0) - new Date(a.updated || 0);
      case 'oldest':
        return new Date(a.updated || 0) - new Date(b.updated || 0);
      case 'stars':
        return (b.stars || 0) - (a.stars || 0);
      case 'activity':
        return ((b.stars || 0) + (b.forks || 0) * 2) - ((a.stars || 0) + (a.forks || 0) * 2);
      default:
        return b.relevanceScore - a.relevanceScore;
    }
  });
};

export const groupSearchItems = (items, groupBy) => {
  if (groupBy === 'none') {
    return items;
  }

  const grouped = items.reduce((accumulator, item) => {
    const groupKey =
      groupBy === 'repository'
        ? item.repository || 'Other'
        : groupBy === 'language'
          ? item.language || 'Other'
          : item.type;

    accumulator[groupKey] = accumulator[groupKey] || [];
    accumulator[groupKey].push(item);
    return accumulator;
  }, {});

  return Object.entries(grouped).flatMap(([groupName, groupItems]) => [
    {
      id: `group-${groupName}`,
      isGroupHeader: true,
      groupName,
      count: groupItems.length,
    },
    ...groupItems,
  ]);
};
