// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomizableDashboard from './components/dashboard/CustomizableDashboard';
import CommandPalette from './components/CommandPalette';
import NotificationCenter from './components/NotificationCenter';
import SearchPage from './components/SearchPage';
import UnifiedSearch from './components/UnifiedSearch';
import { GithubProvider } from './context/GithubContext';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [useCustomDashboard, setUseCustomDashboard] = useState(true);

  // Check for token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('github-token') || sessionStorage.getItem('github-token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }

    // Check dashboard preference
    const dashboardPref = localStorage.getItem('use-custom-dashboard');
    if (dashboardPref !== null) {
      setUseCustomDashboard(dashboardPref === 'true');
    }
  }, []);

  const handleLogin = (accessToken) => {
    setToken(accessToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setToken('');
    setIsAuthenticated(false);
    // Clear stored tokens
    localStorage.removeItem('github-token');
    sessionStorage.removeItem('github-token');
  };

  const toggleDashboardType = () => {
    setUseCustomDashboard(prev => {
      const newValue = !prev;
      localStorage.setItem('use-custom-dashboard', newValue.toString());
      return newValue;
    });
  };

  return (
    <Router>
      <GithubProvider value={{ token, isAuthenticated }}>
        <div className="min-h-screen bg-gray-50 dark:bg-github-dark text-gray-900 dark:text-white">
          {isAuthenticated && (
            <Header
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
              notificationCenter={<NotificationCenter />}
              toggleDashboardType={toggleDashboardType}
              useCustomDashboard={useCustomDashboard}
              searchComponent={<UnifiedSearch />}
            />
          )}

          <main className={isAuthenticated ? "container mx-auto px-4 py-8" : ""}>
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    useCustomDashboard ? <CustomizableDashboard /> : <Dashboard />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                }
              />
              <Route
                path="/search"
                element={
                  isAuthenticated ? (
                    <SearchPage />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                }
              />
            </Routes>
          </main>

          {isAuthenticated && (
            <footer className="py-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    GitHub Dashboard · Built with React · {new Date().getFullYear()}
                  </p>
                  <div className="flex space-x-4 mt-4 md:mt-0">
                    <button
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => window.open('https://github.com/settings/tokens', '_blank')}
                    >
                      Manage GitHub Tokens
                    </button>
                    <button
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => {
                        const element = document.createElement('a');
                        const file = new Blob([JSON.stringify({
                          dashboardLayout: localStorage.getItem('dashboard-layout'),
                          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
                          savedFilters: localStorage.getItem('github-advanced-filters'),
                          recentSearches: localStorage.getItem('github-recent-searches')
                        })], { type: 'application/json' });
                        element.href = URL.createObjectURL(file);
                        element.download = "github-dashboard-settings.json";
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                    >
                      Export Settings
                    </button>
                    <button
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'application/json';
                        input.onchange = (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const settings = JSON.parse(event.target.result);
                                if (settings.dashboardLayout) {
                                  localStorage.setItem('dashboard-layout', settings.dashboardLayout);
                                }
                                if (settings.theme) {
                                  if (settings.theme === 'dark') {
                                    document.documentElement.classList.add('dark');
                                  } else {
                                    document.documentElement.classList.remove('dark');
                                  }
                                }
                                if (settings.savedFilters) {
                                  localStorage.setItem('github-advanced-filters', settings.savedFilters);
                                }
                                if (settings.recentSearches) {
                                  localStorage.setItem('github-recent-searches', settings.recentSearches);
                                }
                                window.location.reload();
                              } catch (error) {
                                console.error('Error importing settings:', error);
                                alert('Invalid settings file');
                              }
                            };
                            reader.readAsText(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      Import Settings
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          )}

          {/* Command Palette - Global component */}
          {isAuthenticated && <CommandPalette />}
        </div>
      </GithubProvider>
    </Router>
  );
}

export default App;