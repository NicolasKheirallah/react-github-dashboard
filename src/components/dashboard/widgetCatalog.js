import ActivityHeatmap from './charts/ActivityHeatmap';
import PRStatusChart from './charts/PRStatusChart';
import LanguageChart from './charts/LanguageChart';
import TimelineChart from './charts/TimelineChart';
import CommitFrequencyChart from './charts/CommitFrequencyChart';
import IssueTypesChart from './charts/IssueTypesChart';
import IssueResolutionChart from './charts/IssueResolutionChart';
import PRReviewTimeChart from './charts/PRReviewTimeChart';
import PRSizeDistributionChart from './charts/PRSizeDistributionChart';
import CodeChurnChart from './charts/CodeChurnChart';
import CollaborationNetwork from './charts/CollaborationNetwork';
import CommitCalendar from './charts/CommitCalendar';
import RepositorySummary from './summaries/RepositorySummary';

export const ALL_WIDGETS = [
  {
    id: 'activity-heatmap',
    title: 'Activity Overview',
    description: 'Shows your GitHub activity over time',
    size: 'large',
    component: ActivityHeatmap,
    favorite: false,
    category: 'activity',
  },
  {
    id: 'pr-status',
    title: 'Pull Request Status',
    description: 'Distribution of open, closed, and merged PRs',
    size: 'medium',
    component: PRStatusChart,
    favorite: false,
    category: 'pullRequests',
  },
  {
    id: 'language-stats',
    title: 'Language Distribution',
    description: 'Languages used across your repositories',
    size: 'medium',
    component: LanguageChart,
    favorite: false,
    category: 'repositories',
  },
  {
    id: 'timeline',
    title: 'Contribution Timeline',
    description: 'Your contributions over time',
    size: 'large',
    component: TimelineChart,
    favorite: false,
    category: 'activity',
  },
  {
    id: 'repo-summary',
    title: 'Repository Summary',
    description: 'Overview of your repositories',
    size: 'medium',
    component: RepositorySummary,
    favorite: false,
    category: 'repositories',
  },
  {
    id: 'commit-frequency',
    title: 'Commit Frequency',
    description: 'How often you commit code',
    size: 'medium',
    component: CommitFrequencyChart,
    favorite: false,
    category: 'activity',
  },
  {
    id: 'issue-types',
    title: 'Issue Types',
    description: 'Breakdown of issues by type',
    size: 'medium',
    component: IssueTypesChart,
    favorite: false,
    category: 'issues',
  },
  {
    id: 'issue-resolution',
    title: 'Issue Resolution Time',
    description: 'How quickly issues are resolved',
    size: 'medium',
    component: IssueResolutionChart,
    favorite: false,
    category: 'issues',
  },
  {
    id: 'pr-review-time',
    title: 'PR Review Time',
    description: 'How long PRs take to be reviewed',
    size: 'medium',
    component: PRReviewTimeChart,
    favorite: false,
    category: 'pullRequests',
  },
  {
    id: 'pr-size-distribution',
    title: 'PR Size Distribution',
    description: 'Size distribution of your PRs',
    size: 'large',
    component: PRSizeDistributionChart,
    favorite: false,
    category: 'pullRequests',
  },
  {
    id: 'code-churn',
    title: 'Code Churn',
    description: 'Code additions and deletions over time',
    size: 'large',
    component: CodeChurnChart,
    favorite: false,
    category: 'repositories',
  },
  {
    id: 'collaboration-network',
    title: 'Collaboration Network',
    description: 'Your network of collaborators',
    size: 'large',
    component: CollaborationNetwork,
    favorite: false,
    category: 'activity',
  },
  {
    id: 'commit-calendar',
    title: 'Commit Calendar',
    description: 'Calendar view of your commit activity',
    size: 'large',
    component: CommitCalendar,
    favorite: false,
    category: 'activity',
  },
];

export const DEFAULT_LAYOUT = [
  'activity-heatmap',
  'pr-status',
  'language-stats',
  'timeline',
  'repo-summary',
]
  .map((id) => ALL_WIDGETS.find((widget) => widget.id === id))
  .filter(Boolean);

export const WIDGET_CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'activity', name: 'Activity' },
  { id: 'repositories', name: 'Repositories' },
  { id: 'pullRequests', name: 'Pull Requests' },
  { id: 'issues', name: 'Issues' },
];

export const normalizeWidgetLayout = (layout) => {
  if (!Array.isArray(layout)) {
    return DEFAULT_LAYOUT;
  }

  const normalizedWidgets = layout
    .map((widget) => {
      const matchedWidget = ALL_WIDGETS.find((candidate) => candidate.id === widget?.id);

      if (!matchedWidget) {
        return null;
      }

      return {
        ...matchedWidget,
        ...widget,
        hidden: Boolean(widget.hidden),
        favorite: Boolean(widget.favorite),
      };
    })
    .filter(Boolean);

  return normalizedWidgets.length > 0 ? normalizedWidgets : DEFAULT_LAYOUT;
};
