import React, { useMemo } from 'react';
import { useGithub } from '../../../context/GithubContext';

const PullRequestsTab = ({ searchQuery, sortOption }) => {
  const { pullRequests } = useGithub();
  
  // Filter and sort pull requests based on search query and sort option
  const filteredAndSortedPRs = useMemo(() => {
    // Filter based on search query
    let filtered = pullRequests;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = pullRequests.filter(pr => 
        pr.title.toLowerCase().includes(query) || 
        pr.repository.toLowerCase().includes(query) ||
        (pr.labels && pr.labels.toLowerCase().includes(query))
      );
    }
    
    // Sort based on sort option
    return filtered.sort((a, b) => {
      switch(sortOption) {
        case 'oldest':
          return new Date(a.createdDateTime) - new Date(b.createdDateTime);
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        case 'newest':
        default:
          return new Date(b.createdDateTime) - new Date(a.createdDateTime);
      }
    });
  }, [pullRequests, searchQuery, sortOption]);
  
  // Display message if no results after filtering
  if (filteredAndSortedPRs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {searchQuery 
          ? `No pull requests found matching "${searchQuery}"` 
          : "No pull requests available"}
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto scrollbar rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Repository</th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">State</th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Labels</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {filteredAndSortedPRs.map(pr => (
            <tr key={`${pr.repository}-${pr.number}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
              <td className="px-4 py-4 whitespace-nowrap">
                <a 
                  href={pr.url} 
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  #{pr.number}
                </a>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{pr.repository}</div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm text-gray-900 dark:text-white">{pr.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pr.daysOpen} days</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  pr.state === 'Open' 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                    : pr.state === 'Merged'
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  {pr.state}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700 dark:text-gray-300">{pr.created}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Updated: {pr.updated}</div>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap">
                  {pr.labels ? pr.labels.split(', ').map((label, index) => (
                    label ? (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 whitespace-nowrap mr-1.5 mb-1.5"
                      >
                        {label}
                      </span>
                    ) : null
                  )) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PullRequestsTab;