import React, { useMemo, useState } from 'react';
import { useGithub } from '../context/GithubContext';
import { openExternalUrl } from '../utils/externalLinks';
import {
  buildSearchItems,
  filterSearchItems,
  getSearchLanguages,
  groupSearchItems,
  parseSearchQuery,
  sortSearchItems,
} from '../utils/search';

const CATEGORY_OPTIONS = [
  { id: 'all', name: 'All Results' },
  { id: 'repositories', name: 'Repositories' },
  { id: 'pull-requests', name: 'Pull Requests' },
  { id: 'issues', name: 'Issues' },
  { id: 'organizations', name: 'Organizations' },
  { id: 'starred', name: 'Starred Repos' },
];

const SORT_OPTIONS = [
  { id: 'relevance', name: 'Best Match' },
  { id: 'newest', name: 'Most Recent' },
  { id: 'oldest', name: 'Oldest First' },
  { id: 'stars', name: 'Most Stars' },
  { id: 'activity', name: 'Most Active' },
];

const GROUP_OPTIONS = [
  { id: 'none', name: 'No Grouping' },
  { id: 'repository', name: 'By Repository' },
  { id: 'type', name: 'By Type' },
  { id: 'language', name: 'By Language' },
];

const getStateBadgeClasses = (state) => {
  switch (state) {
    case 'open':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'merged':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    default:
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }
};

const renderIcon = (type) => {
  const commonProps = {
    className: 'h-5 w-5',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 20 20',
    fill: 'currentColor',
  };

  switch (type) {
    case 'repositories':
    case 'starred':
      return (
        <svg {...commonProps} className="h-5 w-5 text-blue-500">
          <path
            fillRule="evenodd"
            d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'pull-requests':
      return (
        <svg {...commonProps} className="h-5 w-5 text-purple-500">
          <path
            fillRule="evenodd"
            d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'issues':
      return (
        <svg {...commonProps} className="h-5 w-5 text-green-500">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg {...commonProps} className="h-5 w-5 text-orange-500">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      );
  }
};

const SearchResults = ({ query, filters = [], onItemClick }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [groupBy, setGroupBy] = useState('none');
  const {
    repositories,
    pullRequests,
    issues,
    organizations,
    starredRepos,
    userData,
  } = useGithub();

  const queryParts = useMemo(() => parseSearchQuery(query), [query]);

  const rawResults = useMemo(() => {
    return filterSearchItems(
      buildSearchItems({
        repositories,
        pullRequests,
        issues,
        organizations,
        starredRepos,
      }),
      {
        queryParts,
        filters,
        userLogin: userData?.login,
      }
    );
  }, [
    filters,
    issues,
    organizations,
    pullRequests,
    queryParts,
    repositories,
    starredRepos,
    userData?.login,
  ]);

  const resultStats = useMemo(() => {
    return rawResults.reduce(
      (stats, item) => {
        stats.total += 1;
        stats[item.type] = (stats[item.type] || 0) + 1;
        return stats;
      },
      {
        total: 0,
        repositories: 0,
        'pull-requests': 0,
        issues: 0,
        organizations: 0,
        starred: 0,
      }
    );
  }, [rawResults]);

  const languages = useMemo(() => {
    return getSearchLanguages(rawResults);
  }, [rawResults]);

  const displayedResults = useMemo(() => {
    let results = [...rawResults];

    if (activeCategory !== 'all') {
      results = results.filter((item) => item.type === activeCategory);
    }

    if (selectedLanguage !== 'all') {
      results = results.filter((item) => item.language === selectedLanguage);
    }

    results = sortSearchItems(results, sortBy);

    if (groupBy === 'none') {
      return results;
    }

    return groupSearchItems(results, groupBy);
  }, [activeCategory, groupBy, rawResults, selectedLanguage, sortBy]);

  const openResult = (item) => {
    if (onItemClick) {
      onItemClick(item);
      return;
    }

    if (item.url) {
      openExternalUrl(item.url);
    }
  };

  if (!query && filters.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Start searching your GitHub data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-4 py-4 dark:border-gray-700 sm:flex-row sm:items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {resultStats.total} results
          {query && (
            <span className="ml-1 text-base text-gray-600 dark:text-gray-400">
              for &ldquo;{query}&rdquo;
            </span>
          )}
        </h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={activeCategory}
            onChange={(event) => setActiveCategory(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
            aria-label="Filter results by category"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
                {option.id !== 'all' ? ` (${resultStats[option.id] || 0})` : ''}
              </option>
            ))}
          </select>
          <select
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
            aria-label="Filter results by language"
          >
            {languages.map((language) => (
              <option key={language} value={language}>
                {language === 'all' ? 'All Languages' : language}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
            aria-label="Sort results"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <select
            value={groupBy}
            onChange={(event) => setGroupBy(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-700"
            aria-label="Group results"
          >
            {GROUP_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
        {displayedResults.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No results found{query ? ` for “${query}”` : ''}.
          </div>
        ) : (
          <ul>
            {displayedResults.map((item) =>
              item.isGroupHeader ? (
                <li
                  key={item.id}
                  className="bg-gray-50 px-4 py-3 font-medium text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
                >
                  {item.groupName} ({item.count})
                </li>
              ) : (
                <li key={item.id}>
                  <button
                    type="button"
                    className="flex w-full items-start px-4 py-4 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => openResult(item)}
                  >
                    <div className="mt-1 flex-shrink-0">{renderIcon(item.type)}</div>
                    <div className="ml-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {item.title}
                        </span>
                        {item.state && (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStateBadgeClasses(
                              item.state
                            )}`}
                          >
                            {item.state.charAt(0).toUpperCase() + item.state.slice(1)}
                          </span>
                        )}
                        {item.private && (
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Private
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {item.language && (
                          <span className="flex items-center gap-1">
                            <span className="h-3 w-3 rounded-full bg-blue-500" />
                            {item.language}
                          </span>
                        )}
                        {typeof item.stars === 'number' && <span>Stars: {item.stars}</span>}
                        {typeof item.forks === 'number' && <span>Forks: {item.forks}</span>}
                        {item.updated && (
                          <span>Updated {new Date(item.updated).toLocaleDateString()}</span>
                        )}
                        {item.repository && <span>in {item.repository}</span>}
                      </div>
                    </div>
                  </button>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
