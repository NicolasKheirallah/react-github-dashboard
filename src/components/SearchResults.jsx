import React, { useState, useEffect } from 'react';
import { useGithub } from '../context/GithubContext';

const SearchResults = ({ query, filters = [], onItemClick }) => {
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);
const [activeCategory, setActiveCategory] = useState('all');
const [sortBy, setSortBy] = useState('relevance');
const [groupBy, setGroupBy] = useState('none');
const [resultStats, setResultStats] = useState({});
const [expandedItems, setExpandedItems] = useState({});

const { 
repositories, 
pullRequests, 
issues,
organizations,
starredRepos,
userData
} = useGithub();

// Categories for filtering
const categories = [
{ id: 'all', name: 'All Results' },
{ id: 'repositories', name: 'Repositories' },
{ id: 'pull-requests', name: 'Pull Requests' },
{ id: 'issues', name: 'Issues' },
{ id: 'code', name: 'Code' },
{ id: 'organizations', name: 'Organizations' }
];

// Sort options
const sortOptions = [
{ id: 'relevance', name: 'Best Match' },
{ id: 'newest', name: 'Most Recent' },
{ id: 'oldest', name: 'Oldest First' },
{ id: 'stars', name: 'Most Stars' },
{ id: 'activity', name: 'Most Active' }
];

// Group options
const groupOptions = [
{ id: 'none', name: 'No Grouping' },
{ id: 'repository', name: 'By Repository' },
{ id: 'type', name: 'By Type' },
{ id: 'owner', name: 'By Owner' },
{ id: 'language', name: 'By Language' }
];

// Toggle item expansion
const toggleItemExpansion = (itemId) => {
setExpandedItems(prev => ({
  ...prev,
  [itemId]: !prev[itemId]
}));
};

// Effect to perform search when query or filters change
useEffect(() => {
if (!query && filters.length === 0) {
  setResults([]);
  setResultStats({});
  return;
}

setLoading(true);

// Perform search with a slight delay to feel more realistic
const timer = setTimeout(() => {
  const searchResults = performSearch(query, filters);
  setResults(searchResults.results);
  setResultStats(searchResults.stats);
  setLoading(false);
}, 300);

return () => clearTimeout(timer);
}, [query, filters, repositories, pullRequests, issues, organizations, starredRepos]);

// Effect to apply sorting and filtering after results are available
useEffect(() => {
if (results.length === 0) return;

let filteredResults = [...results];

// Apply category filter
if (activeCategory !== 'all') {
  filteredResults = filteredResults.filter(item => item.type === activeCategory);
}

// Apply sorting
filteredResults = sortResults(filteredResults, sortBy);
    
// Apply grouping
filteredResults = groupResults(filteredResults, groupBy);

setResults(filteredResults);
}, [activeCategory, sortBy, groupBy]);

