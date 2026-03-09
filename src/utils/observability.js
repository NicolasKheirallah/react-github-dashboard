const OBSERVABILITY_ENDPOINT = import.meta.env.VITE_OBSERVABILITY_ENDPOINT;
const TOKEN_PATTERNS = [
  /github_pat_[A-Za-z0-9_]+/g,
  /\bgh[pousr]_[A-Za-z0-9_]+\b/g,
  /(Authorization["':\s]+(?:token|Bearer)\s+)[^\s"',]+/gi,
];
const IGNORED_ERROR_PATTERNS = [
  /chrome-extension:\/\//i,
  /runtime\.lastError/i,
  /FrameIsBrowserFrameError/i,
  /FrameDoesNotExistError/i,
  /Receiving end does not exist/i,
  /message port closed before a response was received/i,
];

const redactString = (value) =>
  TOKEN_PATTERNS.reduce((sanitizedValue, pattern) => {
    if (pattern.source.includes('Authorization')) {
      return sanitizedValue.replace(pattern, '$1[REDACTED]');
    }

    return sanitizedValue.replace(pattern, '[REDACTED]');
  }, value);

const sanitizeTelemetry = (value, key = '') => {
  if (typeof value === 'string') {
    return redactString(value);
  }

  if (value instanceof Error) {
    return {
      name: sanitizeTelemetry(value.name),
      message: sanitizeTelemetry(value.message),
      stack: sanitizeTelemetry(value.stack),
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeTelemetry(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        /(token|authorization|auth)/i.test(entryKey)
          ? '[REDACTED]'
          : sanitizeTelemetry(entryValue, entryKey),
      ])
    );
  }

  if (/(token|authorization|auth)/i.test(key)) {
    return '[REDACTED]';
  }

  return value;
};

const shouldIgnoreError = (error) => {
  const normalized = error instanceof Error ? `${error.message}\n${error.stack || ''}` : String(error);
  return IGNORED_ERROR_PATTERNS.some((pattern) => pattern.test(normalized));
};

const sendPayload = (type, payload) => {
  if (!OBSERVABILITY_ENDPOINT) {
    return;
  }

  const body = JSON.stringify({
    type,
    payload: sanitizeTelemetry(payload),
    timestamp: new Date().toISOString(),
    pathname: window.location.pathname,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(OBSERVABILITY_ENDPOINT, body);
    return;
  }

  fetch(OBSERVABILITY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
};

export const logEvent = (level, message, metadata = {}) => {
  const sanitizedMessage = sanitizeTelemetry(message);
  const sanitizedMetadata = sanitizeTelemetry(metadata);

  if (import.meta.env.DEV) {
    if (level === 'error') {
      console.error(sanitizedMessage, sanitizedMetadata);
    } else if (level === 'warn') {
      console.warn(sanitizedMessage, sanitizedMetadata);
    }
  }

  sendPayload('log', { level, message: sanitizedMessage, metadata: sanitizedMetadata });
};

export const captureError = (error, metadata = {}) => {
  if (shouldIgnoreError(error)) {
    return;
  }

  const normalizedError = error instanceof Error ? error : new Error(String(error));

  logEvent('error', normalizedError.message, {
    ...metadata,
    stack: normalizedError.stack,
    name: normalizedError.name,
  });
};

export const captureMetric = (metric) => {
  sendPayload('metric', metric);
};

export const initClientMonitoring = () => {
  window.addEventListener('error', (event) => {
    captureError(event.error || event.message, { source: 'window.error' });
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason, { source: 'window.unhandledrejection' });
  });
};
