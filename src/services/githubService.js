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

const fetchAllPages = async (url, token, customOptions = null) => {
  const cacheKey = `github-cache-${url}`;
  const cachedData = localStorage.getItem(cacheKey);
  const cachedTimestamp = localStorage.getItem(`${cacheKey}-timestamp`);

  // Use cache if it's less than 5 minutes old
  if (cachedData && cachedTimestamp) {
    const isRecent = (Date.now() - parseInt(cachedTimestamp)) < 5 * 60 * 1000;
    if (isRecent) {
      return JSON.parse(cachedData);
    }
  }

  let page = 1;
  let allData = [];
  let hasNextPage = true;
  const options = customOptions || { headers: getHeaders(token) };

  // Implement progressive loading with a callback for UI updates
  while (hasNextPage) {
    try {
      const pageUrl = url.includes('?')
        ? `${url}&page=${page}&per_page=30`
        : `${url}?page=${page}&per_page=30`;

      const response = await fetch(pageUrl, options);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        return data.items ? data.items : (typeof data === 'object' ? [data] : []);
      }

      if (data.length === 0) {
        hasNextPage = false;
      } else {
        allData = [...allData, ...data];

        // Store intermediate results in cache as we fetch
        localStorage.setItem(cacheKey, JSON.stringify(allData));
        localStorage.setItem(`${cacheKey}-timestamp`, Date.now().toString());

        // If we're getting close to rate limits, slow down or pause
        const rateLimit = response.headers.get('X-RateLimit-Remaining');
        if (rateLimit && parseInt(rateLimit) < 20) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        page += 1;
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      hasNextPage = false;
      return allData.length > 0 ? allData : [];
    }
  }

  return allData;
};




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
  const options = {
    headers: {
      ...getHeaders(token),
      'Accept': 'application/vnd.github.inertia-preview+json' // Required for projects API
    },
  };

  try {
    return await fetchAllPages(url, token, options);
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

// Fetch repository contributors directly
export const fetchRepositoryContributors = async (token, owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contributors`;

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
    return [];
  }
};

// Fetch contributors for all repositories
export const fetchAllReposContributors = async (token, repositories) => {
  if (!Array.isArray(repositories) || repositories.length === 0) {
    return [];
  }

  // Limit to first 5 repositories to avoid rate limiting
  const reposToFetch = repositories.slice(0, 5);

  try {
    // Create a map to deduplicate contributors
    const contributorsMap = new Map();

    // Process repositories one by one to avoid rate limits
    for (const repo of reposToFetch) {
      if (!repo || !repo.owner || !repo.owner.login || !repo.name) {
        continue;
      }

      try {
        const contributors = await fetchRepositoryContributors(
          token,
          repo.owner.login,
          repo.name
        );

        if (Array.isArray(contributors)) {
          contributors.forEach(contributor => {
            if (!contributor || !contributor.id) return;

            if (contributorsMap.has(contributor.id)) {
              // Update existing contributor
              const existing = contributorsMap.get(contributor.id);
              existing.contributions += contributor.contributions || 0;

              if (!existing.repositories.includes(repo.name)) {
                existing.repositories.push(repo.name);
              }
            } else {
              // Add new contributor
              contributorsMap.set(contributor.id, {
                ...contributor,
                repositories: [repo.name],
                repoCount: 1,
                pullRequests: 0,
                totalActivity: contributor.contributions || 0
              });
            }
          });
        }

        // Avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing contributors for ${repo.name}:`, error);
      }
    }

    return Array.from(contributorsMap.values());
  } catch (error) {
    console.error('Error fetching all repos contributors:', error);
    return [];
  }
};

// Fetch a specific repository's details including contributors
export const fetchRepositoryWithContributors = async (token, owner, repo) => {
  try {
    const [repoDetails, contributors] = await Promise.all([
      fetchRepoDetails(token, owner, repo),
      fetchRepositoryContributors(token, owner, repo)
    ]);

    return {
      ...repoDetails,
      contributors
    };
  } catch (error) {
    console.error(`Error fetching repository with contributors for ${owner}/${repo}:`, error);
    return null;
  }
};

