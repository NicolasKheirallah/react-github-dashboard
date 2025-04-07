import React, { useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableWidget } from './SortableWidget';

// Import all chart components
import ActivityHeatmap from './charts/ActivityHeatmap';
import PRStatusChart from './charts/PRStatusChart';
import LanguageChart from './charts/LanguageChart';
import TimelineChart from './charts/TimelineChart';
import CommitFrequencyChart from './charts/CommitFrequencyChart';
import IssueTypesChart from './charts/IssueTypesChart';
import IssueResolutionChart from './charts/IssueResolutionChart';
import PRReviewTimeChart from './charts/PRReviewTimeChart';
import PRSizeDistributionChart from './charts/PRSizeDistributionChart';
import CodeChurnChart from './charts/CodeChurnChart';
import CollaborationNetwork from './charts/CollaborationNetwork';
import CommitCalendar from './charts/CommitCalendar';
import RepositorySummary from './summaries/RepositorySummary';

// Define all available widgets
const ALL_WIDGETS = [
  { id: 'activity-heatmap', title: 'Activity Overview', description: 'Shows your GitHub activity over time', size: 'large', component: ActivityHeatmap, favorite: false, category: 'activity' },
  { id: 'pr-status', title: 'Pull Request Status', description: 'Distribution of open, closed, and merged PRs', size: 'medium', component: PRStatusChart, favorite: false, category: 'pullRequests' },
  { id: 'language-stats', title: 'Language Distribution', description: 'Languages used across your repositories', size: 'medium', component: LanguageChart, favorite: false, category: 'repositories' },
  { id: 'timeline', title: 'Contribution Timeline', description: 'Your contributions over time', size: 'large', component: TimelineChart, favorite: false, category: 'activity' },
  { id: 'repo-summary', title: 'Repository Summary', description: 'Overview of your repositories', size: 'medium', component: RepositorySummary, favorite: false, category: 'repositories' },
  { id: 'commit-frequency', title: 'Commit Frequency', description: 'How often you commit code', size: 'medium', component: CommitFrequencyChart, favorite: false, category: 'activity' },
  { id: 'issue-types', title: 'Issue Types', description: 'Breakdown of issues by type', size: 'medium', component: IssueTypesChart, favorite: false, category: 'issues' },
  { id: 'issue-resolution', title: 'Issue Resolution Time', description: 'How quickly issues are resolved', size: 'medium', component: IssueResolutionChart, favorite: false, category: 'issues' },
  { id: 'pr-review-time', title: 'PR Review Time', description: 'How long PRs take to be reviewed', size: 'medium', component: PRReviewTimeChart, favorite: false, category: 'pullRequests' },
  { id: 'pr-size-distribution', title: 'PR Size Distribution', description: 'Size distribution of your PRs', size: 'large', component: PRSizeDistributionChart, favorite: false, category: 'pullRequests' },
  { id: 'code-churn', title: 'Code Churn', description: 'Code additions and deletions over time', size: 'large', component: CodeChurnChart, favorite: false, category: 'repositories' },
  { id: 'collaboration-network', title: 'Collaboration Network', description: 'Your network of collaborators', size: 'large', component: CollaborationNetwork, favorite: false, category: 'activity' },
  { id: 'commit-calendar', title: 'Commit Calendar', description: 'Calendar view of your commit activity', size: 'large', component: CommitCalendar, favorite: false, category: 'activity' },
];

// Default layout with essential widgets
const DEFAULT_LAYOUT = [
  ALL_WIDGETS.find(w => w.id === 'activity-heatmap'),
  ALL_WIDGETS.find(w => w.id === 'pr-status'),
  ALL_WIDGETS.find(w => w.id === 'language-stats'),
  ALL_WIDGETS.find(w => w.id === 'timeline'),
  ALL_WIDGETS.find(w => w.id === 'repo-summary'),
];

