import React, { useState, useEffect } from 'react';
import { useGithub } from '../../context/GithubContext';
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
import ActivityHeatmap from './charts/ActivityHeatmap';
import PRStatusChart from './charts/PRStatusChart';
import LanguageChart from './charts/LanguageChart';
import TimelineChart from './charts/TimelineChart';
import RepositorySummary from './summaries/RepositorySummary';

const DEFAULT_LAYOUT = [
  { id: 'activity-heatmap', title: 'Activity Overview', size: 'large', component: ActivityHeatmap, favorite: false },
  { id: 'pr-status', title: 'Pull Request Status', size: 'medium', component: PRStatusChart, favorite: false },
  { id: 'language-stats', title: 'Language Distribution', size: 'medium', component: LanguageChart, favorite: false },
  { id: 'timeline', title: 'Contribution Timeline', size: 'large', component: TimelineChart, favorite: false },
  { id: 'repo-summary', title: 'Repository Summary', size: 'medium', component: RepositorySummary, favorite: false },
];

const CustomizableDashboard = () => {
  const { userData } = useGithub();
  const [widgets, setWidgets] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState([]);
  
  // Initialize sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Load saved layout or default
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboard-layout');
    try {
      if (savedLayout) {
        setWidgets(JSON.parse(savedLayout));
      } else {
        setWidgets(DEFAULT_LAYOUT);
      }
    } catch (e) {
      console.error("Error loading dashboard layout:", e);
      setWidgets(DEFAULT_LAYOUT);
    }
  }, []);
  
  // Update visible widgets when widgets change
  useEffect(() => {
    setVisibleWidgets(widgets.filter(w => !w.hidden));
  }, [widgets]);
  
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
  
  const toggleWidgetVisibility = (id) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, hidden: !widget.hidden } : widget
    ));
  };
  
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
  
  const toggleFavorite = (id) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, favorite: !widget.favorite } : widget
    ));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {userData?.name ? `${userData.name}'s Dashboard` : 'Your Dashboard'}
        </h2>
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
            <button
              onClick={() => setWidgets(DEFAULT_LAYOUT)}
              className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Reset Layout
            </button>
          )}
        </div>
      </div>
      
      {editMode && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Dashboard Widgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map(widget => (
              <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!widget.hidden}
                    onChange={() => toggleWidgetVisibility(widget.id)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">{widget.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleWidgetSize(widget.id)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Change size"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleFavorite(widget.id)}
                    className={`${
                      widget.favorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                    }`}
                    title={widget.favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
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
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default CustomizableDashboard;