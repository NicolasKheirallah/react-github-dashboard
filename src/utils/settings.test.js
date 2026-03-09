import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SETTINGS_STORAGE_KEYS,
  applyImportedSettings,
  buildSettingsExport,
  parseImportedSettings,
} from './settings';

const baseWidget = {
  id: 'activity-heatmap',
  title: 'Activity Overview',
  description: 'Shows activity over time',
  category: 'activity',
  size: 'large',
  hidden: false,
  favorite: false,
};

describe('settings', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.className = '';
    vi.restoreAllMocks();
  });

  it('builds an export from validated storage-backed settings', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEYS.useCustomDashboard, 'true');
    localStorage.setItem(SETTINGS_STORAGE_KEYS.dashboardView, 'compact');
    localStorage.setItem(
      SETTINGS_STORAGE_KEYS.dashboardLayout,
      JSON.stringify([baseWidget])
    );
    sessionStorage.setItem(
      SETTINGS_STORAGE_KEYS.advancedFilters,
      JSON.stringify([
        {
          id: 'recent',
          name: 'Recent',
          conditions: [{ field: 'state', operator: 'eq', value: 'open' }],
        },
      ])
    );
    sessionStorage.setItem(
      SETTINGS_STORAGE_KEYS.recentSearches,
      JSON.stringify(['react', 'vite'])
    );
    document.documentElement.classList.add('dark');

    expect(buildSettingsExport()).toMatchObject({
      version: 1,
      theme: 'dark',
      useCustomDashboard: true,
      dashboardView: 'compact',
      dashboardLayout: [baseWidget],
      recentSearches: ['react', 'vite'],
    });
  });

  it('rejects invalid imported dashboard layout payloads', () => {
    expect(() =>
      parseImportedSettings(
        JSON.stringify({
          dashboardLayout: [{ id: 'activity-heatmap', size: 'giant' }],
        })
      )
    ).toThrow('The settings file contains an invalid dashboard layout.');
  });

  it('rejects unsupported imported settings fields', () => {
    expect(() =>
      parseImportedSettings(
        JSON.stringify({
          theme: 'dark',
          unexpectedField: true,
        })
      )
    ).toThrow('The settings file contains unsupported fields.');
  });

  it('applies imported settings safely', () => {
    applyImportedSettings({
      theme: 'dark',
      useCustomDashboard: true,
      dashboardView: 'default',
      dashboardLayout: [baseWidget],
      advancedFilters: [
        {
          id: 'recent',
          name: 'Recent',
          conditions: [{ field: 'state', operator: 'eq', value: 'open' }],
        },
      ],
      recentSearches: Array.from({ length: 12 }, (_, index) => `search-${index}`),
    });

    expect(localStorage.getItem(SETTINGS_STORAGE_KEYS.useCustomDashboard)).toBe(
      'true'
    );
    expect(localStorage.getItem(SETTINGS_STORAGE_KEYS.dashboardView)).toBe(
      'default'
    );
    expect(
      JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEYS.dashboardLayout))
    ).toEqual([baseWidget]);
    expect(
      JSON.parse(sessionStorage.getItem(SETTINGS_STORAGE_KEYS.recentSearches))
    ).toHaveLength(10);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
