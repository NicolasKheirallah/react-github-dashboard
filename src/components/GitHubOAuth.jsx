// src/components/GitHubOAuth.jsx
import React, { useState, useEffect } from 'react';

const GitHubOAuth = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // GitHub OAuth app client ID - should be stored in environment variables in production
  const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
  
  // Generate a random state value for security
  const generateState = () => {
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    return Array.from(array, (dec) => dec.toString(16).padStart(8, '0')).join('');
  };
  
  // Handle OAuth flow
  const handleOAuthLogin = () => {
    try {
      setLoading(true);
      setError(null);
      
      const state = generateState();
      // Store state in localStorage to verify when we get the callback
      localStorage.setItem('github-oauth-state', state);
      
      // Set the scope we need
      const scope = 'repo read:org read:user';
      
      // Construct authorization URL
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&state=${state}&redirect_uri=${window.location.origin}`;
      
      // Redirect to GitHub for authorization
      window.location.href = authUrl;
    } catch (err) {
      console.error('OAuth error:', err);
      setError('Failed to initialize GitHub OAuth login');
      setLoading(false);
    }
  };
  
  // Handle OAuth callback - note that this requires a server component to exchange the code for a token
  // In a real implementation, you would have a backend service to handle this exchange
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const returnedState = urlParams.get('state');
      const error = urlParams.get('error');
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (error) {
        setError(`GitHub OAuth error: ${error}`);
        return;
      }
      
      if (code && returnedState) {
        try {
          setLoading(true);
          
          // Verify state to prevent CSRF attacks
          const savedState = localStorage.getItem('github-oauth-state');
          if (returnedState !== savedState) {
            throw new Error('OAuth state mismatch - possible CSRF attack');
          }
          
          // Clear saved state
          localStorage.removeItem('github-oauth-state');
          
          // In a real app, you would exchange the code for a token here using a backend service
          // For example:
          // const response = await fetch('/api/github/oauth/token', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ code })
          // });
          // const data = await response.json();
          // if (data.access_token) {
          //   onLogin(data.access_token);
          // } else {
          //   throw new Error('Failed to get access token');
          // }
          
          // IMPORTANT NOTE:
          // For this demo, we're not implementing the backend exchange
          // Users should enter their token manually in the Login component
          // This component is provided as a reference for implementing full OAuth flow
          
          setLoading(false);
        } catch (err) {
          console.error('OAuth callback error:', err);
          setError(err.message || 'Failed to complete GitHub OAuth login');
          setLoading(false);
        }
      }
    };
    
    if (window.location.search.includes('code=')) {
      handleOAuthCallback();
    }
  }, [onLogin]);
  
  return (
    <div className="mt-6 text-center">
      <button
        onClick={handleOAuthLogin}
        disabled={loading || !clientId}
        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        {loading ? 'Signing in...' : 'Sign in with GitHub'}
      </button>
      
      {!clientId && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          GitHub Client ID not configured. OAuth login is disabled.
        </p>
      )}
      
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Note: Full OAuth flow requires a backend service to exchange the code for a token. 
        For privacy protection in this client-only app, please use a Personal Access Token instead.
      </p>
    </div>
  );
};

export default GitHubOAuth;