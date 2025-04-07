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
import RepoTagsChart from './charts/RepoTagsChart';
import RepoBranchesChart from './charts/RepoBranchesChart';
import RepoTeamsChart from './charts/RepoTeamsChart';
import ContributorStatsChart from './charts/ContributorStatsChart';
import RateLimitChart from './charts/RateLimitChart';
import UserGistsChart from './charts/UserGistsChart';
import OrgMembersChart from './charts/OrgMembersChart';
import OrgTeamsChart from './charts/OrgTeamsChart';

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
    defaultSize: 'large',
    category: 'pull-requests'
  },
  {
    id: 'issue-types',
    title: 'Issue Types',
    description: 'Breakdown of issues by type/label',
    component: IssueTypesChart,
    defaultSize: 'small',
    category: 'issues'
  },
  {
    id: 'repo-tags',
    title: 'Repository Tags',
    description: 'List of tags in a repository',
    component: RepoTagsChart,
    defaultSize: 'small',
    category: 'repositories'
  },
  {
    id: 'repo-branches',
    title: 'Repository Branches',
    description: 'List of branches in a repository',
    component: RepoBranchesChart,
    defaultSize: 'small',
    category: 'repositories'
  },
  {
    id: 'repo-teams',
    title: 'Repository Teams',
    description: 'Teams with access to a repository',
    component: RepoTeamsChart,
    defaultSize: 'small',
    category: 'repositories'
  },
  {
    id: 'contributor-stats',
    title: 'Contributor Stats',
    description: 'Commits per contributor',
    component: ContributorStatsChart,
    defaultSize: 'medium',
    category: 'code'
  },
  {
      id: 'rate-limit',
      title: 'API Rate Limit',
      description: 'Current API rate limit usage',
      component: RateLimitChart,
      defaultSize: 'small',
      category: 'overview'
  },
  {
      id: 'user-gists',
      title: 'User Gists',
      description: 'List of gists created by the user',
      component: UserGistsChart,
      defaultSize: 'medium',
      category: 'user'
  },
  {
      id: 'org-members',
      title: 'Organization Members',
      description: 'List of members in an organization',
      component: OrgMembersChart,
      defaultSize: 'medium',
      category: 'organizations'
  },
  {
      id: 'org-teams',
      title: 'Organization Teams',
      description: 'List of teams in an organization',
      component: OrgTeamsChart,
      defaultSize: 'medium',
      category: 'organizations'
  },
];

// Categories for organizing widgets
export const WIDGET_CATEGORIES = [
  { id: 'overview', name: 'Overview' },
  { id: 'repositories', name: 'Repositories' },
  { id: 'pull-requests', name: 'Pull Requests' },
  { id: 'issues', name: 'Issues' },
  { id: 'code', name: 'Code Analysis' },
  { id: 'user', name: 'User' },
  { id: 'organizations', name: 'Organizations' }
];

export default AVAILABLE_WIDGETS;