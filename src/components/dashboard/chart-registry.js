import ActivityHeatmap from './charts/ActivityHeatmap';
import PRStatusChart from './charts/PRStatusChart';
import LanguageChart from './charts/LanguageChart';
import TimelineChart from './charts/TimelineChart';
import RepositorySummary from './summaries/RepositorySummary';
import PRReviewTimeChart from './charts/PRReviewTimeChart';
import IssueResolutionChart from './charts/IssueResolutionChart';
import CodeChurnChart from './charts/CodeChurnChart';
import CommitFrequencyChart from './charts/CommitFrequencyChart';
import PRSizeDistributionChart from './charts/PRSizeDistributionChart';
import IssueTypesChart from './charts/IssueTypesChart';

// Registry of all available charts/widgets for the dashboard
const AVAILABLE_WIDGETS = [
  // Core widgets
  {
    id: 'activity-heatmap',
    title: 'Activity Overview',
    description: 'Visualize your GitHub activity across repositories',
    component: ActivityHeatmap,
    defaultSize: 'large',
    category: 'overview'
  },
  {
    id: 'pr-status',
    title: 'Pull Request Status',
    description: 'Current status of your pull requests',
    component: PRStatusChart,
    defaultSize: 'medium',
    category: 'pull-requests'
  },
  {
    id: 'language-stats',
    title: 'Language Distribution',
    description: 'Programming languages used across repositories',
    component: LanguageChart,
    defaultSize: 'medium',
    category: 'repositories'
  },
  {
    id: 'timeline',
    title: 'Contribution Timeline',
    description: 'Your activity over time',
    component: TimelineChart,
    defaultSize: 'large',
    category: 'overview'
  },
  {
    id: 'repo-summary',
    title: 'Repository Summary',
    description: 'Overview of your repositories',
    component: RepositorySummary,
    defaultSize: 'medium',
    category: 'repositories'
  },
  
  // Advanced charts
  {
    id: 'pr-review-time',
    title: 'PR Review Time Trend',
    description: 'Average time for pull requests to be reviewed and merged',
    component: PRReviewTimeChart,
    defaultSize: 'medium',
    category: 'pull-requests'
  },
  {
    id: 'issue-resolution',
    title: 'Issue Resolution Time',
    description: 'Time to resolve issues by label',
    component: IssueResolutionChart,
    defaultSize: 'medium',
    category: 'issues'
  },
  {
    id: 'code-churn',
    title: 'Code Churn Overview',
    description: 'Lines added and removed over time',
    component: CodeChurnChart,
    defaultSize: 'medium',
    category: 'code'
  },
  {
    id: 'commit-frequency',
    title: 'Commit Frequency',
    description: 'Heatmap of your commit activity',
    component: CommitFrequencyChart,
    defaultSize: 'large',
    category: 'code'
  },
  {
    id: 'pr-size-distribution',
    title: 'PR Size Distribution',
    description: 'Distribution of pull requests by size',
    component: PRSizeDistributionChart,
    defaultSize: 'small',
    category: 'pull-requests'
  },
  {
    id: 'issue-types',
    title: 'Issue Types',
    description: 'Breakdown of issues by type/label',
    component: IssueTypesChart,
    defaultSize: 'small',
    category: 'issues'
  }
];

// Categories for organizing widgets
export const WIDGET_CATEGORIES = [
  { id: 'overview', name: 'Overview' },
  { id: 'repositories', name: 'Repositories' },
  { id: 'pull-requests', name: 'Pull Requests' },
  { id: 'issues', name: 'Issues' },
  { id: 'code', name: 'Code Analysis' }
];

export default AVAILABLE_WIDGETS;