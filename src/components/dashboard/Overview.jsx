import React from 'react';
import { useGithub } from '../../context/GithubContext';

const Overview = () => {
  const {
    userData,
    pullRequests,
    issues,
    repositories,
    organizations,
    starredRepos,
    followers,
    following,
    loading,
    darkMode,
  } = useGithub();

  // Calculate summary statistics
  const stats = {
    prs: {
      total: pullRequests?.length || 0,
      open: pullRequests?.filter(pr => pr.state === 'open')?.length || 0,
      merged: pullRequests?.filter(pr => pr.state === 'merged' || pr.merged_at)?.length || 0,
      closed: pullRequests?.filter(pr => pr.state === 'closed' && !pr.merged_at)?.length || 0,
    },
    issues: {
      total: issues?.length || 0,
      open: issues?.filter(issue => issue.state === 'open')?.length || 0,
      closed: issues?.filter(issue => issue.state === 'closed')?.length || 0,
    },
    repos: {
      total: repositories?.length || 0,
      public: repositories?.filter(repo => !repo.private)?.length || 0,
      private: repositories?.filter(repo => repo.private)?.length || 0,
      forked: repositories?.filter(repo => repo.fork)?.length || 0,
      sources: repositories?.filter(repo => !repo.fork)?.length || 0,
    },
    orgs: {
      total: organizations?.length || 0,
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 h-32 w-full"></div>
        <div className="px-6 py-4 flex flex-col md:flex-row">
          <div className="-mt-16 mb-4 md:mb-0 flex-shrink-0">
            {userData && userData.avatar_url && (
              <img
                src={userData.avatar_url}
                alt={userData.login}
                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-md"
              />
            )}
          </div>
          <div className="md:ml-6 flex-grow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData?.name || userData?.login || 'GitHub User'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  @{userData?.login || 'username'}
                </p>
                {userData?.bio && (
                  <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-3xl">
                    {userData.bio}
                  </p>
                )}
              </div>
              <div className="mt-4 md:mt-0">
                <a
                  href={`https://github.com/${userData?.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View Profile
                </a>
              </div>
            </div>

            {/* User details (location, company, etc.) */}
            {userData &&
              (userData.company ||
                userData.location ||
                userData.blog ||
                userData.twitter_username) ? (
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
                {userData.company && (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {userData.company}
                  </div>
                )}

                {userData.location && (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {userData.location}
                  </div>
                )}

                {userData.blog && (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <a
                      href={
                        userData.blog.startsWith('http')
                          ? userData.blog
                          : `https://${userData.blog}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {userData.blog}
                    </a>
                  </div>
                )}

                {userData.twitter_username && (
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                    <a
                      href={`https://twitter.com/${userData.twitter_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      @{userData.twitter_username}
                    </a>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Pull Requests"
          value={stats.prs.total}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          }
          details={[
            { label: 'Open', value: stats.prs.open },
            { label: 'Merged', value: stats.prs.merged },
            { label: 'Closed', value: stats.prs.closed },
          ]}
        />
        <StatCard
          title="Issues"
          value={stats.issues.total}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          details={[
            { label: 'Open', value: stats.issues.open },
            { label: 'Closed', value: stats.issues.closed },
          ]}
        />
        <StatCard
          title="Repositories"
          value={stats.repos.total}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          }
          details={[
            { label: 'Public', value: stats.repos.public },
            { label: 'Private', value: stats.repos.private },
            { label: 'Forked', value: stats.repos.forked },
          ]}
        />
        <StatCard
          title="Network"
          value={(followers?.length || 0) + (following?.length || 0)}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          details={[
            { label: 'Followers', value: followers?.length || 0 },
            { label: 'Following', value: following?.length || 0 },
            { label: 'Starred', value: starredRepos?.length || 0 },
            { label: 'Orgs', value: stats.orgs.total },
          ]}
        />

      </div>

      {/* Account Summary Box */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Activity Overview
            </h4>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Member for</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {userData?.created_at
                    ? `${Math.floor((new Date() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24 * 365))} years`
                    : 'Unknown'}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Open Source Contributions</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.prs.total + stats.issues.total}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Repositories Created</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.repos.sources}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Languages Used</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Array.from(new Set(repositories?.map(repo => repo.language).filter(Boolean) || [])).length}
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Top Languages
            </h4>
            <div className="space-y-2">
              {getTopLanguages(repositories, 5).map((lang, index) => (
                <div key={lang.name} className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${lang.percentage}%`,
                        backgroundColor: getLanguageColor(lang.name)
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 w-24 text-right">
                    {lang.name} ({lang.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Update Time */}
      <div className={`text-right text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        Data current as of {new Date().toLocaleDateString()}{' '}
        {new Date().toLocaleTimeString()}
      </div>

    </div>
  );
};

// Enhanced StatCard with details
const StatCard = ({ title, value, icon, details = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </div>
          {icon}
        </div>
        <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </div>

      {details.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 px-5 py-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-xs">
            {details.map((detail, index) => (
              <div key={detail.label} className="flex flex-col items-center">
                <span className="text-gray-500 dark:text-gray-400">{detail.label}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get top languages
function getTopLanguages(repositories, limit = 5) {
  if (!repositories || !repositories.length) return [];

  // Count languages
  const langs = {};
  const reposWithLang = repositories.filter(repo => repo.language);

  reposWithLang.forEach(repo => {
    if (!langs[repo.language]) {
      langs[repo.language] = 0;
    }
    langs[repo.language]++;
  });

  // Convert to array and sort
  const sortedLangs = Object.entries(langs)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / reposWithLang.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return sortedLangs;
}

// Helper function to get language color
function getLanguageColor(language) {
  // Common language colors (GitHub-like)
  const colors = {
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
    R: "#198CE7"
  };

  return colors[language] || "#8b8b8b"; // Default gray for unknown languages
}

export default Overview;