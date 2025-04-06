// src/components/dashboard/summaries/RepositorySummary.jsx
import React from 'react';
import { useGithub } from '../../../context/GithubContext';

const RepositorySummary = ({ size }) => {
  const { repositories } = useGithub();
  
  // This is a placeholder - implement the actual summary
  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
      <p className="text-gray-500 dark:text-gray-400">Repository Summary - {size}</p>
    </div>
  );
};

export default RepositorySummary;