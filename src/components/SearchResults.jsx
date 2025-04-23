import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGithub } from '../context/GithubContext';

const SearchResults = ({ query, filters = [], onItemClick }) => {
  const [rawResults, setRawResults] = useState([]);
  const [resultStats, setResultStats] = useState({});
  const [loading, setLoading] = useState(false);

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [groupBy, setGroupBy] = useState('none');
  const [expandedItems, setExpandedItems] = useState({});

  const {
    repositories,
    pullRequests,
    issues,
    organizations,
    starredRepos,
    userData
  } = useGithub();

  // Available filters
  const categories = [
    { id: 'all', name: 'All Results' },
    { id: 'repositories', name: 'Repositories' },
    { id: 'pull-requests', name: 'Pull Requests' },
    { id: 'issues', name: 'Issues' },
    { id: 'code', name: 'Code' },
    { id: 'organizations', name: 'Organizations' }
  ];
  const sortOptions = [
    { id: 'relevance', name: 'Best Match' },
    { id: 'newest',    name: 'Most Recent' },
    { id: 'oldest',    name: 'Oldest First' },
    { id: 'stars',     name: 'Most Stars' },
    { id: 'activity',  name: 'Most Active' }
  ];
  const groupOptions = [
    { id: 'none',       name: 'No Grouping' },
    { id: 'repository', name: 'By Repository' },
    { id: 'type',       name: 'By Type' },
    { id: 'owner',      name: 'By Owner' },
    { id: 'language',   name: 'By Language' }
  ];

  // toggle expansion of PR/issue details
  const toggleItemExpansion = id => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // generic field-based filter
  const applyFilters = (item, conditions) => {
    if (!conditions?.length) return true;
    return conditions.every(({ field, operator, value }) => {
      const v = item[field];
      if (v == null) return true;
      switch (operator) {
        case 'contains': return String(v).toLowerCase().includes(String(value).toLowerCase());
        case 'eq':       return v === value;
        case 'gt':       return Number(v) > Number(value);
        case 'lt':       return Number(v) < Number(value);
        case 'before':   return new Date(v) < new Date(value);
        case 'after':    return new Date(v) > new Date(value);
        default:         return true;
      }
    });
  };

  // relevance scoring
  const calculateRelevance = (item, q) => {
    if (!q) return 1;
    let score = 0;
    const t = item.title?.toLowerCase() || '';
    if (t.includes(q)) score += 10;
    if (t === q)       score += 5;
    if (t.startsWith(q)) score += 3;
    if (item.description?.toLowerCase().includes(q)) score += 5;
    if (item.language?.toLowerCase().includes(q)) score += 3;
    if (item.stars)    score += Math.min(item.stars / 100, 5);
    if (item.updated) {
      const days = (Date.now() - new Date(item.updated)) / 86400000;
      score += Math.max(0, 3 - days / 30);
    }
    return score;
  };

  // sorting
  const sortResults = (list, option) => {
    return [...list].sort((a, b) => {
      switch (option) {
        case 'relevance': return b.relevanceScore - a.relevanceScore;
        case 'newest':    return new Date(b.updated || 0) - new Date(a.updated || 0);
        case 'oldest':    return new Date(a.updated || 0) - new Date(b.updated || 0);
        case 'stars':     return (b.stars || 0) - (a.stars || 0);
        case 'activity':  return ((b.stars||0)+(b.forks||0)*2) - ((a.stars||0)+(a.forks||0)*2);
        default:          return 0;
      }
    });
  };

  // grouping
  const groupResults = (list, option) => {
    if (option === 'none') return list;
    const groups = {};
    list.forEach(item => {
      const key =
        option === 'repository' ? item.repository :
        option === 'type'       ? item.type :
        option === 'owner'      ? item.owner || userData?.login :
        option === 'language'   ? item.language :
        'Other';
      (groups[key] ||= []).push(item);
    });
    return Object.entries(groups).flatMap(([name, items]) => [
      { id: `group-${name}`, isGroupHeader: true, groupName: name, count: items.length },
      ...items
    ]);
  };

  // icon/render helpers (same as before)
  const renderIcon = type => {/* ... */}
  const renderStateLabel = state => {/* ... */}

  // perform search across all types
  const performSearch = useCallback((searchQuery, filterConditions) => {
    const q = searchQuery.toLowerCase().trim();
    let all = [];
    const stats = { total: 0, repositories: 0, 'pull-requests': 0, issues: 0, code: 0, organizations: 0 };

    // repositories
    if (repositories?.length) {
      const repos = repositories
        .filter(r => (
          (!q || r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
          && applyFilters(r, filterConditions)
        ))
        .map(r => ({
          id: `repo-${r.name}`,
          type: 'repositories',
          title: r.name,
          description: r.description || 'No description',
          url: r.url,
          repository: r.name,
          language: r.language,
          stars: r.stars,
          forks: r.forks,
          updated: r.updated,
          isPrivate: r.isPrivate,
          relevanceScore: calculateRelevance(r, q)
        }));
      all = all.concat(repos);
      stats.repositories = repos.length;
    }

    // [ repeat similar blocks for pullRequests, issues, organizations... ]

    stats.total = all.length;
    return { results: all, stats };
  }, [repositories, pullRequests, issues, organizations, starredRepos]);

  // run search when query/filters change
  useEffect(() => {
    if (!query && filters.length === 0) {
      setRawResults([]);
      setResultStats({});
      return;
    }
    setLoading(true);
    const id = setTimeout(() => {
      const { results, stats } = performSearch(query, filters);
      setRawResults(results);
      setResultStats(stats);
      setLoading(false);
    }, 300);
    return () => clearTimeout(id);
  }, [query, filters, performSearch]);

  // derive unique languages for dropdown
  const languages = useMemo(() => {
    const langs = rawResults.map(i => i.language).filter(Boolean);
    return ['all', ...Array.from(new Set(langs))];
  }, [rawResults]);

  // apply category, language, sort, group
  const displayedResults = useMemo(() => {
    let list = rawResults;
    if (activeCategory !== 'all') {
      list = list.filter(i => i.type === activeCategory);
    }
    if (selectedLanguage !== 'all') {
      list = list.filter(i => i.language === selectedLanguage);
    }
    list = sortResults(list, sortBy);
    list = groupResults(list, groupBy);
    return list;
  }, [rawResults, activeCategory, selectedLanguage, sortBy, groupBy]);

  // render empty state
  if (!query && filters.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Start searching</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {loading ? 'Searching…' : `${resultStats.total || 0} results`}
          {query && !loading && (
            <span className="ml-1 text-gray-600 dark:text-gray-400 text-base">
              for “{query}”
            </span>
          )}
        </h2>
        <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
          {/* Category */}
          <select
            value={activeCategory}
            onChange={e => setActiveCategory(e.target.value)}
            className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{resultStats[c.id] ? ` (${resultStats[c.id]})` : ''}
              </option>
            ))}
          </select>
          {/* Language */}
          <select
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang === 'all' ? 'All Languages' : lang}
              </option>
            ))}
          </select>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3"
          >
            {sortOptions.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          {/* Group */}
          <select
            value={groupBy}
            onChange={e => setGroupBy(e.target.value)}
            className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3"
          >
            {groupOptions.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="py-8 flex justify-center">
            {/* spinner… */}
          </div>
        ) : displayedResults.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No results{query ? ` for “${query}”` : ''}
          </div>
        ) : (
          <ul>
            {displayedResults.map(item =>
              item.isGroupHeader ? (
                <li
                  key={item.id}
                  className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 font-medium text-gray-700 dark:text-gray-300"
                >
                  {item.groupName} ({item.count})
                </li>
              ) : (
                <li key={item.id}>
                  <div
                    className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-start"
                    onClick={() => onItemClick?.(item)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {renderIcon(item.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          onClick={e => e.stopPropagation()}
                        >
                          {item.title}
                        </a>
                        {item.state && renderStateLabel(item.state)}
                        {item.isPrivate && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            Private
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
                        {item.language && (
                          <div className="flex items-center">
                            <span className="h-3 w-3 rounded-full bg-blue-500 mr-1" />
                            <span>{item.language}</span>
                          </div>
                        )}
                        {typeof item.stars === 'number' && (
                          <div className="flex items-center">⭐ {item.stars}</div>
                        )}
                        {typeof item.forks === 'number' && (
                          <div className="flex items-center">🍴 {item.forks}</div>
                        )}
                        {item.updated && (
                          <div>
                            Updated {new Date(item.updated).toLocaleDateString()}
                          </div>
                        )}
                        {item.repository && (
                          <div>
                            in{' '}
                            <a
                              href={`https://github.com/${item.repository}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                              onClick={e => e.stopPropagation()}
                            >
                              {item.repository}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
