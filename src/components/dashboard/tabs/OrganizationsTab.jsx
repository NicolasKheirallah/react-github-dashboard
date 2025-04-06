// src/components/dashboard/tabs/OrganizationsTab.jsx
import React, { useMemo } from 'react';
import { useGithub } from '../../../context/GithubContext';

const OrganizationsTab = ({ searchQuery, sortOption }) => {
  const { organizations } = useGithub();
  
  // Filter and sort organizations based on search query and sort option
  const filteredAndSortedOrgs = useMemo(() => {
    // Filter based on search query
    let filtered = organizations;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = organizations.filter(org => 
        org.login.toLowerCase().includes(query) || 
        org.name.toLowerCase().includes(query) ||
        (org.description && org.description.toLowerCase().includes(query))
      );
    }
    
    // Sort based on sort option
    return filtered.sort((a, b) => {
      switch(sortOption) {
        case 'az':
          return a.name.localeCompare(b.name);
        case 'za':
          return b.name.localeCompare(a.name);
        // For organizations, we don't have created/updated dates,
        // so both 'newest' and 'oldest' will default to alphabetical
        case 'newest':
        case 'oldest':
        default:
          return a.login.localeCompare(b.login);
      }
    });
  }, [organizations, searchQuery, sortOption]);
  
  // Display message if no results after filtering
  if (filteredAndSortedOrgs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {searchQuery 
          ? `No organizations found matching "${searchQuery}"` 
          : "No organizations available"}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {filteredAndSortedOrgs.map(org => (
        <div key={org.login} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 flex items-start space-x-4">
            <img 
              src={org.avatarUrl} 
              alt={org.login} 
              className="w-12 h-12 rounded-full flex-shrink-0 border border-gray-200 dark:border-gray-700"
            />
            <div className="min-w-0 flex-1">
              <a 
                href={org.url} 
                className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {org.name || org.login}
              </a>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">@{org.login}</div>
              {org.description && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {org.description}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrganizationsTab;