import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SortableWidget = ({ 
  id, 
  widget, 
  editMode,
  onToggleFavorite,
  onToggleSize,
  onRemove,
  onConfigure
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  // Determine column span based on widget size
  const getColSpan = () => {
    switch (widget.size) {
      case 'large':
        return 'col-span-1 lg:col-span-3 md:col-span-2';
      case 'medium':
        return 'col-span-1 md:col-span-1';
      case 'small':
      default:
        return 'col-span-1';
    }
  };

  // Determine height based on widget size
  const getHeight = () => {
    switch (widget.size) {
      case 'large':
        return 'h-96';
      case 'medium':
        return 'h-80';
      case 'small':
      default:
        return 'h-64';
    }
  };

  const WidgetComponent = widget.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${getColSpan()} ${editMode ? 'cursor-move' : ''}`}
      {...attributes}
      {...(editMode ? listeners : {})}
    >
      <div className={`w-full ${getHeight()} rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200`}>
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-4 py-2 flex justify-between items-center">
          <div className="flex items-center">
            {widget.favorite && (
              <span className="text-yellow-500 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            )}
            <h3 className="font-medium text-gray-800 dark:text-white truncate max-w-[180px]">{widget.title}</h3>
          </div>
          
          {editMode && (
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSize(widget.id);
                }}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                title="Change size"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(widget.id);
                }}
                className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 ${
                  widget.favorite ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'
                }`}
                title={widget.favorite ? "Remove from favorites" : "Add to favorites"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={widget.favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigure(widget);
                }}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                title="Configure widget"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(widget.id);
                }}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                title="Remove widget"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 h-[calc(100%-40px)] overflow-auto">
          {widget.component && (
            <WidgetComponent size={widget.size} config={widget.config || {}} />
          )}
        </div>
      </div>
    </div>
  );
};
export default SortableWidget;