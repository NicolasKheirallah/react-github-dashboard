import {
  API_BASE_URL,
  fetchAllPages,
  fetchWithRetry,
  withGithubRequestOptions,
} from './apiClient';
import { testTokenValidity } from './session';

export const fetchUserProfile = async (token, requestOptions = {}) =>
  fetchWithRetry(`${API_BASE_URL}/user`, withGithubRequestOptions(token, requestOptions));

export const fetchPullRequests = async (token, requestOptions = {}) => {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/search/issues?q=author:@me+is:pr&sort=created&order=desc`,
      withGithubRequestOptions(token, requestOptions)
    );
    return response.items || [];
  } catch {
    return [];
  }
};

export const fetchIssuesCreated = async (token, requestOptions = {}) => {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/search/issues?q=author:@me+is:issue&sort=created&order=desc`,
      withGithubRequestOptions(token, requestOptions)
    );
    return response.items || [];
  } catch {
    return [];
  }
};

export const fetchRepositories = async (token, requestOptions = {}) =>
  fetchAllPages(`${API_BASE_URL}/user/repos?sort=updated`, token, requestOptions).catch(
    () => []
  );

export const fetchOrganizations = async (token, requestOptions = {}) =>
  fetchAllPages(`${API_BASE_URL}/user/orgs`, token, requestOptions).catch(() => []);

export const fetchStarredRepos = async (token, requestOptions = {}) =>
  fetchAllPages(`${API_BASE_URL}/user/starred?sort=updated`, token, requestOptions).catch(
    () => []
  );

export const fetchFollowers = async (token, requestOptions = {}) =>
  fetchAllPages(`${API_BASE_URL}/user/followers`, token, requestOptions).catch(() => []);

export const fetchFollowing = async (token, requestOptions = {}) =>
  fetchAllPages(`${API_BASE_URL}/user/following`, token, requestOptions).catch(() => []);

export const fetchUserEvents = async (token, requestOptions = {}) => {
  try {
    const userProfile = await fetchUserProfile(token, requestOptions);
    const username = userProfile.login;

    if (!username) {
      throw new Error('Could not determine username from profile');
    }

    return await fetchAllPages(`${API_BASE_URL}/users/${username}/events`, token, requestOptions);
  } catch {
    return [];
  }
};

export const fetchAllGithubData = async (token, requestOptions = {}) => {
  const isValid = await testTokenValidity(token);

  if (!isValid) {
    throw new Error('Invalid token or insufficient permissions');
  }

  const userProfile = await fetchUserProfile(token, requestOptions);
  const [
    pullRequests,
    issuesCreated,
    repositories,
    organizations,
    starredRepos,
    userEvents,
    followers,
    following,
  ] = await Promise.all([
    fetchPullRequests(token, requestOptions),
    fetchIssuesCreated(token, requestOptions),
    fetchRepositories(token, requestOptions),
    fetchOrganizations(token, requestOptions),
    fetchStarredRepos(token, requestOptions),
    fetchUserEvents(token, requestOptions),
    fetchFollowers(token, requestOptions),
    fetchFollowing(token, requestOptions),
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
    following,
  };
};
