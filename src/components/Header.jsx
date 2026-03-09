import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { useTheme } from '../context/ThemeContext';
import SafeExternalLink from './SafeExternalLink';

const Header = ({
  onLogout,
  toggleDashboardType,
  useCustomDashboard,
  notificationCenter,
  searchComponent,
}) => {
  const { userData } = useGithub();
  const { darkMode, toggleDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleQuickSearch = (event) => {
    if (event.key === 'Enter' && event.currentTarget.value.trim()) {
      navigate(`/search?q=${encodeURIComponent(event.currentTarget.value.trim())}`);
    }
  };

  const navigateToTab = (tabId) => {
    if (useCustomDashboard) {
      toggleDashboardType();
    }

    navigate(`/?tab=${tabId}`);
    setMenuOpen(false);
  };

  const navItems = [
    { id: 'pull-requests', label: 'Pull Requests' },
    { id: 'issues', label: 'Issues' },
    { id: 'repositories', label: 'Repositories' },
    { id: 'organizations', label: 'Organizations' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-900 dark:text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                GitHub Dashboard
              </span>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateToTab(item.id)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/search"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                Advanced Search
              </Link>
            </nav>
          </div>

          <div className="hidden flex-1 items-center md:flex">
            <label htmlFor="header-search" className="sr-only">
              Search GitHub data
            </label>
            <div className="relative mx-4 w-full max-w-lg">
              <input
                id="header-search"
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-10 pr-16 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Search GitHub data..."
                onKeyDown={handleQuickSearch}
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-4 w-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-600 dark:text-gray-300">
                  Ctrl+/
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {searchComponent && <div className="hidden md:block">{searchComponent}</div>}
            {notificationCenter && <div className="relative">{notificationCenter}</div>}

            <button
              type="button"
              onClick={toggleDashboardType}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              aria-label={
                useCustomDashboard
                  ? 'Switch to the standard dashboard'
                  : 'Switch to the custom dashboard'
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="hidden flex-col items-end md:flex">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {userData?.name || userData?.login || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userData?.login ? `@${userData.login}` : ''}
                </p>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((isOpen) => !isOpen)}
                  className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Open user menu"
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={
                      userData?.avatar_url ||
                      'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                    }
                    alt={userData?.login || 'GitHub user'}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 dark:bg-gray-800">
                    <SafeExternalLink
                      href={userData?.html_url}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Your Profile
                    </SafeExternalLink>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/search');
                        setMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Advanced Search
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-3 md:hidden dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Search
          </button>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateToTab(item.id)}
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
