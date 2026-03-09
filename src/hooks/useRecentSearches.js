import { useCallback, useEffect, useState } from 'react';
import {
  readJsonStorage,
  removeStorageValue,
  writeJsonStorage,
} from '../utils/storage';

export const useRecentSearches = (storageKey, limit = 10) => {
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    setRecentSearches(readJsonStorage(storageKey, [], 'session'));
  }, [storageKey]);

  const saveSearch = useCallback(
    (query) => {
      if (!query.trim()) {
        return;
      }

      setRecentSearches((currentSearches) => {
        const nextSearches = [query, ...currentSearches.filter((item) => item !== query)].slice(
          0,
          limit
        );
        writeJsonStorage(storageKey, nextSearches, 'session');
        return nextSearches;
      });
    },
    [limit, storageKey]
  );

  const clearSearches = useCallback(() => {
    setRecentSearches([]);
    removeStorageValue(storageKey, 'session');
  }, [storageKey]);

  return { recentSearches, saveSearch, clearSearches };
};
