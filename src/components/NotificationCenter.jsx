import React, { useState, useEffect } from 'react';
import { useGithub } from '../context/GithubContext';
import { fetchNotifications, markNotificationAsRead } from '../services/githubService';

const NotificationCenter = () => {
  const { token } = useGithub();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const data = await fetchNotifications(token);
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchUserNotifications();

    // Poll for notifications every 60 seconds
    const interval = setInterval(fetchUserNotifications, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(token, id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(notifications.map((n) => markNotificationAsRead(token, n.id)));
      setNotifications([]);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PullRequest':
        return (
          <svg className="h-5 w-5 text-purple-500" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z" />
          </svg>
        );
      case 'Issue':
        return (
          <svg className="h-5 w-5 text-green-500" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" />
          </svg>
        );
      case 'Commit':
        return (
          <svg className="h-5 w-5 text-blue-500" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
    }
  };

  // Format the notification time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHrs < 24) {
      return `${diffHrs} hour${diffHrs !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Convert API URL to web URL
  const getWebUrl = (apiUrl) => {
    if (!apiUrl) return '#';
    return apiUrl.replace('api.github.com/repos', 'github.com');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750 rounded-t-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500 dark:text-red-400">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>All caught up! No new notifications.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <li key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.subject.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {notification.repository.full_name}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(notification.updated_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {notification.subject.title}
                        </p>
                        <div className="mt-2 flex space-x-3">
                          <a
                            href={getWebUrl(notification.subject.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Mark as read
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-b-lg">
            <a
              href="https://github.com/notifications"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              View all on GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;