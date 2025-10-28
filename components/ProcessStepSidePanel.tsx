import React, { useState, useRef, useEffect, useMemo } from 'react';
import { KanbanColumn, Task, User, Project, TaskFieldLabels, CustomFieldDefinition, CustomFieldType, CustomField, ChecklistItem, Comment, Tag, TaskWorkflowState, WORKFLOW_STATES, StyleSettings, Document, Form, FormSubmission, Prerequisite } from '../types';
import { CloseIcon, PlusIcon, CalendarIcon, ArrowRightIcon, ParagraphIcon, ChecklistIcon, ChatBubbleIcon, TagIcon, UserIcon, RepeatIcon, CheckCircleIcon, NumberIcon, TextIcon, PhoneIcon, TrashIcon, DocumentTextIcon, EllipsisHorizontalIcon } from './Icons';
import { toPersianDate } from '../utils/dateUtils';
import { STATUS_BADGE_COLOR_MAP, TAG_COLOR_MAP, TAG_COLOR_OPTIONS, STATUS_TEXT_COLOR_MAP } from '../constants';
import TaskPropertyRow from './TaskPropertyRow';
import Comments from './Comments';
import Checklist from './Checklist';
import DueDateSelector from './DueDateSelector';
import ProgressBar from './ProgressBar';
import PrerequisitesModal from '../modals/PrerequisitesModal';


interface MiniTaskCardProps {
    task: Task;
    user?: User;
    onClick: () => void;
}

