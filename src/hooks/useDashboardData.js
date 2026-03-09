import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllGithubData } from '../services/github/dashboard';
import { processGithubData } from '../services/dataProcessingService';

export const useDashboardData = ({
  token,
  setUserData,
  setRepositories,
  setPullRequests,
  setIssues,
  setOrganizations,
  setStarredRepos,
  setContributions,
  setAnalytics,
  setUserEvents,
  setFollowers,
  setFollowing,
  setLoading,
  setError,
}) => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', token],
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    queryFn: ({ signal }) => fetchAllGithubData(token, { signal }),
  });

  useEffect(() => {
    setLoading(dashboardQuery.isLoading || dashboardQuery.isFetching);
  }, [dashboardQuery.isFetching, dashboardQuery.isLoading, setLoading]);

  useEffect(() => {
    if (dashboardQuery.error) {
      setError(
        dashboardQuery.error.message ||
          'Failed to load GitHub data. Check your network connection and token scopes.'
      );
      return;
    }

    setError(null);
  }, [dashboardQuery.error, setError]);

  useEffect(() => {
    if (!dashboardQuery.data) {
      return;
    }

    const data = dashboardQuery.data;
    const {
      userData: nextUserData,
      processedPRs,
      processedIssues,
      processedRepos,
      processedOrgs,
      processedStarred,
      processedContributions,
      processedEvents,
      analytics,
    } = processGithubData(data);

    setUserData(nextUserData);
    setPullRequests(processedPRs);
    setIssues(processedIssues);
    setRepositories(processedRepos);
    setOrganizations(processedOrgs);
    setStarredRepos(processedStarred);
    setContributions(processedContributions);
    setUserEvents(processedEvents || data.userEvents);
    setFollowers(data.followers || []);
    setFollowing(data.following || []);
    setAnalytics(analytics);
    setDataLoaded(true);
  }, [
    dashboardQuery.data,
    setAnalytics,
    setContributions,
    setFollowers,
    setFollowing,
    setIssues,
    setOrganizations,
    setPullRequests,
    setRepositories,
    setStarredRepos,
    setUserData,
    setUserEvents,
  ]);

  return dataLoaded;
};
