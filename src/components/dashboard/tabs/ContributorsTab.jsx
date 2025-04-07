import React, { useState, useEffect } from 'react';
import { useGithub } from '../../../context/GithubContext';

const ContributorsTab = ({ searchQuery, sortOption }) => {
  const { repositories, contributions, pullRequests } = useGithub();
  const [contributors, setContributors] = useState([]);
  const [filteredContributors, setFilteredContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract and process contributor data from repositories and PRs
  useEffect(() => {
    if (!repositories || !pullRequests) {
      setLoading(true);
      return;
    }

    // Collect contributors from all available data
    const contributorsMap = new Map();

    // Process PR authors
    if (Array.isArray(pullRequests)) {
      pullRequests.forEach(pr => {
        if (pr && pr.user) {
          const user = pr.user;
          if (user && user.id && !contributorsMap.has(user.id)) {
            contributorsMap.set(user.id, {
              id: user.id,
              login: user.login || 'unknown',
              name: user.name || user.login || 'unknown',
              avatar_url: user.avatar_url || '',
              html_url: user.html_url || '#',
              contributions: 0,
              pullRequests: 0,
              repositories: new Set(),
            });
          }

          if (user && user.id) {
            const contributor = contributorsMap.get(user.id);
            if (contributor) {
              contributor.pullRequests += 1;
              if (pr.repository && pr.repository.name) {
                contributor.repositories.add(pr.repository.name);
              }
            }
          }
        }
      });
    }

    // Process contributors from repository data if available
    if (Array.isArray(repositories)) {
      repositories.forEach(repo => {
        if (repo && repo.owner) {
          const owner = repo.owner;
          if (owner && owner.id && !contributorsMap.has(owner.id)) {
            contributorsMap.set(owner.id, {
              id: owner.id,
              login: owner.login || 'unknown',
              name: owner.login || 'unknown',
              avatar_url: owner.avatar_url || '',
              html_url: owner.html_url || '#',
              contributions: 0,
              pullRequests: 0,
              repositories: new Set([repo.name]),
            });
          } else if (owner && owner.id) {
            const contributor = contributorsMap.get(owner.id);
            if (contributor && repo.name) {
              contributor.repositories.add(repo.name);
            }
          }
        }
      });
    }

    // Process commit contributors if available
    if (contributions && contributions.commits && Array.isArray(contributions.commits)) {
      contributions.commits.forEach(commit => {
        if (commit && commit.author) {
          const author = commit.author;
          if (author && author.id && !contributorsMap.has(author.id)) {
            contributorsMap.set(author.id, {
              id: author.id,
              login: author.login || 'unknown',
              name: author.name || author.login || 'unknown',
              avatar_url: author.avatar_url || '',
              html_url: author.html_url || '#',
              contributions: 1,
              pullRequests: 0,
              repositories: new Set(),
            });
          } else if (author && author.id) {
            const contributor = contributorsMap.get(author.id);
            if (contributor) {
              contributor.contributions += 1;
            }
          }

          // Add repository if available
          if (author && author.id && commit.repository && commit.repository.name) {
            const contributor = contributorsMap.get(author.id);
            if (contributor) {
              contributor.repositories.add(commit.repository.name);
            }
          }
        }
      });
    }

    // Convert Map to array and finalize data structure
    const contributorsArray = Array.from(contributorsMap.values())
      .filter(Boolean) // Make sure we don't have any undefined entries
      .map(contributor => ({
        ...contributor,
        repositories: Array.from(contributor.repositories || []),
        repoCount: contributor.repositories ? contributor.repositories.size : 0,
        totalActivity: (contributor.contributions || 0) + (contributor.pullRequests || 0),
      }));

    setContributors(contributorsArray);
    setLoading(false);
  }, [repositories, pullRequests, contributions]);

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
  }, [contributors, searchQuery, sortOption]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!filteredContributors || filteredContributors.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500 dark:text-gray-400">
        {searchQuery 
          ? `No contributors found matching "${searchQuery}"`
          : "No contributors data available"
        }
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
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