const MiniTaskCard: React.FC<MiniTaskCardProps> = ({ task, user, onClick }) => {
    const status = task.status;
    const colors = STATUS_BADGE_COLOR_MAP[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
        <div 
            onClick={onClick}
            className="p-3 bg-white border rounded-lg cursor-pointer hover:bg-gray-50/70"
        >
            <p className="font-medium text-sm text-brand-text">{task.content}</p>
            <div className="flex items-center justify-between mt-2 text-xs">
                <div className="flex items-center text-brand-subtext">
                    {user && <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full ml-2" />}
                    {task.dueDate && <span className="flex items-center"><CalendarIcon className="w-4 h-4 ml-1" /> {toPersianDate(task.dueDate)}</span>}
                </div>
                <span className={`px-2 py-0.5 font-medium rounded-full inline-block ${colors.bg} ${colors.text}`}>{status}</span>
            </div>
        </div>
    );
};

// =================================================================
// TASK DETAIL VIEW (New Component)
// =================================================================
interface TaskDetailViewProps {
    task: Task;
    users: User[];
    projects: Project[];
    columns: KanbanColumn[];
    currentUser: User;
    onUpdateTask: (updatedTask: Task) => void;
    taskFieldLabels: TaskFieldLabels;
    onUpdateTaskFieldLabel: (field: keyof TaskFieldLabels, newLabel: string) => void;
    customFieldDefinitions: CustomFieldDefinition[];
    onAddCustomFieldDefinitionToProject: (projectId: string, type: CustomFieldType) => CustomFieldDefinition;
    onUpdateCustomFieldDefinitionInProject: (projectId: string, defId: string, updates: Partial<CustomFieldDefinition>) => void;
    onDeleteCustomFieldDefinitionFromProject: (projectId: string, defId: string) => void;
    onBack: () => void;
    documents: Document[];
    forms: Form[];
    submissions: FormSubmission[];
    allTasks: Task[];
}

const TaskDetailView: React.FC<TaskDetailViewProps> = (props) => {
    const { task, users, projects, columns, currentUser, onUpdateTask, taskFieldLabels, onUpdateTaskFieldLabel, customFieldDefinitions, onBack, documents, forms, submissions, allTasks } = props;

    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [description, setDescription] = useState(task.description || '');
    const [newTagText, setNewTagText] = useState('');
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isPrerequisitesModalOpen, setIsPrerequisitesModalOpen] = useState(false);
    
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const moreMenuButtonRef = useRef<HTMLButtonElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMoreMenuOpen && moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node) && moreMenuButtonRef.current && !moreMenuButtonRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMoreMenuOpen]);


    useEffect(() => {
        if (isEditingDescription && descriptionRef.current) {
            descriptionRef.current.style.height = 'auto';
            descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
            descriptionRef.current.focus();
        }
    }, [isEditingDescription, description]);

    const handleUpdate = (updates: Partial<Task>) => {
        onUpdateTask({ ...task, ...updates });
    };

    const handleDescriptionBlur = () => {
        setIsEditingDescription(false);
        if (description.trim() !== (task.description || '')) {
            handleUpdate({ description: description.trim() });
        }
    };

    const handleChecklistUpdate = (itemId: string, completed: boolean) => {
        const updatedChecklist = task.checklist?.map(item => item.id === itemId ? { ...item, completed } : item);
        handleUpdate({ checklist: updatedChecklist });
    };

    const handleAddChecklistItem = (text: string) => {
        const newItem: ChecklistItem = { id: `cl-${Date.now()}`, text, completed: false };
        const updatedChecklist = [...(task.checklist || []), newItem];
        handleUpdate({ checklist: updatedChecklist });
    };

    const handleAddComment = (text: string) => {
        const newComment: Comment = { id: `c-${Date.now()}`, authorId: currentUser.id, text, createdAt: new Date().toISOString() };
        handleUpdate({ comments: [...(task.comments || []), newComment] });
    };

    const handleAddTag = () => {
        if (newTagText.trim()) {
            const newTag: Tag = { id: `tag-${Date.now()}`, text: newTagText.trim(), color: TAG_COLOR_OPTIONS[Math.floor(Math.random() * TAG_COLOR_OPTIONS.length)] };
            handleUpdate({ tags: [...(task.tags || []), newTag] });
            setNewTagText('');
        }
    };
    
    const handleRemoveTag = (tagId: string) => {
        handleUpdate({ tags: task.tags?.filter(t => t.id !== tagId) });
    };

    const recurrenceLabels: { [key: string]: string } = {
        'hourly': 'هر ساعت', 'every-2-hours': 'هر ۲ ساعت', 'every-3-hours': 'هر سه ساعت', 'every-6-hours': 'هر شش ساعت', 'daily': 'روزانه',
        'weekly': 'هفتگی', 'bi-weekly': 'دو هفته یکبار', 'monthly': 'ماهانه', 'quarterly': 'فصلی', 'semi-annually': 'هر شش ماه', 'annually': 'سالانه',
    };

    const commonSelectClasses = "w-full text-sm border-none bg-transparent focus:ring-0 p-0 rounded-md focus:bg-gray-200/60 font-medium";

    const customFieldsWithDefs = useMemo(() => {
        if (!task?.customFields) return [];
        return task.customFields.map(cf => {
            const def = customFieldDefinitions.find(d => d.id === cf.definitionId);
            return def ? { ...cf, ...def } : null; 
        }).filter((cf): cf is (CustomField & CustomFieldDefinition) => cf !== null);
    }, [task?.customFields, customFieldDefinitions]);

    return (
        <>
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 -mr-2">
                        <ArrowRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <h2 className="text-lg font-bold text-brand-text mr-2 truncate">{task.content}</h2>
                </div>
                 <div className="relative">
                    <button ref={moreMenuButtonRef} onClick={() => setIsMoreMenuOpen(p => !p)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                        <EllipsisHorizontalIcon className="w-5 h-5"/>
                    </button>
                    {isMoreMenuOpen && (
                        <div ref={moreMenuRef} className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20 py-1">
                            <button onClick={() => { setIsPrerequisitesModalOpen(true); setIsMoreMenuOpen(false); }} className="w-full text-right px-3 py-1.5 text-sm hover:bg-gray-100">
                                پیش نیاز تسک
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6">
                <div className="space-y-1">
                    <TaskPropertyRow icon={<UserIcon className="w-4 h-4" />} label={taskFieldLabels.assigneeId} onLabelChange={newLabel => onUpdateTaskFieldLabel('assigneeId', newLabel)}>
                        <select value={task.assigneeId} onChange={e => handleUpdate({ assigneeId: e.target.value })} className={commonSelectClasses}>
                            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </select>
                    </TaskPropertyRow>
                    <TaskPropertyRow icon={<TagIcon className="w-4 h-4" />} label={taskFieldLabels.status} onLabelChange={newLabel => onUpdateTaskFieldLabel('status', newLabel)}>
                        <select value={task.status} onChange={e => handleUpdate({ status: e.target.value as TaskWorkflowState })} className={`${commonSelectClasses} ${STATUS_TEXT_COLOR_MAP[task.status]}`}>
                            {WORKFLOW_STATES.map(state => <option key={state} value={state} className={STATUS_TEXT_COLOR_MAP[state]}>{state}</option>)}
                        </select>
                    </TaskPropertyRow>
                    <TaskPropertyRow icon={<CalendarIcon className="w-4 h-4" />} label={taskFieldLabels.dueDate} onLabelChange={newLabel => onUpdateTaskFieldLabel('dueDate', newLabel)}>
                        <DueDateSelector value={task.dueDate || ''} onChange={(date) => handleUpdate({ dueDate: date || undefined })} />
                    </TaskPropertyRow>
                    {/* Add other fields as needed */}
                </div>
                
                <div className="border-t pt-4">
                    <h3 className="text-md font-semibold text-brand-text mb-2 flex items-center"><ParagraphIcon className="w-5 h-5 ml-2" />توضیحات</h3>
                    {isEditingDescription ? (
                        <textarea ref={descriptionRef} value={description} onChange={e => setDescription(e.target.value)} onBlur={handleDescriptionBlur} placeholder="توضیحات بیشتر..." className="w-full text-sm border-gray-300 rounded-md shadow-sm" rows={4}/>
                    ) : (
                        <div onClick={() => setIsEditingDescription(true)} className="text-sm text-brand-text whitespace-pre-wrap p-2 rounded-md hover:bg-gray-100/70 min-h-[4rem] cursor-text">
                            {task.description || <span className="text-gray-400">توضیحاتی اضافه کنید...</span>}
                        </div>
                    )}
                </div>
                
                <div className="border-t pt-4">
                     <h3 className="text-md font-semibold text-brand-text mb-3 flex items-center"><TagIcon className="w-5 h-5 ml-2"/>تگ‌ها</h3>
                     <div className="flex flex-wrap gap-2 items-center">
                        {task.tags?.map(tag => (
                            <div key={tag.id} className={`flex items-center pl-1 pr-2 py-1 rounded-full text-xs font-medium ${TAG_COLOR_MAP[tag.color]?.bg} ${TAG_COLOR_MAP[tag.color]?.text}`}>
                                <span>{tag.text}</span>
                                <button onClick={() => handleRemoveTag(tag.id)} className="ml-1 opacity-75 hover:opacity-100">&times;</button>
                            </div>
                        ))}
                        <input type="text" value={newTagText} onChange={e => setNewTagText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag()} placeholder="افزودن تگ..." className="text-sm border-none bg-gray-100 rounded-full px-2 py-1"/>
                     </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-md font-semibold text-brand-text mb-3 flex items-center"><ChecklistIcon className="w-5 h-5 ml-2"/>چک‌لیست</h3>
                    <Checklist items={task.checklist || []} onUpdate={handleChecklistUpdate} onAdd={handleAddChecklistItem} />
                </div>
                
                <div className="border-t pt-4">
                     <h3 className="text-md font-semibold text-brand-text mb-3 flex items-center"><ChatBubbleIcon className="w-5 h-5 ml-2"/>نظرات</h3>
                    <Comments comments={task.comments || []} users={users} currentUser={currentUser} onAdd={handleAddComment} />
                </div>
            </div>
            {isPrerequisitesModalOpen && (
              <PrerequisitesModal
                isOpen={isPrerequisitesModalOpen}
                onClose={() => setIsPrerequisitesModalOpen(false)}
                task={task}
                onUpdateTask={onUpdateTask}
                allTasks={allTasks}
                allForms={forms}
                allDocuments={documents}
                allProjects={projects}
                allColumns={columns}
                allSubmissions={submissions}
              />
            )}
        </>
    );
};


// =================================================================
// MAIN PANEL COMPONENT
// =================================================================
interface ProcessStepSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    column: KanbanColumn | undefined;
    tasks: Task[];
    users: User[];
    onQuickAddTask: (content: string) => void;
    projects: Project[];
    columns: KanbanColumn[];
    currentUser: User;
    onUpdateTask: (updatedTask: Task) => void;
    taskFieldLabels: TaskFieldLabels;
    onUpdateTaskFieldLabel: (field: keyof TaskFieldLabels, newLabel: string) => void;
    customFieldDefinitions: CustomFieldDefinition[];
    onAddCustomFieldDefinitionToProject: (projectId: string, type: CustomFieldType) => CustomFieldDefinition;
    onUpdateCustomFieldDefinitionInProject: (projectId: string, defId: string, updates: Partial<CustomFieldDefinition>) => void;
    onDeleteCustomFieldDefinitionFromProject: (projectId: string, defId: string) => void;
    onUpdateColumn: (columnId: string, updates: Partial<KanbanColumn>) => void;
    popupSettings: StyleSettings;
    documents: Document[];
    forms: Form[];
    submissions: FormSubmission[];
}

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void, anchorRef?: React.RefObject<HTMLElement>) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node) || (anchorRef?.current && anchorRef.current.contains(event.target as Node))) {
                return;
            }
            handler();
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, anchorRef]);
};

