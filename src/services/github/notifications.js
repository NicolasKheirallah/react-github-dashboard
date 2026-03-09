import { API_BASE_URL, withGithubRequestOptions } from './apiClient';

export const fetchNotifications = async (token, requestOptions = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications?all=false`, {
      ...withGithubRequestOptions(token, requestOptions),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch {
    return [];
  }
};

export const markNotificationAsRead = async (token, notificationId, requestOptions = {}) => {
  const response = await fetch(`${API_BASE_URL}/notifications/threads/${notificationId}`, {
    method: 'PATCH',
    ...withGithubRequestOptions(token, requestOptions),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return true;
};
