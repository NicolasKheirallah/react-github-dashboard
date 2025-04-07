// src/components/dashboard/charts/RepositoryStats.jsx
import React, { useEffect, useState } from 'react';
import { useGithub } from '../../../context/GithubContext';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const RepositoryStats = ({ owner, repo }) => {
  const {
    fetchRepoCommitStats,
    fetchContributorStats,
    fetchRepoLanguages,
    fetchRepoCommits,
    fetchRepoTags,
    fetchRepoBranches,
    fetchRepoTeams,
    fetchIssueComments,
    fetchPRComments,
    fetchIssueEvents,
    fetchPREvents,
  } = useGithub();
  const [commitStats, setCommitStats] = useState(null);
  const [contributorStats, setContributorStats] = useState([]);
  const [languages, setLanguages] = useState({});
  const [recentCommits, setRecentCommits] = useState([]);
  const [tags, setTags] = useState([]);
  const [branches, setBranches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [issueComments, setIssueComments] = useState([]);
  const [prComments, setPRComments] = useState([]);
  const [issueEvents, setIssueEvents] = useState([]);
  const [prEvents, setPREvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (owner && repo) {
        const commitData = await fetchRepoCommitStats(owner, repo);
        setCommitStats(commitData);

        const contributorData = await fetchContributorStats(owner, repo);
        setContributorStats(contributorData);

        const languageData = await fetchRepoLanguages(owner, repo);
        setLanguages(languageData);

        const commitDataRecent = await fetchRepoCommits(owner, repo);
        setRecentCommits(commitDataRecent);

        const tagsData = await fetchRepoTags(owner, repo);
        setTags(tagsData);

        const branchesData = await fetchRepoBranches(owner, repo);
        setBranches(branchesData);

        const teamsData = await fetchRepoTeams(owner, repo);
        setTeams(teamsData);

        //Fetch issue and pr comments and events, you will need to give a issue number or pr number to fetch data.
        // const issueCommentsData = await fetchIssueComments(owner, repo, issueNumber);
        // setIssueComments(issueCommentsData);

        // const prCommentsData = await fetchPRComments(owner, repo, prNumber);
        // setPRComments(prCommentsData);

        // const issueEventsData = await fetchIssueEvents(owner, repo, issueNumber);
        // setIssueEvents(issueEventsData);

        // const prEventsData = await fetchPREvents(owner, repo, prNumber);
        // setPREvents(prEventsData);
      }
    };

    fetchData();
  }, [owner, repo, fetchRepoCommitStats, fetchContributorStats, fetchRepoLanguages, fetchRepoCommits, fetchRepoTags, fetchRepoBranches, fetchRepoTeams]);

  // Chart configurations
  // ... (commitChartOptions, commitChartData, contributorChartOptions, contributorChartData, languageChartOptions, languageChartData, commitActivityChartOptions, commitActivityChartData from previous example)

  const tagsChartData = {
    labels: tags.map((tag) => tag.name),
    datasets: [
      {
        label: 'Repository Tags',
        data: tags.map(() => 1),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const branchesChartData = {
    labels: branches.map((branch) => branch.name),
    datasets: [
      {
        label: 'Repository Branches',
        data: branches.map(() => 1),
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
      },
    ],
  };

  const teamsChartData = {
    labels: teams.map((team) => team.name),
    datasets: [
      {
        label: 'Repository Teams',
        data: teams.map(() => 1),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {commitChartData && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Commit Activity (Last 52 Weeks)</h3>
          <div className="h-64">
            <Line options={commitChartOptions} data={commitChartData} />
          </div>
        </div>
      )}

      {contributorChartData && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Commits Per Contributor</h3>
          <div className="h-64">
            <Bar options={contributorChartOptions} data={contributorChartData} />
          </div>
        </div>
      )}

      {languageChartData && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Language Distribution</h3>
          <div className="h-64">
            <Pie options={languageChartOptions} data={languageChartData} />
          </div>
        </div>
      )}

      {commitActivityChartData && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Commits</h3>
          <div className="h-64">
            <Line options={commitActivityChartOptions} data={commitActivityChartData} />
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Repository Tags</h3>
          <div className="h-64">
            <Bar data={tagsChartData} />
          </div>
        </div>
      )}

      {branches.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Repository Branches</h3>
          <div className="h-64">
            <Bar data={branchesChartData} />
          </div>
        </div>
      )}

      {teams.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Repository Teams</h3>
          <div className="h-64">
            <Bar data={teamsChartData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryStats;