// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useGithub } from '../context/GithubContext';
import { fetchAllGithubData } from '../services/githubService';
import { processGithubData } from '../services/dataProcessingService';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import Overview from './dashboard/Overview';
import ChartsSection from './dashboard/ChartsSection';
import TabsSection from './dashboard/TabsSection';

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
    loading,
    setLoading,
    error,
    setError
  } = useGithub();
  
  const [activeTab, setActiveTab] = useState('pull-requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [dataLoaded, setDataLoaded] = useState(false);
  
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
  }, [token]); // Only re-run if token changes
  
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
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
    </div>
  );
};

export default Dashboard;