// Perform search across all data types
const performSearch = (searchQuery, filterConditions) => {
const query = searchQuery.toLowerCase().trim();
let allResults = [];
const stats = {
  total: 0,
  repositories: 0,
  'pull-requests': 0,
  issues: 0,
  code: 0,
  organizations: 0
};

// Search repositories
if (repositories && repositories.length > 0) {
  const repoResults = repositories
    .filter(repo => {
      // Match by query
      const matchesQuery = !query || 
        repo.name.toLowerCase().includes(query) || 
        (repo.description && repo.description.toLowerCase().includes(query)) || 
        (repo.language && repo.language.toLowerCase().includes(query));
      
      // Apply additional filters
      return matchesQuery && applyFilters(repo, filterConditions);
    })
    .map(repo => ({
      id: `repo-${repo.name}`,
      type: 'repositories',
      title: repo.name,
      description: repo.description || 'No description',
      url: repo.url,
      created: repo.created,
      updated: repo.updated,
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      isPrivate: repo.isPrivate,
      relevanceScore: calculateRelevance(repo, query)
    }));
  
  allResults = [...allResults, ...repoResults];
  stats.repositories = repoResults.length;
}

// Search pull requests
if (pullRequests && pullRequests.length > 0) {
  const prResults = pullRequests
    .filter(pr => {
      const matchesQuery = !query || 
        pr.title.toLowerCase().includes(query) || 
        pr.repository.toLowerCase().includes(query) || 
        (pr.labels && pr.labels.toLowerCase().includes(query));
      
      return matchesQuery && applyFilters(pr, filterConditions);
    })
    .map(pr => ({
      id: `pr-${pr.repository}-${pr.number}`,
      type: 'pull-requests',
      title: `#${pr.number}: ${pr.title}`,
      description: `Repository: ${pr.repository}`,
      url: pr.url,
      repository: pr.repository,
      state: pr.state,
      created: pr.created,
      updated: pr.updated,
      author: pr.author,
      relevanceScore: calculateRelevance(pr, query)
    }));
  
  allResults = [...allResults, ...prResults];
  stats['pull-requests'] = prResults.length;
}

// Search issues
if (issues && issues.length > 0) {
  const issueResults = issues
    .filter(issue => {
      const matchesQuery = !query || 
        issue.title.toLowerCase().includes(query) || 
        issue.repository.toLowerCase().includes(query) || 
        (issue.labels && issue.labels.toLowerCase().includes(query));
      
      return matchesQuery && applyFilters(issue, filterConditions);
    })
    .map(issue => ({
      id: `issue-${issue.repository}-${issue.number}`,
      type: 'issues',
      title: `#${issue.number}: ${issue.title}`,
      description: `Repository: ${issue.repository}`,
      url: issue.url,
      repository: issue.repository,
      state: issue.state,
      created: issue.created,
      updated: issue.updated,
      author: issue.author,
      relevanceScore: calculateRelevance(issue, query)
    }));
  
  allResults = [...allResults, ...issueResults];
  stats.issues = issueResults.length;
}

// Search organizations
if (organizations && organizations.length > 0) {
  const orgResults = organizations
    .filter(org => {
      const matchesQuery = !query || 
        org.name.toLowerCase().includes(query) || 
        org.login.toLowerCase().includes(query) || 
        (org.description && org.description.toLowerCase().includes(query));
      
      return matchesQuery && applyFilters(org, filterConditions);
    })
    .map(org => ({
      id: `org-${org.login}`,
      type: 'organizations',
      title: org.name,
      description: org.description || 'No description',
      url: org.url,
      avatar: org.avatarUrl,
      relevanceScore: calculateRelevance(org, query)
    }));
  
  allResults = [...allResults, ...orgResults];
  stats.organizations = orgResults.length;
}

// Update total count
stats.total = allResults.length;

return {
  results: allResults,
  stats
};
};

// Apply filters to an item
const applyFilters = (item, filterConditions) => {
if (!filterConditions || filterConditions.length === 0) {
  return true;
}

// Each condition must pass (AND logic)
return filterConditions.every(condition => {
  const { field, operator, value } = condition;
  
  // Skip if the field doesn't exist on the item
  if (!(field in item)) {
    return true;
  }
  
  const itemValue = item[field];
  
  switch (operator) {
    case 'contains':
      return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
    case 'eq':
      return itemValue == value; // Using == to handle number/string type differences
    case 'not':
      return !String(itemValue).toLowerCase().includes(String(value).toLowerCase());
    case 'gt':
      return Number(itemValue) > Number(value);
    case 'lt':
      return Number(itemValue) < Number(value);
    case 'gte':
      return Number(itemValue) >= Number(value);
    case 'lte':
      return Number(itemValue) <= Number(value);
    case 'starts':
      return String(itemValue).toLowerCase().startsWith(String(value).toLowerCase());
    case 'ends':
      return String(itemValue).toLowerCase().endsWith(String(value).toLowerCase());
    case 'before':
      return new Date(itemValue) < new Date(value);
    case 'after':
      return new Date(itemValue) > new Date(value);
    case 'between':
      return new Date(itemValue) >= new Date(value.start) && new Date(itemValue) <= new Date(value.end);
    case 'is':
      return String(itemValue).toLowerCase() === String(value).toLowerCase();
    default:
      return true;
  }
});
};

