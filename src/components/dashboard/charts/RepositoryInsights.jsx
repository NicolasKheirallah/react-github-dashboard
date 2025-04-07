import React, { useState, useEffect } from 'react';
import { useGithub } from '../../../context/GithubContext';
import { fetchDetailedRepoData } from '../../../services/githubService';
import Chart from 'chart.js/auto';

// Sub-components
import RepoCommitChart from './insights/RepoCommitChart';
import ContributorLeaderboard from './insights/ContributorLeaderboard';
import CodeChurnChart from './insights/CodeChurnChart';
import CommitCalendar from './insights/CommitCalendar';
import SecurityAlerts from './insights/SecurityAlerts';

const RepositoryInsights = () => {
  const { repositories, token, darkMode } = useGithub();
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // When a repository is selected, parse owner and name
  useEffect(() => {
    if (selectedRepo) {
      const [owner, name] = selectedRepo.split('/');
      setRepoOwner(owner);
      setRepoName(name);
    }
  }, [selectedRepo]);

  // Fetch repository insights data when owner and name are set
  useEffect(() => {
    const fetchInsights = async () => {
      if (!repoOwner || !repoName || !token) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchDetailedRepoData(token, repoOwner, repoName);
        setInsightsData(data);
      } catch (err) {
        console.error('Error fetching repository insights:', err);
        setError('Failed to load repository insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsights();
  }, [repoOwner, repoName, token]);

  // Get available repos for selection
  const availableRepos = repositories?.map(repo => repo.name) || [];

  // Handle repository selection
  const handleRepoChange = (e) => {
    setSelectedRepo(e.target.value);
    setInsightsData(null); // Clear previous data
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading repository insights...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4 rounded-lg my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Repository Insights</h2>
      
      {/* Repository Selector */}
      <div className="mb-6">
        <label htmlFor="repo-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Repository
        </label>
        <select
          id="repo-select"
          value={selectedRepo}
          onChange={handleRepoChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
        >
          <option value="">-- Select a repository --</option>
          {availableRepos.map(repo => (
            <option key={repo} value={repo}>{repo}</option>
          ))}
        </select>
      </div>
      
      {selectedRepo && insightsData ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => handleTabChange('overview')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabChange('contributors')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'contributors'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Contributors
              </button>
              <button
                onClick={() => handleTabChange('code')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'code'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Code Metrics
              </button>
              <button
                onClick={() => handleTabChange('security')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'security'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Security
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedRepo} Overview
                  </h3>
                  
                  {/* Repository Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Commit Activity</h4>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {insightsData.commitStats?.all.reduce((sum, count) => sum + count, 0) || 'N/A'}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total commits (last year)</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Contributors</h4>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {insightsData.contributorStats?.length || 'N/A'}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Active contributors</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Security</h4>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {insightsData.vulnerabilities?.alerts?.length || '0'}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Security alerts</p>
                    </div>
                  </div>
                  
                  {/* Weekly Commit Activity Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Weekly Commit Activity</h4>
                    <div className="h-64">
                      <RepoCommitChart commitStats={insightsData.commitStats} darkMode={darkMode} />
                    </div>
                  </div>
                  
                  {/* Recent Commits */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Commits</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Author
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Message
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {insightsData.recentCommits?.slice(0, 5).map((commit, index) => (
                            <tr key={commit.sha || index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {commit.author?.login || commit.commit?.author?.name || 'Unknown'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs">
                                {commit.commit?.message || 'No message'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {commit.commit?.author?.date ? new Date(commit.commit.author.date).toLocaleDateString() : 'Unknown date'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'contributors' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Contributors
                </h3>
                
                <ContributorLeaderboard contributorStats={insightsData.contributorStats} darkMode={darkMode} />
              </div>
            )}
            
            {activeTab === 'code' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Code Metrics
                </h3>
                
                {/* Code Churn Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Code Churn</h4>
                  <div className="h-64">
                    <CodeChurnChart codeFrequency={insightsData.codeFrequency} darkMode={darkMode} />
                  </div>
                </div>
                
                {/* Commit Calendar */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Commit Calendar</h4>
                  <CommitCalendar commitActivity={insightsData.commitActivity} darkMode={darkMode} />
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Security
                </h3>
                
                <SecurityAlerts vulnerabilities={insightsData.vulnerabilities} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Repository</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Choose a repository from the dropdown to view detailed insights and metrics about its activity.
          </p>
        </div>
      )}
    </div>
  );
};

export default RepositoryInsights;