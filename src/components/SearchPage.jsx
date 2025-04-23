import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import AdvancedFilterManager from './AdvancedFilterManager';

const SearchPage = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilterManager, setShowFilterManager] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // Parse query parameters on component mount or URL change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get('q');
    
    if (queryParam) {
      setQuery(queryParam);
    }
  }, [location]);

  // Handle search submission
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    
    // Update URL with search query
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('q', searchQuery);
    
    // Update browser history without reload
    window.history.pushState(
      {},
      '',
      `${location.pathname}?${searchParams.toString()}`
    );
    
    // Add to search history
    if (searchQuery.trim() && !searchHistory.includes(searchQuery)) {
      setSearchHistory([searchQuery, ...searchHistory].slice(0, 10));
    }
  };

  // Apply filters from the filter manager
  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setShowFilterManager(false);
  };

  // Handle result item click
  const handleResultClick = (item) => {
    if (item.url) {
      window.open(item.url, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Search GitHub Data</h1>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-grow">
            <SearchBar onSearch={handleSearch} />
          </div>
          
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
            <span>Use <strong>"exact match"</strong> for phrases (with quotes)</span>
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