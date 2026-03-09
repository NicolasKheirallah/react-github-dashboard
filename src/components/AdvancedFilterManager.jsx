import React, { useEffect, useMemo, useState } from 'react';
import { readJsonStorage, writeJsonStorage } from '../utils/storage';

const STORAGE_KEY = 'github-advanced-filters';

const FIELD_OPTIONS = [
  { value: 'title', label: 'Title' },
  { value: 'description', label: 'Description' },
  { value: 'repository', label: 'Repository' },
  { value: 'language', label: 'Language' },
  { value: 'state', label: 'State' },
  { value: 'stars', label: 'Stars' },
  { value: 'updated', label: 'Updated' },
];

const OPERATOR_OPTIONS = [
  { value: 'contains', label: 'contains' },
  { value: 'eq', label: 'equals' },
  { value: 'gt', label: 'greater than' },
  { value: 'lt', label: 'less than' },
  { value: 'after', label: 'after' },
  { value: 'before', label: 'before' },
];

const createEmptyCondition = () => ({
  id: crypto.randomUUID(),
  field: 'title',
  operator: 'contains',
  value: '',
});

const normalizePreset = (preset) => ({
  id: preset.id || crypto.randomUUID(),
  name: preset.name || 'Untitled preset',
  description: preset.description || '',
  conditions: Array.isArray(preset.conditions) ? preset.conditions : [],
  createdAt: preset.createdAt || new Date().toISOString(),
  updatedAt: preset.updatedAt || new Date().toISOString(),
});

const AdvancedFilterManager = ({ onApplyFilter, initialFilters = [] }) => {
  const [savedFilters, setSavedFilters] = useState([]);
  const [draftConditions, setDraftConditions] = useState([createEmptyCondition()]);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  useEffect(() => {
    const storedFilters = readJsonStorage(STORAGE_KEY, null, 'session');

    if (Array.isArray(storedFilters)) {
      setSavedFilters(storedFilters.map(normalizePreset));
      return;
    }

    const normalizedInitialFilters = initialFilters.map(normalizePreset);
    setSavedFilters(normalizedInitialFilters);
    writeJsonStorage(STORAGE_KEY, normalizedInitialFilters, 'session');
  }, [initialFilters]);

  useEffect(() => {
    writeJsonStorage(STORAGE_KEY, savedFilters, 'session');
  }, [savedFilters]);

  const canSavePreset = useMemo(() => {
    return (
      presetName.trim().length > 0 &&
      draftConditions.some((condition) => String(condition.value).trim().length > 0)
    );
  }, [draftConditions, presetName]);

  const updateCondition = (conditionId, nextValues) => {
    setDraftConditions((currentConditions) =>
      currentConditions.map((condition) =>
        condition.id === conditionId ? { ...condition, ...nextValues } : condition
      )
    );
  };

  const removeCondition = (conditionId) => {
    setDraftConditions((currentConditions) => {
      const nextConditions = currentConditions.filter(
        (condition) => condition.id !== conditionId
      );
      return nextConditions.length > 0 ? nextConditions : [createEmptyCondition()];
    });
  };

  const addCondition = () => {
    setDraftConditions((currentConditions) => [
      ...currentConditions,
      createEmptyCondition(),
    ]);
  };

  const applyConditions = (conditions) => {
    const cleanConditions = conditions.filter((condition) =>
      String(condition.value).trim().length > 0
    );
    onApplyFilter(cleanConditions);
  };

  const savePreset = () => {
    if (!canSavePreset) {
      return;
    }

    const nextPreset = normalizePreset({
      id: crypto.randomUUID(),
      name: presetName.trim(),
      description: presetDescription.trim(),
      conditions: draftConditions.filter((condition) =>
        String(condition.value).trim().length > 0
      ),
    });

    setSavedFilters((currentFilters) => [nextPreset, ...currentFilters]);
    setPresetName('');
    setPresetDescription('');
  };

  const deletePreset = (presetId) => {
    setSavedFilters((currentFilters) =>
      currentFilters.filter((preset) => preset.id !== presetId)
    );
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Advanced Filters
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Combine reusable presets with custom rules to narrow search results.
        </p>
      </div>

      <div className="grid gap-6 p-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Custom conditions
            </h3>
            <button
              type="button"
              onClick={addCondition}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Add condition
            </button>
          </div>

          <div className="space-y-3">
            {draftConditions.map((condition, index) => (
              <div
                key={condition.id}
                className="grid gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700 md:grid-cols-[1fr_1fr_1.4fr_auto]"
              >
                <div>
                  <label
                    htmlFor={`condition-field-${condition.id}`}
                    className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                  >
                    Field {index + 1}
                  </label>
                  <select
                    id={`condition-field-${condition.id}`}
                    value={condition.field}
                    onChange={(event) =>
                      updateCondition(condition.id, { field: event.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                  >
                    {FIELD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`condition-operator-${condition.id}`}
                    className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                  >
                    Operator
                  </label>
                  <select
                    id={`condition-operator-${condition.id}`}
                    value={condition.operator}
                    onChange={(event) =>
                      updateCondition(condition.id, { operator: event.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                  >
                    {OPERATOR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`condition-value-${condition.id}`}
                    className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                  >
                    Value
                  </label>
                  <input
                    id={`condition-value-${condition.id}`}
                    type="text"
                    value={condition.value}
                    onChange={(event) =>
                      updateCondition(condition.id, { value: event.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                    placeholder="Enter a value"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeCondition(condition.id)}
                    className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => applyConditions(draftConditions)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply filters
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftConditions([createEmptyCondition()]);
                onApplyFilter([]);
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear filters
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Saved presets
            </h3>
            <div className="mt-3 space-y-3">
              {savedFilters.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  No saved presets yet.
                </p>
              ) : (
                savedFilters.map((preset) => (
                  <div
                    key={preset.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {preset.name}
                        </h4>
                        {preset.description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {preset.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {preset.conditions.length} condition
                          {preset.conditions.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deletePreset(preset.id)}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyConditions(preset.conditions)}
                        className="rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                      >
                        Apply preset
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraftConditions(preset.conditions.map((condition) => ({
                          ...condition,
                          id: crypto.randomUUID(),
                        })))}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Edit as draft
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Save current draft
            </h3>
            <div className="mt-3 space-y-3">
              <div>
                <label
                  htmlFor="filter-preset-name"
                  className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  Preset name
                </label>
                <input
                  id="filter-preset-name"
                  type="text"
                  value={presetName}
                  onChange={(event) => setPresetName(event.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Open PRs in active repos"
                />
              </div>
              <div>
                <label
                  htmlFor="filter-preset-description"
                  className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  Description
                </label>
                <textarea
                  id="filter-preset-description"
                  value={presetDescription}
                  onChange={(event) => setPresetDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Optional context for teammates or future you"
                />
              </div>
              <button
                type="button"
                onClick={savePreset}
                disabled={!canSavePreset}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
              >
                Save preset
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvancedFilterManager;
