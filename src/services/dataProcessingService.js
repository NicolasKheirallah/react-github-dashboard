import { getLastNMonths, getDaysBetween } from '../utils/dateUtils';
import { getLanguageColors } from '../utils/colorUtils';

const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });

const safeGetLabels = (labels) => {
  return Array.isArray(labels) ? labels.map(label => label.name).join(', ') : '';
};

export const processPullRequests = (pullRequests) => {
  return pullRequests.map(pr => {
    try {
      const repoName = (pr.repository_url || '').replace('https://api.github.com/repos/', '');
      const createdDate = new Date(pr.created_at);
      const closedDate = pr.closed_at ? new Date(pr.closed_at) : null;
      const daysOpen = getDaysBetween(createdDate, closedDate || new Date());
      const state = pr.pull_request?.merged_at ? 'Merged' : pr.state === 'closed' ? 'Closed' : 'Open';

      return {
        number: pr.number,
        repository: repoName,
        title: pr.title,
        state,
        daysOpen: parseFloat(daysOpen),
        created: createdDate.toISOString().split('T')[0],
        createdDateTime: createdDate,
        hourCreated: createdDate.getHours(),
        updated: new Date(pr.updated_at).toISOString().split('T')[0],
        closedDateTime: closedDate,
        labels: safeGetLabels(pr.labels),
        comments: pr.comments,
        url: pr.html_url,
        dayOfWeek: weekdayFormatter.format(createdDate),
        month: monthFormatter.format(createdDate),
        year: createdDate.getFullYear().toString()
      };
    } catch (error) {
      console.error(`Error processing PR #${pr.number}:`, error);
      return null;
    }
  }).filter(Boolean);
};

export const processIssues = (issues) => {
  return issues
    .filter(issue => !issue.pull_request)
    .map(issue => {
      try {
        const repoName = (issue.repository_url || '').replace('https://api.github.com/repos/', '');
        const createdDate = new Date(issue.created_at);
        const closedDate = issue.closed_at ? new Date(issue.closed_at) : null;
        const daysOpen = getDaysBetween(createdDate, closedDate || new Date());

        return {
          number: issue.number,
          repository: repoName,
          title: issue.title,
          state: issue.state,
          daysOpen: parseFloat(daysOpen),
          created: createdDate.toISOString().split('T')[0],
          createdDateTime: createdDate,
          hourCreated: createdDate.getHours(),
          updated: new Date(issue.updated_at).toISOString().split('T')[0],
          closedDateTime: closedDate,
          labels: safeGetLabels(issue.labels),
          comments: issue.comments,
          url: issue.html_url,
          dayOfWeek: weekdayFormatter.format(createdDate),
          month: monthFormatter.format(createdDate),
          year: createdDate.getFullYear().toString()
        };
      } catch (error) {
        console.error(`Error processing issue #${issue.number}:`, error);
        return null;
      }
    }).filter(Boolean);
};

export const processRepositories = (repos) => {
  return repos.map(repo => {
    try {
      return {
        name: repo.full_name,
        description: repo.description || '',
        language: repo.language || '',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        isPrivate: repo.private,
        isArchived: repo.archived,
        isFork: repo.fork,
        created: new Date(repo.created_at).toISOString().split('T')[0],
        updated: new Date(repo.updated_at).toISOString().split('T')[0],
        url: repo.html_url,
        topics: repo.topics || [],
        size: repo.size
      };
    } catch (error) {
      console.error(`Error processing repo ${repo.full_name}:`, error);
      return null;
    }
  }).filter(Boolean);
};

export const processOrganizations = (orgs) => {
  return orgs.map(org => {
    try {
      return {
        login: org.login,
        name: org.name || org.login,
        description: org.description || '',
        url: org.html_url,
        avatarUrl: org.avatar_url
      };
    } catch (error) {
      console.error(`Error processing organization ${org.login}:`, error);
      return null;
    }
  }).filter(Boolean);
};

export const processStarredRepos = (repos) => {
  return repos.map(repo => {
    try {
      return {
        name: repo.full_name,
        description: repo.description || '',
        language: repo.language || '',
        stars: repo.stargazers_count,
        url: repo.html_url,
        topics: repo.topics || []
      };
    } catch (error) {
      console.error(`Error processing starred repo ${repo.full_name}:`, error);
      return null;
    }
  }).filter(Boolean);
};

export const processContributions = (events) => {
  const eventTypes = {
    PushEvent: 'Code Push',
    PullRequestEvent: 'Pull Request',
    IssuesEvent: 'Issue',
    IssueCommentEvent: 'Issue Comment',
    CreateEvent: 'Create Branch/Tag',
    DeleteEvent: 'Delete Branch/Tag',
    WatchEvent: 'Watch Repository',
    ForkEvent: 'Fork Repository',
    CommitCommentEvent: 'Commit Comment',
    ReleaseEvent: 'Release',
    PublicEvent: 'Repository Made Public',
    PullRequestReviewEvent: 'PR Review',
    PullRequestReviewCommentEvent: 'PR Review Comment',
    GollumEvent: 'Wiki Update',
    MemberEvent: 'Member Added'
  };

  const eventCounts = {};
  const monthlyCommits = {};
  const repoActivity = {};

  events.forEach(event => {
    try {
      const type = eventTypes[event.type] || event.type;
      const repo = event.repo?.name || '';
      const createdAt = event.created_at;
      eventCounts[type] = (eventCounts[type] || 0) + 1;
      if (repo) repoActivity[repo] = (repoActivity[repo] || 0) + 1;

      if (event.type === 'PushEvent' && createdAt) {
        const monthYear = new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const commits = event.payload?.commits?.length || 0;
        monthlyCommits[monthYear] = (monthlyCommits[monthYear] || 0) + commits;
      }
    } catch (error) {
      console.error('Error processing event:', error);
    }
  });

  return {
    eventCounts,
    monthlyCommits,
    repoActivity
  };
};

