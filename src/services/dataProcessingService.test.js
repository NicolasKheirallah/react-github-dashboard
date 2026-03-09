import { describe, expect, it } from 'vitest';
import {
  generateAnalytics,
  processIssues,
  processOrganizations,
  processPullRequests,
  processRepositories,
  processStarredRepos,
} from './dataProcessingService';

describe('dataProcessingService', () => {
  it('normalizes pull request state and preserves diff stats', () => {
    const [mergedPr, closedPr, openPr] = processPullRequests([
      {
        number: 1,
        repository_url: 'https://api.github.com/repos/openai/react-github-dashboard',
        title: 'Merged PR',
        state: 'closed',
        created_at: '2026-01-01T12:00:00Z',
        updated_at: '2026-01-05T12:00:00Z',
        closed_at: '2026-01-05T12:00:00Z',
        labels: [{ name: 'feature' }],
        comments: 2,
        html_url: 'https://github.com/openai/react-github-dashboard/pull/1',
        additions: 25,
        deletions: 10,
        pull_request: { merged_at: '2026-01-05T12:00:00Z' },
      },
      {
        number: 2,
        repository_url: 'https://api.github.com/repos/openai/react-github-dashboard',
        title: 'Closed PR',
        state: 'closed',
        created_at: '2026-01-03T12:00:00Z',
        updated_at: '2026-01-04T12:00:00Z',
        closed_at: '2026-01-04T12:00:00Z',
        labels: [],
        comments: 0,
        html_url: 'https://github.com/openai/react-github-dashboard/pull/2',
        pull_request: { merged_at: null },
      },
      {
        number: 3,
        repository_url: 'https://api.github.com/repos/openai/react-github-dashboard',
        title: 'Open PR',
        state: 'open',
        created_at: '2026-01-04T12:00:00Z',
        updated_at: '2026-01-06T12:00:00Z',
        closed_at: null,
        labels: [],
        comments: 1,
        html_url: 'https://github.com/openai/react-github-dashboard/pull/3',
        pull_request: {},
      },
    ]);

    expect(mergedPr.state).toBe('merged');
    expect(mergedPr.stateLabel).toBe('Merged');
    expect(mergedPr.additions).toBe(25);
    expect(mergedPr.deletions).toBe(10);
    expect(closedPr.state).toBe('closed');
    expect(openPr.state).toBe('open');
  });

  it('filters pull request-shaped issues and preserves label names for issues', () => {
    const processedIssues = processIssues([
      {
        number: 10,
        repository_url: 'https://api.github.com/repos/openai/react-github-dashboard',
        title: 'Bug report',
        state: 'open',
        created_at: '2026-01-02T12:00:00Z',
        updated_at: '2026-01-03T12:00:00Z',
        closed_at: null,
        labels: [{ name: 'bug' }, { name: 'priority:high' }],
        comments: 3,
        html_url: 'https://github.com/openai/react-github-dashboard/issues/10',
      },
      {
        number: 11,
        repository_url: 'https://api.github.com/repos/openai/react-github-dashboard',
        title: 'Should be skipped',
        state: 'open',
        created_at: '2026-01-02T12:00:00Z',
        updated_at: '2026-01-03T12:00:00Z',
        labels: [],
        comments: 0,
        html_url: 'https://github.com/openai/react-github-dashboard/issues/11',
        pull_request: {},
      },
    ]);

    expect(processedIssues).toHaveLength(1);
    expect(processedIssues[0].labelNames).toEqual(['bug', 'priority:high']);
    expect(processedIssues[0].labels).toBe('bug, priority:high');
  });

  it('normalizes repository, organization, and starred repository fields', () => {
    const [repository] = processRepositories([
      {
        full_name: 'openai/react-github-dashboard',
        description: 'Dashboard',
        language: 'JavaScript',
        stargazers_count: 42,
        forks_count: 10,
        watchers_count: 12,
        private: true,
        archived: false,
        fork: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        html_url: 'https://github.com/openai/react-github-dashboard',
        topics: ['dashboard'],
        size: 128,
      },
    ]);
    const [organization] = processOrganizations([
      {
        login: 'openai',
        name: 'OpenAI',
        description: 'AI research',
        html_url: 'https://github.com/openai',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
      },
    ]);
    const [starred] = processStarredRepos([
      {
        full_name: 'openai/gpt',
        description: 'LLM repo',
        language: 'TypeScript',
        stargazers_count: 100,
        html_url: 'https://github.com/openai/gpt',
        topics: ['ai'],
      },
    ]);

    expect(repository.private).toBe(true);
    expect(repository.isPrivate).toBe(true);
    expect(repository.fork).toBe(false);
    expect(repository.isFork).toBe(false);
    expect(organization.name).toBe('OpenAI');
    expect(starred.stars).toBe(100);
  });

  it('builds analytics from processed models', () => {
    const analytics = generateAnalytics({
      prs: [
        {
          state: 'open',
          createdDateTime: new Date('2026-01-10T12:00:00Z'),
          dayOfWeek: 'Friday',
          hourCreated: 12,
        },
      ],
      issues: [
        {
          createdDateTime: new Date('2026-01-11T12:00:00Z'),
          dayOfWeek: 'Saturday',
          hourCreated: 13,
        },
      ],
      repos: [
        {
          language: 'JavaScript',
          stars: 5,
          isPrivate: false,
          isFork: false,
          topics: ['dashboard', 'github'],
        },
      ],
      contributions: {
        monthlyCommits: {
          'Jan 2026': 5,
        },
      },
    });

    expect(analytics.prStateDistribution.data).toEqual([1, 0, 0]);
    expect(analytics.languageStats.labels).toContain('JavaScript');
    expect(analytics.repositoryTopics.labels).toContain('dashboard');
  });

  it('tolerates missing contribution maps without crashing', () => {
    const analytics = generateAnalytics({
      prs: [],
      issues: [],
      repos: [],
      contributions: {},
    });

    expect(analytics.monthlyCommits.labels).toHaveLength(12);
    expect(analytics.monthlyCommits.data.every((value) => value === 0)).toBe(true);
  });
});
