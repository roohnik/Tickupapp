import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, Project, User, KanbanColumn, Objective, CustomFieldDefinition, TaskFieldLabels, CustomFieldType, StyleSettings, ViewMode, Board, Document, Form, FormSubmission } from '../types';
import { PlusIcon, EditIcon, ChevronDownIcon, FolderIcon, BookmarkIconOutline, BookmarkIconSolid } from './Icons';
import TaskCard from './TaskCard';
import KanbanColumnComponent from './KanbanColumnComponent';
import EditProjectModal from '../modals/EditProjectModal';
import TableView from './TableView';
import CalendarView from './CalendarView';
import TimelineView from './TimelineView';
// FIX: Changed to a named import as the module does not have a default export.
import { ProcessView } from './ProcessView';
import ProcessStepSidePanel from './ProcessStepSidePanel';
import { KANBAN_COLOR_MAP, VIEW_MODES } from '../constants';
import Modal from '../modals/Modal';
import { CardView } from './CardView';
import FormCard from './FormCard';

interface FormsKanbanColumnProps {
    column: KanbanColumn;
    forms: Form[];
    onOpenForm: (formId: string) => void;
    onEditForm: (formId: string) => void;
    onTogglePinForm: (formId: string) => void;
    onMoveRequest: (formId: string) => void;
    currentUser: User;
    submissions: FormSubmission[];
}

