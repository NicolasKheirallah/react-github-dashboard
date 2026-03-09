import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { openExternalUrl } from '../utils/externalLinks';
import {
  buildUnifiedSearchResults,
  CATEGORY_OPTIONS,
  TIME_RANGE_OPTIONS,
} from '../utils/unifiedSearch';
import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';

const STORAGE_KEY = 'github-recent-searches';

const renderIcon = (iconType) => {
  switch (iconType) {
    case 'repo':
      return (
        <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    case 'pr':
      return (
        <svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
        </svg>
      );
    case 'issue':
      return (
        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className="h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      );
  }
};

const UnifiedSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { recentSearches, saveSearch, clearSearches } = useRecentSearches(STORAGE_KEY);
  const { repositories, pullRequests, issues, organizations, starredRepos } =
    useGithub();
  const dialogRef = useDialogFocusTrap(isOpen, inputRef);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        setIsOpen((currentValue) => !currentValue);
      }

      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    return buildUnifiedSearchResults({
      repositories,
      pullRequests,
      issues,
      organizations,
      starredRepos,
      query: searchQuery,
      selectedCategory,
      timeRange,
    });
  }, [
    issues,
    organizations,
    pullRequests,
    repositories,
    searchQuery,
    selectedCategory,
    starredRepos,
    timeRange,
  ]);

  const handleResultSelect = (result) => {
    openExternalUrl(result.url);
    setIsOpen(false);
    setSearchQuery('');
  };

  const goToSearchPage = () => {
    if (searchQuery.trim()) {
      saveSearch(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }

    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyNavigation = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((currentIndex) =>
        currentIndex < searchResults.length - 1 ? currentIndex + 1 : currentIndex
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((currentIndex) => (currentIndex > 0 ? currentIndex - 1 : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (searchResults[selectedIndex]) {
        handleResultSelect(searchResults[selectedIndex]);
      } else {
        goToSearchPage();
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        aria-label="Open unified search"
        title="Search (Ctrl+/)"
      >
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </button>
    );
  }

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Unified search"
    >
      <button
        type="button"
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75"
        onClick={() => setIsOpen(false)}
        aria-label="Close unified search"
      />

      <div className="fixed inset-0 flex items-start justify-center pt-16 sm:pt-24">
        <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <svg className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 border-none bg-transparent text-base text-gray-900 placeholder-gray-400 focus:ring-0 dark:text-white dark:placeholder-gray-500"
              placeholder="Search repositories, PRs, issues, and orgs..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyNavigation}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded-full p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Clear search query"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedCategory(option.id)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    selectedCategory === option.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {TIME_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTimeRange(option.id)}
                  className={`rounded-md px-3 py-1 text-xs ${
                    timeRange === option.id
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[55vh] overflow-y-auto">
            {!searchQuery && recentSearches.length > 0 && (
              <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Recent Searches
                  </h3>
                  <button
                    type="button"
                    onClick={clearSearches}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                </div>
                <ul>
                  {recentSearches.slice(0, 5).map((searchTerm) => (
                    <li key={searchTerm}>
                      <button
                        type="button"
                        className="flex w-full items-center px-0 py-2 text-left hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => setSearchQuery(searchTerm)}
                      >
                        <svg className="mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                        {searchTerm}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {searchQuery && searchResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No results found for &quot;{searchQuery}&quot;.
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={goToSearchPage}
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Try advanced search
                  </button>
                </div>
              </div>
            ) : searchQuery ? (
              <ul>
                {searchResults.map((result, index) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      className={`flex w-full items-start px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => handleResultSelect(result)}
                    >
                      <div className="mt-1 flex-shrink-0">{renderIcon(result.icon)}</div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.title}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {result.category}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {result.description}
                        </p>
                        {result.meta && (
                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {result.meta}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-center text-sm text-blue-600 hover:bg-gray-100 dark:text-blue-400 dark:hover:bg-gray-700"
                    onClick={goToSearchPage}
                  >
                    View all results for &quot;{searchQuery}&quot;
                  </button>
                </li>
              </ul>
            ) : (
              <div className="px-4 py-4">
                <h3 className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Search Tips
                </h3>
                <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <li>
                    Use <span className="font-medium">language:javascript</span> on the
                    full search page to filter by language.
                  </li>
                  <li>
                    Use <span className="font-medium">state:open</span> to jump to open
                    issues and pull requests.
                  </li>
                  <li>
                    Use <span className="font-medium">Ctrl+/</span> from anywhere in the app
                    to reopen this search.
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="rounded border border-gray-300 px-1.5 py-0.5 dark:border-gray-500">↑</kbd>{' '}
                <kbd className="rounded border border-gray-300 px-1.5 py-0.5 dark:border-gray-500">↓</kbd>{' '}
                navigate
              </span>
              <span>
                <kbd className="rounded border border-gray-300 px-1.5 py-0.5 dark:border-gray-500">Enter</kbd>{' '}
                open
              </span>
            </div>
            <span>
              <kbd className="rounded border border-gray-300 px-1.5 py-0.5 dark:border-gray-500">Esc</kbd>{' '}
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSearch;
