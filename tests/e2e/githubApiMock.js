export const registerGithubApiMock = async (page) => {
  await page.route('https://api.github.com/**', async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname;
    const pageParam = Number(url.searchParams.get('page') || '1');

    if (pathname === '/user') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          login: 'janedoe',
          name: 'Jane Doe',
          avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
          html_url: 'https://github.com/janedoe',
          created_at: '2020-01-01T00:00:00Z',
        }),
      });
      return;
    }

    if (pathname === '/search/issues') {
      const isPullRequestSearch = url.searchParams.get('q')?.includes('is:pr');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: isPullRequestSearch
            ? [
                {
                  number: 42,
                  repository_url: 'https://api.github.com/repos/janedoe/dashboard',
                  title: 'Improve dashboard filters',
                  state: 'open',
                  created_at: '2026-03-01T10:00:00Z',
                  updated_at: '2026-03-02T10:00:00Z',
                  closed_at: null,
                  labels: [{ name: 'ux' }],
                  comments: 2,
                  html_url: 'https://github.com/janedoe/dashboard/pull/42',
                  pull_request: {},
                },
              ]
            : [
                {
                  number: 12,
                  repository_url: 'https://api.github.com/repos/janedoe/dashboard',
                  title: 'Fix loading state copy',
                  state: 'open',
                  created_at: '2026-03-01T10:00:00Z',
                  updated_at: '2026-03-03T10:00:00Z',
                  closed_at: null,
                  labels: [{ name: 'bug' }],
                  comments: 1,
                  html_url: 'https://github.com/janedoe/dashboard/issues/12',
                },
              ],
        }),
      });
      return;
    }

    if (pathname === '/user/repos') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          pageParam > 1
            ? []
            : [
                {
                  full_name: 'janedoe/dashboard',
                  description: 'Dashboard repo',
                  language: 'JavaScript',
                  stargazers_count: 20,
                  forks_count: 4,
                  watchers_count: 5,
                  private: false,
                  archived: false,
                  fork: false,
                  created_at: '2024-01-01T00:00:00Z',
                  updated_at: '2026-03-02T00:00:00Z',
                  html_url: 'https://github.com/janedoe/dashboard',
                  topics: ['dashboard'],
                  size: 100,
                },
              ]
        ),
      });
      return;
    }

    if (
      ['/user/orgs', '/user/starred', '/user/followers', '/user/following'].includes(pathname)
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pageParam > 1 ? [] : []),
      });
      return;
    }

    if (pathname === '/users/janedoe/events') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pageParam > 1 ? [] : []),
      });
      return;
    }

    if (pathname === '/notifications') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    if (pathname.startsWith('/notifications/threads/')) {
      await route.fulfill({ status: 205, body: '' });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
};