// Calculate relevance score for sorting
const calculateRelevance = (item, query) => {
if (!query) return 1; // All items equally relevant if no query

let score = 0;

// Title match is most important
if (item.title?.toLowerCase().includes(query) || item.name?.toLowerCase().includes(query)) {
  score += 10;
  // Exact match is even better
  if (item.title?.toLowerCase() === query || item.name?.toLowerCase() === query) {
    score += 5;
  }
  // Title starts with query is also good
  if (item.title?.toLowerCase().startsWith(query) || item.name?.toLowerCase().startsWith(query)) {
    score += 3;
  }
}

// Description match
if (item.description?.toLowerCase().includes(query)) {
  score += 5;
}

// Other fields match
if (item.language?.toLowerCase().includes(query)) {
  score += 3;
}

if (item.repository?.toLowerCase().includes(query)) {
  score += 2;
}

// Boost for popular repositories
if (item.stars) {
  score += Math.min(item.stars / 100, 5);
}

// Boost for recency
if (item.updated) {
  const updatedDate = new Date(item.updated);
  const now = new Date();
  const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
  score += Math.max(0, 3 - (daysSinceUpdate / 30)); // Boost for items updated in the last 3 months
}

return score;
};

// Sort results based on the selected sort option
const sortResults = (results, sortOption) => {
switch (sortOption) {
  case 'relevance':
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  case 'newest':
    return results.sort((a, b) => {
      if (!a.updated) return 1;
      if (!b.updated) return -1;
      return new Date(b.updated) - new Date(a.updated);
    });
  case 'oldest':
    return results.sort((a, b) => {
      if (!a.updated) return 1;
      if (!b.updated) return -1;
      return new Date(a.updated) - new Date(b.updated);
    });
  case 'stars':
    return results.sort((a, b) => (b.stars || 0) - (a.stars || 0));
  case 'activity':
    // Sort by a combination of recent updates and interactions (simplistic)
    return results.sort((a, b) => {
      const aActivity = (a.stars || 0) + (a.forks || 0) * 2;
      const bActivity = (b.stars || 0) + (b.forks || 0) * 2;
      return bActivity - aActivity;
    });
  default:
    return results;
}
};

// Group results based on the selected group option
const groupResults = (results, groupOption) => {
if (groupOption === 'none') {
  return results;
}

// Create a map of groups
const groups = {};

results.forEach(item => {
  let groupKey;
  
  switch (groupOption) {
    case 'repository':
      groupKey = item.repository || 'Unknown Repository';
      break;
    case 'type':
      groupKey = item.type || 'Unknown Type';
      break;
    case 'owner':
      groupKey = item.owner || userData?.login || 'Unknown Owner';
      break;
    case 'language':
      groupKey = item.language || 'Unknown Language';
      break;
    default:
      groupKey = 'Other';
  }
  
  if (!groups[groupKey]) {
    groups[groupKey] = [];
  }
  
  groups[groupKey].push(item);
});

// Flatten groups into an array with group headers
const flattenedResults = [];

Object.entries(groups).forEach(([groupName, groupItems]) => {
  // Add a group header item
  flattenedResults.push({
    id: `group-${groupName}`,
    isGroupHeader: true,
    groupName,
    count: groupItems.length
  });
  
  // Add the group items
  flattenedResults.push(...groupItems);
});

return flattenedResults;
};