const CustomizableDashboard = () => {
  const [widgets, setWidgets] = useState([]);
  const [availableWidgets, setAvailableWidgets] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState([]);
  const [addWidgetModalOpen, setAddWidgetModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [widgetConfig, setWidgetConfig] = useState(null);
  
  // Initialize sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Only activate drag after moving 8px
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
    const updateAvailableWidgets = useCallback((currentWidgets) => {
      const widgetIds = currentWidgets.map(w => w.id);
      const available = ALL_WIDGETS.filter(w => !widgetIds.includes(w.id));
      setAvailableWidgets(available);
    }, []);
  // Load saved layout or default
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboard-layout');
    try {
      if (savedLayout) {
        const parsedLayout = JSON.parse(savedLayout);
        const validatedLayout = parsedLayout.map(widget => {
          const matchedWidget = ALL_WIDGETS.find(w => w.id === widget.id);
          return { ...matchedWidget, ...widget };
        });
        setWidgets(validatedLayout);
      } else {
        setWidgets(DEFAULT_LAYOUT);
      }
  
      updateAvailableWidgets(savedLayout ? JSON.parse(savedLayout) : DEFAULT_LAYOUT);
    } catch (e) {
      console.error("Error loading dashboard layout:", e);
      setWidgets(DEFAULT_LAYOUT);
      updateAvailableWidgets(DEFAULT_LAYOUT);
    }
  }, [updateAvailableWidgets]); // ✅ add dependency here
  
  

  
  // Update visible widgets when widgets change
  useEffect(() => {
    setVisibleWidgets(widgets.filter(w => !w.hidden));
    updateAvailableWidgets(widgets);
  }, [widgets, updateAvailableWidgets]);
  
    
  // Save layout when it changes
  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem('dashboard-layout', JSON.stringify(widgets));
    }
  }, [widgets]);
  
  // Handle drag end event
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      // Find the indices of the source and destination items
      const oldIndex = visibleWidgets.findIndex(widget => widget.id === active.id);
      const newIndex = visibleWidgets.findIndex(widget => widget.id === over.id);
      
      // Reorder the visible widgets
      const updatedVisibleWidgets = arrayMove(visibleWidgets, oldIndex, newIndex);
      setVisibleWidgets(updatedVisibleWidgets);
      
      // Update the full widget list preserving hidden widgets
      const newWidgets = [...widgets];
      let visibleIndex = 0;
      
      // Update the order in the full widgets array
      for (let i = 0; i < newWidgets.length; i++) {
        if (!newWidgets[i].hidden) {
          newWidgets[i] = updatedVisibleWidgets[visibleIndex];
          visibleIndex++;
        }
      }
      
      setWidgets(newWidgets);
    }
  };
  
  // Toggle widget visibility
  const toggleWidgetVisibility = (id) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, hidden: !widget.hidden } : widget
    ));
  };
  
  // Toggle widget size
  const toggleWidgetSize = (id) => {
    setWidgets(widgets.map(widget => {
      if (widget.id === id) {
        const sizes = ['small', 'medium', 'large'];
        const currentIndex = sizes.indexOf(widget.size);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];
        return { ...widget, size: nextSize };
      }
      return widget;
    }));
  };
  
  // Toggle favorite status
  const toggleFavorite = (id) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, favorite: !widget.favorite } : widget
    ));
  };
  
  // Add a widget to the dashboard
  const addWidget = (widget) => {
    setWidgets([...widgets, { ...widget }]);
    setAddWidgetModalOpen(false);
  };
  
  // Remove widget from dashboard
  const removeWidget = (id) => {
    setWidgets(widgets.filter(widget => widget.id !== id));
  };
  
  // Configure widget
  const openWidgetConfig = (widget) => {
    setWidgetConfig(widget);
  };
  
  // Save widget configuration
  const saveWidgetConfig = (updatedConfig) => {
    setWidgets(widgets.map(widget => 
      widget.id === updatedConfig.id ? { ...widget, ...updatedConfig } : widget
    ));
    setWidgetConfig(null);
  };
  
  // Filter available widgets by category and search term
  const filteredWidgets = availableWidgets.filter(widget => {
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      widget.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get applicable widget categories from available widgets
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'activity', name: 'Activity' },
    { id: 'repositories', name: 'Repositories' },
    { id: 'pullRequests', name: 'Pull Requests' },
    { id: 'issues', name: 'Issues' },
  ];

  // Close all modals
  const closeAllModals = () => {
    setAddWidgetModalOpen(false);
    setWidgetConfig(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              editMode
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {editMode ? 'Done Editing' : 'Customize Dashboard'}
          </button>
          {editMode && (
            <>
              <button
                onClick={() => setAddWidgetModalOpen(true)}
                className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                Add Widget
              </button>
              <button
                onClick={() => setWidgets(DEFAULT_LAYOUT)}
                className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Reset Layout
              </button>
            </>
          )}
        </div>
      </div>
      
      {editMode && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Current Widgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map(widget => (
              <div key={widget.id} className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800 dark:text-white">{widget.title}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className={`p-1 rounded-md ${widget.hidden ? 'bg-gray-200 dark:bg-gray-600' : 'bg-blue-100 dark:bg-blue-900'}`}
                      title={widget.hidden ? "Show widget" : "Hide widget"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {widget.hidden ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleWidgetSize(widget.id)}
                      className="p-1 rounded-md bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                      title="Change size"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openWidgetConfig(widget)}
                      className="p-1 rounded-md bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                      title="Configure widget"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleFavorite(widget.id)}
                      className={`p-1 rounded-md ${widget.favorite ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'}`}
                      title={widget.favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={widget.favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      title="Remove widget"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {widget.description}
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
                    widget.size === 'large' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : widget.size === 'medium'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {widget.size.charAt(0).toUpperCase() + widget.size.slice(1)} size
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add Widget Modal */}
      {addWidgetModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Widgets</h3>
              <button
                onClick={closeAllModals}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search widgets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
                <span className="absolute right-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {filteredWidgets.map(widget => (
                <div
                  key={widget.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-800 cursor-pointer"
                  onClick={() => addWidget(widget)}
                >
                  <h4 className="font-medium text-gray-900 dark:text-white">{widget.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{widget.description}</p>
                  <div className="flex mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      widget.category === 'activity'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : widget.category === 'repositories'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : widget.category === 'pullRequests'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {widget.category}
                    </span>
                  </div>
                </div>
              ))}
              
              {filteredWidgets.length === 0 && (
                <div className="col-span-2 p-6 text-center text-gray-500 dark:text-gray-400">
                  No widgets match your search criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Widget Configuration Modal */}
      {widgetConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Configure Widget</h3>
              <button
                onClick={() => setWidgetConfig(null)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              saveWidgetConfig(widgetConfig);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={widgetConfig.title}
                  onChange={(e) => setWidgetConfig({...widgetConfig, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size
                </label>
                <select
                  value={widgetConfig.size}
                  onChange={(e) => setWidgetConfig({...widgetConfig, size: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={widgetConfig.favorite}
                    onChange={(e) => setWidgetConfig({...widgetConfig, favorite: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Add to favorites</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setWidgetConfig(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Sortable Dashboard Grid */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={visibleWidgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleWidgets.map(widget => (
              <SortableWidget
                key={widget.id}
                id={widget.id}
                widget={widget}
                editMode={editMode}
                onToggleFavorite={toggleFavorite}
                onToggleSize={toggleWidgetSize}
                onRemove={removeWidget}
                onConfigure={openWidgetConfig}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <div className="text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No widgets to display</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {editMode 
              ? "Add widgets to your dashboard by clicking the 'Add Widget' button."
              : "Your dashboard is empty. Click 'Customize Dashboard' to add widgets."}
          </p>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Customize Dashboard
            </button>
          )}
          {editMode && (
            <button
              onClick={() => setAddWidgetModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Widget
            </button>
          )}
        </div>
      )}
      
      {/* Widget Layout Presets */}
      {editMode && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Layout Presets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setWidgets(DEFAULT_LAYOUT)}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
            >
              <h4 className="font-medium text-gray-900 dark:text-white">Default Layout</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Essential widgets for GitHub overview</p>
            </button>
            
            <button
              onClick={() => {
                const prFocusedWidgets = ALL_WIDGETS.filter(w => 
                  ['pr-status', 'pr-review-time', 'pr-size-distribution', 'timeline', 'activity-heatmap'].includes(w.id)
                );
                setWidgets(prFocusedWidgets);
              }}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
            >
              <h4 className="font-medium text-gray-900 dark:text-white">PR-Focused Layout</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Focus on pull request metrics and reviews</p>
            </button>
            
            <button
              onClick={() => {
                const codeFocusedWidgets = ALL_WIDGETS.filter(w => 
                  ['activity-heatmap', 'commit-frequency', 'code-churn', 'language-stats', 'commit-calendar'].includes(w.id)
                );
                setWidgets(codeFocusedWidgets);
              }}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-800"
            >
              <h4 className="font-medium text-gray-900 dark:text-white">Code-Focused Layout</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Focus on code contributions and languages</p>
            </button>
          </div>
        </div>
      )}
      
      {/* Quick Tips Panel */}
      {editMode && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-900">
          <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-300">Dashboard Tips</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Drag and drop widgets to rearrange them</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Favorite widgets appear in the favorites section and stay visible</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Your dashboard layout is automatically saved</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomizableDashboard;