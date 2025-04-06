// src/components/dashboard/tabs/RepositoriesTab.jsx
import React, { useMemo } from 'react';
import { useGithub } from '../../../context/GithubContext';

const RepositoriesTab = ({ searchQuery, sortOption }) => {
  const { repositories } = useGithub();
  
  // Filter and sort repositories based on search query and sort option
  const filteredAndSortedRepos = useMemo(() => {
    // Filter based on search query
    let filtered = repositories;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = repositories.filter(repo => 
        repo.name.toLowerCase().includes(query) || 
        (repo.description && repo.description.toLowerCase().includes(query)) ||
        (repo.language && repo.language.toLowerCase().includes(query)) ||
        repo.topics.some(topic => topic.toLowerCase().includes(query))
      );
    }
    
    // Sort based on sort option
    return filtered.sort((a, b) => {
      switch(sortOption) {
        case 'oldest':
          return new Date(a.created) - new Date(b.created);
        case 'az':
          return a.name.localeCompare(b.name);
        case 'za':
          return b.name.localeCompare(a.name);
        case 'newest':
        default:
          return new Date(b.updated) - new Date(a.updated);
      }
    });
  }, [repositories, searchQuery, sortOption]);
  
  // Display message if no results after filtering
  if (filteredAndSortedRepos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {searchQuery 
          ? `No repositories found matching "${searchQuery}"` 
          : "No repositories available"}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredAndSortedRepos.map(repo => (
        <div key={repo.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <a 
                  href={repo.url} 
                  className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {repo.name}
                </a>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {repo.description || "No description available"}
                </div>
              </div>
              <div className="flex">
                {repo.isPrivate ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    Private
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Public
                  </span>
                )}
                
                {repo.isFork && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ml-2">
                    Fork
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {repo.language && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mr-2">
                    {repo.language}
                  </span>
                )}
                
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
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {repo.stars}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {repo.forks}
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
              Created: {repo.created} · Updated: {repo.updated}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RepositoriesTab;