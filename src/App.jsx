import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Loader from './components/Loader';
import AppErrorBoundary from './components/AppErrorBoundary';
import { GithubProvider } from './context/GithubContext';
import { ThemeProvider } from './context/ThemeContext';
import { queryClient } from './lib/queryClient';
import { clearGithubApiCache } from './services/github/apiClient';
import {
  applyImportedSettings,
  buildSettingsExport,
  downloadSettingsFile,
  parseImportedSettings,
} from './utils/settings';
import { openExternalUrl } from './utils/externalLinks';
import './App.css';

const Dashboard = lazy(() => import('./components/Dashboard'));
const CustomizableDashboard = lazy(() =>
  import('./components/dashboard/CustomizableDashboard')
);
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const NotificationCenter = lazy(() => import('./components/NotificationCenter'));
const SearchPage = lazy(() => import('./components/SearchPage'));
const UnifiedSearch = lazy(() => import('./components/UnifiedSearch'));

const LoadingFallback = ({ message }) => (
  <div className="py-12">
    <Loader message={message} />
  </div>
);

const AppShell = () => {
  const [token, setToken] = useState('');
  const [useCustomDashboard, setUseCustomDashboard] = useState(() => {
    const savedPreference = localStorage.getItem('use-custom-dashboard');
    return savedPreference !== null ? savedPreference === 'true' : true;
  });
  const [settingsRevision, setSettingsRevision] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);
  const location = useLocation();
  const isAuthenticated = Boolean(token);
  const hasTabQuery = new URLSearchParams(location.search).has('tab');

  useEffect(() => {
    const handleLogout = () => {
      clearGithubApiCache();
      queryClient.clear();
      setToken('');
      setStatusMessage('Signed out. Your token was cleared from memory.');
    };

    window.addEventListener('github-dashboard:logout', handleLogout);
    return () => {
      window.removeEventListener('github-dashboard:logout', handleLogout);
    };
  }, []);

  const handleLogin = (accessToken) => {
    clearGithubApiCache();
    queryClient.clear();
    setToken(accessToken.trim());
    setStatusMessage('');
  };

  const handleLogout = () => {
    clearGithubApiCache();
    queryClient.clear();
    setToken('');
    setStatusMessage('Signed out. Your token was cleared from memory.');
  };

  const toggleDashboardType = () => {
    setUseCustomDashboard((currentValue) => {
      const nextValue = !currentValue;
      localStorage.setItem('use-custom-dashboard', String(nextValue));
      return nextValue;
    });
  };

  const handleExportSettings = () => {
    downloadSettingsFile(buildSettingsExport());
    setStatusMessage('Settings exported successfully.');
  };

  const handleImportSettings = async (event) => {
    const [file] = event.target.files || [];

    if (!file) {
      return;
    }

    try {
      const fileContents = await file.text();
      const settings = parseImportedSettings(fileContents);
      applyImportedSettings(settings);

      if (typeof settings.useCustomDashboard === 'boolean') {
        setUseCustomDashboard(settings.useCustomDashboard);
      }

      setSettingsRevision((currentValue) => currentValue + 1);
      setStatusMessage('Settings imported successfully.');
    } catch (error) {
      setStatusMessage(error.message || 'Failed to import settings.');
    } finally {
      event.target.value = '';
    }
  };

  const openImportPicker = () => {
    fileInputRef.current?.click();
  };

  const renderDashboardRoute = () => {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }

    if (useCustomDashboard && !hasTabQuery) {
      return (
        <Suspense fallback={<LoadingFallback message="Loading your dashboard..." />}>
          <CustomizableDashboard key={`custom-dashboard-${settingsRevision}`} />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<LoadingFallback message="Loading your dashboard..." />}>
        <Dashboard key={`dashboard-${settingsRevision}`} />
      </Suspense>
    );
  };

  return (
    <GithubProvider value={{ token, isAuthenticated }}>
      <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {isAuthenticated && (
          <Header
            onLogout={handleLogout}
            toggleDashboardType={toggleDashboardType}
            useCustomDashboard={useCustomDashboard}
            notificationCenter={
              <Suspense fallback={null}>
                <NotificationCenter />
              </Suspense>
            }
            searchComponent={
              <Suspense fallback={null}>
                <UnifiedSearch />
              </Suspense>
            }
          />
        )}

        {statusMessage && (
          <div className="container mx-auto px-4 pt-4">
            <div
              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-300"
              role="status"
            >
              {statusMessage}
            </div>
          </div>
        )}

        <main className={isAuthenticated ? 'container mx-auto px-4 py-8' : ''}>
          <Routes>
            <Route path="/" element={renderDashboardRoute()} />
            <Route
              path="/search"
              element={
                isAuthenticated ? (
                  <Suspense fallback={<LoadingFallback message="Loading search..." />}>
                    <SearchPage key={`search-${settingsRevision}`} />
                  </Suspense>
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
          </Routes>
        </main>

        {isAuthenticated && (
          <footer className="mt-auto border-t border-slate-200 bg-slate-100 py-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  GitHub Dashboard · Built with React · {new Date().getFullYear()}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={() => openExternalUrl('https://github.com/settings/tokens')}
                  >
                    Manage GitHub Tokens
                  </button>
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={handleExportSettings}
                  >
                    Export Settings
                  </button>
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={openImportPicker}
                  >
                    Import Settings
                  </button>
                </div>
              </div>
            </div>
          </footer>
        )}

        {isAuthenticated && (
          <Suspense fallback={null}>
            <CommandPalette />
          </Suspense>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImportSettings}
        />
      </div>
    </GithubProvider>
  );
};

function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppShell />
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
