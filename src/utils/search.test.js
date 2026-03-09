import { describe, expect, it } from 'vitest';
import {
  buildSearchItems,
  filterSearchItems,
  getSearchLanguages,
  groupSearchItems,
  matchesStarsFilter,
  parseSearchQuery,
  sortSearchItems,
} from './search';

const searchItems = buildSearchItems({
  repositories: [
    {
      name: 'openai/dashboard',
      description: 'React dashboard',
      language: 'JavaScript',
      stars: 42,
      forks: 10,
      updated: '2026-02-01',
      url: 'https://github.com/openai/dashboard',
      private: false,
    },
  ],
  pullRequests: [
    {
      number: 7,
      repository: 'openai/dashboard',
      title: 'Fix search',
      labels: 'bug',
      state: 'open',
      updated: '2026-02-10',
      url: 'https://github.com/openai/dashboard/pull/7',
    },
  ],
  issues: [
    {
      number: 8,
      repository: 'openai/dashboard',
      title: 'Improve accessibility',
      labels: 'a11y',
      state: 'closed',
      updated: '2026-02-03',
      url: 'https://github.com/openai/dashboard/issues/8',
    },
  ],
  organizations: [
    {
      login: 'openai',
      name: 'OpenAI',
      description: 'AI research',
      url: 'https://github.com/openai',
    },
  ],
  starredRepos: [
    {
      name: 'openai/vite-starter',
      description: 'Starter',
      language: 'TypeScript',
      stars: 100,
      updated: '2026-01-01',
      url: 'https://github.com/openai/vite-starter',
    },
  ],
});

describe('search utils', () => {
  it('parses structured search filters and free text', () => {
    expect(parseSearchQuery('language:javascript state:open fix search')).toEqual({
      filters: {
        language: 'javascript',
        state: 'open',
      },
      freeText: 'fix search',
    });
  });

  it('matches star filters with supported operators', () => {
    expect(matchesStarsFilter({ stars: 42 }, '>10')).toBe(true);
    expect(matchesStarsFilter({ stars: 42 }, '<10')).toBe(false);
    expect(matchesStarsFilter({ stars: 42 }, '>=42')).toBe(true);
  });

  it('filters search results from parsed query parts', () => {
    const results = filterSearchItems(searchItems, {
      queryParts: parseSearchQuery('type:pull-requests state:open fix'),
      userLogin: 'jane',
    });

    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('pull-requests');
    expect(results[0].title).toContain('Fix search');
  });

  it('collects languages, sorts, and groups results', () => {
    const filtered = filterSearchItems(searchItems, {
      queryParts: parseSearchQuery('openai'),
      userLogin: 'jane',
    });

    expect(getSearchLanguages(filtered)).toEqual(['all', 'JavaScript', 'TypeScript']);

    const sorted = sortSearchItems(filtered, 'stars');
    expect(sorted[0].stars).toBe(100);

    const grouped = groupSearchItems(sorted, 'type');
    expect(grouped[0].isGroupHeader).toBe(true);
    expect(grouped.some((item) => item.groupName === 'repositories')).toBe(true);
  });
});
