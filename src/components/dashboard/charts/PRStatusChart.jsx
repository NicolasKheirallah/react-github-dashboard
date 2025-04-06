import React from 'react';
import { useGithub } from '../../../context/GithubContext';

const PRStatusChart = ({ size }) => {
  const { analytics } = useGithub();
  
  // This is a placeholder - implement the actual chart
  return (
    <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
      <p className="text-gray-500 dark:text-gray-400">PR Status Chart - {size}</p>
    </div>
  );
};

export default PRStatusChart;