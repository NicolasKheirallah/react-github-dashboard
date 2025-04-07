import React, { useState, useEffect } from 'react';
import { useGithub } from '../context/GithubContext';
import { fetchAllGithubData } from '../services/githubService';
import { processGithubData } from '../services/dataProcessingService';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import Overview from './dashboard/Overview';
import ChartsSection from './dashboard/ChartsSection';
import TabsSection from './dashboard/TabsSection';
import CustomizableDashboard from './dashboard/CustomizableDashboard';
import ContributorsTab from './dashboard/tabs/ContributorsTab';
import AnalyticsTab from './dashboard/tabs/AnalyticsTab';

// Import individual chart components
import PRReviewTimeChart from './dashboard/charts/PRReviewTimeChart';
import IssueResolutionChart from './dashboard/charts/IssueResolutionChart';
import CodeChurnChart from './dashboard/charts/CodeChurnChart';
import CommitFrequencyChart from './dashboard/charts/CommitFrequencyChart';
import PRSizeDistributionChart from './dashboard/charts/PRSizeDistributionChart';
import IssueTypesChart from './dashboard/charts/IssueTypesChart';
import ActivityHeatmap from './dashboard/charts/ActivityHeatmap';
import LanguageChart from './dashboard/charts/LanguageChart';

const Dashboard = () => {
  const { 
    token, 
    userData, 
    setUserData,
    setRepositories,
    setPullRequests,
    setIssues,
    setOrganizations,
    setStarredRepos,
    setContributions,
    setAnalytics,
    setUserEvents,
    loading,
    setLoading,
    error,
    setError,
    darkMode
  } = useGithub();
  
  const [activeTab, setActiveTab] = useState('pull-requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Dashboard preferences
  const [dashboardType, setDashboardType] = useState(() => {
    const saved = localStorage.getItem('github-dashboard-type');
    return saved || 'standard';
  });
  
  const [dashboardView, setDashboardView] = useState(() => {
    const saved = localStorage.getItem('github-dashboard-view');
    return saved || 'default';
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchAllGithubData(token);
        
        // Process the raw data
        const {
          userData,
          processedPRs,
          processedIssues,
          processedRepos,
          processedOrgs,
          processedStarred,
          processedContributions,
          processedEvents,
          analytics
        } = processGithubData(data);
        
        // Update context with processed data
        setUserData(userData);
        setPullRequests(processedPRs);
        setIssues(processedIssues);
        setRepositories(processedRepos);
        setOrganizations(processedOrgs);
        setStarredRepos(processedStarred);
        setContributions(processedContributions);
        setUserEvents(processedEvents || data.userEvents); // Make sure userEvents is set
        setAnalytics(analytics);
        setDataLoaded(true);
      } catch (err) {
        console.error('Error loading GitHub data:', err);
        setError('Failed to load GitHub data. Please check your connection and token validity.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  // Added all the setter dependencies to satisfy ESLint
  }, [token, setUserData, setPullRequests, setIssues, setRepositories, setOrganizations, setStarredRepos, setContributions, setUserEvents, setAnalytics, setError, setLoading]);
  
  // Toggle between dashboard types
  const toggleDashboardType = () => {
    const newType = dashboardType === 'standard' ? 'custom' : 'standard';
    setDashboardType(newType);
    localStorage.setItem('github-dashboard-type', newType);
  };
  
  // Change dashboard view
  const changeDashboardView = (view) => {
    setDashboardView(view);
    localStorage.setItem('github-dashboard-view', view);
  };
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
  };
  
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSort = (event) => {
    setSortOption(event.target.value);
  };
  
  if (loading && !dataLoaded) {
    return <Loader message="Loading your GitHub data..." />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (!userData) {
    return <ErrorMessage message="Could not load user data" />;
  }
  
  // Render view switcher
  const renderViewSwitcher = () => (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {userData?.name ? `${userData.name}'s Dashboard` : 'GitHub Dashboard'}
      </h2>
      
      <div className="flex items-center space-x-4">
        <div className="relative inline-block">
          <select
            value={dashboardView}
            onChange={(e) => changeDashboardView(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Standard View</option>
            <option value="contributors">Contributors View</option>
            <option value="analytics">Analytics View</option>
            <option value="code">Code Metrics View</option>
          </select>
        </div>
        
        <button
          onClick={toggleDashboardType}
          className={`flex items-center px-4 py-2 rounded-md text-sm transition-colors ${
            dashboardType === 'custom'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          title={dashboardType === 'custom' ? "Switch to Standard Dashboard" : "Switch to Custom Dashboard"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          {dashboardType === 'custom' ? 'Custom Dashboard' : 'Standard Dashboard'}
        </button>
      </div>
    </div>
  );
  
  // Render dashboard based on selected type and view
  const renderDashboard = () => {
    if (dashboardType === 'custom') {
      return (
        <>
          {renderViewSwitcher()}
          <CustomizableDashboard />
        </>
      );
    }
    
    // Standard dashboard with different views
    switch(dashboardView) {
      case 'contributors':
        return (
          <>
            {renderViewSwitcher()}
            <Overview />
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contributors Overview</h2>
              </div>
              <div className="p-4">
                <ContributorsTab searchQuery={searchQuery} sortOption={sortOption === 'newest' ? 'most-active' : sortOption} />
              </div>
            </div>
            <div className="mb-8">
              <ActivityHeatmap />
            </div>
          </>
        );
        
      case 'analytics':
        return (
          <>
            {renderViewSwitcher()}
            <Overview />
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Advanced Analytics</h2>
              </div>
              <div className="p-4">
                <AnalyticsTab />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pull Request Review Time</h3>
                </div>
                <div className="p-4">
                  <PRReviewTimeChart size="medium" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Issue Resolution</h3>
                </div>
                <div className="p-4">
                  <IssueResolutionChart size="medium" />
                </div>
              </div>
            </div>
          </>
        );
        
      case 'code':
        return (
          <>
            {renderViewSwitcher()}
            <Overview />
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Code Metrics</h2>
              </div>
              <div className="p-4 space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Code Churn Analysis</h3>
                  </div>
                  <div className="p-4">
                    <CodeChurnChart size="medium" />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Commit Activity</h3>
                  </div>
                  <div className="p-4">
                    <CommitFrequencyChart size="large" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Language Distribution</h3>
                    </div>
                    <div className="p-4">
                      <LanguageChart size="small" />
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pull Request Size Distribution</h3>
                    </div>
                    <div className="p-4">
                      <PRSizeDistributionChart size="small" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
        
      default: // Default view
        return (
          <>
            {renderViewSwitcher()}
            <Overview />
            <ChartsSection />
            <TabsSection 
              activeTab={activeTab}
              onTabChange={handleTabChange}
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
              sortOption={sortOption}
              onSortChange={handleSort}
            />
            
            {/* Activity Heatmap Section */}
            <div className="mb-8">
              <ActivityHeatmap />
            </div>
            
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Issue Types</h3>
                </div>
                <div className="p-4">
                  <IssueTypesChart size="medium" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Language Distribution</h3>
                </div>
                <div className="p-4">
                  <LanguageChart size="medium" />
                </div>
              </div>
            </div>
            
            {/* Review & Resolution Analytics Section */}
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Review & Resolution Analytics</h2>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <PRReviewTimeChart size="small" />
                <IssueResolutionChart size="small" />
              </div>
            </div>
          </>
        );
    }
  };
  
  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;