import { API_BASE_URL, getHeaders } from './apiClient';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getFullRepoName = (repo) => {
  if (!repo) {
    return null;
  }

  if (typeof repo === 'string') {
    return repo.includes('/') ? repo : null;
  }

  if (repo.full_name) {
    return repo.full_name;
  }

  if (repo.name && repo.name.includes('/')) {
    return repo.name;
  }

  if (repo.owner?.login && repo.name) {
    return `${repo.owner.login}/${repo.name}`;
  }

  return null;
};

const extractRepoInfo = (repoName) => {
  if (!repoName || !repoName.includes('/')) {
    return null;
  }

  const [owner, repo] = repoName.split('/');
  return owner && repo ? { owner, repo } : null;
};

export const fetchRepoContributors = async (token, owner, repo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/repos/${owner}/${repo}/contributors`, {
      headers: getHeaders(token),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }

      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
    return [];
  }
};

export const fetchAllRepositoriesContributors = async (token, repositories = []) => {
  if (!Array.isArray(repositories) || repositories.length === 0) {
    return [];
  }

  const contributorsMap = new Map();
  const processedRepos = new Set();

  for (const repo of repositories.slice(0, 5)) {
    const fullName = getFullRepoName(repo);

    if (!fullName || processedRepos.has(fullName)) {
      continue;
    }

    processedRepos.add(fullName);
    const repoInfo = extractRepoInfo(fullName);

    if (!repoInfo) {
      continue;
    }

    try {
      const contributors = await fetchRepoContributors(token, repoInfo.owner, repoInfo.repo);

      contributors.forEach((contributor) => {
        if (!contributor?.id) {
          return;
        }

        if (contributorsMap.has(contributor.id)) {
          const existing = contributorsMap.get(contributor.id);
          existing.contributions += contributor.contributions || 0;

          if (!existing.repositories.includes(fullName)) {
            existing.repositories.push(fullName);
          }

          existing.repoCount = existing.repositories.length;
          existing.totalActivity = existing.contributions + (existing.pullRequests || 0);
          return;
        }

        contributorsMap.set(contributor.id, {
          ...contributor,
          repositories: [fullName],
          repoCount: 1,
          pullRequests: 0,
          totalActivity: contributor.contributions || 0,
        });
      });

      await delay(250);
    } catch (error) {
      console.error(`Error processing contributors for ${fullName}:`, error);
    }
  }

  return Array.from(contributorsMap.values());
};

const extractReposFromPullRequests = (pullRequests = []) => {
  const repoNames = new Set();

  pullRequests.forEach((pullRequest) => {
    if (pullRequest?.repository) {
      repoNames.add(pullRequest.repository);
    } else if (pullRequest?.base?.repo?.full_name) {
      repoNames.add(pullRequest.base.repo.full_name);
    }
  });

  return Array.from(repoNames);
};

const mergeContributors = (contributors, additionalContributors) => {
  const contributorMap = new Map(
    contributors.map((contributor) => [contributor.id, contributor])
  );

  additionalContributors.forEach((contributor) => {
    if (!contributor?.id) {
      return;
    }

    if (contributorMap.has(contributor.id)) {
      const existing = contributorMap.get(contributor.id);
      existing.contributions += contributor.contributions || 0;

      contributor.repositories.forEach((repository) => {
        if (!existing.repositories.includes(repository)) {
          existing.repositories.push(repository);
        }
      });

      existing.repoCount = existing.repositories.length;
      existing.totalActivity = existing.contributions + (existing.pullRequests || 0);
      return;
    }

    contributorMap.set(contributor.id, contributor);
  });

  return Array.from(contributorMap.values());
};

const enhanceWithPullRequestAuthors = (contributors, pullRequests = []) => {
  const contributorMap = new Map(
    contributors.map((contributor) => [contributor.id, contributor])
  );

  pullRequests.forEach((pullRequest) => {
    const author = pullRequest?.user;

    if (!author?.id) {
      return;
    }

    const repositoryName = pullRequest.repository || pullRequest?.base?.repo?.full_name || null;

    if (contributorMap.has(author.id)) {
      const existing = contributorMap.get(author.id);
      existing.pullRequests = (existing.pullRequests || 0) + 1;

      if (repositoryName && !existing.repositories.includes(repositoryName)) {
        existing.repositories.push(repositoryName);
      }

      existing.repoCount = existing.repositories.length;
      existing.totalActivity = (existing.contributions || 0) + existing.pullRequests;
      return;
    }

    const repositories = repositoryName ? [repositoryName] : [];

    contributorMap.set(author.id, {
      id: author.id,
      login: author.login,
      name: author.name || author.login,
      avatar_url: author.avatar_url,
      html_url: author.html_url,
      contributions: 0,
      pullRequests: 1,
      repositories,
      repoCount: repositories.length,
      totalActivity: 1,
    });
  });

  return Array.from(contributorMap.values());
};

export const fetchAllContributorData = async (token, repositories = [], pullRequests = []) => {
  try {
    let contributors = await fetchAllRepositoriesContributors(token, repositories);

    if (Array.isArray(pullRequests) && pullRequests.length > 0) {
      const pullRequestRepos = extractReposFromPullRequests(pullRequests);
      const pullRequestContributors = await fetchAllRepositoriesContributors(
        token,
        pullRequestRepos
      );
      contributors = mergeContributors(contributors, pullRequestContributors);
    }

    return enhanceWithPullRequestAuthors(contributors, pullRequests);
  } catch (error) {
    console.error('Error fetching all contributor data:', error);
    return [];
  }
};
