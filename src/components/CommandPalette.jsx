import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { repositories, pullRequests, issues } = useGithub();
  
  // Define available commands
  const commands = [
    { id: 'dashboard', name: 'Go to Dashboard', shortcut: 'g d', action: () => navigate('/') },
    { id: 'repos', name: 'View Repositories', shortcut: 'g r', action: () => navigate('/?tab=repositories') },
    { id: 'prs', name: 'View Pull Requests', shortcut: 'g p', action: () => navigate('/?tab=pull-requests') },
    { id: 'issues', name: 'View Issues', shortcut: 'g i', action: () => navigate('/?tab=issues') },
    { id: 'organizations', name: 'View Organizations', shortcut: 'g o', action: () => navigate('/?tab=organizations') },
    { id: 'starred', name: 'View Starred Repositories', shortcut: 'g s', action: () => navigate('/?tab=starred') },
    { id: 'theme', name: 'Toggle Dark Mode', shortcut: 'ctrl k t', action: () => document.documentElement.classList.toggle('dark') },
    { id: 'logout', name: 'Logout', shortcut: 'ctrl l', action: () => navigate('/logout') },
    { id: 'help', name: 'View Keyboard Shortcuts', shortcut: '?', action: () => setIsOpen(true) },
  ];
  
  // Add dynamic commands for repositories
  const repoCommands = repositories?.slice(0, 5).map(repo => ({
    id: `repo-${repo.name}`,
    name: `Open Repository: ${repo.name}`,
    description: repo.description,
    action: () => window.open(repo.url, '_blank')
  })) || [];
  
  // Add dynamic commands for pull requests
  const prCommands = pullRequests?.slice(0, 3).map(pr => ({
    id: `pr-${pr.number}`,
    name: `Open PR: #${pr.number}`,
    description: pr.title,
    action: () => window.open(pr.url, '_blank')
  })) || [];
  
  const issueCommands = issues?.slice(0, 3).map(issue => ({
    id: `issue-${issue.number}`,
    name: `Open Issue: #${issue.number}`,
    description: issue.title,
    action: () => window.open(issue.url, '_blank')
  })) || [];
  
  // Filter commands based on search query
  const filteredCommands = [
    ...commands,
    ...repoCommands,
    ...prCommands,
    ...issueCommands
  ].filter(command => 
    command.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (command.description && command.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (command.shortcut && command.shortcut.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  
  // Handle key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  // Focus input when palette opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);
  
  // Handle keyboard navigation within results
  const handleKeyNavigation = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
        setSearchQuery('');
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Command Palette Panel */}
      <div className="fixed inset-0 flex items-start justify-center pt-16 sm:pt-24">
        <div className="w-full max-w-xl bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden transform transition-all">
          {/* Search input */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <svg className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white text-base placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Search commands or type ? to see all shortcuts"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyNavigation}
            />
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                ↓
              </kbd>
              <span>to navigate</span>
              
              <kbd className="ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                esc
              </kbd>
              <span>to close</span>
            </div>
          </div>
          
          {/* Results list */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No matching commands found
              </div>
            ) : (
              <ul className="py-2">
                {filteredCommands.map((command, index) => (
                  <li key={command.id}>
                    <button
                      className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${
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
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {command.description}
                          </div>
                        )}
                      </div>
                      {command.shortcut && (
                        <div className="ml-3 flex items-center">
                          {command.shortcut.split(' ').map((key, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <span className="mx-1">+</span>}
                              <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
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