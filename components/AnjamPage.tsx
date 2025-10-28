import React, { useState, useRef, useEffect, useMemo } from 'react';
// FIX: Added Objective to the import list to resolve type error.
import { Task, Project, User, Form, KeyResult, Objective, FormSubmission } from '../types';
import TaskCard from './TaskCard';
import FormCard from './FormCard';
import { KANBAN_COLOR_MAP, KANBAN_COLOR_OPTIONS } from '../constants';
import { ThreeDotsIcon, PlusIcon, CloseIcon } from './Icons';

interface AnjamPageProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  forms: Form[];
  currentUser: User;
  onSelectTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onUpdateProject: (project: Project) => void;
  onQuickAddTask: (content: string, projectId: string) => void;
  onOpenForm: (formId: string) => void;
  onEditForm: (formId: string) => void;
  onTogglePinForm: (formId: string) => void;
  objectives: Objective[];
  onUpdateKeyResultDetails: (objectiveId: string, krId: string, updates: Partial<KeyResult>) => void;
  submissions: FormSubmission[];
}

interface FormColumnProps {
    forms: Form[];
    currentUser: User;
    onOpenForm: (formId: string) => void;
    onEditForm: (formId: string) => void;
    onTogglePinForm: (formId: string) => void;
    submissions: FormSubmission[];
}

const MenuPopover: React.FC<{
    onColorSelect: (color: string) => void;
    onClose: () => void;
}> = ({ onColorSelect, onClose }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={ref} className="absolute top-8 left-0 bg-white rounded-md shadow-lg py-2 z-10 border border-gray-200 w-40">
            <div className="px-3 text-xs text-gray-500 mb-2">رنگ ستون</div>
            <div className="px-3 grid grid-cols-6 gap-1">
                {KANBAN_COLOR_OPTIONS.map(color => (
                    <button
                        key={color}
                        onClick={() => onColorSelect(color)}
                        className={`w-5 h-5 rounded-full ${KANBAN_COLOR_MAP[color].dot} border-2 border-white hover:ring-2 hover:ring-blue-400`}
// FIX: Changed String(color) to color to avoid potential 'callable expression' errors in strict environments and for better practice.
                        aria-label={color}
                    />
                ))}
            </div>
        </div>
    );
};

interface ProjectColumnProps {
  project: Project;
  tasks: Task[];
  users: User[];
  onSelectTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onUpdateProject: (project: Project) => void;
  onQuickAddTask: (content: string, projectId: string) => void;
}