const FormsKanbanColumn: React.FC<FormsKanbanColumnProps> = ({ column, forms, onOpenForm, onEditForm, onTogglePinForm, onMoveRequest, currentUser, submissions }) => {
    const colorScheme = KANBAN_COLOR_MAP[column.color || 'purple'];

    return (
        <div className={`rounded-lg p-2 pt-1 flex flex-col flex-shrink-0 w-[calc(100vw-3rem)] sm:w-72 md:w-80 ${colorScheme.bg}`}>
            <div className="flex items-center justify-between font-semibold mb-3 px-2 py-1">
                 <div className="flex items-center min-w-0">
                    <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${colorScheme.dot}`}></span>
                    <h3 className={`text-sm font-semibold truncate ${colorScheme.text}`}>{column.title}</h3>
                    <span className="text-sm text-gray-400 font-normal mr-2">({forms.length})</span>
                </div>
            </div>
            <div className="space-y-2 h-full overflow-y-auto p-1 rounded-md">
                {forms.map(form => {
                     const hasDraft = submissions.some(s => s.formId === form.id && s.submittedById === currentUser.id && s.status === 'DRAFT');
                    return (
                        <FormCard
                            key={form.id}
                            form={form}
                            onOpen={() => onOpenForm(form.id)}
                            onEdit={onEditForm}
                            onTogglePin={onTogglePinForm}
                            currentUser={currentUser}
                            hasDraft={hasDraft}
                            onMoveRequest={onMoveRequest}
                        />
                    );
                })}
            </div>
        </div>
    );
};

interface KanbanPageProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  columns: KanbanColumn[];
  objectives: Objective[];
  onTaskColumnChange: (taskId: string, newColumnId: string) => void;
  onSelectTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTasks: (taskIds: string[]) => void;
  onAddTask: (defaultColumn?: string, defaultDate?: string) => void;
  onUpdateColumnTitle: (columnId: string, newTitle: string) => void;
  onAddColumn: (title: string) => void;
  onUpdateColumnColor: (columnId: string, color: string) => void;
  onUpdateColumnIcon: (columnId: string, icon: string) => void;
  onQuickAddTask: (content: string, columnId: string, projectId: string) => void;
  onUpdateProject: (project: Project) => void;
  onAddProject: () => void;
  onArchiveProject: (projectId: string) => void;
  isListViewComfortable: boolean;
  currentUser: User;
  onInlineAddTask: (taskData: Omit<Task, 'id' | 'tags' | 'comments' | 'checklist' | 'status'>) => void;
  taskFieldLabels: TaskFieldLabels;
  onUpdateTaskFieldLabel: (field: keyof TaskFieldLabels, newLabel: string) => void;
  onAddCustomFieldDefinitionToProject: (projectId: string, type: CustomFieldType) => CustomFieldDefinition;
  onUpdateCustomFieldDefinitionInProject: (projectId: string, defId: string, updates: Partial<CustomFieldDefinition>) => void;
  onDeleteCustomFieldDefinitionFromProject: (projectId: string, defId: string) => void;
  onUpdateColumnDetails: (columnId: string, updates: Partial<KanbanColumn>) => void;
  popupSettings: StyleSettings;
  activeCardTemplate: 'none' | 'business' | 'swot';
  onSetCardTemplate: (template: 'none' | 'business' | 'swot') => void;
  boards: Board[];
  activeBoardId: string;
  onActiveBoardChange: (boardId: string) => void;
  onAddBoard: (projectId: string | 'all') => void;
  onEditBoard: (board: Board) => void;
  onUpdateBoard: (board: Board) => void;
  kanbanProjectFilter: string | 'all';
  onKanbanProjectFilterChange: (projectId: string | 'all') => void;
  documents: Document[];
  forms: Form[];
  submissions: FormSubmission[];
  onOpenDocument: (documentId: string) => void;
  onOpenForm: (formId: string) => void;
  onMoveFormRequest: (formId: string) => void;
  onEditForm: (formId: string) => void;
  onTogglePinForm: (formId: string) => void;
  onFormColumnChange: (formId: string, newColumnId: string) => void;
}

const KanbanPage: React.FC<KanbanPageProps> = (props) => {
    const { 
        tasks, projects, users, columns, objectives, onTaskColumnChange, 
        onSelectTask, onUpdateTask, onDeleteTasks, onAddTask, 
        onUpdateColumnTitle, onAddColumn, onUpdateColumnColor, onUpdateColumnIcon, 
        onQuickAddTask, onUpdateProject, onAddProject, onArchiveProject, 
        isListViewComfortable, currentUser, onInlineAddTask, taskFieldLabels, 
        onUpdateTaskFieldLabel, onAddCustomFieldDefinitionToProject, 
        onUpdateCustomFieldDefinitionInProject, onDeleteCustomFieldDefinitionFromProject, 
        onUpdateColumnDetails, popupSettings, activeCardTemplate, onSetCardTemplate,
        boards, activeBoardId, onActiveBoardChange, onAddBoard, onEditBoard, onUpdateBoard,
        kanbanProjectFilter, onKanbanProjectFilterChange,
        documents, forms, submissions, onOpenDocument, onOpenForm,
        onMoveFormRequest, onEditForm, onTogglePinForm, onFormColumnChange
    } = props;

    const [isBoardMenuOpen, setIsBoardMenuOpen] = useState(false);
    const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [selectedColumnForPanel, setSelectedColumnForPanel] = useState<string | null>(null);
    const [currentViewOverride, setCurrentViewOverride] = useState<ViewMode | null>(null);


    const boardMenuRef = useRef<HTMLDivElement>(null);
    const viewMenuRef = useRef<HTMLDivElement>(null);
    const projectMenuRef = useRef<HTMLDivElement>(null);
    
    const activeBoard = useMemo(() => boards.find(b => b.id === activeBoardId), [boards, activeBoardId]);
    
    useEffect(() => {
        // When board changes, reset the view override to use the new board's default
        setCurrentViewOverride(null);
    }, [activeBoardId]);
    
    const effectiveProjectId = (kanbanProjectFilter !== 'all') 
        ? kanbanProjectFilter 
        : activeBoard?.projectId ?? 'all';

    const currentViewMode = currentViewOverride || activeBoard?.defaultViewMode || 'board';
    
    const activeProject = useMemo(() => projects.find(p => p.id === effectiveProjectId), [projects, effectiveProjectId]);
    const projectFilterSelection = useMemo(() => projects.find(p => p.id === kanbanProjectFilter), [projects, kanbanProjectFilter]);

    const availableBoardViews = useMemo(() => {
        if (!activeBoard || !activeBoard.enabledViews || activeBoard.enabledViews.length === 0) {
            return VIEW_MODES;
        }
        return VIEW_MODES.filter(v => activeBoard.enabledViews!.includes(v.key));
    }, [activeBoard]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (boardMenuRef.current && !boardMenuRef.current.contains(event.target as Node)) {
            setIsBoardMenuOpen(false);
          }
           if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
            setIsViewMenuOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
            setIsProjectMenuOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (availableBoardViews.length > 0 && !availableBoardViews.some(v => v.key === currentViewMode)) {
            // If current view is not available for this board, reset to default.
            setCurrentViewOverride(null);
        }
    }, [availableBoardViews, currentViewMode]);

    
    useEffect(() => {
        if (currentViewMode !== 'card') {
            onSetCardTemplate('none');
        }
    }, [currentViewMode, onSetCardTemplate]);
    
    const handleUpdateAndCloseModal = (updatedProject: Project) => {
        onUpdateProject(updatedProject);
        setIsEditProjectModalOpen(false);
        setProjectToEdit(null);
    };

    const activeProjectTasks = useMemo(() => {
        if (effectiveProjectId === 'all') return tasks;
        return tasks.filter(task => task.projectId === effectiveProjectId);
    }, [tasks, effectiveProjectId]);
    
    const formsForCurrentBoard = useMemo(() => {
        if (!activeBoard) return [];
        return forms.filter(form => form.boardId === activeBoard.id);
    }, [forms, activeBoard]);
    
    const formsColumnForBoard = useMemo(() => {
        if (!activeBoard) return null;
        return columns.find(c => c.id === `forms-col-${activeBoard.id}`);
    }, [columns, activeBoard]);


    const columnsByProject = useMemo(() => {
        const taskColumns = columns.filter(c => c.id !== formsColumnForBoard?.id);
        if (effectiveProjectId === 'all') return taskColumns;
        const projectObjectiveId = projects.find(p => p.id === effectiveProjectId)?.objectiveId;
        if (!projectObjectiveId) return taskColumns;
        const objective = objectives.find(o => o.id === projectObjectiveId);
        // This is a placeholder for more complex logic, e.g. project-specific workflows
        return taskColumns;
    }, [columns, effectiveProjectId, projects, objectives, formsColumnForBoard]);
    
    const customFieldDefinitionsForView = useMemo(() => {
        if (effectiveProjectId === 'all') {
            const allDefs = new Map<string, CustomFieldDefinition>();
            projects.forEach(p => {
                (p.customFieldDefinitions || []).forEach(def => {
                    if (!allDefs.has(def.id)) {
                        allDefs.set(def.id, def);
                    }
                });
            });
            return Array.from(allDefs.values());
        }
        const project = projects.find(p => p.id === effectiveProjectId);
        return project?.customFieldDefinitions || [];
    }, [effectiveProjectId, projects]);

    // Calculate all possible columns for the list view from standard and custom fields
    const availableColumns = useMemo(() => {
        const standardColumns: { key: string; label: string; isCustom: boolean }[] = [
          { key: 'assigneeId', label: 'مسئول', isCustom: false },
          { key: 'status', label: 'وضعیت', isCustom: false },
          { key: 'startDate', label: 'تاریخ شروع', isCustom: false },
          { key: 'dueDate', label: 'تاریخ پایان', isCustom: false },
          { key: 'progress', label: 'میزان پیشرفت', isCustom: false },
          { key: 'tags', label: 'تگ‌ها', isCustom: false },
          { key: 'recurrence', label: 'تکرار', isCustom: false },
          { key: 'numericValue', label: 'مقدار عددی', isCustom: false },
        ];

        const customColumns = customFieldDefinitionsForView.map(def => ({
            key: def.id,
            label: def.label,
            isCustom: true,
        }));

        return [...standardColumns, ...customColumns];
    }, [customFieldDefinitionsForView]);

    const visibleColumns = useMemo(() => activeBoard?.tableViewColumns || ['assigneeId', 'dueDate'], [activeBoard]);

    const handleVisibleColumnsChange = (newColumns: string[]) => {
        if (activeBoard) {
            onUpdateBoard({ ...activeBoard, tableViewColumns: newColumns });
        }
    };

    const currentView = VIEW_MODES.find(v => v.key === currentViewMode) || VIEW_MODES[0];
    const CurrentViewIcon = currentView.Icon;

    const handleBoardChange = (boardId: string) => {
        onActiveBoardChange(boardId);
        setIsBoardMenuOpen(false);
    };

    const handleProjectChange = (newProjectId: string | 'all') => {
        onKanbanProjectFilterChange(newProjectId);
        setIsProjectMenuOpen(false);
    };

    const handleTogglePin = (e: React.MouseEvent, boardId: string) => {
        e.stopPropagation();
        const board = boards.find(b => b.id === boardId);
        if (board) {
            onUpdateBoard({ ...board, isPinned: !board.isPinned });
        }
    };

    const sortedBoards = [...boards]
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return a.name.localeCompare(b.name);
        });

    return (
        <div className="flex flex-col h-full">
            {/* Header / Board Selector */}
            <div className="flex-shrink-0 p-3 border-b flex items-center flex-wrap gap-2">
                <div className="relative" ref={projectMenuRef}>
                    <button onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)} className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-gray-100">
                        <FolderIcon className="w-5 h-5 text-gray-500" />
                        <span className="font-semibold text-brand-text">{projectFilterSelection ? projectFilterSelection.name : 'همه پروژه‌ها'}</span>
                        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isProjectMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isProjectMenuOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
                            <div className="py-1 max-h-72 overflow-y-auto">
                                <button onClick={() => handleProjectChange('all')} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">همه پروژه‌ها</button>
                                <div className="border-t my-1"></div>
                                {projects.filter(p => !p.isArchived).map(proj => (
                                    <button key={proj.id} onClick={() => handleProjectChange(proj.id)} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{proj.name}</button>
                                ))}
                                <div className="border-t my-1"></div>
                                <button
                                    onClick={() => {
                                        if (projectFilterSelection) {
                                            setProjectToEdit(projectFilterSelection);
                                            setIsEditProjectModalOpen(true);
                                            setIsProjectMenuOpen(false);
                                        }
                                    }}
                                    disabled={!projectFilterSelection}
                                    className="w-full text-right flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <EditIcon className="w-4 h-4 ml-2" />
                                    ویرایش پروژه
                                </button>
                                <div className="border-t my-1"></div>
                                <button
                                    onClick={() => { onAddProject(); setIsProjectMenuOpen(false); }}
                                    className="w-full text-right flex items-center px-4 py-2 text-sm text-brand-primary hover:bg-gray-100"
                                >
                                    <PlusIcon className="w-4 h-4 ml-2" />
                                    ایجاد پروژه جدید
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-gray-200"></div>
                
                <div className="relative" ref={boardMenuRef}>
                    <button onClick={() => setIsBoardMenuOpen(!isBoardMenuOpen)} className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-gray-100">
                        <span className="font-bold text-brand-text">{activeBoard?.name || 'انتخاب برد'}</span>
                        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isBoardMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isBoardMenuOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
                            <div className="py-1">
                                {sortedBoards.map(board => (
                                    <div key={board.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 group">
                                        <button onClick={() => handleBoardChange(board.id)} className="flex-grow text-right text-sm text-gray-700">{board.name}</button>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); onEditBoard(board); }} className="p-1 text-gray-400 hover:text-blue-500" title="ویرایش برد"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={(e) => handleTogglePin(e, board.id)} className="p-1 text-gray-400 hover:text-yellow-500" title={board.isPinned ? "برداشتن پین" : "پین کردن"}>
                                                {board.isPinned ? <BookmarkIconSolid className="w-5 h-5 text-yellow-500" /> : <BookmarkIconOutline className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t my-1"></div>
                                <button onClick={() => { onAddBoard(kanbanProjectFilter); setIsBoardMenuOpen(false); }} className="w-full text-right flex items-center px-4 py-2 text-sm text-brand-primary hover:bg-gray-100">
                                    <PlusIcon className="w-4 h-4 ml-2" />
                                    برد جدید
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="relative" ref={viewMenuRef}>
                    <button onClick={() => setIsViewMenuOpen(p => !p)} className="p-2 rounded-lg hover:bg-gray-100 flex items-center" title={`نمای فعلی: ${currentView.label}`}>
                        <CurrentViewIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    {isViewMenuOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
                            <div className="py-1">
                                {availableBoardViews.map(view => (
                                    <button 
                                        key={view.key} 
                                        onClick={() => { setCurrentViewOverride(view.key); setIsViewMenuOpen(false); }}
                                        className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <view.Icon className="w-5 h-5 ml-2 text-gray-500"/>
                                        {view.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto min-w-0">
                {currentViewMode === 'process' && (
                    <ProcessView
                        columns={columnsByProject}
                        tasks={activeProjectTasks}
                        forms={formsForCurrentBoard}
                        onStepSelect={setSelectedColumnForPanel}
                        selectedStepId={selectedColumnForPanel}
                    />
                )}
                 {currentViewMode === 'board' && (
                    <div className="flex space-x-4 space-x-reverse h-full overflow-x-auto p-4">
                        {columnsByProject.map(column => (
                            <KanbanColumnComponent
                                key={column.id}
                                column={column}
                                tasks={activeProjectTasks.filter(task => task.columnId === column.id)}
                                projects={projects}
                                users={users}
                                onTaskColumnChange={onTaskColumnChange}
                                onSelectTask={onSelectTask}
                                onAddTask={onAddTask}
                                onUpdateTask={onUpdateTask}
                                onUpdateColumnTitle={onUpdateColumnTitle}
                                onUpdateColumnColor={onUpdateColumnColor}
                                onUpdateColumnIcon={onUpdateColumnIcon}
                                onQuickAddTask={(content, colId) => onQuickAddTask(content, colId, effectiveProjectId === 'all' ? (projects.find(p=>!p.isArchived)?.id || '') : effectiveProjectId)}
                                onColumnClick={setSelectedColumnForPanel}
                                forms={formsForCurrentBoard.filter(form => form.columnId === column.id)}
                                onFormColumnChange={onFormColumnChange}
                                onOpenForm={onOpenForm}
                                onEditForm={onEditForm}
                                onTogglePinForm={onTogglePinForm}
                                onMoveRequest={onMoveFormRequest}
                                currentUser={currentUser}
                                submissions={submissions}
                            />
                        ))}
                        {formsColumnForBoard && formsForCurrentBoard.some(f => f.columnId === formsColumnForBoard.id) && (
                            <FormsKanbanColumn
                                column={formsColumnForBoard}
                                forms={formsForCurrentBoard.filter(f => f.columnId === formsColumnForBoard.id)}
                                onOpenForm={onOpenForm}
                                onEditForm={onEditForm}
                                onTogglePinForm={onTogglePinForm}
                                onMoveRequest={onMoveFormRequest}
                                currentUser={currentUser}
                                submissions={submissions}
                            />
                        )}
                        <div className="flex-shrink-0 w-72">
                             <button onClick={() => onAddColumn('ستون جدید')} className="w-full p-2 text-sm font-semibold rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-200">
                                <PlusIcon className="w-4 h-4 ml-2" /> افزودن ستون جدید
                            </button>
                        </div>
                    </div>
                )}
                {currentViewMode === 'card' && (
                    <CardView
                        tasks={activeProjectTasks}
                        columns={columnsByProject}
                        users={users}
                        currentUser={currentUser}
                        activeProjectId={effectiveProjectId}
                        onSelectTask={onSelectTask}
                        onInlineAddTask={onInlineAddTask}
                        onUpdateTask={onUpdateTask}
                        onDeleteTasks={onDeleteTasks}
                        activeTemplate={activeCardTemplate}
                    />
                )}
                {currentViewMode === 'table' && (
                    <div className="p-4">
                        <TableView
                            tasks={activeProjectTasks}
                            users={users}
                            projects={projects}
                            columns={columnsByProject}
                            onSelectTask={onSelectTask}
                            onUpdateTask={onUpdateTask}
                            availableColumns={availableColumns}
                            visibleColumns={visibleColumns}
                            onVisibleColumnsChange={handleVisibleColumnsChange}
                            isListViewComfortable={isListViewComfortable}
                            onInlineAddTask={onInlineAddTask}
                            currentUser={currentUser}
                            activeProjectId={effectiveProjectId}
                            customFieldDefinitions={customFieldDefinitionsForView}
                            documents={documents}
                            onOpenDocument={onOpenDocument}
                            forms={forms}
                            onOpenForm={onOpenForm}
                        />
                    </div>
                )}
                {currentViewMode === 'calendar' && (
                    <div className="p-4">
                        <CalendarView
                            projects={projects}
                            tasks={activeProjectTasks}
                            onSelectTask={onSelectTask}
                            onAddTask={onAddTask}
                            onUpdateTask={onUpdateTask}
                        />
                    </div>
                )}
                 {currentViewMode === 'timeline' && (
                    <div className="p-1 h-full">
                        <TimelineView
                            tasks={activeProjectTasks}
                            projects={projects}
                            users={users}
                            columns={columnsByProject}
                            onSelectTask={onSelectTask}
                            onUpdateTask={onUpdateTask}
                        />
                    </div>
                )}
            </div>
            
            {projectToEdit && (
                <EditProjectModal
                    isOpen={isEditProjectModalOpen}
                    onClose={() => setIsEditProjectModalOpen(false)}
                    project={projectToEdit}
                    objectives={objectives}
                    onSubmit={handleUpdateAndCloseModal}
                    onArchive={onArchiveProject}
                />
            )}
            <ProcessStepSidePanel
                isOpen={!!selectedColumnForPanel}
                onClose={() => setSelectedColumnForPanel(null)}
                column={columns.find(c => c.id === selectedColumnForPanel)}
                tasks={activeProjectTasks}
                users={users}
                onQuickAddTask={(content) => {
                    if (selectedColumnForPanel) {
                        const projectId = effectiveProjectId === 'all' ? (projects[0]?.id || '') : effectiveProjectId;
                        onQuickAddTask(content, selectedColumnForPanel, projectId);
                    }
                }}
                projects={projects}
                columns={columns}
                currentUser={currentUser}
                onUpdateTask={onUpdateTask}
                taskFieldLabels={taskFieldLabels}
                onUpdateTaskFieldLabel={onUpdateTaskFieldLabel}
                customFieldDefinitions={customFieldDefinitionsForView}
                onAddCustomFieldDefinitionToProject={onAddCustomFieldDefinitionToProject}
                onUpdateCustomFieldDefinitionInProject={onUpdateCustomFieldDefinitionInProject}
                onDeleteCustomFieldDefinitionFromProject={onDeleteCustomFieldDefinitionFromProject}
                onUpdateColumn={onUpdateColumnDetails}
                popupSettings={popupSettings}
                documents={documents}
                forms={forms}
                submissions={submissions}
            />
        </div>
    );
};

export default KanbanPage;