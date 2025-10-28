import React, { useState, useEffect, useRef, useMemo } from 'react';
// FIX: Added Form to imports to resolve 'Cannot find name' error.
import { Task, User, Project, Tag, ChecklistItem, Comment, KanbanColumn, TaskWorkflowState, WORKFLOW_STATES, TaskFieldLabels, CustomField, CustomFieldType, CustomFieldDefinition, Team, Prerequisite, FormSubmission, Document, Form } from '../types';
import { CloseIcon, TagIcon, UserIcon, ChecklistIcon, ChatBubbleIcon, ParagraphIcon, PlusIcon, TrashIcon, CalendarIcon, RepeatIcon, CheckCircleIcon, NumberIcon, TextIcon, PhoneIcon, UserGroupIcon, EllipsisHorizontalIcon, DocumentTextIcon, ChevronDownIcon, ClipboardListIcon } from './Icons';
import Checklist from './Checklist';
import Comments from './Comments';
import TaskPropertyRow from './TaskPropertyRow';
import { TAG_COLOR_MAP, TAG_COLOR_OPTIONS, STATUS_TEXT_COLOR_MAP } from '../constants';
import DueDateSelector from './DueDateSelector';
import ProgressBar from './ProgressBar';
import PrerequisitesModal from '../modals/PrerequisitesModal';

// Helper to check prerequisites
const getUnmetPrerequisites = (
  task: Task,
  allTasks: Task[],
  allSubmissions: FormSubmission[],
  allDocuments: Document[],
): { prerequisite: Prerequisite, reason: string }[] => {
  if (!task.prerequisites) return [];

  const unmet: { prerequisite: Prerequisite, reason: string }[] = [];

  task.prerequisites.forEach((prereq, index) => {
    switch (prereq.type) {
      case 'TASK': {
        const incompleteTasks = prereq.taskIds
          .map(id => allTasks.find(t => t.id === id))
          .filter(t => t && t.status !== 'انجام شد');
        if (incompleteTasks.length > 0) {
          unmet.push({ prerequisite: prereq, reason: `تسک های زیر باید انجام شوند: ${incompleteTasks.map(t => `'${t.content}'`).join(', ')}` });
        }
        break;
      }
      case 'FORM': {
        const unsubmittedForms = prereq.formIds.filter(formId => 
          !allSubmissions.some(sub => sub.formId === formId && sub.submittedById === task.assigneeId)
        );
        if (unsubmittedForms.length > 0) {
          unmet.push({ prerequisite: prereq, reason: `فرم های با شناسه ${unsubmittedForms.join(', ')} باید ثبت شوند.` });
        }
        break;
      }
      case 'KANBAN_LIST': {
        const tasksInList = allTasks.filter(t => t.projectId === prereq.projectId && t.columnId === prereq.columnId);
        const incompleteTasks = tasksInList.filter(t => t.status !== 'انجام شد');
        if (incompleteTasks.length > 0) {
          unmet.push({ prerequisite: prereq, reason: `${incompleteTasks.length} تسک در لیست مشخص شده هنوز انجام نشده اند.` });
        }
        break;
      }
      case 'DOCUMENT_STUDY': {
        const doc = allDocuments.find(d => d.id === prereq.documentId);
        if (doc) {
            const headingIds = doc.content.filter(b => b.type === 'heading1').map(b => b.id);
            if (headingIds.length > 0) {
                 const completedIds = task.prerequisiteCompletion?.[prereq.documentId] || [];
                 if (completedIds.length < headingIds.length) {
                    unmet.push({ prerequisite: prereq, reason: `باید مطالعه دستورالعمل '${doc.title}' تکمیل شود.` });
                 }
            }
        }
        break;
      }
    }
  });

  return unmet;
};

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
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
  }, [ref, handler]);
};

