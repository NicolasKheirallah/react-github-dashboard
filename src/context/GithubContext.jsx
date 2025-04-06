import React, { createContext, useState, useContext, useEffect } from 'react';

const GithubContext = createContext();

export function GithubProvider({ children, value }) {
  const [userData, setUserData] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);
  const [issues, setIssues] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [starredRepos, setStarredRepos] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [analytics, setAnalytics] = useState({
    languageStats: {},
    prTimeline: {},
    issueTimeline: {},
    dayOfWeekActivity: {},
    prStateDistribution: {},
    timeOfDay: {},
    repoTypeDistribution: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Clear all data
  const clearData = () => {
    setUserData(null);
    setRepositories([]);
    setPullRequests([]);
    setIssues([]);
    setOrganizations([]);
    setStarredRepos([]);
    setContributions([]);
    setAnalytics({
      languageStats: {},
      prTimeline: {},
      issueTimeline: {},
      dayOfWeekActivity: {},
      prStateDistribution: {},
      timeOfDay: {},
      repoTypeDistribution: {},
    });
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
      darkMode,
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
      toggleDarkMode,
      clearData
    }}>
      {children}
    </GithubContext.Provider>
  );
}

export function useGithub() {
  return useContext(GithubContext);
}

export default GithubContext;
