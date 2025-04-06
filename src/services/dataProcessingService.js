// src/services/dataProcessingService.js
import _ from 'lodash';

// Generate consistent colors for programming languages
const getLanguageColors = (languages) => {
  // Common language colors (GitHub-like)
  const commonLanguageColors = {
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    Python: "#3572A5",
    Java: "#b07219",
    "C#": "#178600",
    PHP: "#4F5D95",
    "C++": "#f34b7d",
    C: "#555555",
    Shell: "#89e051",
    Ruby: "#701516",
    Go: "#00ADD8",
    Swift: "#ffac45",
    Kotlin: "#F18E33",
    Rust: "#dea584",
    Dart: "#00B4AB",
    HTML: "#e34c26",
    CSS: "#563d7c",
    "Jupyter Notebook": "#DA5B0B",
    Vue: "#2c3e50",
    R: "#198CE7",
    Other: "#8b8b8b",
  };

  const languageColors = {};

  for (const lang of languages) {
    if (lang in commonLanguageColors) {
      languageColors[lang] = commonLanguageColors[lang];
    } else {
      // Generate color based on language name hash for consistency
      let hash = 0;
      for (let i = 0; i < lang.length; i++) {
        hash = lang.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      // Generate RGB values
      const r = (hash & 0xFF) % 200 + 55;  // Avoid too dark/light
      const g = ((hash >> 8) & 0xFF) % 200 + 55;
      const b = ((hash >> 16) & 0xFF) % 200 + 55;
      
      languageColors[lang] = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }

  return languageColors;
};

/**
 * Process raw GitHub API data into formatted data for charts and display
 */
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
  
  // Process pull requests
  const processedPRs = processPullRequests(pullRequests);
  
  // Process issues (excluding PRs)
  const processedIssues = processIssues(issuesCreated);
  
  // Process repositories
  const processedRepos = processRepositories(repositories);
  
  // Process organizations
  const processedOrgs = processOrganizations(organizations);
  
  // Process starred repositories
  const processedStarred = processStarredRepos(starredRepos);
  
  // Process user events for contributions
  const processedContributions = processContributions(userEvents);
  
  // Generate analytics data
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

/**
 * Process pull requests into formatted data
 */
const processPullRequests = (pullRequests) => {
  return pullRequests.map(pr => {
    try {
      // Extract repository name from URL
      const repoUrl = pr.repository_url || '';
      const repoName = repoUrl.replace('https://api.github.com/repos/', '');

      // Calculate days open
      const createdDate = new Date(pr.created_at);
      let closedDate = null;
      let daysOpen = 0;
      
      if (pr.closed_at) {
        closedDate = new Date(pr.closed_at);
        daysOpen = ((closedDate - createdDate) / (1000 * 60 * 60 * 24)).toFixed(1);
      } else {
        daysOpen = ((new Date() - createdDate) / (1000 * 60 * 60 * 24)).toFixed(1);
      }

      // Determine merge status
      let mergeStatus = 'Open';
      if (pr.pull_request?.merged_at) {
        mergeStatus = 'Merged';
      } else if (pr.state === 'closed') {
        mergeStatus = 'Closed';
      }

      // Extract labels
      const labels = pr.labels.map(label => label.name).join(', ');

      return {
        number: pr.number,
        repository: repoName,
        title: pr.title,
        state: mergeStatus,
        daysOpen: parseFloat(daysOpen),
        created: createdDate.toISOString().split('T')[0],
        createdDateTime: createdDate,
        hourCreated: createdDate.getHours(),
        updated: new Date(pr.updated_at).toISOString().split('T')[0],
        closedDateTime: closedDate,
        labels,
        comments: pr.comments,
        url: pr.html_url,
        dayOfWeek: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(createdDate),
        month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(createdDate),
        year: createdDate.getFullYear().toString()
      };
    } catch (error) {
      console.error(`Error processing PR #${pr.number}:`, error);
      return null;
    }
  }).filter(Boolean); // Remove any nulls from errors
};

/**
 * Process issues into formatted data (excluding PRs)
 */
const processIssues = (issues) => {
  return issues.filter(issue => !issue.pull_request).map(issue => {
    try {
      // Extract repository name from URL
      const repoUrl = issue.repository_url || '';
      const repoName = repoUrl.replace('https://api.github.com/repos/', '');

      // Calculate days open
      const createdDate = new Date(issue.created_at);
      let closedDate = null;
      let daysOpen = 0;
      
      if (issue.closed_at) {
        closedDate = new Date(issue.closed_at);
        daysOpen = ((closedDate - createdDate) / (1000 * 60 * 60 * 24)).toFixed(1);
      } else {
        daysOpen = ((new Date() - createdDate) / (1000 * 60 * 60 * 24)).toFixed(1);
      }

      // Extract labels
      const labels = issue.labels.map(label => label.name).join(', ');

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
        labels,
        comments: issue.comments,
        url: issue.html_url,
        dayOfWeek: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(createdDate),
        month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(createdDate),
        year: createdDate.getFullYear().toString()
      };
    } catch (error) {
      console.error(`Error processing issue #${issue.number}:`, error);
      return null;
    }
  }).filter(Boolean); // Remove any nulls from errors
};

/**
 * Process repositories into formatted data
 */
const processRepositories = (repositories) => {
  return repositories.map(repo => {
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
  }).filter(Boolean); // Remove any nulls from errors
};

/**
 * Process organizations into formatted data
 */
const processOrganizations = (organizations) => {
  return organizations.map(org => {
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
  }).filter(Boolean); // Remove any nulls from errors
};

/**
 * Process starred repositories into formatted data
 */
const processStarredRepos = (starredRepos) => {
  return starredRepos.map(repo => {
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
  }).filter(Boolean); // Remove any nulls from errors
};

/**
 * Process user events into contribution data
 */
const processContributions = (events) => {
  // Map event types to more readable descriptions
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

  // Initialize counters
  const eventCounts = {};
  const monthlyCommits = {};
  const repoActivity = {};

  events.forEach(event => {
    try {
      const eventType = event.type || 'Unknown';
      const createdAt = event.created_at || '';
      const repoName = event.repo?.name || '';

      // Count event types
      const readableType = eventTypes[eventType] || eventType;
      eventCounts[readableType] = (eventCounts[readableType] || 0) + 1;

      // Count repository activity
      if (repoName) {
        repoActivity[repoName] = (repoActivity[repoName] || 0) + 1;
      }

      // Count monthly commits for PushEvents
      if (eventType === 'PushEvent' && createdAt) {
        const date = new Date(createdAt);
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        // Get commit count from the payload
        const commitCount = event.payload?.commits?.length || 0;
        monthlyCommits[monthYear] = (monthlyCommits[monthYear] || 0) + commitCount;
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

/**
 * Generate analytics data from processed GitHub data
 */
const generateAnalytics = ({ prs, issues, repos, contributions }) => {
  return {
    languageStats: processLanguageStats(repos),
    prTimeline: processPRTimeline(prs),
    issueTimeline: processIssueTimeline(issues),
    dayOfWeekActivity: processDayOfWeekActivity(prs, issues),
    prStateDistribution: processPRStateStats(prs),
    timeOfDay: processTimeOfDayActivity(prs, issues),
    repoTypeDistribution: processRepoTypeStats(repos),
    monthlyCommits: processMonthlyCommits(contributions),
    repositoryTopics: processRepositoryTopics(repos)
  };
};

/**
 * Process language statistics for visualization
 */
const processLanguageStats = (repos) => {
  const languageStats = {};

  // Count languages across repositories weighted by stars
  repos.forEach(repo => {
    if (repo.language && !repo.isFork) {
      const lang = repo.language;
      // Weight by stars
      const weight = 1 + (0.1 * repo.stars);
      languageStats[lang] = (languageStats[lang] || 0) + weight;
    }
  });

  // Filter out languages with very small values and sort by value
  const threshold = 0.5;
  const filteredStats = Object.fromEntries(
    Object.entries(languageStats).filter(([, value]) => value >= threshold)
  );
  
  const sortedStats = Object.fromEntries(
    Object.entries(filteredStats).sort((a, b) => b[1] - a[1])
  );

  // Take top 10 languages
  const topLanguages = Object.fromEntries(
    Object.entries(sortedStats).slice(0, 10)
  );

  // Others category for the rest
  const otherLanguages = Object.entries(filteredStats)
    .filter(([key]) => !Object.keys(topLanguages).includes(key))
    .reduce((sum, [, value]) => sum + value, 0);

  if (otherLanguages > 0) {
    topLanguages['Other'] = otherLanguages;
  }

  // Generate colors for each language
  const languageColors = getLanguageColors(Object.keys(topLanguages));

  return {
    labels: Object.keys(topLanguages),
    data: Object.values(topLanguages),
    colors: Object.keys(topLanguages).map(lang => languageColors[lang])
  };
};

/**
 * Process PR timeline data for visualization
 */
const processPRTimeline = (prs) => {
  // Group PRs by month-year
  const timelineData = {};

  // Create a 12-month timeline
  const now = new Date();
  const months = [];
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    timelineData[monthYear] = 0;
    months.unshift(monthYear); // Add to beginning for chronological order
  }

  // Fill in actual PR counts
  prs.forEach(pr => {
    const monthYear = new Date(pr.createdDateTime).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    
    if (monthYear in timelineData) {
      timelineData[monthYear]++;
    }
  });

  return {
    labels: months,
    data: months.map(month => timelineData[month])
  };
};

/**
 * Process issue timeline data for visualization
 */
const processIssueTimeline = (issues) => {
  // Get the same months as PR timeline for consistency
  const prTimeline = processPRTimeline(issues);
  const months = prTimeline.labels;
  
  // Group issues by month-year
  const timelineData = {};
  
  months.forEach(month => {
    timelineData[month] = 0;
  });

  // Fill in actual issue counts
  issues.forEach(issue => {
    const monthYear = new Date(issue.createdDateTime).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    
    if (monthYear in timelineData) {
      timelineData[monthYear]++;
    }
  });

  return {
    labels: months,
    data: months.map(month => timelineData[month])
  };
};

/**
 * Process activity by day of week
 */
const processDayOfWeekActivity = (prs, issues) => {
  // Initialize counts for each day of week in correct order (Monday to Sunday)
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  
  const prCounts = daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});
  const issueCounts = daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});

  // Count PRs by day of week
  prs.forEach(pr => {
    const day = pr.dayOfWeek;
    prCounts[day]++;
  });

  // Count issues by day of week
  issues.forEach(issue => {
    const day = issue.dayOfWeek;
    issueCounts[day]++;
  });

  return {
    labels: daysOfWeek,
    prData: daysOfWeek.map(day => prCounts[day]),
    issueData: daysOfWeek.map(day => issueCounts[day])
  };
};

/**
 * Process PR state distribution
 */
const processPRStateStats = (prs) => {
  const stateCounts = { 'Open': 0, 'Closed': 0, 'Merged': 0 };

  prs.forEach(pr => {
    if (pr.state in stateCounts) {
      stateCounts[pr.state]++;
    }
  });

  return {
    labels: Object.keys(stateCounts),
    data: Object.values(stateCounts),
    colors: ['#10b981', '#ef4444', '#8b5cf6'] // Green, Red, Purple
  };
};

/**
 * Process activity by time of day
 */
const processTimeOfDayActivity = (prs, issues) => {
  // Initialize hourly bins
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const prCounts = Array(24).fill(0);
  const issueCounts = Array(24).fill(0);

  // Count PRs by hour
  prs.forEach(pr => {
    const hour = pr.hourCreated;
    prCounts[hour]++;
  });

  // Count issues by hour
  issues.forEach(issue => {
    const hour = issue.hourCreated;
    issueCounts[hour]++;
  });

  // Format hour labels
  const hourLabels = hours.map(h => `${h}:00`);

  return {
    labels: hourLabels,
    prData: prCounts,
    issueData: issueCounts
  };
};

/**
 * Process repository type distribution
 */
const processRepoTypeStats = (repos) => {
  // Count repository types
  const repoTypes = { 'Public': 0, 'Private': 0, 'Forked': 0, 'Original': 0 };

  repos.forEach(repo => {
    if (repo.isPrivate) {
      repoTypes['Private']++;
    } else {
      repoTypes['Public']++;
    }

    if (repo.isFork) {
      repoTypes['Forked']++;
    } else {
      repoTypes['Original']++;
    }
  });

  // Store results as two separate datasets
  return {
    visibility: {
      labels: ['Public', 'Private'],
      data: [repoTypes['Public'], repoTypes['Private']],
      colors: ['#22c55e', '#6366f1'] // Green, Indigo
    },
    origin: {
      labels: ['Original', 'Forked'],
      data: [repoTypes['Original'], repoTypes['Forked']],
      colors: ['#3b82f6', '#a855f7'] // Blue, Purple
    }
  };
};

/**
 * Process monthly commit data from contributions
 */
const processMonthlyCommits = (contributions) => {
  // Get the monthly commits data
  const monthlyCommits = contributions.monthlyCommits || {};
  
  // Create a 12-month timeline (reuse same logic as PR timeline for consistency)
  const now = new Date();
  const months = [];
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    months.unshift(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
  }
  
  // Map the data to the timeline
  const data = months.map(month => monthlyCommits[month] || 0);

  return {
    labels: months,
    data
  };
};

/**
 * Process repository topics for visualization
 */
const processRepositoryTopics = (repos) => {
  // Count topics across all repositories
  const topicCounts = {};

  repos.forEach(repo => {
    repo.topics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });

  // Get top 20 topics
  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // Generate colors for topics
  const topicColors = {};
  sortedTopics.forEach(([topic]) => {
    // Generate color based on topic name hash for consistency
    let hash = 0;
    for (let i = 0; i < topic.length; i++) {
      hash = topic.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate RGB values
    const r = (hash & 0xFF) % 200 + 55;
    const g = ((hash >> 8) & 0xFF) % 200 + 55;
    const b = ((hash >> 16) & 0xFF) % 200 + 55;
    
    topicColors[topic] = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  });

  return {
    labels: sortedTopics.map(([topic]) => topic),
    data: sortedTopics.map(([, count]) => count),
    colors: sortedTopics.map(([topic]) => topicColors[topic])
  };
};