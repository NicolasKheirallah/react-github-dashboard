export const API_BASE_URL = 'https://api.github.com';
const CACHE_TTL_MS = 5 * 60 * 1000;
const githubResponseCache = new Map();

export const getHeaders = (token) => ({
  Authorization: `token ${token}`,
  Accept: 'application/vnd.github.v3+json',
});

export const withGithubRequestOptions = (token, customOptions = {}) => ({
  ...customOptions,
  headers: {
    ...getHeaders(token),
    ...(customOptions.headers || {}),
  },
});

const createGithubApiError = (response, url) => {
  const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
  const rateLimitReset = response.headers.get('X-RateLimit-Reset');
  const isRateLimited = response.status === 403 && rateLimitRemaining === '0';
  const resetMessage =
    isRateLimited && rateLimitReset
      ? ` GitHub rate limit resets at ${new Date(Number(rateLimitReset) * 1000).toLocaleTimeString()}.`
      : '';

  const error = new Error(
    isRateLimited
      ? `GitHub API rate limit reached.${resetMessage}`
      : `GitHub API error: ${response.status} ${response.statusText}`
  );
  error.status = response.status;
  error.isRateLimited = isRateLimited;
  try {
    error.url = new URL(url).pathname;
  } catch {
    error.url = url;
  }
  return error;
};

export const clearGithubApiCache = () => {
  githubResponseCache.clear();
};

export const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url, options);

    if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const waitTime = Math.max(resetTime * 1000 - Date.now(), 0);

      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime || delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
    }

    if (!response.ok) {
      throw createGithubApiError(response, url);
    }

    return response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }

    throw error;
  }
};

export const fetchAllPages = async (url, token, customOptions = null) => {
  const cacheKey = url;
  const cachedEntry = githubResponseCache.get(cacheKey);

  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
    return cachedEntry.data;
  }

  let page = 1;
  let allData = [];
  let hasNextPage = true;
  const options = withGithubRequestOptions(token, customOptions || {});

  while (hasNextPage) {
    try {
      const pageUrl = url.includes('?')
        ? `${url}&page=${page}&per_page=30`
        : `${url}?page=${page}&per_page=30`;

      const response = await fetch(pageUrl, options);

      if (!response.ok) {
        throw createGithubApiError(response, pageUrl);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        return data.items ? data.items : typeof data === 'object' ? [data] : [];
      }

      if (data.length === 0) {
        hasNextPage = false;
      } else {
        allData = [...allData, ...data];
        githubResponseCache.set(cacheKey, {
          data: allData,
          timestamp: Date.now(),
        });

        const rateLimit = response.headers.get('X-RateLimit-Remaining');
        if (rateLimit && Number.parseInt(rateLimit, 10) < 20) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        page += 1;
      }
    } catch {
      hasNextPage = false;
      return allData.length > 0 ? allData : [];
    }
  }

  return allData;
};
