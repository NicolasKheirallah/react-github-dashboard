import React, { createContext, useContext, useState } from 'react';

const GithubContext = createContext();

const emptyContributions = {
  monthlyCommits: {},
  eventCounts: {},
  repoActivity: {},
};

export function GithubProvider({ children, value }) {
  const [userEvents, setUserEvents] = useState([]);
  const [userData, setUserData] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);
  const [issues, setIssues] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [starredRepos, setStarredRepos] = useState([]);
  const [contributions, setContributions] = useState(emptyContributions);
  const [analytics, setAnalytics] = useState({
    languageStats: {},
    prTimeline: {},
    issueTimeline: {},
    dayOfWeekActivity: {},
    prStateDistribution: {},
    timeOfDay: {},
    repoTypeDistribution: {},
    monthlyCommits: {},
    repositoryTopics: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // Clear all data
  const clearData = () => {
    setUserData(null);
    setRepositories([]);
    setPullRequests([]);
    setIssues([]);
    setOrganizations([]);
    setStarredRepos([]);
    setContributions(emptyContributions);
    setAnalytics({
      languageStats: {},
      prTimeline: {},
      issueTimeline: {},
      dayOfWeekActivity: {},
      prStateDistribution: {},
      timeOfDay: {},
      repoTypeDistribution: {},
      monthlyCommits: {},
      repositoryTopics: {},
    });
    setFollowers([]);
    setFollowing([]);
  };

  return (
    <GithubContext.Provider value={{
      ...value,
      userData,
      repositories,
      pullRequests,
      issues,
      organizations,
      starredRepos,
      contributions,
      analytics,
      loading,
      error,
      followers,
      following,
      userEvents,
      setUserData,
      setRepositories,
      setPullRequests,
      setIssues,
      setOrganizations,
      setStarredRepos,
      setContributions,
      setAnalytics,
      setLoading,
      setError,
      clearData,
      setFollowers,
      setFollowing,
      setUserEvents,
    }}>
      {children}
    </GithubContext.Provider>
  );
}

export function useGithub() {
  return useContext(GithubContext);
}

export default GithubContext;
