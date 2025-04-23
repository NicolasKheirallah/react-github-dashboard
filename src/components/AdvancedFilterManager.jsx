import React, { useState, useEffect, useRef, useCallback } from 'react';

const AdvancedFilterManager = ({ onApplyFilter,
    initialFilters = []}) => {
    const [savedFilters, setSavedFilters] = useState([]);
    const [activeFilter, setActiveFilter] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
    const [newFilterName, setNewFilterName] = useState('');
    const [newFilterDescription, setNewFilterDescription] = useState('');
    const [newFilterConditions, setNewFilterConditions] = useState([
        { field: 'name', operator: 'contains', value: '' }
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [timeRange,  setTimeRange]  = useState('all');
    const [timeRanges, setTimeRanges] = useState([
        { id: 'all',   name: 'All Time' },
        { id: 'day',   name: 'Last 24 Hours' },
        { id: 'week',  name: 'Last Week' },
        { id: 'month', name: 'Last Month' },
        { id: 'year',  name: 'Last Year' },
      ]);
      

    useEffect(() => {
        // pretend we fetched these from an API or defined them once here
        const defaultCats = [
            { id: 'all', name: 'All' },
            { id: 'frontend', name: 'Frontend' },
            { id: 'backend', name: 'Backend' },
        ];
        const defaultTRs = [
            { id: 'all', name: 'All Time' },
            { id: 'week', name: 'Last Week' },
            { id: 'month', name: 'Last Month' },
        ];

        setCategories(defaultCats);
        setTimeRanges(defaultTRs);
    }, []);
    // Load saved filters from localStorage on component mount
    useEffect(() => {
        try {
            const filtersFromStorage = localStorage.getItem('github-advanced-filters');
            if (filtersFromStorage) {
                setSavedFilters(JSON.parse(filtersFromStorage));
            } else if (initialFilters.length > 0) {
                setSavedFilters(initialFilters);
                localStorage.setItem('github-advanced-filters', JSON.stringify(initialFilters));
            }
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    }, [initialFilters]);

    // Save filters to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('github-advanced-filters', JSON.stringify(savedFilters));
        } catch (error) {
            console.error('Error saving filters:', error);
        }
    }, [savedFilters]);

    // Available filter fields
    const availableFields = [
        { id: 'name', label: 'Name' },
        { id: 'description', label: 'Description' },
        { id: 'language', label: 'Language' },
        { id: 'stars', label: 'Stars' },
        { id: 'forks', label: 'Forks' },
        { id: 'created', label: 'Created Date' },
        { id: 'updated', label: 'Updated Date' },
        { id: 'state', label: 'State' },
        { id: 'labels', label: 'Labels' },
        { id: 'comments', label: 'Comments' },
        { id: 'author', label: 'Author' }
    ];

    // Available operators based on field type
    const getOperatorsForField = (fieldId) => {
        const numericFields = ['stars', 'forks', 'comments'];
        const dateFields = ['created', 'updated'];
        const stateFields = ['state'];

        if (numericFields.includes(fieldId)) {
            return [
                { id: 'eq', label: 'equals' },
                { id: 'gt', label: 'greater than' },
                { id: 'lt', label: 'less than' },
                { id: 'gte', label: 'greater than or equal' },
                { id: 'lte', label: 'less than or equal' }
            ];
        }

        if (dateFields.includes(fieldId)) {
            return [
                { id: 'before', label: 'before' },
                { id: 'after', label: 'after' },
                { id: 'between', label: 'between' },
                { id: 'within', label: 'within last' }
            ];
        }

        if (stateFields.includes(fieldId)) {
            return [
                { id: 'is', label: 'is' },
                { id: 'not', label: 'is not' }
            ];
        }

        // Default string operators
        return [
            { id: 'contains', label: 'contains' },
            { id: 'eq', label: 'equals' },
            { id: 'starts', label: 'starts with' },
            { id: 'ends', label: 'ends with' },
            { id: 'not', label: 'does not contain' }
        ];
    };

    // Reset form fields
    const resetForm = () => {
        setNewFilterName('');
        setNewFilterDescription('');
        setNewFilterConditions([{ field: 'name', operator: 'contains', value: '' }]);
        setActiveFilter(null);
        setSearchQuery('');
        setSelectedCategory(null);
        setTimeRange(null);
    };

    // Create a new filter
    const createFilter = () => {
        if (!newFilterName.trim()) return;
        const newFilter = {
            id: `filter-${Date.now()}`,
            name: newFilterName,
            description: newFilterDescription,
            conditions: newFilterConditions,
            settings: { searchQuery, selectedCategory, timeRange },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setSavedFilters(prev => [...prev, newFilter]);
        resetForm();
        setShowCreateModal(false);
    };

    // Save the current filter settings
    const saveCurrentFilter = () => {
        if (!newFilterName.trim()) return;
        const current = {
            id: `filter-${Date.now()}`,
            name: newFilterName,
            description: newFilterDescription,
            conditions: newFilterConditions,
            settings: { searchQuery, selectedCategory, timeRange },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setSavedFilters(prev => [...prev, current]);
        resetForm();
        setShowSaveFilterModal(false);
    };

    // Edit an existing filter
    const editFilter = () => {
        if (!activeFilter || !newFilterName.trim()) return;
        setSavedFilters(prev => prev.map(f =>
            f.id === activeFilter.id
                ? {
                    ...f,
                    name: newFilterName,
                    description: newFilterDescription,
                    conditions: newFilterConditions,
                    settings: { searchQuery, selectedCategory, timeRange },
                    updatedAt: new Date().toISOString()
                }
                : f
        ));
        resetForm();
        setShowEditModal(false);
    };

    // Delete a filter
    const deleteFilter = (filterId) => {
        setSavedFilters(prev => prev.filter(f => f.id !== filterId));
    };

    // Apply a filter
    const applyFilter = (filter) => {
        onApplyFilter?.(filter.conditions);
        setActiveFilter(filter);
    };

    // Duplicate a filter
    const duplicateFilter = (filter) => {
        const copy = {
            ...filter,
            id: `filter-${Date.now()}`,
            name: `${filter.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setSavedFilters(prev => [...prev, copy]);
    };

    // Condition helpers
    const addCondition = () => setNewFilterConditions(prev => [...prev, { field: 'name', operator: 'contains', value: '' }]);
    const removeCondition = (i) => setNewFilterConditions(prev => prev.filter((_, idx) => idx !== i));
    const updateCondition = (i, key, val) => {
        setNewFilterConditions(prev => {
            const copy = [...prev];
            copy[i] = { ...copy[i], [key]: val };
            if (key === 'field') copy[i].operator = getOperatorsForField(val)[0].id;
            return copy;
        });
    };

    // Initialize edit form
    const startEditingFilter = (filter) => {
        setActiveFilter(filter);
        setNewFilterName(filter.name);
        setNewFilterDescription(filter.description || '');
        setNewFilterConditions(filter.conditions);
        setSearchQuery(filter.settings?.searchQuery || '');
        setSelectedCategory(filter.settings?.selectedCategory || null);
        setTimeRange(filter.settings?.timeRange || null);
        setShowEditModal(true);
    };

    // Render input based on field/operator
    const renderValueInput = (cond, idx) => {
        const { field, operator, value } = cond;
        const baseClass = "w-full sm:w-40 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm";

        if (field === 'state') {
            return (
                <select value={value} onChange={e => updateCondition(idx, 'value', e.target.value)} className={baseClass}>
                    <option value="">Select state</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="merged">Merged</option>
                </select>
            );
        }

        if (['created', 'updated'].includes(field)) {
            if (operator === 'between') {
                return (
                    <div className="flex space-x-2 items-center">
                        <input type="date" value={value?.start || ''} onChange={e => updateCondition(idx, 'value', { ...value, start: e.target.value })} className={baseClass} />
                        <span className="text-gray-500 dark:text-gray-400">and</span>
                        <input type="date" value={value?.end || ''} onChange={e => updateCondition(idx, 'value', { ...value, end: e.target.value })} className={baseClass} />
                    </div>
                );
            }
            if (operator === 'within') {
                return (
                    <div className="flex space-x-2 items-center">
                        <input type="number" min="1" value={value?.amount || ''} onChange={e => updateCondition(idx, 'value', { ...value, amount: e.target.value })} className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm" />
                        <select value={value?.unit || 'days'} onChange={e => updateCondition(idx, 'value', { ...value, unit: e.target.value })} className="w-28 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                            <option value="days">days</option>
                            <option value="weeks">weeks</option>
                            <option value="months">months</option>
                            <option value="years">years</option>
                        </select>
                    </div>
                );
            }
            return <input type="date" value={value || ''} onChange={e => updateCondition(idx, 'value', e.target.value)} className={baseClass} />;
        }

        if (['stars', 'forks', 'comments'].includes(field)) {
            return <input type="number" min="0" value={value || ''} onChange={e => updateCondition(idx, 'value', e.target.value)} className={baseClass} />;
        }

        return <input type="text" value={value || ''} onChange={e => updateCondition(idx, 'value', e.target.value)} className={baseClass} placeholder="Value" />;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-medium text-gray-900 dark:text-white">Saved Filters</h3>
                <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center">
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Filter
                </button>
            </div>

            {/* Filter list */}
            <div className="p-4">
                {savedFilters.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <svg className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <p className="mb-2">No saved filters yet</p>
                        <p className="text-sm">Create your first filter to quickly access specific GitHub data.</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {savedFilters.map(filter => (
                            <li key={filter.id} className={`p-3 border rounded-lg ${activeFilter?.id === filter.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">{filter.name}</h4>
                                        {filter.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filter.description}</p>}
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {filter.conditions.map((condition, i) => {
                                                const fieldInfo = availableFields.find(f => f.id === condition.field);
                                                const opInfo = getOperatorsForField(condition.field).find(o => o.id === condition.operator);
                                                return (
                                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                        {fieldInfo?.label} {opInfo?.label} {condition.value?.toString()}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button onClick={() => applyFilter(filter)} className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400" title="Apply filter">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button onClick={() => startEditingFilter(filter)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="Edit filter">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => duplicateFilter(filter)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="Duplicate filter">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                                <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => deleteFilter(filter.id)} className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500" title="Delete filter">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                    Updated {new Date(filter.updatedAt).toLocaleString()}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Create Filter Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* modal backdrop */}
                    <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75" onClick={() => setShowCreateModal(false)} />
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">
                        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-2xl w-full">
                            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                    Create New Filter
                                </h3>
                                <div className="mt-6 space-y-6">
                                    {/* Filter Name */}
                                    <div>
                                        <label htmlFor="filter-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Filter Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="filter-name"
                                            value={newFilterName}
                                            onChange={e => setNewFilterName(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="My Custom Filter"
                                        />
                                    </div>
                                    {/* Description */}
                                    <div>
                                        <label htmlFor="filter-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            id="filter-description"
                                            value={newFilterDescription}
                                            onChange={e => setNewFilterDescription(e.target.value)}
                                            rows="2"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="Filter description (optional)"
                                        />
                                    </div>
                                    {/* Conditions */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conditions</label>
                                            <button type="button" onClick={addCondition} className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                                Add Condition
                                            </button>
                                        </div>
                                        {newFilterConditions.map((cond, idx) => (
                                            <div key={idx} className="flex flex-wrap items-center space-x-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                                {/* Field Select */}
                                                <select value={cond.field} onChange={e => updateCondition(idx, 'field', e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                                                    {availableFields.map(f => (
                                                        <option key={f.id} value={f.id}>{f.label}</option>
                                                    ))}
                                                </select>
                                                {/* Operator Select */}
                                                <select value={cond.operator} onChange={e => updateCondition(idx, 'operator', e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                                                    {getOperatorsForField(cond.field).map(o => (
                                                        <option key={o.id} value={o.id}>{o.label}</option>
                                                    ))}
                                                </select>
                                                {/* Value Input */}
                                                {renderValueInput(cond, idx)}
                                                {/* Remove Condition */}
                                                {newFilterConditions.length > 1 && (
                                                    <button type="button" onClick={() => removeCondition(idx)} className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20">
                                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" onClick={createFilter} disabled={!newFilterName.trim()} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm">
                                    Create Filter
                                </button>
                                <button type="button" onClick={() => setShowCreateModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Filter Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75" onClick={() => setShowEditModal(false)} />
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">
                        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-2xl w-full">
                            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                    Edit Filter
                                </h3>
                                <div className="mt-6 space-y-6">
                                    <div>
                                        <label htmlFor="edit-filter-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Filter Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="edit-filter-name"
                                            value={newFilterName}
                                            onChange={e => setNewFilterName(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="edit-filter-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            id="edit-filter-description"
                                            value={newFilterDescription}
                                            onChange={e => setNewFilterDescription(e.target.value)}
                                            rows="2"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conditions</label>
                                            <button type="button" onClick={addCondition} className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                                Add Condition
                                            </button>
                                        </div>
                                        {newFilterConditions.map((cond, idx) => (
                                            <div key={idx} className="flex flex-wrap items-center space-x-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                                <select value={cond.field} onChange={e => updateCondition(idx, 'field', e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                                                    {availableFields.map(f => (
                                                        <option key={f.id} value={f.id}>{f.label}</option>
                                                    ))}
                                                </select>
                                                <select value={cond.operator} onChange={e => updateCondition(idx, 'operator', e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                                                    {getOperatorsForField(cond.field).map(o => (
                                                        <option key={o.id} value={o.id}>{o.label}</option>
                                                    ))}
                                                </select>
                                                {renderValueInput(cond, idx)}
                                                {newFilterConditions.length > 1 && (
                                                    <button type="button" onClick={() => removeCondition(idx)} className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20">
                                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" onClick={editFilter} disabled={!newFilterName.trim()} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm">
                                    Save Changes
                                </button>
                                <button type="button" onClick={() => setShowEditModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Current Filter Modal */}
            {/* Save Current Filter Modal */}
            {showSaveFilterModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* backdrop */}
                    <div
                        className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
                        onClick={() => setShowSaveFilterModal(false)}
                    />
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">
                        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl sm:max-w-lg w-full">
                            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Save Current Filter
                                </h3>
                                {/* Filter Name */}
                                <div className="mt-4">
                                    <label htmlFor="save-filter-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Filter Name
                                    </label>
                                    <input
                                        type="text"
                                        id="save-filter-name"
                                        value={newFilterName}
                                        onChange={e => setNewFilterName(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="My Custom Filter"
                                    />
                                </div>

                                {/* ← Insert your Category picker here */}
                                <div className="mt-4">
                                    <label htmlFor="save-filter-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Category
                                    </label>
                                    <select
                                        id="save-filter-category"
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* ← Insert your Time-range picker here */}
                                <div className="mt-4">
                                    <label htmlFor="save-filter-timerange" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Time Range
                                    </label>
                                    <select
                                        id="save-filter-timerange"
                                        value={timeRange}
                                        onChange={e => setTimeRange(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                                    >
                                        {timeRanges.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Existing Filter Settings summary */}
                                <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Settings</h4>
                                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        <p><span className="font-medium">Query:</span> {searchQuery || '(Empty)'}</p>
                                        <p><span className="font-medium">Category:</span> {categories.find(c => c.id === selectedCategory)?.name}</p>
                                        <p><span className="font-medium">Time Range:</span> {timeRanges.find(t => t.id === timeRange)?.name}</p>
                                    </div>
                                </div>
                            </div>
                            {/* modal actions */}
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={saveCurrentFilter}
                                    disabled={!newFilterName.trim()}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Save Filter
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSaveFilterModal(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default AdvancedFilterManager;
