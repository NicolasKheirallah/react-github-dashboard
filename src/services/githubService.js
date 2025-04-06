// src/services/githubService.js

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

// Function to fetch all GitHub data in parallel with improved error handling
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
      userEvents
    ] = await Promise.all([
      fetchPullRequests(token),
      fetchIssuesCreated(token),
      fetchRepositories(token),
      fetchOrganizations(token),
      fetchStarredRepos(token),
      fetchUserEvents(token)
    ]);
    
    return {
      userProfile,
      pullRequests,
      issuesCreated,
      repositories,
      organizations,
      starredRepos,
      userEvents
    };
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    throw error;
  }
};