export const generateAnalytics = ({ prs, issues, repos, contributions }) => {
  return {
    languageStats: processLanguageStats(repos),
    prTimeline: processTimeline(prs),
    issueTimeline: processTimeline(issues),
    dayOfWeekActivity: processDayOfWeekActivity(prs, issues),
    prStateDistribution: processPRStateStats(prs),
    timeOfDay: processTimeOfDayActivity(prs, issues),
    repoTypeDistribution: processRepoTypeStats(repos),
    monthlyCommits: processMonthlyCommits(contributions),
    repositoryTopics: processRepositoryTopics(repos)
  };
};

const processTimeline = (items) => {
  const months = getLastNMonths(12);
  const timeline = Object.fromEntries(months.map(month => [month, 0]));
  items.forEach(item => {
    const key = new Date(item.createdDateTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (timeline[key] !== undefined) timeline[key]++;
  });
  return { labels: months, data: months.map(m => timeline[m]) };
};

const processDayOfWeekActivity = (prs, issues) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const prCounts = Object.fromEntries(days.map(day => [day, 0]));
  const issueCounts = Object.fromEntries(days.map(day => [day, 0]));

  prs.forEach(pr => prCounts[pr.dayOfWeek]++);
  issues.forEach(issue => issueCounts[issue.dayOfWeek]++);

  return {
    labels: days,
    prData: days.map(day => prCounts[day]),
    issueData: days.map(day => issueCounts[day])
  };
};

const processPRStateStats = (prs) => {
  const states = { Open: 0, Closed: 0, Merged: 0 };
  prs.forEach(pr => {
    if (states[pr.state] !== undefined) states[pr.state]++;
  });
  return {
    labels: Object.keys(states),
    data: Object.values(states),
    colors: ['#10b981', '#ef4444', '#8b5cf6']
  };
};

const processTimeOfDayActivity = (prs, issues) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const prCounts = Array(24).fill(0);
  const issueCounts = Array(24).fill(0);
  prs.forEach(pr => prCounts[pr.hourCreated]++);
  issues.forEach(issue => issueCounts[issue.hourCreated]++);
  return {
    labels: hours.map(h => `${h}:00`),
    prData: prCounts,
    issueData: issueCounts
  };
};

const processRepoTypeStats = (repos) => {
  const counts = { Public: 0, Private: 0, Forked: 0, Original: 0 };
  repos.forEach(repo => {
    counts[repo.isPrivate ? 'Private' : 'Public']++;
    counts[repo.isFork ? 'Forked' : 'Original']++;
  });
  return {
    visibility: {
      labels: ['Public', 'Private'],
      data: [counts.Public, counts.Private],
      colors: ['#22c55e', '#6366f1']
    },
    origin: {
      labels: ['Original', 'Forked'],
      data: [counts.Original, counts.Forked],
      colors: ['#3b82f6', '#a855f7']
    }
  };
};

const processMonthlyCommits = (contributions) => {
  const months = getLastNMonths(12);
  const commits = months.map(month => contributions.monthlyCommits[month] || 0);
  return { labels: months, data: commits };
};

const processLanguageStats = (repos) => {
  const stats = {};
  repos.forEach(repo => {
    if (repo.language && !repo.isFork) {
      const weight = 1 + Math.log2(repo.stars + 1);
      stats[repo.language] = (stats[repo.language] || 0) + weight;
    }
  });

  const entries = Object.entries(stats).filter(([, v]) => v >= 0.5);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 10);
  const topLangs = Object.fromEntries(top);
  const otherSum = sorted.slice(10).reduce((sum, [, v]) => sum + v, 0);
  if (otherSum > 0) topLangs.Other = otherSum;

  const colors = getLanguageColors(Object.keys(topLangs));
  return {
    labels: Object.keys(topLangs),
    data: Object.values(topLangs),
    colors: Object.keys(topLangs).map(lang => colors[lang])
  };
};

const processRepositoryTopics = (repos) => {
  const topicCounts = {};
  repos.forEach(repo => {
    repo.topics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });

  const sorted = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const colors = getLanguageColors(sorted.map(([t]) => t));
  return {
    labels: sorted.map(([t]) => t),
    data: sorted.map(([, v]) => v),
    colors: sorted.map(([t]) => colors[t])
  };
};

export const processGithubData = (rawData) => {
  const {
    userProfile,
    pullRequests,
    issuesCreated,
    repositories,
    organizations,
    starredRepos,
    userEvents
  } = rawData;

  const processedPRs = processPullRequests(pullRequests);
  const processedIssues = processIssues(issuesCreated);
  const processedRepos = processRepositories(repositories);
  const processedOrgs = processOrganizations(organizations);
  const processedStarred = processStarredRepos(starredRepos);
  const processedContributions = processContributions(userEvents);
  const analytics = generateAnalytics({
    prs: processedPRs,
    issues: processedIssues,
    repos: processedRepos,
    contributions: processedContributions
  });

  return {
    userData: userProfile,
    processedPRs,
    processedIssues,
    processedRepos,
    processedOrgs,
    processedStarred,
    processedContributions,
    analytics
  };
};
