import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';

const UnifiedSearch = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [timeRange, setTimeRange] = useState('all');

    const inputRef = useRef(null);
    const navigate = useNavigate();

    const {
        repositories,
        pullRequests,
        issues,
        organizations,
        starredRepos,
        userData
    } = useGithub();

    // Available search categories
    const categories = [
        { id: 'all', name: 'All' },
        { id: 'repositories', name: 'Repositories' },
        { id: 'pull-requests', name: 'Pull Requests' },
        { id: 'issues', name: 'Issues' },
        { id: 'organizations', name: 'Organizations' },
        { id: 'starred', name: 'Starred Repos' },
    ];

    // Time range options
    const timeRanges = [
        { id: 'all', name: 'All Time' },
        { id: 'day', name: 'Last 24 Hours' },
        { id: 'week', name: 'Last Week' },
        { id: 'month', name: 'Last Month' },
        { id: 'year', name: 'Last Year' }
    ];

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

    // Focus on input when search opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 50);
        }
    }, [isOpen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+/ to open search
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }

            // Escape to close
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Perform search when query changes
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);

        // Debounce search to avoid excessive processing
        const timer = setTimeout(() => {
            const query = searchQuery.toLowerCase();
            let results = [];

            // Function to check if date is within selected time range
            const isWithinTimeRange = (dateString) => {
                if (timeRange === 'all') return true;

                const date = new Date(dateString);
                const now = new Date();
                const diffMs = now - date;
                const diffDays = diffMs / (1000 * 60 * 60 * 24);

                switch (timeRange) {
                    case 'day': return diffDays <= 1;
                    case 'week': return diffDays <= 7;
                    case 'month': return diffDays <= 30;
                    case 'year': return diffDays <= 365;
                    default: return true;
                }
            };

            // Search in repositories
            if (selectedCategory === 'all' || selectedCategory === 'starred') {
                const starredResults = starredRepos
                    .filter(repo =>
                        repo.name.toLowerCase().includes(query) ||
                        (repo.description && repo.description.toLowerCase().includes(query))
                    )
                    .slice(0, 5)
                    .map(repo => ({
                        id: `starred-${repo.name}`,
                        title: repo.name,
                        description: repo.description || 'No description',
                        category: 'Starred',
                        icon: 'repo',
                        url: repo.url,
                        meta: `★ ${repo.stars} • ${repo.language || 'Unknown'}`,
                        updated: repo.updated
                    }));
                results = [...results, ...starredResults];
            }

            // Search in pull requests
            if (selectedCategory === 'all' || selectedCategory === 'pull-requests') {
                const prResults = pullRequests
                    .filter(pr =>
                        (pr.title.toLowerCase().includes(query) ||
                            pr.repository.toLowerCase().includes(query) ||
                            (pr.labels && pr.labels.toLowerCase().includes(query))) &&
                        (timeRange === 'all' || isWithinTimeRange(pr.updated))
                    )
                    .slice(0, 3) // Limit results
                    .map(pr => ({
                        id: `pr-${pr.repository}-${pr.number}`,
                        title: `#${pr.number} ${pr.title}`,
                        description: `${pr.repository}`,
                        category: 'Pull Request',
                        icon: 'pr',
                        url: pr.url,
                        meta: `${pr.state} • Updated ${new Date(pr.updated).toLocaleDateString()}`,
                        updated: pr.updated
                    }));

                results = [...results, ...prResults];
            }

            // Search in issues
            if (selectedCategory === 'all' || selectedCategory === 'issues') {
                const issueResults = issues
                    .filter(issue =>
                        (issue.title.toLowerCase().includes(query) ||
                            issue.repository.toLowerCase().includes(query) ||
                            (issue.labels && issue.labels.toLowerCase().includes(query))) &&
                        (timeRange === 'all' || isWithinTimeRange(issue.updated))
                    )
                    .slice(0, 3) // Limit results
                    .map(issue => ({
                        id: `issue-${issue.repository}-${issue.number}`,
                        title: `#${issue.number} ${issue.title}`,
                        description: `${issue.repository}`,
                        category: 'Issue',
                        icon: 'issue',
                        url: issue.url,
                        meta: `${issue.state} • Updated ${new Date(issue.updated).toLocaleDateString()}`,
                        updated: issue.updated
                    }));

                results = [...results, ...issueResults];
            }

            // Search in organizations
            if (selectedCategory === 'all' || selectedCategory === 'organizations') {
                const orgResults = organizations
                    .filter(org =>
                        org.name.toLowerCase().includes(query) ||
                        (org.description && org.description.toLowerCase().includes(query))
                    )
                    .slice(0, 3) // Limit results
                    .map(org => ({
                        id: `org-${org.login}`,
                        title: org.name,
                        description: org.description || 'No description',
                        category: 'Organization',
                        icon: 'org',
                        url: org.url,
                        meta: `@${org.login}`
                    }));

                results = [...results, ...orgResults];
            }

            // Sort results by relevance and recency
            results.sort((a, b) => {
                // First by exact match
                const aExact = a.title.toLowerCase() === query;
                const bExact = b.title.toLowerCase() === query;
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;

                // Then by title starts with query
                const aStartsWith = a.title.toLowerCase().startsWith(query);
                const bStartsWith = b.title.toLowerCase().startsWith(query);
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;

                // Then by update date if available
                if (a.updated && b.updated) {
                    return new Date(b.updated) - new Date(a.updated);
                }

                return 0;
            });

            setSearchResults(results);
            setLoading(false);
            setSelectedIndex(0); // Reset selection on new results
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory, timeRange, repositories, pullRequests, issues, organizations]);

    // Save search to recent searches
    const saveSearch = (query) => {
        if (!query.trim()) return;

        const updatedSearches = [
            query,
            ...recentSearches.filter(s => s !== query)
        ].slice(0, 10);

        setRecentSearches(updatedSearches);
        localStorage.setItem('github-recent-searches', JSON.stringify(updatedSearches));
    };

    // Handle navigation on result selection
    const handleResultSelect = (result) => {
        if (result.url) {
            window.open(result.url, '_blank');
        }
        setIsOpen(false);
        setSearchQuery('');
    };

    // Navigate to full search page
    const goToSearchPage = () => {
        if (searchQuery.trim()) {
            saveSearch(searchQuery);
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsOpen(false);
            setSearchQuery('');
        } else {
            navigate('/search');
            setIsOpen(false);
        }
    };

    // Handle keyboard navigation within results
    const handleKeyNavigation = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev < searchResults.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (searchResults.length > 0 && searchResults[selectedIndex]) {
                handleResultSelect(searchResults[selectedIndex]);
            } else if (searchQuery.trim()) {
                goToSearchPage();
            }
        }
    };

    // Render icon based on category
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
            case 'org':
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

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Search (Ctrl+/)"
            >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            {/* Search Panel */}
            <div className="fixed inset-0 flex items-start justify-center pt-16 sm:pt-24">
                <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden transform transition-all">
                    {/* Search input */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                        <svg className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white text-base placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Search GitHub data..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyNavigation}
                        />

                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                        {/* Category filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>

                        {/* Time range filter */}
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {timeRanges.map(range => (
                                <option key={range.id} value={range.id}>{range.name}</option>
                            ))}
                        </select>

                        {/* Go to advanced search */}
                        <button
                            onClick={goToSearchPage}
                            className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1"
                        >
                            Advanced Search
                        </button>
                    </div>

                    {/* Results list */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="py-8 flex justify-center">
                                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : (
                            <>
                                {/* Recent searches */}
                                {recentSearches.length > 0 && !searchQuery && (
                                    <div className="py-2">
                                        <div className="px-4 py-2 flex justify-between items-center">
                                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400">Recent Searches</h3>
                                            <button
                                                onClick={() => {
                                                    setRecentSearches([]);
                                                    localStorage.removeItem('github-recent-searches');
                                                }}
                                                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        <ul>
                                            {recentSearches.slice(0, 5).map((search, index) => (
                                                <li key={index}>
                                                    <button
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                        onClick={() => {
                                                            setSearchQuery(search);
                                                        }}
                                                    >
                                                        <svg className="h-4 w-4 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                                        </svg>
                                                        {search}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {searchQuery && searchResults.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No results found for "{searchQuery}"
                                        <p className="mt-2 text-sm">
                                            <button
                                                onClick={goToSearchPage}
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Try advanced search
                                            </button>
                                        </p>
                                    </div>
                                ) : (
                                    searchQuery && (
                                        <ul>
                                            {searchResults.map((result, index) => (
                                                <li key={result.id}>
                                                    <button
                                                        className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                            }`}
                                                        onClick={() => handleResultSelect(result)}
                                                    >
                                                        <div className="flex-shrink-0 mt-1">
                                                            {renderIcon(result.icon)}
                                                        </div>
                                                        <div className="ml-3 flex-1">
                                                            <div className="flex items-center">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {result.title}
                                                                </span>
                                                                <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                                                    {result.category}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                {result.description}
                                                            </p>
                                                            {result.meta && (
                                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                    {result.meta}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}

                                            {/* View all results link */}
                                            {searchResults.length > 0 && (
                                                <li>
                                                    <button
                                                        className="w-full text-center px-4 py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        onClick={goToSearchPage}
                                                    >
                                                        View all results for "{searchQuery}"
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    )
                                )}

                                {/* Search tips */}
                                {!searchQuery && (
                                    <div className="py-4 px-4">
                                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Search Tips</h3>
                                        <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                                            <li className="flex items-center">
                                                <span className="inline-block w-20 font-medium">language:</span>
                                                <span>Filter by programming language (e.g., language:javascript)</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="inline-block w-20 font-medium">state:</span>
                                                <span>Filter by state (e.g., state:open)</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="inline-block w-20 font-medium">stars:</span>
                                                <span>Filter by stars (e.g., stars:{'>'}10)</span>
                                            </li>
                                            <li className="flex items-center">
                                                <span className="inline-block w-20 font-medium">"exact"</span>
                                                <span>Search for exact phrase (in quotes)</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Keyboard shortcuts */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 mr-1">↑</kbd>
                                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 mr-1">↓</kbd>
                                <span>navigate</span>
                            </div>
                            <div className="flex items-center">
                                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 mr-1">Enter</kbd>
                                <span>select</span>
                            </div>
                            <div className="flex items-center">
                                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 mr-1">Esc</kbd>
                                <span>close</span>
                            </div>
                        </div>
                        <a
                            href="/search"
                            onClick={(e) => {
                                e.preventDefault();
                                goToSearchPage();
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            Advanced Search
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedSearch;