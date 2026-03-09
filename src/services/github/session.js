import { API_BASE_URL, fetchWithRetry, getHeaders } from './apiClient';

export const testTokenValidity = async (token) => {
  try {
    await fetchWithRetry(`${API_BASE_URL}/user`, {
      headers: getHeaders(token),
    });
    return true;
  } catch {
    return false;
  }
};
