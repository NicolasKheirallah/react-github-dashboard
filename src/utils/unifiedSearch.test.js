import { describe, expect, it } from 'vitest';
import {
  buildUnifiedSearchResults,
  isWithinUnifiedSearchTimeRange,
} from './unifiedSearch';

describe('unifiedSearch', () => {
  it('filters repository and pull request results by query and time range', () => {
    const results = buildUnifiedSearchResults({
      repositories: [
        {
          name: 'openai/react-github-dashboard',
          description: 'Dashboard app',
          url: 'https://github.com/openai/react-github-dashboard',
          stars: 10,
          language: 'JavaScript',
          updated: '2026-03-01',
        },
      ],
      pullRequests: [
        {
          repository: 'openai/react-github-dashboard',
          number: 12,
          title: 'Improve dashboard scope',
          labels: 'dashboard, ux',
          url: 'https://github.com/openai/react-github-dashboard/pull/12',
          state: 'open',
          stateLabel: 'Open',
          updated: '2026-03-02',
        },
      ],
      query: 'dashboard',
      selectedCategory: 'all',
      timeRange: 'month',
    });

    expect(results).toHaveLength(2);
    expect(results[0].title.toLowerCase()).toContain('dashboard');
  });

  it('matches time ranges safely when dates are missing or recent', () => {
    expect(isWithinUnifiedSearchTimeRange('', 'week')).toBe(true);
    expect(isWithinUnifiedSearchTimeRange('2026-03-08', 'week')).toBe(true);
  });
});