const ProjectColumn: React.FC<ProjectColumnProps> = ({ project, tasks, users, onSelectTask, onUpdateTask, onUpdateProject, onQuickAddTask }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskContent, setNewTaskContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const colorScheme = KANBAN_COLOR_MAP[project.color || 'gray'] || KANBAN_COLOR_MAP.gray;

    useEffect(() => {
        if (isAddingTask) {
            textareaRef.current?.focus();
        }
    }, [isAddingTask]);

    const handleColorSelect = (color: string) => {
        onUpdateProject({ ...project, color });
        setIsMenuOpen(false);
    }
    
    const handleQuickAdd = () => {
        if (newTaskContent.trim()) {
            onQuickAddTask(newTaskContent.trim(), project.id);
            setNewTaskContent('');
            setIsAddingTask(false);
        }
    };

    return (
        <div className={`rounded-lg p-2 pt-1 flex flex-col flex-shrink-0 w-[calc(100vw-3rem)] sm:w-80 lg:w-96 ${colorScheme.bg}`}>
            <div className="flex items-center justify-between font-semibold mb-3 px-2 py-1">
                <div className="flex items-center min-w-0">
                    <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${colorScheme.dot}`}></span>
                    <h3 className={`text-sm font-semibold truncate ${colorScheme.text}`}>{project.name}</h3>
                    <span className="text-sm text-gray-400 font-normal mr-2">({tasks.length})</span>
                </div>
                 <div className="relative">
                    <button onClick={() => setIsMenuOpen(p => !p)} className="p-1 text-gray-400 hover:text-gray-700 rounded-md">
                        <ThreeDotsIcon className="w-4 h-4" />
                    </button>
                    {isMenuOpen && <MenuPopover 
                        onColorSelect={handleColorSelect} 
                        onClose={() => setIsMenuOpen(false)} 
                    />}
                </div>
            </div>
            <div className="space-y-2 flex-grow h-[calc(100vh-20rem)] overflow-y-auto p-1">
                {tasks.map(task => {
                    if (task.dailyTargetKrId) {
                        // In the future, we can render a specific card for daily targets here
                        // For now, it will render as a normal task card.
                    }
                    return (
                        <TaskCard
                            key={task.id}
                            task={task}
                            assignee={users.find(u => u.id === task.assigneeId)}
                            onUpdateTask={onUpdateTask}
                            onSelectTask={onSelectTask}
                        />
                    );
                 })}
            </div>
             {isAddingTask ? (
                <div className="mt-2 p-1">
                    <div className="bg-white rounded-lg shadow-md">
                        <textarea
                            ref={textareaRef}
                            value={newTaskContent}
                            onChange={e => setNewTaskContent(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleQuickAdd();
                                }
                                if (e.key === 'Escape') {
                                    setIsAddingTask(false);
                                    setNewTaskContent('');
                                }
                            }}
                            placeholder="عنوان تسک..."
                            className="w-full p-2 border-none rounded-lg focus:ring-2 focus:ring-brand-primary text-sm resize-none"
                            rows={3}
                        />
                    </div>
                    <div className="mt-2 space-x-2 space-x-reverse">
                        <button onClick={handleQuickAdd} className="px-3 py-1 bg-brand-primary text-white rounded-md text-sm font-semibold">افزودن کارت</button>
                        <button onClick={() => setIsAddingTask(false)} className="p-1 text-gray-500 hover:text-gray-800">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsAddingTask(true)} className={`w-full mt-2 p-2 text-sm font-semibold rounded-md flex items-center justify-center transition-colors ${colorScheme.text} ${colorScheme.hover}`}>
                    <PlusIcon className="w-4 h-4 ml-2" /> افزودن تسک
                </button>
            )}
        </div>
    );
};

const FormColumn: React.FC<FormColumnProps> = ({ forms, currentUser, onOpenForm, onEditForm, onTogglePinForm, submissions }) => {
    const colorScheme = KANBAN_COLOR_MAP['yellow'] || KANBAN_COLOR_MAP.gray;

    return (
        <div className={`rounded-lg p-2 pt-1 flex flex-col flex-shrink-0 w-[calc(100vw-3rem)] sm:w-80 lg:w-96 ${colorScheme.bg}`}>
            <div className="flex items-center justify-between font-semibold mb-3 px-2 py-1">
                <div className="flex items-center min-w-0">
                    <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${colorScheme.dot}`}></span>
                    <h3 className={`text-sm font-semibold truncate ${colorScheme.text}`}>فرم</h3>
                    <span className="text-sm text-gray-400 font-normal mr-2">({forms.length})</span>
                </div>
            </div>
            <div className="space-y-2 flex-grow h-[calc(100vh-18rem)] overflow-y-auto p-1">
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
                        />
                    );
                })}
            </div>
        </div>
    );
};

const AnjamPage: React.FC<AnjamPageProps> = ({ tasks, projects, users, forms, currentUser, onSelectTask, onUpdateTask, onUpdateProject, onQuickAddTask, onOpenForm, onEditForm, onTogglePinForm, objectives, onUpdateKeyResultDetails, submissions }) => {
    
    const todayString = new Date().toDateString();

    const todaysTasks = useMemo(() => {
        return tasks.filter(task => 
            task.dueDate && new Date(task.dueDate).toDateString() === todayString
        );
    }, [tasks, todayString]);
    
    const todaysForms = useMemo(() => {
        return forms.filter(form =>
            (form.dueDate && new Date(form.dueDate).toDateString() === todayString) || form.isPinned
        );
    }, [forms, todayString]);

    const projectsWithTodaysTasks = useMemo(() => {
        return projects.filter(project => 
            todaysTasks.some(task => task.projectId === project.id)
        );
    }, [projects, todaysTasks]);

    return (
        <div className="flex space-x-4 space-x-reverse overflow-x-auto pb-4">
            {todaysForms.length > 0 && (
                <FormColumn 
                    forms={todaysForms} 
                    currentUser={currentUser} 
                    onOpenForm={onOpenForm}
                    onEditForm={onEditForm}
                    onTogglePinForm={onTogglePinForm}
                    submissions={submissions}
                />
            )}
            
            {projectsWithTodaysTasks.map(project => {
                const tasksForProject = todaysTasks.filter(task => task.projectId === project.id);
                return (
                    <ProjectColumn
                        key={project.id}
                        project={project}
                        tasks={tasksForProject}
                        users={users}
                        onSelectTask={onSelectTask}
                        onUpdateTask={onUpdateTask}
                        onUpdateProject={onUpdateProject}
                        onQuickAddTask={onQuickAddTask}
                    />
                );
            })}
            {todaysTasks.length === 0 && todaysForms.length === 0 && (
                <div className="w-full text-center py-10">
                    <p className="text-brand-subtext">هیچ تسک یا فرمی برای امروز تعریف نشده است.</p>
                </div>
            )}
        </div>
    );
};

export default AnjamPage;