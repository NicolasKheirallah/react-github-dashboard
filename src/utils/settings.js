import {
  readJsonStorage,
  readStorageValue,
  writeJsonStorage,
  writeStorageValue,
} from './storage';

const STORAGE_KEYS = {
  dashboardLayout: 'dashboard-layout',
  dashboardView: 'github-dashboard-view',
  advancedFilters: 'github-advanced-filters',
  recentSearches: 'github-recent-searches',
  useCustomDashboard: 'use-custom-dashboard',
};
const SESSION_STORAGE_KEYS = new Set([
  STORAGE_KEYS.advancedFilters,
  STORAGE_KEYS.recentSearches,
]);
const MAX_IMPORT_BYTES = 100 * 1024;
const VALID_DASHBOARD_VIEWS = new Set(['default', 'contributors', 'analytics', 'compact']);
const ALLOWED_IMPORT_KEYS = new Set([
  'version',
  'exportedAt',
  'theme',
  'useCustomDashboard',
  'dashboardView',
  'dashboardLayout',
  'advancedFilters',
  'recentSearches',
]);

const getStorageType = (key) =>
  SESSION_STORAGE_KEYS.has(key) ? 'session' : 'local';

const isValidCondition = (condition) => {
  return Boolean(
    condition &&
      typeof condition === 'object' &&
      typeof condition.field === 'string' &&
      typeof condition.operator === 'string' &&
      typeof condition.value !== 'undefined'
  );
};

const isValidFilterPreset = (preset) => {
  return Boolean(
    preset &&
      typeof preset === 'object' &&
      typeof preset.id === 'string' &&
      typeof preset.name === 'string' &&
      Array.isArray(preset.conditions) &&
      preset.conditions.every(isValidCondition)
  );
};

const isValidDashboardWidget = (widget) => {
  return Boolean(
    widget &&
      typeof widget === 'object' &&
      typeof widget.id === 'string' &&
      typeof widget.title === 'string' &&
      typeof widget.description === 'string' &&
      typeof widget.category === 'string' &&
      ['small', 'medium', 'large'].includes(widget.size) &&
      typeof widget.hidden === 'boolean' &&
      typeof widget.favorite === 'boolean'
  );
};

export const buildSettingsExport = () => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  useCustomDashboard:
    readStorageValue(STORAGE_KEYS.useCustomDashboard, 'false', 'local') === 'true',
  dashboardView: readStorageValue(STORAGE_KEYS.dashboardView, 'default', 'local'),
  dashboardLayout: readJsonStorage(STORAGE_KEYS.dashboardLayout, [], 'local'),
  advancedFilters: readJsonStorage(STORAGE_KEYS.advancedFilters, [], 'session'),
  recentSearches: readJsonStorage(STORAGE_KEYS.recentSearches, [], 'session'),
});

export const downloadSettingsFile = (settings) => {
  const blob = new Blob([JSON.stringify(settings, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'github-dashboard-settings.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseImportedSettings = (rawText) => {
  if (typeof rawText !== 'string' || rawText.length > MAX_IMPORT_BYTES) {
    throw new Error('The selected file is too large to import safely.');
  }

  let parsed;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('The selected file does not contain a valid settings payload.');
  }

  const unexpectedKeys = Object.keys(parsed).filter((key) => !ALLOWED_IMPORT_KEYS.has(key));

  if (unexpectedKeys.length > 0) {
    throw new Error('The settings file contains unsupported fields.');
  }

  const theme = parsed.theme;
  const dashboardView = parsed.dashboardView;
  const useCustomDashboard = parsed.useCustomDashboard;
  const dashboardLayout = parsed.dashboardLayout;
  const advancedFilters = parsed.advancedFilters;
  const recentSearches = parsed.recentSearches;

  if (theme && !['light', 'dark'].includes(theme)) {
    throw new Error('The settings file contains an invalid theme value.');
  }

  if (
    dashboardView &&
    (typeof dashboardView !== 'string' || !VALID_DASHBOARD_VIEWS.has(dashboardView))
  ) {
    throw new Error('The settings file contains an invalid dashboard view value.');
  }

  if (
    typeof useCustomDashboard !== 'undefined' &&
    typeof useCustomDashboard !== 'boolean'
  ) {
    throw new Error('The settings file contains an invalid dashboard toggle value.');
  }

  if (
    typeof dashboardLayout !== 'undefined' &&
    (!Array.isArray(dashboardLayout) ||
      !dashboardLayout.every(isValidDashboardWidget))
  ) {
    throw new Error('The settings file contains an invalid dashboard layout.');
  }

  if (
    typeof advancedFilters !== 'undefined' &&
    (!Array.isArray(advancedFilters) || !advancedFilters.every(isValidFilterPreset))
  ) {
    throw new Error('The settings file contains invalid advanced filters.');
  }

  if (
    typeof recentSearches !== 'undefined' &&
    (!Array.isArray(recentSearches) ||
      recentSearches.some((item) => typeof item !== 'string'))
  ) {
    throw new Error('The settings file contains invalid recent searches.');
  }

  return parsed;
};

export const applyImportedSettings = (settings) => {
  if (typeof settings.useCustomDashboard === 'boolean') {
    writeStorageValue(
      STORAGE_KEYS.useCustomDashboard,
      String(settings.useCustomDashboard),
      'local'
    );
  }

  if (typeof settings.dashboardView === 'string') {
    writeStorageValue(STORAGE_KEYS.dashboardView, settings.dashboardView, 'local');
  }

  if (Array.isArray(settings.dashboardLayout)) {
    writeJsonStorage(STORAGE_KEYS.dashboardLayout, settings.dashboardLayout, 'local');
  }

  if (Array.isArray(settings.advancedFilters)) {
    writeJsonStorage(
      STORAGE_KEYS.advancedFilters,
      settings.advancedFilters,
      getStorageType(STORAGE_KEYS.advancedFilters)
    );
  }

  if (Array.isArray(settings.recentSearches)) {
    writeJsonStorage(
      STORAGE_KEYS.recentSearches,
      settings.recentSearches.slice(0, 10),
      getStorageType(STORAGE_KEYS.recentSearches)
    );
  }

  if (settings.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (settings.theme === 'light') {
    document.documentElement.classList.remove('dark');
  }
};

export const SETTINGS_STORAGE_KEYS = STORAGE_KEYS;
