// GitHub API base URL with https://
const API_BASE_URL = 'https://api.github.com';

// Default headers for API requests
const getHeaders = (token) => {
  return {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };
};

// Test method to check token validity
export const testTokenValidity = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      headers: getHeaders(token),
    });
    
    if (response.ok) {
      return true;
    }
    
    console.error(`Token validation failed: ${response.status} ${response.statusText}`);
    return false;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Fetch function with retry logic
const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url, options);
    
    // Handle rate limiting
    if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const waitTime = Math.max(resetTime * 1000 - Date.now(), 0);
      console.log(`Rate limited. Waiting ${waitTime / 1000} seconds.`);
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime || delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
    }
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} for URL: ${url}`);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Function to fetch all pages of a paginated API - improved with better error handling
const fetchAllPages = async (url, token) => {
  let page = 1;
  let allData = [];
  let hasNextPage = true;
  
  const options = {
    headers: getHeaders(token),
  };
  
  while (hasNextPage) {
    try {
      const pageUrl = url.includes('?') 
        ? `${url}&page=${page}&per_page=100` 
        : `${url}?page=${page}&per_page=100`;
      
      console.log(`Fetching: ${pageUrl}`);
      const response = await fetch(pageUrl, options);
      
      // Check if response is OK
      if (!response.ok) {
        console.error(`API error: ${response.status} for ${pageUrl}`);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.warn(`Expected array but got: ${typeof data}`, data);
        // If not an array but we have data, return it wrapped in an array
        return data.items ? data.items : (typeof data === 'object' ? [data] : []);
      }
      
      if (data.length === 0) {
        hasNextPage = false;
      } else {
        allData = [...allData, ...data];
        page += 1;
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      hasNextPage = false;
      // Return what we have so far instead of failing completely
      if (allData.length > 0) {
        return allData;
      }
      // If we have nothing, return empty array to prevent further errors
      return [];
    }
  }
  
  return allData;
};

// API Functions

export const fetchUserProfile = async (token) => {
  const url = `${API_BASE_URL}/user`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    return await fetchWithRetry(url, options);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const fetchPullRequests = async (token) => {
  const url = `${API_BASE_URL}/search/issues?q=author:@me+is:pr&sort=created&order=desc`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    const response = await fetchWithRetry(url, options);
    return response.items || [];
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return [];
  }
};

export const fetchIssuesCreated = async (token) => {
  const url = `${API_BASE_URL}/search/issues?q=author:@me+is:issue&sort=created&order=desc`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    const response = await fetchWithRetry(url, options);
    return response.items || [];
  } catch (error) {
    console.error('Error fetching created issues:', error);
    return [];
  }
};

export const fetchIssuesAssigned = async (token) => {
  const url = `${API_BASE_URL}/search/issues?q=assignee:@me+is:issue&sort=created&order=desc`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    const response = await fetchWithRetry(url, options);
    return response.items || [];
  } catch (error) {
    console.error('Error fetching assigned issues:', error);
    return [];
  }
};

export const fetchRepositories = async (token) => {
  const url = `${API_BASE_URL}/user/repos?sort=updated`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
};

export const fetchOrganizations = async (token) => {
  const url = `${API_BASE_URL}/user/orgs`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
};

export const fetchStarredRepos = async (token) => {
  const url = `${API_BASE_URL}/user/starred?sort=updated`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error('Error fetching starred repos:', error);
    return [];
  }
};

export const fetchWatchedRepos = async (token) => {
  const url = `${API_BASE_URL}/user/subscriptions`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error('Error fetching watched repos:', error);
    return [];
  }
};

// Fetch user notifications
export const fetchNotifications = async (token) => {
  const url = `${API_BASE_URL}/notifications?all=false`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (token, notificationId) => {
  const url = `${API_BASE_URL}/notifications/threads/${notificationId}`;
  const options = {
    method: 'PATCH',
    headers: getHeaders(token),
  };
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const fetchUserEvents = async (token) => {
  try {
    // First fetch user info to get the username
    const userProfile = await fetchUserProfile(token);
    const username = userProfile.login;
    
    if (!username) {
      throw new Error('Could not determine username from profile');
    }
    
    // Use the username to fetch events (this is more reliable than /user/events)
    const url = `${API_BASE_URL}/users/${username}/events`;
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error('Error fetching user events:', error);
    return [];
  }
};

// ====== NEW METHODS FOR ENHANCED DATA ======

// Fetch Pull Request details including review data
export const fetchPRDetails = async (token, owner, repo, prNumber) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    const prData = await fetchWithRetry(url, options);
    
    // Fetch reviews for this PR
    const reviewsUrl = `${API_BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`;
    const reviews = await fetchAllPages(reviewsUrl, token);
    
    // Add reviews to PR data
    return {
      ...prData,
      reviews: reviews || []
    };
  } catch (error) {
    console.error(`Error fetching PR details for ${owner}/${repo}#${prNumber}:`, error);
    return null;
  }
};