interface TaskSidePanelProps {
    task: Task | null;
    users: User[];
    projects: Project[];
    teams: Team[];
    columns: KanbanColumn[];
    currentUser: User;
    onClose: () => void;
    onUpdateTask: (updatedTask: Task) => void;
    taskFieldLabels: TaskFieldLabels;
    onUpdateTaskFieldLabel: (field: keyof TaskFieldLabels, newLabel: string) => void;
    onAddCustomFieldDefinitionToProject: (projectId: string, type: CustomFieldType) => CustomFieldDefinition;
    onUpdateCustomFieldDefinitionInProject: (projectId: string, defId: string, updates: Partial<CustomFieldDefinition>) => void;
    onDeleteCustomFieldDefinitionFromProject: (projectId: string, defId: string) => void;
    displayAs?: 'panel' | 'modal';
    // New props for prerequisites
    submissions: FormSubmission[];
    documents: Document[];
    tasks: Task[];
    forms: Form[];
    onOpenDocument: (documentId: string) => void;
    onOpenForm: (formId: string) => void;
}

const FormSelector: React.FC<{
    forms: Form[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    onOpenForm: (formId: string) => void;
}> = ({ forms, selectedIds, onChange, onOpenForm }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, () => setIsOpen(false));

    const selectedForms = forms.filter(f => selectedIds.includes(f.id));

    const toggleSelection = (formId: string) => {
        onChange(selectedIds.includes(formId) ? selectedIds.filter(id => id !== formId) : [...selectedIds, formId]);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="w-full flex items-center justify-between text-right p-1 rounded-md hover:bg-gray-100 min-h-[28px]">
                <div className="flex flex-wrap gap-1">
                    {selectedForms.length > 0 ? (
                        selectedForms.map(form => (
                            <button
                                key={form.id}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onOpenForm(form.id); }}
                                className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full hover:bg-purple-200"
                            >
                                {form.title}
                            </button>
                        ))
                    ) : (
                        <span className="text-gray-500 text-sm">انتخاب فرم...</span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1"
                >
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border z-10 max-h-60 overflow-y-auto">
                    {forms.map(form => (
                        <label key={form.id} className="w-full text-right flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(form.id)}
                                onChange={() => toggleSelection(form.id)}
                                className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary ml-3"
                            />
                            <span className="flex-grow">{form.title}</span>
                        </label>
                    ))}
                    {forms.length === 0 && <div className="p-2 text-sm text-center text-gray-400">فرم وجود ندارد.</div>}
                </div>
            )}
        </div>
    );
};