// Render an icon based on result type
const renderIcon = (type) => {
switch (type) {
  case 'repositories':
    return (
      <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  case 'pull-requests':
    return (
      <svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
      </svg>
    );
  case 'issues':
    return (
      <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    );
  case 'code':
    return (
      <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  case 'organizations':
    return (
      <svg className="h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    );
  default:
    return (
      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
}
};

// Render state label
const renderStateLabel = (state) => {
if (!state) return null;

let bgColor, textColor;

switch (state.toLowerCase()) {
  case 'open':
    bgColor = 'bg-green-100 dark:bg-green-900/20';
    textColor = 'text-green-800 dark:text-green-400';
    break;
  case 'closed':
    bgColor = 'bg-red-100 dark:bg-red-900/20';
    textColor = 'text-red-800 dark:text-red-400';
    break;
  case 'merged':
    bgColor = 'bg-purple-100 dark:bg-purple-900/20';
    textColor = 'text-purple-800 dark:text-purple-400';
    break;
  default:
    bgColor = 'bg-gray-100 dark:bg-gray-700';
    textColor = 'text-gray-800 dark:text-gray-300';
}

return (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
    {state}
  </span>
);
};

// No query and no filters
if (!query && filters.length === 0) {
return (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Start searching</h3>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Use the search bar above to find repositories, pull requests, issues, and more.
    </p>
  </div>
);
}

return (
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
  {/* Header with search stats and filters */}
  <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        {loading ? (
          'Searching...'
        ) : (
          <>
            <span>{resultStats.total || 0} results</span>
            {query && <span className="ml-1 text-gray-600 dark:text-gray-400 text-base">for "{query}"</span>}
          </>
        )}
      </h2>
      
      <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
        {/* Category filter */}
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} {resultStats[category.id] ? `(${resultStats[category.id]})` : ''}
            </option>
          ))}
        </select>
        
        {/* Sort options */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {sortOptions.map(option => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
        
        {/* Grouping options */}
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {groupOptions.map(option => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
  
  {/* Results list */}
  <div className="divide-y divide-gray-200 dark:divide-gray-700">
    {loading ? (
      <div className="py-8 flex justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    ) : results.length === 0 ? (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No results found for your search.</p>
      </div>
    ) : (
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {results.map((result, index) => (
          <li key={result.id} className={result.isGroupHeader ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
            {result.isGroupHeader ? (
              // Group header
              <div className="px-4 py-3 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {result.groupName} <span className="text-gray-500 dark:text-gray-400">({result.count})</span>
                </h3>
              </div>
            ) : (
              // Regular result item
              <div 
                className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => result.url && onItemClick && onItemClick(result)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {renderIcon(result.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <a 
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {result.title}
                      </a>
                      {result.state && renderStateLabel(result.state)}
                      {result.isPrivate && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          Private
                        </span>
                      )}
                    </div>
                    
                    {result.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                    
                    <div className="mt-2 flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
                      {result.language && (
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded-full bg-blue-500 mr-1"></span>
                          <span>{result.language}</span>
                        </div>
                      )}
                      
                      {result.stars !== undefined && (
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{result.stars}</span>
                        </div>
                      )}
                      
                      {result.forks !== undefined && (
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{result.forks} forks</span>
                        </div>
                      )}
                      
                      {result.updated && (
                        <div>
                          Updated {new Date(result.updated).toLocaleDateString()}
                        </div>
                      )}
                      
                      {result.repository && !result.isGroupHeader && (
                        <div>
                          <span className="text-gray-400 dark:text-gray-500">in </span>
                          <a 
                            href={`https://github.com/${result.repository}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {result.repository}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {/* Toggle expanded content */}
                    {(result.type === 'pull-requests' || result.type === 'issues') && (
                      <div className="mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItemExpansion(result.id);
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                        >
                          {expandedItems[result.id] ? (
                            <>
                              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              Show less
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              Show more
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {/* Expanded content */}
                    {expandedItems[result.id] && (
                      <div className="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-xs">
                        <div className="flex flex-col space-y-2">
                          {result.type === 'pull-requests' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{result.state}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{new Date(result.created).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{new Date(result.updated).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Author:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{result.author || 'Unknown'}</span>
                              </div>
                            </>
                          )}
                          
                          {result.type === 'issues' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{result.state}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{new Date(result.created).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{new Date(result.updated).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Author:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{result.author || 'Unknown'}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
);
};

export default SearchResults;