// Fetch a repository's commit statistics (weekly commit counts)
export const fetchRepoCommitStats = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/stats/participation`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    return await fetchWithRetry(url, options);
  } catch (error) {
    console.error(`Error fetching commit stats for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch a repository's contributor statistics
export const fetchContributorStats = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/stats/contributors`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    return await fetchWithRetry(url, options);
  } catch (error) {
    console.error(`Error fetching contributor stats for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch code frequency statistics (additions/deletions per week)
export const fetchCodeFrequencyStats = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/stats/code_frequency`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    return await fetchWithRetry(url, options);
  } catch (error) {
    console.error(`Error fetching code frequency stats for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch commit activity stats (commits per day of week)
export const fetchCommitActivityStats = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/stats/commit_activity`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    return await fetchWithRetry(url, options);
  } catch (error) {
    console.error(`Error fetching commit activity stats for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch project boards associated with user
export const fetchProjectBoards = async (token) => {
  const url = `${API_BASE_URL}/user/projects`;
  // const options = {
  //   headers: {
  //     ...getHeaders(token),
  //     'Accept': 'application/vnd.github.inertia-preview+json' // Required for projects API
  //   },
  // };
  
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error('Error fetching project boards:', error);
    return [];
  }
};

// Fetch recent commits for a specific repository
export const fetchRepoCommits = async (token, owner, repo, since = null) => {
  let url = `${API_BASE_URL}/repos/${owner}/${repo}/commits`;
  
  if (since) {
    // Format date as ISO string and add to URL
    const sinceDate = new Date(since);
    url += `?since=${sinceDate.toISOString()}`;
  }
  
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching commits for ${owner}/${repo}:`, error);
    return [];
  }
};

// Fetch pull request review comments for a specific repo
export const fetchPRReviewComments = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/pulls/comments`;
  
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching PR review comments for ${owner}/${repo}:`, error);
    return [];
  }
};

// Fetch security vulnerabilities for a repo
export const fetchRepoVulnerabilities = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/vulnerability-alerts`;
  const options = {
    headers: {
      ...getHeaders(token),
      'Accept': 'application/vnd.github.dorian-preview+json' // Required for vulnerability alerts API
    },
  };
  
  try {
    return await fetchWithRetry(url, options);
  } catch (error) {
    // Often returns 404 if no vulnerabilities or if feature not enabled
    if (error.message && error.message.includes('404')) {
      return { enabled: false, alerts: [] };
    }
    console.error(`Error fetching vulnerabilities for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch user followers
export const fetchFollowers = async (token) => {
  const url = `${API_BASE_URL}/user/followers`;
  
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
};

// Fetch user following
export const fetchFollowing = async (token) => {
  const url = `${API_BASE_URL}/user/following`;
  
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
};

// Enhanced function to fetch all GitHub data in parallel with improved error handling
export const fetchAllGithubData = async (token) => {
  try {
    // First validate the token
    const isValid = await testTokenValidity(token);
    if (!isValid) {
      throw new Error('Invalid token or insufficient permissions');
    }
    
    // Then fetch user profile to get the username
    const userProfile = await fetchUserProfile(token);
    
    // Then fetch everything else in parallel
    const [
      pullRequests, 
      issuesCreated, 
      repositories, 
      organizations, 
      starredRepos, 
      userEvents,
      followers,
      following
    ] = await Promise.all([
      fetchPullRequests(token),
      fetchIssuesCreated(token),
      fetchRepositories(token),
      fetchOrganizations(token),
      fetchStarredRepos(token),
      fetchUserEvents(token),
      fetchFollowers(token),
      fetchFollowing(token)
    ]);
    
    return {
      userProfile,
      pullRequests,
      issuesCreated,
      repositories,
      organizations,
      starredRepos,
      userEvents,
      followers,
      following
    };
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    throw error;
  }
};

// Fetch detailed repository data including statistics for a specific repo
export const fetchDetailedRepoData = async (token, owner, repo) => {
  try {
    const [
      commitStats,
      contributorStats,
      codeFrequency,
      commitActivity,
      recentCommits,
      prReviewComments,
      vulnerabilities
    ] = await Promise.all([
      fetchRepoCommitStats(token, owner, repo),
      fetchContributorStats(token, owner, repo),
      fetchCodeFrequencyStats(token, owner, repo),
      fetchCommitActivityStats(token, owner, repo),
      fetchRepoCommits(token, owner, repo),
      fetchPRReviewComments(token, owner, repo),
      fetchRepoVulnerabilities(token, owner, repo)
    ]);
    
    return {
      commitStats,
      contributorStats,
      codeFrequency,
      commitActivity,
      recentCommits,
      prReviewComments,
      vulnerabilities
    };
  } catch (error) {
    console.error(`Error fetching detailed repo data for ${owner}/${repo}:`, error);
    return {
      commitStats: null,
      contributorStats: [],
      codeFrequency: [],
      commitActivity: [],
      recentCommits: [],
      prReviewComments: [],
      vulnerabilities: null
    };
  }
};

// ====== NEW READ FUNCTIONALITY ADDITIONS ======

// Fetch repository languages
export const fetchRepoLanguages = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/languages`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    return await fetchWithRetry(url, options);
  } catch (error) {
    console.error(`Error fetching languages for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch repository tags
export const fetchRepoTags = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/tags`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching tags for ${owner}/${repo}:`, error);
    return [];
  }
};

// Fetch repository branches
export const fetchRepoBranches = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/branches`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching branches for ${owner}/${repo}:`, error);
    return [];
  }
};

// Fetch repository contributors
export const fetchRepoDetailedContributors = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/contributors`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching detailed contributors for ${owner}/${repo}:`, error);
    return [];
  }
};

// Fetch repository teams (for organization repos)
export const fetchRepoTeams = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/teams`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching teams for ${owner}/${repo}:`, error);
    return [];
  }
};

// Fetch repository contents
export const fetchRepoContents = async (token, owner, repo, path = '') => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${path}`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    return await fetchWithRetry(url, options);
  } catch (error) {
    console.error(`Error fetching contents for ${owner}/${repo}/${path}:`, error);
    return null;
  }
};

// Fetch repository README
export const fetchRepoReadme = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/readme`;
  const options = {
    headers: {
      ...getHeaders(token),
      'Accept': 'application/vnd.github.v3.raw+json'
    },
  };
  
  try {
    return await fetch(url, options).then(res => res.text());
  } catch (error) {
    console.error(`Error fetching README for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch repository license
export const fetchRepoLicense = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/license`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    return await fetchWithRetry(url, options);
  } catch (error) {
    console.error(`Error fetching license for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch issue/PR comments
export const fetchIssueComments = async (token, owner, repo, issueNumber) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching comments for ${owner}/${repo}#${issueNumber}:`, error);
    return [];
  }
};

