import React, { createContext, useState, useContext, useEffect } from 'react';

const GithubContext = createContext();

export function GithubProvider({ children, value }) {
  const [userEvents, setUserEvents] = useState([]);
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
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

const toggleDarkMode = () => {
  // Apply a class that temporarily disables transitions for performance
  document.documentElement.classList.add('no-transition');
  
  setDarkMode(prevMode => {
    const newMode = !prevMode;
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    return newMode;
  });
  
  // Force a reflow to ensure transitions are disabled during class changes
  window.getComputedStyle(document.documentElement).getPropertyValue('color');
  
  // Re-enable transitions after the theme change
  setTimeout(() => {
    document.documentElement.classList.remove('no-transition');
  }, 50);
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
      darkMode,
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
      toggleDarkMode,
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