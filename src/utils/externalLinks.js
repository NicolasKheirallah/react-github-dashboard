const getDefaultBaseUrl = () =>
  typeof window !== 'undefined' ? window.location.origin : 'https://github.com';

const isAllowedHost = (hostname, allowedHosts = []) => {
  if (!allowedHosts || allowedHosts.length === 0) {
    return true;
  }

  return allowedHosts.some(
    (allowedHost) => hostname === allowedHost || hostname.endsWith(`.${allowedHost}`)
  );
};

export const getSafeExternalUrl = (
  value,
  optionsOrBaseUrl = getDefaultBaseUrl()
) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  try {
    const options =
      typeof optionsOrBaseUrl === 'string'
        ? { baseUrl: optionsOrBaseUrl }
        : optionsOrBaseUrl || {};
    const url = new URL(value, options.baseUrl || getDefaultBaseUrl());

    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    if (!isAllowedHost(url.hostname, options.allowedHosts)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
};

export const getSafeGithubWebUrl = (value) => {
  const safeUrl = getSafeExternalUrl(value, {
    allowedHosts: ['github.com', 'www.github.com', 'docs.github.com', 'api.github.com'],
  });

  if (!safeUrl) {
    return null;
  }

  const url = new URL(safeUrl);

  if (url.hostname === 'api.github.com' && url.pathname.startsWith('/repos/')) {
    const [, , owner, repo, ...rest] = url.pathname.split('/');
    return getSafeExternalUrl(`https://github.com/${[owner, repo, ...rest].join('/')}`, {
      allowedHosts: ['github.com', 'www.github.com'],
    });
  }

  return getSafeExternalUrl(safeUrl, {
    allowedHosts: ['github.com', 'www.github.com', 'docs.github.com'],
  });
};

export const openExternalUrl = (
  value,
  opener = typeof window !== 'undefined' ? window.open : () => null,
  options = {}
) => {
  const safeUrl = getSafeExternalUrl(value, options);

  if (!safeUrl) {
    return false;
  }

  opener(safeUrl, '_blank', 'noopener,noreferrer');
  return true;
};