// Helper function to fetch a specific repository's details
export const fetchRepoDetails = async (token, owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}`;

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching repo details for ${owner}/${repo}:`, error);
    return null;
  }
};
// Function to enrich contributor data with pull request information
export const enrichContributorsWithPRData = (contributors, pullRequests) => {
  if (!Array.isArray(contributors) || !Array.isArray(pullRequests)) {
    return contributors;
  }

  // Create a map of existing contributors for faster lookup
  const contributorsMap = new Map(
    contributors.map(contributor => [contributor.id, contributor])
  );

  // Process pull requests
  pullRequests.forEach(pr => {
    if (!pr || !pr.user || !pr.user.id) return;

    if (contributorsMap.has(pr.user.id)) {
      // Update existing contributor
      const contributor = contributorsMap.get(pr.user.id);
      contributor.pullRequests = (contributor.pullRequests || 0) + 1;

      // Add repository if not already included
      if (pr.base && pr.base.repo && pr.base.repo.name) {
        const repoName = pr.base.repo.name;
        if (!contributor.repositories.includes(repoName)) {
          contributor.repositories.push(repoName);
        }
      }
    } else {
      // Add new contributor from PR
      const repositories = [];
      if (pr.base && pr.base.repo && pr.base.repo.name) {
        repositories.push(pr.base.repo.name);
      }

      contributorsMap.set(pr.user.id, {
        id: pr.user.id,
        login: pr.user.login,
        name: pr.user.name || pr.user.login,
        avatar_url: pr.user.avatar_url,
        html_url: pr.user.html_url,
        contributions: 0,
        pullRequests: 1,
        repositories: repositories
      });
    }
  });

  // Calculate total activity and repo count for each contributor
  return Array.from(contributorsMap.values()).map(contributor => ({
    ...contributor,
    totalActivity: (contributor.contributions || 0) + (contributor.pullRequests || 0),
    repoCount: contributor.repositories ? contributor.repositories.length : 0
  }));
};
// Add these contributor-related functions to your existing githubService.js file

// Fetch contributors for a specific repository
export const fetchRepoContributors = async (token, owner, repo) => {
  try {
    const url = `${API_BASE_URL}/repos/${owner}/${repo}/contributors`;
    const options = {
      headers: getHeaders(token)
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`No contributors found for ${owner}/${repo} or repository not found`);
        return [];
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
    return [];
  }
};

// Extract repository owner and name from various formats
const extractRepoInfo = (repoString) => {
  // Format could be "owner/repo" or just "repo"
  if (!repoString) return null;

  if (repoString.includes('/')) {
    const [owner, repo] = repoString.split('/');
    return { owner, repo };
  }

  // If we only have the repo name, we can't fetch contributors
  return null;
};

// Get full repository name (owner/repo) from repository object
const getFullRepoName = (repo) => {
  if (!repo) return null;

  if (repo.full_name) {
    return repo.full_name;
  }

  if (repo.owner && repo.owner.login && repo.name) {
    return `${repo.owner.login}/${repo.name}`;
  }

  if (repo.name && repo.name.includes('/')) {
    return repo.name;
  }

  return null;
};

// Fetch all contributors for a list of repositories
export const fetchAllRepositoriesContributors = async (token, repositories = []) => {
  if (!Array.isArray(repositories) || repositories.length === 0) {
    return [];
  }

  try {
    const contributorsMap = new Map();
    const processedRepos = new Set();

    // Process up to 5 repositories to avoid rate limiting
    const reposToProcess = repositories.slice(0, 5);

    for (const repo of reposToProcess) {
      const fullName = getFullRepoName(repo);

      if (!fullName || processedRepos.has(fullName)) continue;
      processedRepos.add(fullName);

      const repoInfo = extractRepoInfo(fullName);
      if (!repoInfo) continue;

      const { owner, repo: repoName } = repoInfo;

      try {
        const contributors = await fetchRepoContributors(token, owner, repoName);

        contributors.forEach(contributor => {
          if (!contributor || !contributor.id) return;

          if (contributorsMap.has(contributor.id)) {
            // Update existing contributor
            const existing = contributorsMap.get(contributor.id);
            existing.contributions += contributor.contributions || 0;

            if (!existing.repositories.includes(fullName)) {
              existing.repositories.push(fullName);
            }
          } else {
            // Add new contributor
            contributorsMap.set(contributor.id, {
              ...contributor,
              repositories: [fullName],
              repoCount: 1,
              pullRequests: 0,
              totalActivity: contributor.contributions || 0
            });
          }
        });

        // Add a delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing contributors for ${fullName}:`, error);
      }
    }

    return Array.from(contributorsMap.values());
  } catch (error) {
    console.error('Error fetching all repositories contributors:', error);
    return [];
  }
};