export const fetchPRComments = async (token, owner, repo, prNumber) => {
    const url = `${API_BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}/comments`;
    try {
        return await fetchAllPages(url, token);
    } catch (error) {
        console.error(`Error fetching comments for ${owner}/${repo}#${prNumber}:`, error);
        return [];
    }
};

// Fetch issue/PR events
export const fetchIssueEvents = async (token, owner, repo, issueNumber) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/issues/${issueNumber}/events`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching events for ${owner}/${repo}#${issueNumber}:`, error);
    return [];
  }
};

export const fetchPREvents = async (token, owner, repo, prNumber) => {
    const url = `${API_BASE_URL}/repos/${owner}/${repo}/pulls/${prNumber}/events`;
    try {
        return await fetchAllPages(url, token);
    } catch (error) {
        console.error(`Error fetching events for ${owner}/${repo}#${prNumber}:`, error);
        return [];
    }
};

// Fetch user gists
export const fetchUserGists = async (token, username) => {
  const url = `${API_BASE_URL}/users/${username}/gists`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching gists for ${username}:`, error);
    return [];
  }
};

// Fetch detailed user organizations
export const fetchDetailedUserOrgs = async (token, username) => {
  const url = `${API_BASE_URL}/users/${username}/orgs`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching detailed orgs for ${username}:`, error);
    return [];
  }
};

