import React, { useMemo } from 'react';
import { useGithub } from '../../context/GithubContext';
import { applyDashboardScopeFilters } from '../../utils/dashboardFilters';

const ATTENTION_WINDOW_DAYS = 14;

const DashboardBriefing = ({
  activeTab,
  onJumpToTab,
  ownerScope,
  repoScope,
  timeRange,
  scopedData,
}) => {
  const {
    pullRequests: allPullRequests,
    issues: allIssues,
    repositories: allRepositories,
  } = useGithub();

  const briefing = useMemo(() => {
    const pullRequests = scopedData?.pullRequests ?? allPullRequests ?? [];
    const issues = scopedData?.issues ?? allIssues ?? [];
    const repositories = scopedData?.repositories ?? allRepositories ?? [];
    const scopedIssues =
      scopedData?.issues ??
      applyDashboardScopeFilters(issues, { ownerScope, repoScope, timeRange });
    const scopedPullRequests =
      scopedData?.pullRequests ??
      applyDashboardScopeFilters(pullRequests, {
        ownerScope,
        repoScope,
        timeRange,
      });
    const scopedRepositories =
      scopedData?.repositories ??
      applyDashboardScopeFilters(repositories, {
        ownerScope,
        repoScope,
        timeRange,
      });

    const staleIssues = scopedIssues.filter((issue) => {
      if (issue.state !== 'open' || !issue.created_at) {
        return false;
      }

      const ageInDays =
        (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24);

      return ageInDays >= ATTENTION_WINDOW_DAYS;
    });

    const openPullRequests = scopedPullRequests.filter((pr) => pr.state === 'open');
    const mergedRecently = scopedPullRequests.filter((pr) => pr.state === 'merged').length;

    const repoActivity = new Map();
    [...scopedPullRequests, ...scopedIssues].forEach((item) => {
      if (!item.repository) {
        return;
      }

      repoActivity.set(item.repository, (repoActivity.get(item.repository) || 0) + 1);
    });

    const topRepository = Array.from(repoActivity.entries()).sort((a, b) => b[1] - a[1])[0];
    const privateRepos = scopedRepositories.filter(
      (repo) => repo.private || repo.isPrivate
    ).length;

    return {
      staleIssues: staleIssues.length,
      openPullRequests: openPullRequests.length,
      mergedRecently,
      privateRepos,
      topRepository: topRepository
        ? {
            name: topRepository[0],
            activityCount: topRepository[1],
          }
        : null,
    };
  }, [allIssues, allPullRequests, allRepositories, ownerScope, repoScope, scopedData, timeRange]);

  const cards = [
    {
      id: 'pull-requests',
      label: 'Needs Review',
      value: briefing.openPullRequests,
      hint: 'Open pull requests waiting for attention',
    },
    {
      id: 'issues',
      label: 'Stale Issues',
      value: briefing.staleIssues,
      hint: `Open longer than ${ATTENTION_WINDOW_DAYS} days`,
    },
    {
      id: 'repositories',
      label: 'Private Repos',
      value: briefing.privateRepos,
      hint: 'Repositories with limited visibility',
    },
    {
      id: 'repositories',
      label: 'Top Activity Repo',
      value: briefing.topRepository?.name || 'No activity yet',
      hint: briefing.topRepository
        ? `${briefing.topRepository.activityCount} PRs/issues in scope`
        : 'No recent repository activity found',
    },
  ];

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
              Dashboard Briefing
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              What needs attention next
            </h2>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Active tab: <span className="font-medium capitalize">{activeTab.replace('-', ' ')}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onJumpToTab(card.id)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-400 hover:bg-white dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-blue-500 dark:hover:bg-slate-900/60"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
              {card.value}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.hint}</p>
          </button>
        ))}
      </div>
      <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        {briefing.openPullRequests > 0 || briefing.staleIssues > 0 ? (
          <span>
            Prioritize open reviews and aging issues first, then scan the top activity repo for
            recent change risk.
          </span>
        ) : (
          <span>No immediate backlog hotspots detected from the currently loaded GitHub data.</span>
        )}
      </div>
    </section>
  );
};

export default DashboardBriefing;
