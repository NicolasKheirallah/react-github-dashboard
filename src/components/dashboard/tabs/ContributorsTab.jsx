import React, { useState, useEffect } from 'react';
import { useGithub } from '../../../context/GithubContext';
import { fetchAllContributorData } from '../../../services/githubService';

const ContributorsTab = ({ searchQuery, sortOption }) => {
  const { repositories, pullRequests, token } = useGithub();
  const [contributors, setContributors] = useState([]);
  const [filteredContributors, setFilteredContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch contributors using the integrated GitHub service
  useEffect(() => {
    const getContributors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Log what data we're working with
        console.log(`Fetching contributors data with ${repositories?.length || 0} repositories and ${pullRequests?.length || 0} pull requests`);
        
        if (!token) {
          throw new Error('GitHub token not available');
        }
        
        // Fetch contributors directly from GitHub API
        const contributorsData = await fetchAllContributorData(token, repositories, pullRequests);
        
        console.log(`Fetched ${contributorsData.length} contributors from GitHub API`);
        setContributors(contributorsData);
      } catch (err) {
        console.error('Error fetching contributors:', err);
        setError(err.message || 'Failed to load contributors');
        
        // In development mode, use dummy data
        if (process.env.NODE_ENV === 'development') {
          console.log('Using dummy data for development');
          setContributors([
            {
              id: 'dev1',
              login: 'developer1',
              name: 'Developer One',
              avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
              html_url: 'https://github.com/developer1',
              contributions: 35,
              pullRequests: 12,
              repositories: ['repo1', 'repo2', 'repo3'],
              repoCount: 3,
              totalActivity: 47
            },
            {
              id: 'dev2',
              login: 'developer2',
              name: 'Developer Two',
              avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
              html_url: 'https://github.com/developer2',
              contributions: 28,
              pullRequests: 5,
              repositories: ['repo1', 'repo4'],
              repoCount: 2,
              totalActivity: 33
            },
            {
              id: 'dev3',
              login: 'developer3',
              name: 'Developer Three',
              avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
              html_url: 'https://github.com/developer3',
              contributions: 42,
              pullRequests: 9,
              repositories: ['repo2', 'repo3', 'repo5', 'repo6'],
              repoCount: 4,
              totalActivity: 51
            }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    getContributors();
  }, [repositories, pullRequests, token]);

  // Filter and sort contributors based on search query and sort option
  useEffect(() => {
    if (!contributors || !contributors.length) {
      setFilteredContributors([]);
      return;
    }

    // Filter by search query
    let filtered = contributors;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = contributors.filter(contributor => {
        // Handle potential undefined values with safe property access
        const loginMatch = contributor.login && 
          contributor.login.toLowerCase().includes(query);
        const nameMatch = contributor.name && 
          contributor.name.toLowerCase().includes(query);
        const repoMatch = contributor.repositories && Array.isArray(contributor.repositories) && 
          contributor.repositories.some(repo => repo && repo.toLowerCase().includes(query));
        
        return loginMatch || nameMatch || repoMatch;
      });
    }

    // Sort based on selected option
    switch (sortOption) {
      case 'az':
        filtered.sort((a, b) => {
          const aLogin = a.login || '';
          const bLogin = b.login || '';
          return aLogin.localeCompare(bLogin);
        });
        break;
      case 'za':
        filtered.sort((a, b) => {
          const aLogin = a.login || '';
          const bLogin = b.login || '';
          return bLogin.localeCompare(aLogin);
        });
        break;
      case 'most-active':
        filtered.sort((a, b) => (b.totalActivity || 0) - (a.totalActivity || 0));
        break;
      case 'most-repos':
        filtered.sort((a, b) => (b.repoCount || 0) - (a.repoCount || 0));
        break;
      default: // 'most-active' as default
        filtered.sort((a, b) => (b.totalActivity || 0) - (a.totalActivity || 0));
    }

    setFilteredContributors(filtered);
    console.log(`Filtered to ${filtered.length} contributors`);
  }, [contributors, searchQuery, sortOption]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading contributors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-500 dark:text-red-400">
        <div className="mb-4">Error loading contributors</div>
        <div className="text-sm">{error}</div>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!filteredContributors || filteredContributors.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500 dark:text-gray-400">
        <div className="mb-4">
          {searchQuery 
            ? `No contributors found matching "${searchQuery}"`
            : "No contributors data available"
          }
        </div>
        <div className="text-sm max-w-lg mx-auto">
          <p>This could be due to:</p>
          <ul className="list-disc pl-5 text-left mt-2">
            <li>Limited access to contributor data with your current GitHub token</li>
            <li>The repositories analyzed don't have multiple contributors</li>
            <li>GitHub API rate limiting prevented fetching all contributor data</li>
          </ul>
          <p className="mt-2">Try refreshing the page or analyzing different repositories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="text-gray-600 dark:text-gray-300 text-sm">
          Showing {filteredContributors.length} {filteredContributors.length === 1 ? 'contributor' : 'contributors'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {filteredContributors.map(contributor => (
          <div 
            key={contributor.id}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-start space-x-4 border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          >
            <img 
              src={contributor.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'} 
              alt={contributor.login || 'user'}
              className="h-12 w-12 rounded-full"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white truncate">
                  {contributor.name || contributor.login || 'Unknown User'}
                </h3>
                <a
                  href={contributor.html_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                >
                  @{contributor.login || 'unknown'}
                </a>
              </div>
              
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span>{contributor.contributions || 0} commits</span>
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>{contributor.pullRequests || 0} PRs</span>
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <span>{contributor.repoCount || 0} repos</span>
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>{contributor.totalActivity || 0} activities</span>
                </div>
              </div>
              
              {contributor.repositories && contributor.repositories.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Repositories:</div>
                  <div className="flex flex-wrap gap-1">
                    {contributor.repositories.slice(0, 3).map((repo, idx) => (
                      <span key={`${repo || 'unknown'}-${idx}`} className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded">
                        {repo || 'unknown'}
                      </span>
                    ))}
                    {contributor.repositories.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded">
                        +{contributor.repositories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributorsTab;