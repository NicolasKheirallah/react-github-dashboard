import React, { useState, useEffect } from 'react';
import { useGithub } from '../context/GithubContext';
import { testTokenValidity } from '../services/githubService';

const Login = ({ onLogin }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [savedTokens, setSavedTokens] = useState([]);
  const [showAddToken, setShowAddToken] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const { darkMode, toggleDarkMode } = useGithub();

  // Load saved tokens on component mount
  useEffect(() => {
    const loadSavedTokens = () => {
      try {
        const tokens = localStorage.getItem('github-saved-tokens');
        if (tokens) {
          return JSON.parse(tokens);
        }
      } catch (error) {
        console.error('Error loading saved tokens:', error);
      }
      return [];
    };

    setSavedTokens(loadSavedTokens());
  }, []);

  const handleSaveToken = (token, name) => {
    try {
      const newToken = { name: name || 'Unnamed Token', token, lastUsed: new Date().toISOString() };
      const updatedTokens = [...savedTokens.filter(t => t.token !== token), newToken];
      localStorage.setItem('github-saved-tokens', JSON.stringify(updatedTokens));
      setSavedTokens(updatedTokens);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const handleDeleteSavedToken = (tokenToDelete) => {
    try {
      const updatedTokens = savedTokens.filter(t => t.token !== tokenToDelete);
      localStorage.setItem('github-saved-tokens', JSON.stringify(updatedTokens));
      setSavedTokens(updatedTokens);
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  };

  const handleUseSavedToken = (token) => {
    setTokenInput(token);
    // Update last used date
    const updatedTokens = savedTokens.map(t => 
      t.token === token ? { ...t, lastUsed: new Date().toISOString() } : t
    );
    localStorage.setItem('github-saved-tokens', JSON.stringify(updatedTokens));
    setSavedTokens(updatedTokens);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!tokenInput.trim()) {
      setError('Please enter a GitHub personal access token');
      setLoading(false);
      return;
    }
    
    try {
      const isValid = await testTokenValidity(tokenInput);
      
      if (isValid) {
        // Save current session token
        if (rememberMe) {
          localStorage.setItem('github-token', tokenInput);
          if (tokenName || !savedTokens.some(t => t.token === tokenInput)) {
            handleSaveToken(tokenInput, tokenName);
          }
        } else {
          // For session only - use sessionStorage instead
          sessionStorage.setItem('github-token', tokenInput);
          localStorage.removeItem('github-token');
        }
        
        onLogin(tokenInput);
      } else {
        setError('Invalid token or insufficient permissions. Please check your token and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(`Authentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-github-dark">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-16 w-16 text-gray-900 dark:text-white">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">GitHub Dashboard</h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
            Visualize your GitHub activity with interactive charts and analytics
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-github-border">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Sign in to your Dashboard</h2>
            
            {/* Saved tokens section */}
            {savedTokens.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Your saved tokens</h3>
                <div className="space-y-2">
                  {savedTokens.map((saved, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{saved.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Last used: {new Date(saved.lastUsed).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleUseSavedToken(saved.token)}
                          className="text-github-accent hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          Use
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedToken(saved.token)}
                          className="text-github-danger hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>
              </div>
            )}
            
            {/* Add new token UI */}
            <div className={showAddToken ? 'block' : 'hidden'}>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="tokenName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Token Name (optional)
                  </label>
                  <input
                    id="tokenName"
                    name="tokenName"
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-github-border rounded-lg shadow-sm focus:ring-github-accent focus:border-github-accent dark:bg-gray-700 dark:text-white"
                    placeholder="My GitHub Token"
                  />
                </div>
                
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Personal Access Token
                  </label>
                  <input
                    id="token"
                    name="token"
                    type="password"
                    required
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-github-border rounded-lg shadow-sm focus:ring-github-accent focus:border-github-accent dark:bg-gray-700 dark:text-white"
                    placeholder="ghp_..."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Tokens are securely stored in your browser's local storage.
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-github-accent focus:ring-github-accent border-gray-300 dark:border-github-border rounded"
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember this token
                  </label>
                </div>
                
                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-red-400 dark:text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-github-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent disabled:opacity-50 transition duration-150"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                      </>
                    ) : "Sign in"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddToken(false)}
                    className="px-4 py-3 border border-gray-300 dark:border-github-border rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
            
            {/* Sign in buttons */}
            {!showAddToken && (
              <div className="space-y-4">
                <button 
                  type="button"
                  onClick={() => setShowAddToken(true)}
                  className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-github-border rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add GitHub Token
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                      Other options
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => window.open('https://github.com/settings/tokens/new?scopes=repo,read:org,user', '_blank')}
                  className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-github-border rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-2">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Create New GitHub Token
                </button>
              </div>
            )}
            
            <div className="mt-6">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Learn how to <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" target="_blank" rel="noopener noreferrer" className="font-medium text-github-accent hover:text-blue-600 dark:hover:text-blue-300">create a token</a>
              </p>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-github-border">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold">🔒 Privacy First:</span> All processing happens locally in your browser. Your tokens and data are never sent to any server.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={toggleDarkMode} 
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Switch to Light Mode
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
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