// Extract repository information from PR objects
const extractReposFromPRs = (pullRequests) => {
  if (!Array.isArray(pullRequests)) return [];

  const repoSet = new Set();

  pullRequests.forEach(pr => {
    // Try different possible locations for repository info
    if (pr.repository) {
      repoSet.add(pr.repository);
    } else if (pr.base && pr.base.repo && pr.base.repo.full_name) {
      repoSet.add(pr.base.repo.full_name);
    } else if (pr.html_url) {
      const match = pr.html_url.match(/github\.com\/([^\/]+\/[^\/]+)/);
      if (match && match[1]) {
        repoSet.add(match[1]);
      }
    }
  });

  return Array.from(repoSet);
};

// Enhance contributor data with PR author info
const enhanceWithPRAuthors = (contributors, pullRequests) => {
  if (!Array.isArray(pullRequests) || !Array.isArray(contributors)) {
    return contributors;
  }

  const contributorMap = new Map(
    contributors.map(contributor => [contributor.id, contributor])
  );

  pullRequests.forEach(pr => {
    if (!pr.user || !pr.user.id) return;

    if (contributorMap.has(pr.user.id)) {
      // Update existing contributor
      const contributor = contributorMap.get(pr.user.id);
      contributor.pullRequests = (contributor.pullRequests || 0) + 1;
      contributor.totalActivity = (contributor.contributions || 0) + contributor.pullRequests;

      // Add repo if it's not already included
      if (pr.repository && !contributor.repositories.includes(pr.repository)) {
        contributor.repositories.push(pr.repository);
        contributor.repoCount = contributor.repositories.length;
      }
    } else {
      // Add new contributor
      const repositories = [];
      if (pr.repository) repositories.push(pr.repository);

      contributorMap.set(pr.user.id, {
        id: pr.user.id,
        login: pr.user.login,
        name: pr.user.name || pr.user.login,
        avatar_url: pr.user.avatar_url,
        html_url: pr.user.html_url,
        contributions: 0,
        pullRequests: 1,
        repositories: repositories,
        repoCount: repositories.length,
        totalActivity: 1
      });
    }
  });

  return Array.from(contributorMap.values());
};

// Comprehensive function to fetch all contributors data
export const fetchAllContributorData = async (token, repositories = [], pullRequests = []) => {
  try {
    // 1. First try to get contributors from repositories
    let contributors = await fetchAllRepositoriesContributors(token, repositories);

    // 2. Try to extract repository names from PRs and fetch their contributors
    if (Array.isArray(pullRequests) && pullRequests.length > 0) {
      const repoNames = extractReposFromPRs(pullRequests);

      // Transform repo names into objects for the repository contributor fetcher
      const repoObjects = repoNames.map(name => ({ name }));

      const prContributors = await fetchAllRepositoriesContributors(token, repoObjects);

      // Merge the two contributor lists
      if (prContributors.length > 0) {
        const contributorMap = new Map();

        // Add existing contributors
        contributors.forEach(contributor => {
          contributorMap.set(contributor.id, contributor);
        });

        // Merge with PR repository contributors
        prContributors.forEach(contributor => {
          if (contributorMap.has(contributor.id)) {
            // Update existing contributor
            const existing = contributorMap.get(contributor.id);
            existing.contributions += contributor.contributions || 0;

            // Add repositories
            contributor.repositories.forEach(repo => {
              if (!existing.repositories.includes(repo)) {
                existing.repositories.push(repo);
              }
            });

            existing.repoCount = existing.repositories.length;
            existing.totalActivity = existing.contributions + (existing.pullRequests || 0);
          } else {
            // Add new contributor
            contributorMap.set(contributor.id, contributor);
          }
        });

        contributors = Array.from(contributorMap.values());
      }
    }

    // 3. Enhance with PR author information
    contributors = enhanceWithPRAuthors(contributors, pullRequests);

    return contributors;
  } catch (error) {
    console.error('Error fetching all contributor data:', error);
    return [];
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
  const options = {
    headers: getHeaders(token)
  };
  try {
    return await fetchAllPages(url, token, options);
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