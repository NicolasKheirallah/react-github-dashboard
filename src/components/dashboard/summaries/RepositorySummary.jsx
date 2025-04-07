// src/components/dashboard/summaries/RepositorySummary.jsx
import React from 'react';
import { useGithub } from '../../../context/GithubContext';

const RepositorySummary = ({ size }) => {
  const { repositories } = useGithub();
  
  if (!repositories || repositories.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No repository data available</p>
      </div>
    );
  }
  
  // Calculate repository statistics
  const totalRepos = repositories.length;
  const originalRepos = repositories.filter(repo => !repo.isFork).length;
  const forkedRepos = repositories.filter(repo => repo.isFork).length;
  const publicRepos = repositories.filter(repo => !repo.isPrivate).length;
  const privateRepos = repositories.filter(repo => repo.isPrivate).length;
  
  // Find most starred repo
  const mostStarredRepo = [...repositories].sort((a, b) => b.stars - a.stars)[0];
  
  // Find most recently updated repo
  const mostRecentRepo = [...repositories].sort((a, b) => 
    new Date(b.updated) - new Date(a.updated)
  )[0];
  
  // Get top languages
  const languageCounts = {};
  repositories.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });
  
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);
  
  return (
    <div className="h-full">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Repos</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{totalRepos}</div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Original/Forked</div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {originalRepos}/{forkedRepos}
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Starred</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {mostStarredRepo.stars} ★
          </div>
        </div>
        <a 
          href={mostStarredRepo.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block"
        >
          {mostStarredRepo.name}
        </a>
      </div>
      
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Recently Updated</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(mostRecentRepo.updated).toLocaleDateString()}
          </div>
        </div>
        <a 
          href={mostRecentRepo.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block"
        >
          {mostRecentRepo.name}
        </a>
      </div>
      
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Top Languages</div>
        <div className="flex flex-wrap gap-2">
          {topLanguages.map(lang => (
            <span
              key={lang}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepositorySummary;