// src/components/dashboard/tabs/StarredTab.jsx
import React, { useMemo } from 'react';
import { useGithub } from '../../../context/GithubContext';

const StarredTab = ({ searchQuery, sortOption }) => {
  const { starredRepos } = useGithub();
  
  // Filter and sort starred repositories based on search query and sort option
  const filteredAndSortedStarred = useMemo(() => {
    // Filter based on search query
    let filtered = starredRepos;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = starredRepos.filter(repo => 
        repo.name.toLowerCase().includes(query) || 
        (repo.description && repo.description.toLowerCase().includes(query)) ||
        (repo.language && repo.language.toLowerCase().includes(query)) ||
        repo.topics.some(topic => topic.toLowerCase().includes(query))
      );
    }
    
    // Sort based on sort option
    return filtered.sort((a, b) => {
      switch(sortOption) {
        case 'az':
          return a.name.localeCompare(b.name);
        case 'za':
          return b.name.localeCompare(a.name);
        case 'stars':
          return b.stars - a.stars;
        case 'newest':
        case 'oldest':
        default:
          return b.stars - a.stars; // Default sort by stars for starred repos
      }
    });
  }, [starredRepos, searchQuery, sortOption]);
  
  // Display message if no results after filtering
  if (filteredAndSortedStarred.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {searchQuery 
          ? `No starred repositories found matching "${searchQuery}"` 
          : "No starred repositories available"}
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto scrollbar rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Repository</th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Language</th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stars</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {filteredAndSortedStarred.map(repo => (
            <tr key={repo.name} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
              <td className="px-4 py-4 whitespace-nowrap">
                <a 
                  href={repo.url} 
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {repo.name}
                </a>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {repo.description || "No description available"}
                </div>
                <div className="mt-1 flex flex-wrap">
                  {repo.topics.slice(0, 3).map((topic, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-1.5 mb-1.5"
                    >
                      {topic}
                    </span>
                  ))}
                  
                  {repo.topics.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      +{repo.topics.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {repo.language ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {repo.language}
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {repo.stars.toLocaleString()}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StarredTab;