interface ProcessSpecPopoverProps {
  column: KanbanColumn;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSave: (updates: Partial<Pick<KanbanColumn, 'processStartDate' | 'processEndDate' | 'processDescription'>>) => void;
  styleSettings: StyleSettings;
}

const ProcessSpecPopover: React.FC<ProcessSpecPopoverProps> = ({ column, anchorEl, onClose, onSave, styleSettings }) => {
    const [startDate, setStartDate] = useState(column.processStartDate || '');
    const [endDate, setEndDate] = useState(column.processEndDate || '');
    const [description, setDescription] = useState(column.processDescription || '');
    const popoverRef = useRef<HTMLDivElement>(null);

    useClickOutside(popoverRef, onClose, { current: anchorEl });

    if (!anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const style: React.CSSProperties = {
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
    };

    const handleSave = () => {
        onSave({
            processStartDate: startDate || undefined,
            processEndDate: endDate || undefined,
            processDescription: description || undefined,
        });
        onClose();
    };

    return (
        <div 
            ref={popoverRef} 
            style={{ ...style, fontFamily: styleSettings.fontFamily }} 
            className={`w-80 rounded-lg shadow-xl border z-50 p-4 space-y-4 animate-fade-in ${styleSettings.backgroundColor}`}
        >
            <h3 className="font-semibold text-brand-text">مشخصات فرایند</h3>
             <div className="space-y-1">
                <label className="text-xs font-medium text-brand-subtext">تاریخ شروع</label>
                <DueDateSelector value={startDate} onChange={setStartDate} />
            </div>
             <div className="space-y-1">
                <label className="text-xs font-medium text-brand-subtext">تاریخ پایان</label>
                <DueDateSelector value={endDate} onChange={setEndDate} />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-brand-subtext">توضیحات</label>
                <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={4}
                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
                    placeholder="توضیحات این مرحله از فرایند..."
                />
            </div>
            <div className="flex justify-end border-t pt-3">
                <button onClick={handleSave} className="px-4 py-1.5 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: styleSettings.primaryColor }}>
                    ذخیره
                </button>
            </div>
        </div>
    );
};

const ProcessStepSidePanel: React.FC<ProcessStepSidePanelProps> = (props) => {
    const { isOpen, onClose, column, tasks, users, onQuickAddTask, onUpdateColumn, popupSettings } = props;
    const [detailedTaskId, setDetailedTaskId] = useState<string | null>(null);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskContent, setNewTaskContent] = useState('');
    const [isSpecPopoverOpen, setIsSpecPopoverOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const specButtonRef = useRef<HTMLButtonElement>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isAddingTask) textareaRef.current?.focus();
    }, [isAddingTask]);

     useEffect(() => {
        if (!isOpen) {
            setIsAddingTask(false);
            setNewTaskContent('');
            setDetailedTaskId(null);
            setIsSpecPopoverOpen(false);
        }
    }, [isOpen]);

    const handleQuickAdd = () => {
        if (newTaskContent.trim()) {
            onQuickAddTask(newTaskContent.trim());
            setNewTaskContent('');
            setIsAddingTask(false);
        }
    };
    
    if (!isOpen || !column) return null;

    const selectedTaskForDetail = detailedTaskId ? tasks.find(t => t.id === detailedTaskId) : null;
    const columnTasks = tasks.filter(t => t.columnId === column.id);
    
    const panelClasses = isMobile
        ? "fixed inset-0 bg-white z-50 flex flex-col"
        : "absolute top-0 left-0 h-full w-full max-w-lg bg-white shadow-2xl animate-slide-in-left flex flex-col";

    return (
        <div className={`fixed top-0 left-0 h-full w-full z-40 ${isMobile ? '' : 'bg-black bg-opacity-40 animate-fade-in'}`} onClick={onClose}>
            <div 
                ref={panelRef}
                className={panelClasses}
                onClick={e => e.stopPropagation()}
                dir="rtl"
            >
                {selectedTaskForDetail ? (
                    <TaskDetailView 
                        task={selectedTaskForDetail}
                        onBack={() => setDetailedTaskId(null)}
                        allTasks={props.tasks}
                        {...props}
                    />
                ) : (
                    <>
                        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                            <h2 className="text-lg font-bold text-brand-text">{column.title}</h2>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <button
                                    ref={specButtonRef} 
                                    onClick={() => setIsSpecPopoverOpen(p => !p)} 
                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                                    title="ثبت مشخصات فرایند"
                                >
                                    <DocumentTextIcon className="w-6 h-6" />
                                </button>
                                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {isSpecPopoverOpen && (
                            <ProcessSpecPopover 
                                column={column}
                                anchorEl={specButtonRef.current}
                                onClose={() => setIsSpecPopoverOpen(false)}
                                onSave={(updates) => onUpdateColumn(column.id, updates)}
                                styleSettings={popupSettings}
                            />
                        )}
                        
                        <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50/50">
                            {columnTasks.map(task => (
                                <MiniTaskCard 
                                    key={task.id} 
                                    task={task}
                                    user={users.find(u => u.id === task.assigneeId)}
                                    onClick={() => setDetailedTaskId(task.id)}
                                />
                            ))}
                        </div>

                        <div className="p-4 border-t flex-shrink-0">
                            {isAddingTask ? (
                                <div>
                                    <div className="bg-white rounded-lg border">
                                        <textarea
                                            ref={textareaRef}
                                            value={newTaskContent}
                                            onChange={e => setNewTaskContent(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuickAdd(); }
                                                if (e.key === 'Escape') { setIsAddingTask(false); setNewTaskContent(''); }
                                            }}
                                            placeholder="عنوان تسک..."
                                            className="w-full p-2 border-none rounded-lg focus:ring-1 focus:ring-brand-primary text-sm resize-none"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="mt-2 space-x-2 space-x-reverse">
                                        <button onClick={handleQuickAdd} className="px-3 py-1 bg-brand-primary text-white rounded-md text-sm font-semibold">افزودن</button>
                                        <button onClick={() => setIsAddingTask(false)} className="p-1 text-gray-500 hover:text-gray-800">
                                            <CloseIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsAddingTask(true)} 
                                    className="w-full p-2 text-sm font-semibold rounded-md flex items-center justify-center transition-colors text-brand-primary bg-blue-100/60 hover:bg-blue-100"
                                >
                                    <PlusIcon className="w-4 h-4 ml-2" /> افزودن تسک
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProcessStepSidePanel;
