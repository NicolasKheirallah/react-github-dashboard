import { useCallback, useEffect, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { ALL_WIDGETS, DEFAULT_LAYOUT, normalizeWidgetLayout } from '../components/dashboard/widgetCatalog';

const STORAGE_KEY = 'dashboard-layout';

export const useDashboardLayout = () => {
  const [widgets, setWidgets] = useState([]);

  useEffect(() => {
    const savedLayout = localStorage.getItem(STORAGE_KEY);

    try {
      if (savedLayout) {
        setWidgets(normalizeWidgetLayout(JSON.parse(savedLayout)));
        return;
      }
    } catch (error) {
      console.error('Error loading dashboard layout:', error);
    }

    setWidgets(DEFAULT_LAYOUT);
  }, []);

  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    }
  }, [widgets]);

  const visibleWidgets = useMemo(() => widgets.filter((widget) => !widget.hidden), [widgets]);

  const availableWidgets = useMemo(() => {
    const widgetIds = new Set(widgets.map((widget) => widget.id));
    return ALL_WIDGETS.filter((widget) => !widgetIds.has(widget.id));
  }, [widgets]);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = visibleWidgets.findIndex((widget) => widget.id === active.id);
      const newIndex = visibleWidgets.findIndex((widget) => widget.id === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return;
      }

      const updatedVisibleWidgets = arrayMove(visibleWidgets, oldIndex, newIndex);

      setWidgets((currentWidgets) => {
        const nextWidgets = [...currentWidgets];
        let visibleIndex = 0;

        for (let index = 0; index < nextWidgets.length; index += 1) {
          if (!nextWidgets[index].hidden) {
            nextWidgets[index] = updatedVisibleWidgets[visibleIndex];
            visibleIndex += 1;
          }
        }

        return nextWidgets;
      });
    },
    [visibleWidgets]
  );

  const updateWidget = useCallback((id, updater) => {
    setWidgets((currentWidgets) =>
      currentWidgets.map((widget) =>
        widget.id === id ? { ...widget, ...updater(widget) } : widget
      )
    );
  }, []);

  const toggleWidgetVisibility = useCallback(
    (id) => {
      updateWidget(id, (widget) => ({ hidden: !widget.hidden }));
    },
    [updateWidget]
  );

  const toggleWidgetSize = useCallback(
    (id) => {
      updateWidget(id, (widget) => {
        const sizes = ['small', 'medium', 'large'];
        const currentIndex = sizes.indexOf(widget.size);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];
        return { size: nextSize };
      });
    },
    [updateWidget]
  );

  const toggleFavorite = useCallback(
    (id) => {
      updateWidget(id, (widget) => ({ favorite: !widget.favorite }));
    },
    [updateWidget]
  );

  const addWidget = useCallback((widget) => {
    setWidgets((currentWidgets) => [...currentWidgets, { ...widget }]);
  }, []);

  const removeWidget = useCallback((id) => {
    setWidgets((currentWidgets) => currentWidgets.filter((widget) => widget.id !== id));
  }, []);

  const saveWidgetConfig = useCallback((updatedConfig) => {
    setWidgets((currentWidgets) =>
      currentWidgets.map((widget) =>
        widget.id === updatedConfig.id ? { ...widget, ...updatedConfig } : widget
      )
    );
  }, []);

  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_LAYOUT);
  }, []);

  const applyLayoutPreset = useCallback((widgetIds) => {
    const presetLayout = widgetIds
      .map((id) => ALL_WIDGETS.find((widget) => widget.id === id))
      .filter(Boolean);

    setWidgets(presetLayout.length > 0 ? presetLayout : DEFAULT_LAYOUT);
  }, []);

  return {
    widgets,
    availableWidgets,
    visibleWidgets,
    handleDragEnd,
    toggleWidgetVisibility,
    toggleWidgetSize,
    toggleFavorite,
    addWidget,
    removeWidget,
    saveWidgetConfig,
    resetLayout,
    applyLayoutPreset,
  };
};
