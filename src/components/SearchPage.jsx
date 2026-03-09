import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import AdvancedFilterManager from './AdvancedFilterManager';
import { openExternalUrl } from '../utils/externalLinks';

const SEARCH_PRESETS = [
  {
    id: 'needs-review',
    title: 'Needs Review',
    query: 'type:pr state:open',
    filters: [],
    description: 'Open pull requests that likely need review attention.',
  },
  {
    id: 'bug-triage',
    title: 'Bug Triage',
    query: 'type:issue',
    filters: [{ field: 'description', operator: 'contains', value: 'bug' }],
    description: 'Issues tagged or described as bugs.',
  },
  {
    id: 'popular-repos',
    title: 'Popular Repos',
    query: 'stars:>10',
    filters: [{ field: 'stars', operator: 'gt', value: 10 }],
    description: 'Repositories with enough traction to deserve a closer look.',
  },
];

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilterManager, setShowFilterManager] = useState(false);
  const [searchMode, setSearchMode] = useState('structured');

  // Parse query parameters on component mount or URL change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get('q');
    
    if (queryParam) {
      setQuery(queryParam);
    } else {
      setQuery('');
    }
  }, [location]);

  // Handle search submission
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    
    // Update URL with search query
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('q', searchQuery);
    
    // Update browser history without reload
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    
  };

  // Apply filters from the filter manager
  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setShowFilterManager(false);
  };

  // Handle result item click
  const handleResultClick = (item) => {
    if (item.url) {
      openExternalUrl(item.url);
    }
  };

  const applyPreset = (preset) => {
    setQuery(preset.query);
    setActiveFilters(preset.filters);
    setSearchMode('structured');
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('q', preset.query);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
            Search Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            Search GitHub Data
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Start with a preset, refine with structured filters, and jump directly into the
            repository, pull request, issue, or organization behind the signal.
          </p>
        </div>
        
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex-grow">
            <SearchBar
              onSearch={handleSearch}
              value={query}
              onQueryChange={setQuery}
              inputId="search-page-query"
              placeholder="Search with plain text or qualifiers like type:pr state:open"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSearchMode('structured')}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                searchMode === 'structured'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 ring-1 ring-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600'
              }`}
            >
              Structured mode
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('explore')}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                searchMode === 'explore'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 ring-1 ring-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600'
              }`}
            >
              Explore mode
            </button>
            <button
              onClick={() => setShowFilterManager(!showFilterManager)}
              className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium ${
                activeFilters.length > 0
                  ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
                  : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              {activeFilters.length > 0 ? `Filters (${activeFilters.length})` : 'Filters'}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                Active search
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                {query ? query : 'Start with a preset or type a qualifier-driven query'}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {searchMode === 'structured'
                  ? 'Best for known workflows like review queue, bug triage, and backlog cleanup.'
                  : 'Best for exploring repos, languages, and broad activity patterns before narrowing down.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveFilters([]);
                navigate(location.pathname, { replace: true });
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Reset search
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
            Search rhythm
          </p>
          <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li>1. Start broad with a preset or `type:` qualifier.</li>
            <li>2. Narrow by filters when you know the slice you need.</li>
            <li>3. Open the exact repo, PR, issue, or org from the results list.</li>
          </ul>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {SEARCH_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset)}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md dark:bg-slate-800 dark:hover:border-blue-500 ${
              query === preset.query
                ? 'border-blue-500 ring-2 ring-blue-200 dark:border-blue-400 dark:ring-blue-900/40'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{preset.title}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {preset.description}
            </p>
            <code className="mt-3 inline-block rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {preset.query}
            </code>
          </button>
        ))}
      </div>
      
      {/* Filter manager section */}
      {showFilterManager && (
        <div className="mb-6">
          <AdvancedFilterManager 
            onApplyFilter={handleApplyFilters}
            initialFilters={[
              {
                id: 'filter-recent',
                name: 'Recent Items',
                description: 'Items updated in the last 30 days',
                conditions: [
                  { field: 'updated', operator: 'after', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'filter-starred',
                name: 'Popular Repositories',
                description: 'Repositories with more than 10 stars',
                conditions: [
                  { field: 'stars', operator: 'gt', value: 10 }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ]}
          />
        </div>
      )}
      
      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <div
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
            >
              <span>
                {filter.field} {filter.operator} {filter.value?.toString()}
              </span>
              <button
                onClick={() => setActiveFilters(activeFilters.filter((_, i) => i !== index))}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
          
          <button
            onClick={() => setActiveFilters([])}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Clear all filters
          </button>
        </div>
      )}
      
      {/* Search results */}
      <SearchResults 
        query={query} 
        filters={activeFilters}
        onItemClick={handleResultClick}
      />

      {/* Search tips */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Search tips</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <svg className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Use <strong>language:javascript</strong> to filter by programming language</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Use <strong>state:open</strong> to find open issues and PRs</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Use <strong>author:username</strong> to filter by author</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Use <strong>stars:{'>'}10</strong> to find repositories with more than 10 stars</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>
              Use <strong>&quot;exact match&quot;</strong> for phrases (with quotes)
            </span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Use <strong>Ctrl+/</strong> to open unified search from anywhere</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SearchPage;
