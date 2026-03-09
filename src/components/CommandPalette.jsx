import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { useTheme } from '../context/ThemeContext';
import { openExternalUrl } from '../utils/externalLinks';
import { useDialogFocusTrap } from '../hooks/useDialogFocusTrap';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { repositories, pullRequests, issues } = useGithub();
  const { toggleDarkMode } = useTheme();
  const dialogRef = useDialogFocusTrap(isOpen, inputRef);

  const commands = useMemo(
    () => [
      { id: 'dashboard', name: 'Go to Dashboard', shortcut: 'g d', action: () => navigate('/') },
      {
        id: 'repos',
        name: 'View Repositories',
        shortcut: 'g r',
        action: () => navigate('/?tab=repositories'),
      },
      {
        id: 'prs',
        name: 'View Pull Requests',
        shortcut: 'g p',
        action: () => navigate('/?tab=pull-requests'),
      },
      {
        id: 'issues',
        name: 'View Issues',
        shortcut: 'g i',
        action: () => navigate('/?tab=issues'),
      },
      {
        id: 'organizations',
        name: 'View Organizations',
        shortcut: 'g o',
        action: () => navigate('/?tab=organizations'),
      },
      { id: 'search', name: 'Open Advanced Search', shortcut: '/', action: () => navigate('/search') },
      { id: 'theme', name: 'Toggle Dark Mode', shortcut: 'ctrl k t', action: toggleDarkMode },
      {
        id: 'logout',
        name: 'Sign Out',
        shortcut: 'ctrl l',
        action: () => window.dispatchEvent(new Event('github-dashboard:logout')),
      },
    ],
    [navigate, toggleDarkMode]
  );

  const dynamicCommands = useMemo(
    () => [
      ...repositories.slice(0, 5).map((repo) => ({
        id: `repo-${repo.name}`,
        name: `Open Repository: ${repo.name}`,
        description: repo.description,
        action: () => openExternalUrl(repo.url),
      })),
      ...pullRequests.slice(0, 3).map((pr) => ({
        id: `pr-${pr.number}`,
        name: `Open PR: #${pr.number}`,
        description: pr.title,
        action: () => openExternalUrl(pr.url),
      })),
      ...issues.slice(0, 3).map((issue) => ({
        id: `issue-${issue.number}`,
        name: `Open Issue: #${issue.number}`,
        description: issue.title,
        action: () => openExternalUrl(issue.url),
      })),
    ],
    [issues, pullRequests, repositories]
  );

  const filteredCommands = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return [...commands, ...dynamicCommands].filter(
      (command) =>
        command.name.toLowerCase().includes(query) ||
        command.description?.toLowerCase().includes(query) ||
        command.shortcut?.toLowerCase().includes(query)
    );
  }, [commands, dynamicCommands, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen((currentValue) => !currentValue);
      }

      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyNavigation = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((currentIndex) =>
        currentIndex < filteredCommands.length - 1 ? currentIndex + 1 : currentIndex
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((currentIndex) => (currentIndex > 0 ? currentIndex - 1 : 0));
    } else if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
      event.preventDefault();
      filteredCommands[selectedIndex].action();
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75"
        onClick={() => setIsOpen(false)}
        aria-label="Close command palette"
      />

      <div className="fixed inset-0 flex items-start justify-center pt-16 sm:pt-24">
        <div className="w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-800">
          <div className="flex items-center border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <svg className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 border-none bg-transparent text-base text-gray-900 placeholder-gray-400 focus:ring-0 dark:text-white dark:placeholder-gray-500"
              placeholder="Search commands"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyNavigation}
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No matching commands found.
              </div>
            ) : (
              <ul className="py-2">
                {filteredCommands.map((command, index) => (
                  <li key={command.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => {
                        command.action();
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {command.name}
                        </div>
                        {command.description && (
                          <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                            {command.description}
                          </div>
                        )}
                      </div>
                      {command.shortcut && (
                        <div className="ml-3 flex items-center">
                          {command.shortcut.split(' ').map((key, indexValue) => (
                            <React.Fragment key={`${command.id}-${key}-${indexValue}`}>
                              {indexValue > 0 && <span className="mx-1">+</span>}
                              <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-xs dark:border-gray-600 dark:bg-gray-700">
                                {key}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
