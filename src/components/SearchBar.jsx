import React, { useState, useEffect } from 'react';
import UnifiedSearch from './UnifiedSearch';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('github-recent-searches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Update localStorage when recent searches change
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('github-recent-searches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  // Generate search suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // Filter recent searches that match the query
    const matchingSearches = recentSearches
      .filter(search => search.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3);
    
    // Common GitHub search suggestions
    const commonSuggestions = [
      { type: 'language', value: 'language:javascript' },
      { type: 'language', value: 'language:python' },
      { type: 'language', value: 'language:typescript' },
      { type: 'state', value: 'state:open' },
      { type: 'state', value: 'state:closed' },
      { type: 'state', value: 'state:merged' },
      { type: 'label', value: 'label:bug' },
      { type: 'label', value: 'label:feature' },
      { type: 'author', value: 'author:me' },
      { type: 'type', value: 'type:pr' },
      { type: 'type', value: 'type:issue' },
      { type: 'stars', value: 'stars:>10' },
    ];
    
    // Filter common suggestions that match the query
    const matchingSuggestions = commonSuggestions
      .filter(suggestion => suggestion.value.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
      
    // Combine recent searches and common suggestions
    const allSuggestions = [
      ...matchingSearches.map(search => ({ type: 'recent', value: search })),
      ...matchingSuggestions
    ];
    
    setSuggestions(allSuggestions);
  }, [query, recentSearches]);

  // Handle search submission
  const handleSearch = (e) => {
    e && e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add to recent searches if not already present
    if (!recentSearches.includes(query)) {
      const updatedSearches = [query, ...recentSearches].slice(0, 10);
      setRecentSearches(updatedSearches);
    }
    
    // Add to search history for the current session
    setSearchHistory([query, ...searchHistory].slice(0, 20));
    
    // Call the parent's search handler
    if (onSearch) {
      onSearch(query);
    }
    
    // Hide suggestions
    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.value);
    
    // If it's a filter suggestion, apply it directly
    if (suggestion.type !== 'recent') {
      // Small delay to update the input field before submitting
      setTimeout(() => {
        handleSearch();
      }, 10);
    }
    
    setShowSuggestions(false);
  };

  // Clear search history
  const clearSearchHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('github-recent-searches');
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <form onSubmit={handleSearch} className="w-full relative">
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Search repositories, PRs, issues..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // Delay hiding the suggestions to allow for clicks
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            {query && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setQuery('')}
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="hidden"
          >
            Search
          </button>
        </form>
        
        <div className="ml-2">
          <UnifiedSearch />
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div className="py-1">
              <div className="px-4 py-2 flex justify-between items-center">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400">Recent Searches</h3>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear All
                </button>
              </div>
              <ul>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <li key={index}>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setQuery(search);
                        handleSearch();
                      }}
                    >
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                        {search}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions based on query */}
          {suggestions.length > 0 && (
            <div className="py-1">
              {query && (
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400">Suggestions</h3>
                </div>
              )}
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center">
                        {suggestion.type === 'recent' ? (
                          <svg className="h-4 w-4 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                          </svg>
                        ) : suggestion.type === 'language' ? (
                          <svg className="h-4 w-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        ) : suggestion.type === 'state' ? (
                          <svg className="h-4 w-4 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : suggestion.type === 'type' ? (
                          <svg className="h-4 w-4 mr-2 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                          </svg>
                        )}
                        {suggestion.value}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;