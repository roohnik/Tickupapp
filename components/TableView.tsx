import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, User, Project, KanbanColumn, WORKFLOW_STATES, CustomField, MonitoringData, Tag, CustomFieldDefinition, Document, Form, TaskWorkflowState } from '../types';
import { PlusIcon, ChevronRightIcon, ChevronDownIcon, TrashIcon } from './Icons';
import { KANBAN_COLOR_MAP, TAG_COLOR_MAP, TAG_COLOR_OPTIONS, STATUS_TABLE_CELL_COLORS } from '../constants';
import { toPersianDate, toDDMMYYYY } from '../utils/dateUtils';
import ProgressBar from './ProgressBar';
import EditableCell from './EditableCell';

interface ColumnSelectorPopoverProps {
    anchorEl: HTMLElement | null;
    availableColumns: { key: string; label: string }[];
    visibleColumns: string[];
    onToggle: (columnKey: string) => void;
    onClose: () => void;
}

const ColumnSelectorPopover: React.FC<ColumnSelectorPopoverProps> = ({ anchorEl, availableColumns, visibleColumns, onToggle, onClose }) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && anchorEl && !anchorEl.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, anchorEl]);

    if (!anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const style: React.CSSProperties = {
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
    };

    return (
        <div ref={popoverRef} style={style} className="bg-white rounded-md shadow-lg py-2 z-10 border w-56">
            <ul className="max-h-60 overflow-y-auto">
                {availableColumns.map(col => (
                    <li key={col.key}>
                        <label className="flex items-center w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={visibleColumns.includes(col.key)}
                                onChange={() => onToggle(col.key)}
                                className="ml-2 h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                            />
                            {col.label}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const CALCULATION_MODES = [
    { key: 'sum', label: 'جمع' },
    { key: 'avg', label: 'میانگین' },
    { key: 'max', label: 'بالاترین' },
    { key: 'min', label: 'پایین‌ترین' },
    { key: 'count', label: 'شمارش' },
] as const;

type CalculationMode = typeof CALCULATION_MODES[number]['key'];

interface CalculationModePopoverProps {
    anchorEl: HTMLElement | null;
    onSelect: (mode: CalculationMode) => void;
    onClose: () => void;
}

const CalculationModePopover: React.FC<CalculationModePopoverProps> = ({ anchorEl, onSelect, onClose }) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && anchorEl && !anchorEl.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, anchorEl]);

    if (!anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const style: React.CSSProperties = {
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
    };
    
    return (
        <div ref={popoverRef} style={style} className="bg-white rounded-md shadow-lg py-1 z-10 border w-40">
            <ul>
                {CALCULATION_MODES.map(mode => (
                    <li key={mode.key}>
                        <button onClick={() => onSelect(mode.key)} className="w-full text-right px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">
                            {mode.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface TagEditorPopoverProps {
  anchorEl: HTMLElement;
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
  onClose: () => void;
}

const TagEditorPopover: React.FC<TagEditorPopoverProps> = ({ anchorEl, task, onUpdateTask, onClose }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [newTagText, setNewTagText] = useState('');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && anchorEl && !anchorEl.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, anchorEl]);

    const handleAddTag = () => {
        if (newTagText.trim()) {
            const newTag: Tag = {
                id: `tag-${Date.now()}`,
                text: newTagText.trim(),
                color: TAG_COLOR_OPTIONS[Math.floor(Math.random() * TAG_COLOR_OPTIONS.length)]
            };
            const updatedTags = [...(task.tags || []), newTag];
            onUpdateTask({ ...task, tags: updatedTags });
            setNewTagText('');
        }
    };

    const handleRemoveTag = (tagId: string) => {
        const updatedTags = task.tags?.filter(t => t.id !== tagId);
        onUpdateTask({ ...task, tags: updatedTags });
    };

    const rect = anchorEl.getBoundingClientRect();
    const style: React.CSSProperties = {
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        zIndex: 20
    };

    return (
        <div ref={popoverRef} style={style} className="bg-white rounded-md shadow-lg p-3 border w-64">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">تگ‌ها</h4>
            <div className="flex flex-wrap gap-1 mb-2">
                {task.tags?.map(tag => {
                    const colorScheme = TAG_COLOR_MAP[tag.color] || TAG_COLOR_MAP.gray;
                    return (
                        <div key={tag.id} className={`flex items-center pl-1 pr-2 py-0.5 rounded-full text-xs font-medium ${colorScheme.bg} ${colorScheme.text}`}>
                            <span>{tag.text}</span>
                            <button onClick={() => handleRemoveTag(tag.id)} className="mr-1 opacity-75 hover:opacity-100">&times;</button>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center mt-2 border-t pt-2">
                <input
                    type="text"
                    value={newTagText}
                    onChange={e => setNewTagText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddTag() }}
                    placeholder="افزودن تگ..."
                    className="flex-grow text-sm border-gray-200 rounded-md focus:ring-1 focus:ring-brand-primary focus:border-brand-primary p-1"
                />
                <button onClick={handleAddTag} className="mr-2 p-1 bg-gray-200 rounded-md hover:bg-gray-300">
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};


const renderCellContent = (task: Task, colKey: string, users: User[], projects: Project[], isListViewComfortable: boolean, customFieldDefinitions: CustomFieldDefinition[], documents: Document[], onOpenDocument: (docId: string) => void, forms: Form[], onOpenForm: (formId: string) => void) => {
    if (colKey === 'assigneeId') {
        const assignee = users.find(u => u.id === task.assigneeId);
        if (!assignee) return null;
        return (
            <div className="flex items-center justify-center">
                <img src={assignee.avatarUrl} alt={assignee.name} className={`rounded-full ml-2 ${isListViewComfortable ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <span className="truncate">{assignee.name}</span>
            </div>
        );
    }
    if (colKey === 'projectId') {
        const project = projects.find(p => p.id === task.projectId);
        return project?.name || '';
    }
    if (colKey === 'startDate') {
        return toPersianDate(task.startDate);
    }
    if (colKey === 'dueDate') {
        return toPersianDate(task.dueDate);
    }
    if (colKey === 'status') {
        return task.status;
    }
    if (colKey === 'progress') {
        return <ProgressBar progress={task.progress || 0} />;
    }
    if (colKey === 'numericValue') {
        return task.numericValue?.toLocaleString('fa-IR') ?? '';
    }
    if (colKey === 'tags') {
        if (!task.tags || task.tags.length === 0) return null;
        return (
            <div className="flex flex-wrap gap-1 justify-center">
                {task.tags.map(tag => {
                    const colorScheme = TAG_COLOR_MAP[tag.color] || TAG_COLOR_MAP.gray;
                    return (
                        <span key={tag.id} className={`px-2 py-0.5 text-xs font-medium rounded-md ${colorScheme.bg} ${colorScheme.text}`}>
                            {tag.text}
                        </span>
                    );
                })}
            </div>
        );
    }
    if (colKey === 'recurrence') {
        if (!task.recurrence) return null;
        const recurrenceLabels: { [key: string]: string } = {
            'hourly': 'هر ساعت', 'every-2-hours': 'هر ۲ ساعت', 'every-3-hours': 'هر سه ساعت', 'every-6-hours': 'هر شش ساعت', 'daily': 'روزانه',
            'weekly': 'هفتگی', 'bi-weekly': 'دو هفته یکبار', 'monthly': 'ماهانه', 'quarterly': 'فصلی', 'semi-annually': 'هر شش ماه', 'annually': 'سالانه',
        };
        return recurrenceLabels[task.recurrence.frequency] || task.recurrence.frequency;
    }

    if (colKey.startsWith('monitoring_')) {
        const monitoringKey = colKey.replace('monitoring_', '') as keyof MonitoringData;
        const monitoringData = task.monitoring;

        if (!monitoringData || monitoringData[monitoringKey] === undefined || monitoringData[monitoringKey] === null) {
            return <span className="text-gray-400">-</span>;
        }

        const value = monitoringData[monitoringKey];

        switch (monitoringKey) {
            case 'temperature':
                return `${value}°C`;
            case 'cost':
                return `${(value as number).toLocaleString('fa-IR')} تومان`;
            case 'pieceCount':
                return (value as number).toLocaleString('fa-IR');
            case 'responsiblePersonId':
                const person = users.find(u => u.id === value);
                return person?.name || '';
            case 'category':
                return value as string;
            default:
                return <span className="text-gray-400">-</span>;
        }
    }

    const customFieldInstance = task.customFields?.find(cf => cf.definitionId === colKey);
    if (customFieldInstance) {
        const customFieldDef = customFieldDefinitions.find(def => def.id === customFieldInstance.definitionId);
        if (customFieldDef) {
            switch (customFieldDef.type) {
                case 'DOCUMENT': {
                    const docIds = customFieldInstance.value as string[] | null;
                    if (!docIds || docIds.length === 0) return null;
                    return (
                        <div className="flex flex-wrap gap-1 justify-center">
                            {docIds.map(docId => {
                                const doc = documents.find(d => d.id === docId);
                                if (!doc) return null;
                                return (
                                    <button
                                        key={docId}
                                        onClick={(e) => { e.stopPropagation(); onOpenDocument(docId); }}
                                        className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full hover:bg-gray-300"
                                    >
                                        {doc.title}
                                    </button>
                                );
                            })}
                        </div>
                    );
                }
                case 'FORM': {
                    const formIds = customFieldInstance.value as string[] | null;
                    if (!formIds || !Array.isArray(formIds) || formIds.length === 0) return null;
                    return (
                        <div className="flex flex-wrap gap-1 justify-center">
                            {formIds.map(formId => {
                                const form = forms.find(f => f.id === formId);
                                if (!form) return null;
                                return (
                                    <button
                                        key={formId}
                                        onClick={(e) => { e.stopPropagation(); onOpenForm(formId); }}
                                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full hover:bg-purple-200"
                                    >
                                        {form.title}
                                    </button>
                                );
                            })}
                        </div>
                    );
                }
                case 'NUMBER':
                case 'COST':
                    return (customFieldInstance.value as number | null)?.toLocaleString('fa-IR');
                case 'TEXT_SHORT':
                case 'TEXT_LONG':
                case 'PHONE':
                    return customFieldInstance.value as string;
                case 'CONFIRMATION':
                    return customFieldInstance.value ? 'بله' : 'خیر';
                default:
                    return String(customFieldInstance.value);
            }
        }
    }
    return null;
};



const InlineAddTaskRow: React.FC<{
    visibleColumns: string[];
    columnId: string;
    projectId: string;
    currentUser: User;
    onSave: (taskData: Omit<Task, 'id' | 'tags' | 'comments' | 'checklist' | 'status'>) => void;
    onCancel: () => void;
    users: User[];
}> = ({ visibleColumns, columnId, projectId, currentUser, onSave, onCancel, users }) => {

    const [newTaskData, setNewTaskData] = useState<Partial<Omit<Task, 'id'>>>({});
    const rowRef = useRef<HTMLTableRowElement>(null);
    const contentInputRef = useRef<HTMLInputElement>(null);
    const isSavingRef = useRef(false);

    useEffect(() => {
        setNewTaskData({
            content: '',
            columnId: columnId,
            projectId: projectId,
            assigneeId: currentUser.id,
            status: WORKFLOW_STATES[0], // "برای انجام"
            customFields: [],
            startDate: undefined,
        });
        setTimeout(() => contentInputRef.current?.focus(), 50);
    }, [columnId, projectId, currentUser.id]);
    
    const handleSave = () => {
        if (isSavingRef.current) return;
        if (!newTaskData.content?.trim()) {
            onCancel();
            return;
        }
        isSavingRef.current = true;
        
        const taskDataToSubmit = {
            content: newTaskData.content,
            projectId: newTaskData.projectId!,
            assigneeId: newTaskData.assigneeId!,
            columnId: newTaskData.columnId!,
            status: newTaskData.status!,
            dueDate: newTaskData.dueDate,
            startDate: newTaskData.startDate,
            customFields: [], // Not handled for simplicity
        };
        onSave(taskDataToSubmit);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (rowRef.current && !rowRef.current.contains(event.target as Node)) {
                handleSave();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newTaskData]);

    const handleFieldChange = (field: keyof Omit<Task, 'id'>, value: any) => {
        setNewTaskData(prev => ({...prev, [field]: value}));
    };
    
    return (
        <tr ref={rowRef} className="bg-white dark:bg-slate-800">
            <td className="p-1 border border-gray-300 dark:border-slate-600">
                <input
                    ref={contentInputRef}
                    type="text"
                    placeholder="عنوان وظیفه..."
                    value={newTaskData.content || ''}
                    onChange={e => handleFieldChange('content', e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') onCancel();
                    }}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary p-1"
                />
            </td>
            {visibleColumns.map(colKey => (
                <td key={colKey} className="p-1 border border-gray-300 dark:border-slate-600 align-middle text-center">
                     {colKey === 'assigneeId' && (
                        <select
                            value={newTaskData.assigneeId || ''}
                            onChange={e => handleFieldChange('assigneeId', e.target.value)}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary p-1"
                        >
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    )}
                     {(colKey === 'dueDate' || colKey === 'startDate') && (
                         <input
                            type="date"
                            value={newTaskData[colKey as 'dueDate' | 'startDate'] ? new Date(newTaskData[colKey as 'dueDate' | 'startDate']!).toISOString().substring(0, 10) : ''}
                            onChange={e => {
                                const val = e.target.value;
                                if (val) {
                                    const [year, month, day] = val.split('-').map(Number);
                                    handleFieldChange(colKey, new Date(Date.UTC(year, month - 1, day)).toISOString());
                                } else {
                                    handleFieldChange(colKey, undefined);
                                }
                            }}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary p-1"
                        />
                    )}
                </td>
            ))}
            <td className="p-2 w-10 border border-gray-300 dark:border-slate-600"></td>
        </tr>
    );
};


interface TableViewProps {
    tasks: Task[];
    users: User[];
    projects: Project[];
    columns: KanbanColumn[];
    onSelectTask: (taskId: string) => void;
    onUpdateTask: (updatedTask: Task) => void;
    availableColumns: { key: string; label: string; isCustom: boolean }[];
    visibleColumns: string[];
    onVisibleColumnsChange: (columns: string[]) => void;
    isListViewComfortable: boolean;
    onInlineAddTask: (taskData: Omit<Task, 'id' | 'tags' | 'comments' | 'checklist' | 'status'>) => void;
    currentUser: User;
    activeProjectId: string | 'all';
    customFieldDefinitions: CustomFieldDefinition[];
    documents: Document[];
    onOpenDocument: (documentId: string) => void;
    forms: Form[];
    onOpenForm: (formId: string) => void;
}

const StatusCalculationBar: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    if (tasks.length === 0) return null;
    const total = tasks.length;
    const doneCount = tasks.filter(t => t.status === 'انجام شد').length;
    const donePercent = total > 0 ? (doneCount / total) * 100 : 0;
    
    const tooltipText = `${doneCount} از ${total} انجام شده`;

    return (
        <div title={tooltipText} className="w-full h-6 bg-gray-300 rounded-full flex overflow-hidden">
            <div className="bg-green-500" style={{ width: `${donePercent}%` }}></div>
        </div>
    );
};

interface TableViewGroupProps {
    column: KanbanColumn;
    tasks: Task[];
    users: User[];
    projects: Project[];
    onSelectTask: (taskId: string) => void;
    onUpdateTask: (updatedTask: Task) => void;
    availableColumns: { key: string; label: string, isCustom: boolean }[];
    visibleColumns: string[];
    onVisibleColumnsChange: (columns: string[]) => void;
    isListViewComfortable: boolean;
    onInlineAddTask: (taskData: Omit<Task, 'id' | 'tags' | 'comments' | 'checklist' | 'status'>) => void;
    currentUser: User;
    activeProjectId: string | 'all';
    isAdding: boolean;
    onStartAdding: () => void;
    onCancelAdding: () => void;
    onOpenTagEditor: (anchorEl: HTMLElement, task: Task) => void;
    customFieldDefinitions: CustomFieldDefinition[];
    columnWidths: Record<string, number>;
    onColumnResize: (colKey: string, newWidth: number) => void;
    documents: Document[];
    onOpenDocument: (docId: string) => void;
    forms: Form[];
    onOpenForm: (formId: string) => void;
}

const TableViewGroup: React.FC<TableViewGroupProps> = ({ column, tasks, users, projects, onSelectTask, onUpdateTask, availableColumns, visibleColumns, onVisibleColumnsChange, isListViewComfortable, onInlineAddTask, currentUser, activeProjectId, isAdding, onStartAdding, onCancelAdding, onOpenTagEditor, customFieldDefinitions, columnWidths, onColumnResize, documents, onOpenDocument, forms, onOpenForm }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [editingCell, setEditingCell] = useState<{ taskId: string; colKey: string } | null>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const colorScheme = KANBAN_COLOR_MAP[column.color || 'gray'] || KANBAN_COLOR_MAP.gray;
    
    const [calculationModes, setCalculationModes] = useState<{ [colKey: string]: CalculationMode }>({});
    const [calcMenuState, setCalcMenuState] = useState<{ anchorEl: HTMLElement, colKey: string } | null>(null);

     const handleMouseDown = (e: React.MouseEvent, colKey: string) => {
        e.preventDefault();
        const startX = e.clientX;
        const thElement = (e.target as HTMLElement).parentElement;
        if (!thElement) return;
        const startWidth = thElement.offsetWidth;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            // For RTL, dragging left increases width, dragging right decreases it.
            const newWidth = Math.max(80, startWidth - dx); // min width 80px
            onColumnResize(colKey, newWidth);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleCalcModeChange = (colKey: string, mode: CalculationMode) => {
        setCalculationModes(prev => ({ ...prev, [colKey]: mode }));
        setCalcMenuState(null);
    };

    const calculations = useMemo(() => {
        const results: { [colKey: string]: { node: React.ReactNode } } = {};

        visibleColumns.forEach(colKey => {
            const colInfo = availableColumns.find(c => c.key === colKey);
            let isPotentiallyNumeric = false;

            if (colKey === 'status') {
                results[colKey] = { node: <StatusCalculationBar tasks={tasks} /> };
                return;
            }

            const allValues = tasks.map(task => {
                if (colKey === 'progress') {
                    isPotentiallyNumeric = true;
                    return task.progress;
                }
                if (colKey === 'numericValue') {
                    isPotentiallyNumeric = true;
                    return task.numericValue;
                }
                if (colKey.startsWith('monitoring_')) {
                    const monitoringKey = colKey.replace('monitoring_', '') as keyof MonitoringData;
                    if (['temperature', 'cost', 'pieceCount'].includes(monitoringKey)) {
                        isPotentiallyNumeric = true;
                    }
                    return task.monitoring?.[monitoringKey];
                }
                if (colInfo?.isCustom) {
                    const customFieldDef = customFieldDefinitions.find(def => def.id === colKey);
                    const field = task.customFields?.find(cf => cf.definitionId === colKey);
                    if (field && customFieldDef) {
                        if (customFieldDef.type === 'NUMBER' || customFieldDef.type === 'COST') {
                            isPotentiallyNumeric = true;
                        }
                        return field.value;
                    }
                }
                return task[colKey as keyof Task];
            }).filter(v => v !== null && v !== undefined && v !== '');

            const mode = calculationModes[colKey] || (isPotentiallyNumeric ? 'sum' : 'count');

            if (mode === 'count') {
                results[colKey] = { node: allValues.length.toLocaleString('fa-IR') };
                return;
            }

            if (isPotentiallyNumeric) {
                const numericValues = allValues.filter(v => typeof v === 'number') as number[];
                if (numericValues.length === 0) {
                    results[colKey] = { node: '۰' };
                    return;
                }
                
                let result: number;
                switch (mode) {
                    case 'sum': result = numericValues.reduce((a, b) => a + b, 0); break;
                    case 'avg': result = numericValues.reduce((a, b) => a + b, 0) / numericValues.length; break;
                    case 'max': result = Math.max(...numericValues); break;
                    case 'min': result = Math.min(...numericValues); break;
                    default: result = 0;
                }
                results[colKey] = { node: result.toLocaleString('fa-IR', { maximumFractionDigits: 2 }) };
            } else {
                results[colKey] = { node: 'N/A' };
            }
        });
        return results;
    }, [tasks, visibleColumns, availableColumns, calculationModes, customFieldDefinitions]);

    const handleColumnToggle = (columnKey: string) => {
        const newVisibleColumns = visibleColumns.includes(columnKey)
            ? visibleColumns.filter(key => key !== columnKey)
            : [...visibleColumns, columnKey];
        onVisibleColumnsChange(newVisibleColumns);
    };

    const handleUpdate = (task: Task, colKey: string, newValue: any) => {
        let updatedTask = { ...task };

        if (['assigneeId', 'status'].includes(colKey)) {
            updatedTask = { ...updatedTask, [colKey]: newValue };
        } else if (colKey === 'progress') {
            updatedTask.progress = parseInt(newValue, 10) || 0;
        } else if (colKey === 'numericValue') {
            updatedTask.numericValue = newValue !== '' ? parseFloat(newValue) : undefined;
        } else if (colKey === 'recurrence') {
            updatedTask.recurrence = newValue ? { frequency: newValue as any } : undefined;
        } else if (colKey === 'startDate' || colKey === 'dueDate') {
            const dateValue = newValue ? new Date(Date.UTC(
                new Date(newValue).getFullYear(),
                new Date(newValue).getMonth(),
                new Date(newValue).getDate()
            )).toISOString() : undefined;
            if (colKey === 'startDate') {
                updatedTask.startDate = dateValue;
            } else {
                updatedTask.dueDate = dateValue;
            }
        } else if (colKey.startsWith('monitoring_')) {
            const monitoringKey = colKey.replace('monitoring_', '') as keyof MonitoringData;
            let value = newValue;
            if (['temperature', 'cost', 'pieceCount'].includes(monitoringKey)) {
                value = newValue !== '' ? parseFloat(newValue) : null;
            }
            updatedTask.monitoring = { ...(updatedTask.monitoring || {}), [monitoringKey]: value };
        } else { // Custom Field
            const fieldDef = customFieldDefinitions.find(def => def.id === colKey);
            if (fieldDef) {
                let value = newValue;
                if (fieldDef.type === 'NUMBER' || fieldDef.type === 'COST') {
                    value = parseFloat(newValue) || 0;
                }
                const existingFieldIndex = task.customFields?.findIndex(cf => cf.definitionId === colKey) ?? -1;
                const newCustomFields = [...(task.customFields || [])];
                if (existingFieldIndex > -1) {
                    newCustomFields[existingFieldIndex] = { ...newCustomFields[existingFieldIndex], value };
                } else {
                    newCustomFields.push({ definitionId: colKey, value });
                }
                updatedTask.customFields = newCustomFields;
            }
        }
        onUpdateTask(updatedTask);
    };

    return (
        <div className="mb-8">
            <div className="flex items-center mb-3">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center p-1 text-right transition-colors"
                >
                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-slate-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                </button>
                <div className="flex items-center min-w-0 ml-2">
                    <h3 className={`font-bold text-xl truncate ${colorScheme.text}`}>{column.title}</h3>
                    <span className="text-base text-gray-400 font-normal mr-2">({tasks.length})</span>
                </div>
            </div>

            {isExpanded && (
                <div className="relative bg-white dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 animate-fade-in overflow-hidden">
                    <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${colorScheme.dot}`}></div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-right table-fixed border-collapse">
                            <thead>
                                <tr className="bg-white dark:bg-slate-800">
                                    <th style={{ width: `${columnWidths.task || 300}px` }} className="p-4 font-medium text-brand-subtext text-xs tracking-wider border border-gray-300 dark:border-slate-600 relative">
                                        وظیفه
                                        <div onMouseDown={e => handleMouseDown(e, 'task')} className="absolute top-0 right-[-2px] h-full w-1 cursor-col-resize z-10" />
                                    </th>
                                    {visibleColumns.map(colKey => {
                                        const col = availableColumns.find(c => c.key === colKey);
                                        return <th key={colKey} style={{ width: `${columnWidths[colKey] || 180}px` }} className="p-4 font-medium text-brand-subtext text-xs tracking-wider border border-gray-300 dark:border-slate-600 text-center relative">
                                            {col?.label}
                                            <div onMouseDown={e => handleMouseDown(e, colKey)} className="absolute top-0 right-[-2px] h-full w-1 cursor-col-resize z-10" />
                                        </th>;
                                    })}
                                    <th className="p-4 w-10 text-center border border-gray-300 dark:border-slate-600">
                                        <button
                                            ref={menuButtonRef}
                                            onClick={() => setIsMenuOpen(p => !p)}
                                            className="p-1 rounded-md hover:bg-gray-200"
                                            title="افزودن فیلد"
                                        >
                                            <PlusIcon className="w-4 h-4 text-gray-500" />
                                        </button>
                                        {isMenuOpen && (
                                            <ColumnSelectorPopover
                                                anchorEl={menuButtonRef.current}
                                                availableColumns={availableColumns}
                                                visibleColumns={visibleColumns}
                                                onToggle={handleColumnToggle}
                                                onClose={() => setIsMenuOpen(false)}
                                            />
                                        )}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => {
                                    return (
                                        <tr key={task.id} className="text-sm dark:text-slate-300 bg-white">
                                            <td onClick={() => onSelectTask(task.id)} className={`font-medium text-brand-text dark:text-slate-200 cursor-pointer p-4 border border-gray-300 dark:border-slate-600`}>{task.content}</td>
                                            {visibleColumns.map(colKey => {
                                                const isEditing = editingCell?.taskId === task.id && editingCell?.colKey === colKey;
                                                const isTagColumn = colKey === 'tags';
                                                const isStatusCol = colKey === 'status';
                                                const statusColors = isStatusCol ? STATUS_TABLE_CELL_COLORS[task.status as TaskWorkflowState] : null;

                                                return (
                                                    <td key={colKey} className={`p-0 border border-gray-300 dark:border-slate-600 align-middle text-center`}>
                                                        {isEditing && !isTagColumn ? (
                                                            <EditableCell
                                                                task={task}
                                                                colKey={colKey}
                                                                users={users}
                                                                onSave={(newValue) => {
                                                                    handleUpdate(task, colKey, newValue);
                                                                    setEditingCell(null);
                                                                }}
                                                                onCancel={() => setEditingCell(null)}
                                                                customFieldDefinitions={customFieldDefinitions}
                                                            />
                                                        ) : (
                                                            <div
                                                                onClick={(e) => {
                                                                    if (isTagColumn) {
                                                                        onOpenTagEditor(e.currentTarget, task);
                                                                    } else {
                                                                        setEditingCell({ taskId: task.id, colKey });
                                                                    }
                                                                }}
                                                                className={`h-full w-full p-4 flex items-center justify-center ${
                                                                    isStatusCol 
                                                                    ? `font-semibold ${statusColors?.bg} ${statusColors?.text}` 
                                                                    : 'text-gray-600 dark:text-slate-400'
                                                                }`}
                                                            >
                                                                {renderCellContent(task, colKey, users, projects, isListViewComfortable, customFieldDefinitions, documents, onOpenDocument, forms, onOpenForm)}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className={`w-10 p-4 border border-gray-300 dark:border-slate-600`}></td>
                                        </tr>
                                    );
                                })}
                                 {isAdding && (
                                    <InlineAddTaskRow
                                        visibleColumns={visibleColumns}
                                        columnId={column.id}
                                        projectId={activeProjectId === 'all' ? (projects[0]?.id || '') : activeProjectId}
                                        currentUser={currentUser}
                                        onSave={onInlineAddTask}
                                        onCancel={onCancelAdding}
                                        users={users}
                                    />
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-white dark:bg-slate-800">
                                    <td className="p-4 font-semibold text-sm text-brand-text border border-gray-300 dark:border-slate-600">
                                         <button
                                            onClick={onStartAdding}
                                            className="flex items-center text-sm text-brand-subtext hover:text-brand-text"
                                        >
                                            <PlusIcon className="w-4 h-4 ml-1" />
                                            افزودن وظیفه
                                        </button>
                                    </td>
                                    {visibleColumns.map(colKey => {
                                        const calculation = calculations[colKey];
                                        return (
                                            <td key={colKey} className="p-0 border border-gray-300 dark:border-slate-600 text-xs font-semibold text-brand-text dark:text-slate-200 group relative text-center">
                                                {calculation ? (
                                                    <button
                                                        onClick={(e) => setCalcMenuState({ anchorEl: e.currentTarget, colKey })}
                                                        className="w-full h-full text-center p-4"
                                                    >
                                                        <span>{calculation.node}</span>
                                                    </button>
                                                ) : (
                                                    <div className="p-4">-</div>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="p-4 w-10 border border-gray-300 dark:border-slate-600"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    {calcMenuState && (
                        <CalculationModePopover
                            anchorEl={calcMenuState.anchorEl}
                            onClose={() => setCalcMenuState(null)}
                            onSelect={(mode) => handleCalcModeChange(calcMenuState.colKey, mode)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

const TableView: React.FC<TableViewProps> = (props) => {
    const [addingTaskInColumn, setAddingTaskInColumn] = useState<string | null>(null);
    const [tagEditorState, setTagEditorState] = useState<{ anchorEl: HTMLElement, task: Task } | null>(null);
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
        task: 350,
        assigneeId: 200,
        dueDate: 150,
    });

    const handleColumnResize = (colKey: string, newWidth: number) => {
        setColumnWidths(prev => ({ ...prev, [colKey]: newWidth }));
    };

    const handleInlineAddTaskAndReset = (taskData: Omit<Task, 'id' | 'tags' | 'comments' | 'checklist' | 'status'>) => {
        props.onInlineAddTask(taskData);
        setAddingTaskInColumn(null);
    };

    return (
        <div className="space-y-4">
            {props.columns.map(column => {
                const tasksForColumn = props.tasks.filter(t => t.columnId === column.id);
                return (
                    <TableViewGroup
                        key={column.id}
                        column={column}
                        tasks={tasksForColumn}
                        users={props.users}
                        projects={props.projects}
                        onSelectTask={props.onSelectTask}
                        onUpdateTask={props.onUpdateTask}
                        availableColumns={props.availableColumns}
                        visibleColumns={props.visibleColumns}
                        onVisibleColumnsChange={props.onVisibleColumnsChange}
                        isListViewComfortable={props.isListViewComfortable}
                        onInlineAddTask={handleInlineAddTaskAndReset}
                        currentUser={props.currentUser}
                        activeProjectId={props.activeProjectId}
                        isAdding={addingTaskInColumn === column.id}
                        onStartAdding={() => setAddingTaskInColumn(column.id)}
                        onCancelAdding={() => setAddingTaskInColumn(null)}
                        onOpenTagEditor={(anchorEl, task) => setTagEditorState({ anchorEl, task })}
                        customFieldDefinitions={props.customFieldDefinitions}
                        columnWidths={columnWidths}
                        onColumnResize={handleColumnResize}
                        documents={props.documents}
                        onOpenDocument={props.onOpenDocument}
                        forms={props.forms}
                        onOpenForm={props.onOpenForm}
                    />
                );
            })}
            {tagEditorState && (
                <TagEditorPopover
                    anchorEl={tagEditorState.anchorEl}
                    task={tagEditorState.task}
                    onUpdateTask={props.onUpdateTask}
                    onClose={() => setTagEditorState(null)}
                />
            )}
        </div>
    );
};

export default TableView;