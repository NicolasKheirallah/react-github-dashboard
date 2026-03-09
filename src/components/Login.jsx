import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { testTokenValidity } from '../services/github/session';
import { openExternalUrl } from '../utils/externalLinks';
import SafeExternalLink from './SafeExternalLink';

const TOKEN_CREATION_URL =
  'https://github.com/settings/tokens/new?scopes=repo,read:org,read:user';

const Login = ({ onLogin }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedToken = tokenInput.trim();

    if (!trimmedToken) {
      setError('Enter a GitHub personal access token to continue.');
      return;
    }

    setLoading(true);

    try {
      const isValid = await testTokenValidity(trimmedToken);

      if (!isValid) {
        setError('The token is invalid or does not have the required GitHub scopes.');
        return;
      }

      onLogin(trimmedToken);
      setTokenInput('');
    } catch (validationError) {
      console.error('Login error:', validationError);
      setError('Authentication failed. Verify the token and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-16 w-16 text-gray-900 dark:text-white"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            GitHub Dashboard
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-base text-gray-600 dark:text-gray-400">
            Visualize your GitHub activity with interactive charts and analytics.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="px-6 py-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Sign in with a GitHub token
            </h2>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="token"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Personal access token
                </label>
                <input
                  id="token"
                  name="token"
                  type="password"
                  required
                  autoComplete="off"
                  spellCheck="false"
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="github_pat_..."
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  The token stays in memory only for this browser session. It is
                  not saved to local storage.
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                Recommended scopes: <code>repo</code>, <code>read:org</code>, and{' '}
                <code>read:user</code>.
              </div>

              {error && (
                <div
                  className="rounded-md bg-red-50 p-4 dark:bg-red-900/20"
                  role="alert"
                >
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white transition duration-150 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign in'}
                </button>
                <button
                  type="button"
                  onClick={() => openExternalUrl(TOKEN_CREATION_URL)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  Create token
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Learn how to{' '}
                <SafeExternalLink
                  href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  create a GitHub token
                </SafeExternalLink>
                .
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Privacy first:</span> this client-only
              app talks directly to the GitHub API from your browser.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
            First Use
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
            Get from token to signal in three steps
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">1. Create a token</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Start with `repo`, `read:org`, and `read:user` so the dashboard can load your repos, PRs, issues, and orgs.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">2. Pick a working mode</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Use saved views like Review Queue, Repo Health, or Code Watch instead of rebuilding filters from scratch.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">3. Narrow the scope</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Scope by owner, repo, and time window when you want to move from overview into one concrete decision.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
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
                Switch to Light Mode
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
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
                Switch to Dark Mode
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