const DocumentSelector: React.FC<{
    documents: Document[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    onOpenDocument: (docId: string) => void;
}> = ({ documents, selectedIds, onChange, onOpenDocument }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, () => setIsOpen(false));

    const selectedDocuments = documents.filter(d => selectedIds.includes(d.id));

    const toggleSelection = (docId: string) => {
        onChange(selectedIds.includes(docId) ? selectedIds.filter(id => id !== docId) : [...selectedIds, docId]);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="w-full flex items-center justify-between text-right p-1 rounded-md hover:bg-gray-100 min-h-[28px]">
                <div className="flex flex-wrap gap-1">
                    {selectedDocuments.length > 0 ? (
                        selectedDocuments.map(doc => (
                            <button
                                key={doc.id}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onOpenDocument(doc.id); }}
                                className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full hover:bg-gray-300"
                            >
                                {doc.title}
                            </button>
                        ))
                    ) : (
                        <span className="text-gray-500 text-sm">انتخاب مستندات...</span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1"
                >
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border z-10 max-h-60 overflow-y-auto">
                    {documents.map(doc => (
                        <label key={doc.id} className="w-full text-right flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(doc.id)}
                                onChange={() => toggleSelection(doc.id)}
                                className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary ml-3"
                            />
                            <span className="flex-grow">{doc.title}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const TaskSidePanel: React.FC<TaskSidePanelProps> = ({ task, users, projects, teams, columns, currentUser, onClose, onUpdateTask, taskFieldLabels, onUpdateTaskFieldLabel, onAddCustomFieldDefinitionToProject, onUpdateCustomFieldDefinitionInProject, onDeleteCustomFieldDefinitionFromProject, displayAs = 'panel', submissions, documents, tasks, forms, onOpenDocument, onOpenForm }) => {
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [content, setContent] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [description, setDescription] = useState('');
    const [isEditingIcon, setIsEditingIcon] = useState(false);
    const [newTagText, setNewTagText] = useState('');
    const [isAddFieldMenuOpen, setIsAddFieldMenuOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isPrerequisitesModalOpen, setIsPrerequisitesModalOpen] = useState(false);

    const iconInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const addFieldButtonRef = useRef<HTMLButtonElement>(null);
    const addFieldMenuRef = useRef<HTMLDivElement>(null);
    const moreMenuButtonRef = useRef<HTMLButtonElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (task) {
            setContent(task.content);
            setDescription(task.description || '');
        }
    }, [task]);
    
     useEffect(() => {
        if (isEditingContent && contentRef.current) {
            contentRef.current.style.height = 'auto';
            contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
            contentRef.current.focus();
        }
    }, [isEditingContent, content]);
    
     useEffect(() => {
        if (isEditingDescription && descriptionRef.current) {
            descriptionRef.current.style.height = 'auto';
            descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
            descriptionRef.current.focus();
        }
    }, [isEditingDescription, description]);

    useEffect(() => {
        if (isEditingIcon && iconInputRef.current) {
            iconInputRef.current.focus();
        }
    }, [isEditingIcon]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isAddFieldMenuOpen && addFieldMenuRef.current && !addFieldMenuRef.current.contains(event.target as Node) && addFieldButtonRef.current && !addFieldButtonRef.current.contains(event.target as Node)) {
                setIsAddFieldMenuOpen(false);
            }
            if (isMoreMenuOpen && moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node) && moreMenuButtonRef.current && !moreMenuButtonRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isAddFieldMenuOpen, isMoreMenuOpen]);

    const project = useMemo(() => projects.find(p => p.id === task?.projectId), [projects, task?.projectId]);

    const availableDefsToAdd = useMemo(() => {
        if (!project || !project.customFieldDefinitions || !task) return [];
        const taskCustomFieldDefIds = new Set((task.customFields || []).map(cf => cf.definitionId));
        return project.customFieldDefinitions.filter(def => !taskCustomFieldDefIds.has(def.id));
    }, [project, task]);


    const customFieldDefinitionsForProject = useMemo(() => {
        if (!task) return [];
        const project = projects.find(p => p.id === task.projectId);
        return project?.customFieldDefinitions || [];
    }, [task, projects]);

    const customFieldsWithDefs = useMemo(() => {
        if (!task?.customFields) return [];
        return task.customFields.map(cf => {
            const def = customFieldDefinitionsForProject.find(d => d.id === cf.definitionId);
            return def ? { ...cf, ...def } : null; 
        }).filter((cf): cf is (CustomField & CustomFieldDefinition) => cf !== null);
    }, [task?.customFields, customFieldDefinitionsForProject]);

    if (!task) return null;
    
    const handleUpdate = (updates: Partial<Task>) => {
        onUpdateTask({ ...task, ...updates });
    }
    
    const handleStatusUpdate = (newStatus: TaskWorkflowState) => {
        if (newStatus === 'انجام شد') {
            const unmet = getUnmetPrerequisites(task, tasks, submissions, documents);
            if (unmet.length > 0) {
                setIsPrerequisitesModalOpen(true);
                return; // Block status change
            }
        }
        handleUpdate({ status: newStatus });
    };

    const handleContentBlur = () => {
        setIsEditingContent(false);
        if (content.trim() && content.trim() !== task.content) {
            handleUpdate({ content: content.trim() });
        } else {
            setContent(task.content);
        }
    };
    
    const handleDescriptionBlur = () => {
        setIsEditingDescription(false);
        if (description.trim() !== (task.description || '')) {
            handleUpdate({ description: description.trim() });
        }
    };

    const handleIconChange = (newIcon: string) => {
        // Simple validation for a single emoji
        if (/\p{Emoji}/u.test(newIcon) && newIcon.length <= 2) {
             handleUpdate({ icon: newIcon });
        }
        setIsEditingIcon(false);
    }
    
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
        const newComment: Comment = {
            id: `c-${Date.now()}`,
            authorId: currentUser.id,
            text,
            createdAt: new Date().toISOString()
        };
        const updatedComments = [...(task.comments || []), newComment];
        handleUpdate({ comments: updatedComments });
    };

    const handleAddTag = () => {
        if (newTagText.trim()) {
            const newTag: Tag = {
                id: `tag-${Date.now()}`,
                text: newTagText.trim(),
                color: TAG_COLOR_OPTIONS[Math.floor(Math.random() * TAG_COLOR_OPTIONS.length)]
            };
            const updatedTags = [...(task.tags || []), newTag];
            handleUpdate({ tags: updatedTags });
            setNewTagText('');
        }
    };
    
    const handleRemoveTag = (tagId: string) => {
        const updatedTags = task.tags?.filter(t => t.id !== tagId);
        handleUpdate({ tags: updatedTags });
    };

    const handleAddCustomField = (type: CustomFieldType) => {
        if (!task) return;
        const newDef = onAddCustomFieldDefinitionToProject(task.projectId, type);
        const newFieldInstance: CustomField = {
            definitionId: newDef.id,
            value: null,
        };
        const updatedFields = [...(task.customFields || []), newFieldInstance];
        handleUpdate({ customFields: updatedFields });
        setIsAddFieldMenuOpen(false);
    };

    const handleAddExistingCustomField = (definitionId: string) => {
        if (!task) return;
        const newFieldInstance: CustomField = {
            definitionId: definitionId,
            value: null,
        };
        const updatedFields = [...(task.customFields || []), newFieldInstance];
        handleUpdate({ customFields: updatedFields });
        setIsAddFieldMenuOpen(false);
    };

    const handleRemoveCustomFieldFromTask = (definitionId: string) => {
        if (!task) return;
        const updatedFields = (task.customFields || []).filter(f => f.definitionId !== definitionId);
        handleUpdate({ customFields: updatedFields });
    };
    
    const handleUpdateCustomFieldValue = (definitionId: string, value: CustomField['value']) => {
        const updatedFields = (task.customFields || []).map(f =>
            f.definitionId === definitionId ? { ...f, value } : f
        );
        handleUpdate({ customFields: updatedFields });
    };
    
    const handleUpdateCustomFieldDefinition = (defId: string, updates: Partial<CustomFieldDefinition>) => {
        if (!task) return;
        onUpdateCustomFieldDefinitionInProject(task.projectId, defId, updates);
    };

    const getIconForCustomField = (type: CustomFieldType) => {
        switch(type) {
            case 'NUMBER': return <NumberIcon className="w-4 h-4" />;
            case 'PHONE': return <PhoneIcon className="w-4 h-4" />;
            case 'DOCUMENT': return <DocumentTextIcon className="w-4 h-4" />;
            case 'FORM': return <ClipboardListIcon className="w-4 h-4" />;
            case 'TEXT_SHORT':
            default:
                return <TextIcon className="w-4 h-4" />;
        }
    };

    const commonSelectClasses = "w-full text-sm border-none bg-transparent focus:ring-0 p-0 rounded-md focus:bg-gray-200/60 font-medium";
    
    const recurrenceLabels: { [key: string]: string } = {
        'hourly': 'هر ساعت', 'every-2-hours': 'هر ۲ ساعت', 'every-3-hours': 'هر سه ساعت', 'every-6-hours': 'هر شش ساعت', 'daily': 'روزانه',
        'weekly': 'هفتگی', 'bi-weekly': 'دو هفته یکبار', 'monthly': 'ماهانه', 'quarterly': 'فصلی', 'semi-annually': 'هر شش ماه', 'annually': 'سالانه',
    };

    const panelContent = (
        <>
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <div className="flex items-center text-xs text-gray-500">
                    <span>پروژه: {projects.find(p => p.id === task.projectId)?.name}</span>
                </div>
                <div className="flex items-center space-x-1 space-x-reverse">
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
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-grow p-6 overflow-y-auto space-y-6">
                <div className="relative">
                    {isEditingIcon ? (
                        <input
                            ref={iconInputRef}
                            type="text"
                            defaultValue={task.icon}
                            onBlur={(e) => handleIconChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleIconChange(e.target.value);
                                if (e.key === 'Escape') setIsEditingIcon(false);
                            }}
                            className="text-5xl w-20 text-center p-1 bg-gray-100 border-2 border-blue-400 rounded-lg"
                        />
                    ) : (
                            <button
                            onClick={() => setIsEditingIcon(true)}
                            className="text-5xl mb-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {task.icon || '📄'}
                        </button>
                    )}
                    
                </div>

                {/* Task Title */}
                <div>
                        {isEditingContent ? (
                        <textarea
                            ref={contentRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onBlur={handleContentBlur}
                            className="w-full text-2xl font-bold border-none focus:ring-0 resize-none p-0"
                        />
                    ) : (
                        <h2 onClick={() => setIsEditingContent(true)} className="text-2xl font-bold cursor-pointer hover:bg-gray-100/70 p-1 rounded-md">{task.content}</h2>
                    )}
                </div>

                <div className="space-y-1">
                    <TaskPropertyRow icon={<UserIcon className="w-4 h-4" />} label={taskFieldLabels.assigneeId} onLabelChange={newLabel => onUpdateTaskFieldLabel('assigneeId', newLabel)}>
                        <select value={task.assigneeId} onChange={e => handleUpdate({ assigneeId: e.target.value })} className={commonSelectClasses}>
                            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </select>
                    </TaskPropertyRow>
                        <TaskPropertyRow icon={<UserGroupIcon className="w-4 h-4" />} label="تیم">
                        <select value={task.assigneeTeamId} onChange={e => handleUpdate({ assigneeTeamId: e.target.value || undefined })} className={commonSelectClasses}>
                            <option value="">هیچکدام</option>
                            {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                        </TaskPropertyRow>
                    <TaskPropertyRow icon={<TagIcon className="w-4 h-4" />} label={taskFieldLabels.status} onLabelChange={newLabel => onUpdateTaskFieldLabel('status', newLabel)}>
                        <select value={task.status} onChange={e => handleStatusUpdate(e.target.value as TaskWorkflowState)} className={`${commonSelectClasses} ${STATUS_TEXT_COLOR_MAP[task.status]}`}>
                            {WORKFLOW_STATES.map(state => <option key={state} value={state} className={STATUS_TEXT_COLOR_MAP[state]}>{state}</option>)}
                        </select>
                    </TaskPropertyRow>
                    <TaskPropertyRow icon={<CalendarIcon className="w-4 h-4" />} label={taskFieldLabels.startDate} onLabelChange={newLabel => onUpdateTaskFieldLabel('startDate', newLabel)}>
                        <DueDateSelector
                            value={task.startDate || ''}
                            onChange={(date) => handleUpdate({ startDate: date || undefined })}
                        />
                    </TaskPropertyRow>
                    <TaskPropertyRow icon={<CalendarIcon className="w-4 h-4" />} label={taskFieldLabels.dueDate} onLabelChange={newLabel => onUpdateTaskFieldLabel('dueDate', newLabel)}>
                        <DueDateSelector
                            value={task.dueDate || ''}
                            onChange={(date) => handleUpdate({ dueDate: date || undefined })}
                        />
                    </TaskPropertyRow>
                    <TaskPropertyRow icon={<RepeatIcon className="w-4 h-4" />} label={taskFieldLabels.recurrence} onLabelChange={newLabel => onUpdateTaskFieldLabel('recurrence', newLabel)}>
                        <select value={task.recurrence?.frequency || ''} onChange={e => handleUpdate({ recurrence: e.target.value ? { frequency: e.target.value as any } : undefined })} className={commonSelectClasses}>
                            <option value="">بدون تکرار</option>
                            {Object.entries(recurrenceLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </TaskPropertyRow>
                    <TaskPropertyRow icon={<CheckCircleIcon className="w-4 h-4" />} label={taskFieldLabels.progress} onLabelChange={newLabel => onUpdateTaskFieldLabel('progress', newLabel)}>
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="flex-grow"><ProgressBar progress={task.progress || 0} /></div>
                            <input
                                type="number"
                                value={task.progress || 0}
                                onChange={e => handleUpdate({ progress: parseInt(e.target.value, 10) || 0 })}
                                className="w-16 text-center bg-transparent border-none focus:ring-1 focus:ring-blue-300 rounded"
                            />
                            <span>%</span>
                        </div>
                    </TaskPropertyRow>
                    <TaskPropertyRow icon={<NumberIcon className="w-4 h-4" />} label={taskFieldLabels.numericValue} onLabelChange={newLabel => onUpdateTaskFieldLabel('numericValue', newLabel)}>
                        <input
                            type="number"
                            value={task.numericValue ?? ''}
                            onChange={e => handleUpdate({ numericValue: e.target.value ? parseFloat(e.target.value) : undefined })}
                            placeholder="وارد کنید..."
                            className="w-full text-sm border-none bg-transparent focus:ring-0 p-1 rounded-md hover:bg-gray-200 font-medium"
                        />
                    </TaskPropertyRow>
                    {customFieldsWithDefs.map(field => (
                        <div key={field.definitionId} className="group -mr-7 flex items-center">
                            <TaskPropertyRow
                                icon={getIconForCustomField(field.type)}
                                label={field.label}
                                onLabelChange={newLabel => handleUpdateCustomFieldDefinition(field.id, { label: newLabel })}
                            >
                                {field.type === 'DOCUMENT' ? (
                                    <DocumentSelector
                                        documents={documents}
                                        selectedIds={(field.value as string[] | null) || []}
                                        onChange={(ids) => handleUpdateCustomFieldValue(field.definitionId, ids)}
                                        onOpenDocument={onOpenDocument}
                                    />
                                ) : field.type === 'FORM' ? (
                                    <FormSelector
                                        forms={forms}
                                        selectedIds={(field.value as string[] | null) || []}
                                        onChange={(ids) => handleUpdateCustomFieldValue(field.definitionId, ids)}
                                        onOpenForm={onOpenForm}
                                    />
                                ) : (
                                    <input
                                        type={field.type === 'NUMBER' ? 'number' : field.type === 'PHONE' ? 'tel' : 'text'}
                                        value={String(field.value ?? '')}
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            let valueToSave: CustomField['value'] = val;
                                            if (field.type === 'NUMBER' || field.type === 'COST') {
                                                    valueToSave = val ? parseFloat(val) : null;
                                            }
                                            handleUpdateCustomFieldValue(field.definitionId, valueToSave)
                                        }}
                                        onChange={(e) => {
                                                const val = e.target.value;
                                                const updatedFields = (task.customFields || []).map(f =>
                                                f.definitionId === field.definitionId ? { ...f, value: val } : f
                                            );
                                                onUpdateTask({ ...task, customFields: updatedFields });
                                        }}
                                        placeholder="مقدار..."
                                        className="w-full text-sm border-none bg-transparent focus:ring-0 p-1 rounded-md hover:bg-gray-200 font-medium"
                                    />
                                )}
                            </TaskPropertyRow>
                            <button
                                onClick={() => handleRemoveCustomFieldFromTask(field.definitionId)}
                                className="p-1 mr-1 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                title="حذف فیلد از این تسک"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-2">
                    <div className="relative mt-2">
                        <button
                            ref={addFieldButtonRef}
                            onClick={() => setIsAddFieldMenuOpen(p => !p)}
                            className="flex items-center text-sm text-gray-500 hover:text-brand-primary p-1 rounded-md"
                        >
                            <PlusIcon className="w-4 h-4 ml-1" />
                            افزودن فیلد
                        </button>
                        {isAddFieldMenuOpen && (
                            <div ref={addFieldMenuRef} className="absolute top-full right-0 mt-1 w-56 bg-white rounded-md shadow-lg border z-20 py-1">
                                {availableDefsToAdd.length > 0 && (
                                    <>
                                        <div className="px-3 py-1 text-xs text-gray-500">افزودن فیلد موجود</div>
                                        {availableDefsToAdd.map(def => (
                                            <button 
                                                key={def.id} 
                                                onClick={() => handleAddExistingCustomField(def.id)} 
                                                className="w-full text-right flex items-center px-3 py-1.5 text-sm hover:bg-gray-100"
                                            >
                                                <div className="w-4 h-4 ml-2 text-gray-500">{getIconForCustomField(def.type)}</div>
                                                <span className="mr-2">{def.label}</span>
                                            </button>
                                        ))}
                                        <div className="border-t my-1"></div>
                                    </>
                                )}
                                <div className="px-3 py-1 text-xs text-gray-500">ایجاد فیلد جدید</div>
                                <button onClick={() => handleAddCustomField('TEXT_SHORT')} className="w-full text-right flex items-center px-3 py-1.5 text-sm hover:bg-gray-100">
                                    <TextIcon className="w-4 h-4 ml-2 text-gray-500"/>فیلد متنی
                                </button>
                                <button onClick={() => handleAddCustomField('NUMBER')} className="w-full text-right flex items-center px-3 py-1.5 text-sm hover:bg-gray-100">
                                    <NumberIcon className="w-4 h-4 ml-2 text-gray-500"/>فیلد عددی
                                </button>
                                    <button onClick={() => handleAddCustomField('PHONE')} className="w-full text-right flex items-center px-3 py-1.5 text-sm hover:bg-gray-100">
                                    <PhoneIcon className="w-4 h-4 ml-2 text-gray-500"/>شماره موبایل
                                </button>
                                <button onClick={() => handleAddCustomField('DOCUMENT')} className="w-full text-right flex items-center px-3 py-1.5 text-sm hover:bg-gray-100">
                                    <DocumentTextIcon className="w-4 h-4 ml-2 text-gray-500"/>مستندات
                                </button>
                                <button onClick={() => handleAddCustomField('FORM')} className="w-full text-right flex items-center px-3 py-1.5 text-sm hover:bg-gray-100">
                                    <ClipboardListIcon className="w-4 h-4 ml-2 text-gray-500"/>فرم
                                </button>
                            </div>
                        )}
                    </div>
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
                        <input
                            type="text"
                            value={newTagText}
                            onChange={e => setNewTagText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                            placeholder="افزودن تگ..."
                            className="text-sm border-none bg-gray-100 rounded-full px-2 py-1 focus:ring-2 focus:ring-blue-300"
                        />
                        </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-md font-semibold text-brand-text mb-3 flex items-center">
                        <ChecklistIcon className="w-5 h-5 ml-2"/>
                        چک‌لیست
                    </h3>
                    <Checklist items={task.checklist || []} onUpdate={handleChecklistUpdate} onAdd={handleAddChecklistItem} />
                </div>
                
                <div className="border-t pt-4">
                        <h3 className="text-md font-semibold text-brand-text mb-3 flex items-center">
                        <ChatBubbleIcon className="w-5 h-5 ml-2"/>
                        نظرات
                    </h3>
                    <Comments comments={task.comments || []} users={users} currentUser={currentUser} onAdd={handleAddComment} />
                </div>

            </div>
        </>
    );

    const modalContainer = (
        <>
            {panelContent}
            {isPrerequisitesModalOpen && (
              <PrerequisitesModal
                isOpen={isPrerequisitesModalOpen}
                onClose={() => setIsPrerequisitesModalOpen(false)}
                task={task}
                onUpdateTask={onUpdateTask}
                allTasks={tasks}
                allForms={forms}
                allDocuments={documents}
                allProjects={projects}
                allColumns={columns}
                allSubmissions={submissions}
              />
            )}
        </>
    )

    if (displayAs === 'modal') {
        return (
            <div 
                className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
                onClick={onClose}
            >
                <div
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/80 dark:border-slate-700 w-full mx-auto animate-slide-in-up relative max-w-3xl flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                    dir="rtl"
                >
                    {modalContainer}
                </div>
            </div>
        );
    }
    
    // Default 'panel' view
    return (
        <div 
            className="fixed top-[61px] left-0 h-[calc(100%-61px)] w-full max-w-lg bg-white shadow-2xl animate-slide-in-left flex flex-col z-40"
            onClick={e => e.stopPropagation()}
            dir="rtl"
        >
            {modalContainer}
        </div>
    );
};

export default TaskSidePanel;