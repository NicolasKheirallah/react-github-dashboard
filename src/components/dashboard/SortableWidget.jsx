// src/components/dashboard/SortableWidget.jsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Import all possible widget components directly
import ActivityHeatmap from './charts/ActivityHeatmap';
import PRStatusChart from './charts/PRStatusChart';
import LanguageChart from './charts/LanguageChart'; 
import TimelineChart from './charts/TimelineChart';
import RepositorySummary from './summaries/RepositorySummary';

// Component mapping
const COMPONENT_MAP = {
  'activity-heatmap': ActivityHeatmap,
  'pr-status': PRStatusChart,
  'language-stats': LanguageChart,
  'timeline': TimelineChart,
  'repo-summary': RepositorySummary,
};

export function SortableWidget({ id, widget, editMode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };
  
  // Define the column span based on widget size
  const getColumnSpan = () => {
    switch (widget.size) {
      case 'large':
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'medium':
        return 'col-span-1 md:col-span-1 lg:col-span-1';
      case 'small':
      default:
        return 'col-span-1';
    }
  };
  
  // Use component mapping instead of direct reference
  const WidgetComponent = COMPONENT_MAP[widget.id] || (() => (
    <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <p className="text-gray-500 dark:text-gray-400">Widget '{widget.id}' not found</p>
    </div>
  ));
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700
        transition-all duration-200 ${isDragging ? 'ring-2 ring-blue-500' : ''}
        ${getColumnSpan()}
        ${widget.favorite ? 'ring-1 ring-yellow-400 dark:ring-yellow-600' : ''}
      `}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {widget.favorite && (
            <span className="mr-1 text-yellow-500">★</span>
          )}
          {widget.title}
        </h3>
        {editMode && (
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-5">
        <WidgetComponent size={widget.size} />
      </div>
    </div>
  );
}

export default SortableWidget;