const getStorage = (type = 'local') => {
  if (typeof window === 'undefined') {
    return null;
  }

  return type === 'session' ? window.sessionStorage : window.localStorage;
};

export const readStorageValue = (key, fallback = null, type = 'local') => {
  try {
    const storage = getStorage(type);
    const value = storage?.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeStorageValue = (key, value, type = 'local') => {
  try {
    const storage = getStorage(type);
    storage?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const removeStorageValue = (key, type = 'local') => {
  try {
    const storage = getStorage(type);
    storage?.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const readJsonStorage = (key, fallback, type = 'local') => {
  const value = readStorageValue(key, null, type);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const writeJsonStorage = (key, value, type = 'local') =>
  writeStorageValue(key, JSON.stringify(value), type);