// Fetch user packages
export const fetchUserPackages = async (token, username) => {
  const url = `${API_BASE_URL}/users/${username}/packages`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching packages for ${username}:`, error);
    return [];
  }
};

// Fetch organization members
export const fetchOrgMembers = async (token, org) => {
  const url = `${API_BASE_URL}/orgs/${org}/members`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching members for ${org}:`, error);
    return [];
  }
};

// Fetch organization teams
export const fetchOrgTeams = async (token, org) => {
  const url = `${API_BASE_URL}/orgs/${org}/teams`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching teams for ${org}:`, error);
    return [];
  }
};

// Fetch organization projects
export const fetchOrgProjects = async (token, org) => {
  const url = `${API_BASE_URL}/orgs/${org}/projects`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching projects for ${org}:`, error);
    return [];
  }
};

export const fetchRepoReleases = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/releases`;
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching releases for ${owner}/${repo}:`, error);
    return [];
  }
};

// Fetch repository traffic views
export const fetchRepoTrafficViews = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/traffic/views`;
  const options = {
    headers: getHeaders(token)
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching traffic views for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch repository traffic clones
export const fetchRepoTrafficClones = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/traffic/clones`;
  const options = {
    headers: getHeaders(token)
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching traffic clones for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch GitHub Actions workflows for a repository
export const fetchRepoWorkflows = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/actions/workflows`;
  try {
    return await fetchWithRetry(url, { headers: getHeaders(token) });
  } catch (error) {
    console.error(`Error fetching workflows for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch GitHub Actions workflow runs for a repository
export const fetchWorkflowRuns = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/actions/runs`;
  try {
    return await fetchWithRetry(url, { headers: getHeaders(token) });
  } catch (error) {
    console.error(`Error fetching workflow runs for ${owner}/${repo}:`, error);
    return null;
  }
};

// Fetch repository topics
export const fetchRepoTopics = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/topics`;
  const options = {
    headers: {
      ...getHeaders(token),
      'Accept': 'application/vnd.github.mercy-preview+json' // Required for topics API
    }
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching topics for ${owner}/${repo}:`, error);
    return null;
  }
};
export const fetchGraphQLData = async (token, query, variables = {}) => {
  const url = 'https://api.github.com/graphql';
  const options = {
    method: 'POST',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`GraphQL API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching GraphQL data:', error);
    return null;
  }
};

// Fetch code scanning alerts for a repository
export const fetchCodeScanningAlerts = async (token, owner, repo) => {
  const url = `${API_BASE_URL}/repos/${owner}/${repo}/code-scanning/alerts`;
  // const options = {
  //   headers: getHeaders(token)
  // };
  try {
    return await fetchAllPages(url, token);
  } catch (error) {
    console.error(`Error fetching code scanning alerts for ${owner}/${repo}:`, error);
    return [];
  }
};

// Fetch rate limit status
export const fetchRateLimit = async (token) => {
  const url = `${API_BASE_URL}/rate_limit`;
  const options = {
    headers: getHeaders(token),
  };
  
  try {
    return await fetchWithRetry(url, options);
  } catch (error) {
    console.error('Error fetching rate limit:', error);
    return null;
  }
};