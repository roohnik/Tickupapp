import React, { useState, useRef, useEffect } from 'react';
import { Task, Project, User, KanbanColumn, Form, FormSubmission } from '../types';
import { PlusIcon, ThreeDotsIcon, CloseIcon, ICONS } from './Icons';
import TaskCard from './TaskCard';
import FormCard from './FormCard';
import { KANBAN_COLOR_MAP, KANBAN_COLOR_OPTIONS } from '../constants';

const IconPickerPopover: React.FC<{
    onSelect: (iconName: string) => void;
    onClose: () => void;
    anchorEl: HTMLElement;
}> = ({ onSelect, onClose, anchorEl }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node) && !anchorEl.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, anchorEl]);

    const iconList = ['ListBulletIcon', 'ClockIcon', 'EyeIcon', 'CheckCircleIcon', 'SparklesIcon', 'FolderIcon', 'UserIcon', 'RocketIcon', 'StarIcon', 'LightbulbIcon', 'CalendarIcon', 'TagIcon', 'CubeIcon', 'BanknotesIcon', 'ChartIcon'];

    const rect = anchorEl.getBoundingClientRect();
    const style: React.CSSProperties = {
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        zIndex: 20
    };

    return (
        <div ref={ref} style={style} className="bg-white rounded-md shadow-lg p-2 border w-64">
            <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
                {iconList.map(iconName => {
                    const Icon = ICONS[iconName];
                    return (
                        <button key={iconName} onClick={() => onSelect(iconName)} className="p-2 rounded-md hover:bg-gray-100 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-gray-600" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const MenuPopover: React.FC<{
    onColorSelect: (color: string) => void;
    onIconChange: () => void;
    onClose: () => void;
}> = ({ onColorSelect, onIconChange, onClose }) => {
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
            <button onClick={onIconChange} className="w-full text-right px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">
                تغییر آیکون
            </button>
            <div className="border-t my-1"></div>
            <div className="px-3 text-xs text-gray-500 mb-2">رنگ</div>
            <div className="px-3 grid grid-cols-6 gap-1">
                {KANBAN_COLOR_OPTIONS.map(color => (
                    <button
                        key={color}
                        onClick={() => onColorSelect(color)}
                        className={`w-5 h-5 rounded-full ${KANBAN_COLOR_MAP[color].dot} border-2 border-white hover:ring-2 hover:ring-blue-400`}
                        aria-label={color}
                    />
                ))}
            </div>
        </div>
    );
};

interface KanbanColumnComponentProps {
  column: KanbanColumn;
  tasks: Task[];
  projects: Project[];
  users: User[];
  onTaskColumnChange: (taskId: string, newColumnId: string) => void;
  onSelectTask: (taskId: string) => void;
  onAddTask: (columnId: string) => void;
  onUpdateTask: (task: Task) => void;
  onUpdateColumnTitle: (columnId: string, newTitle: string) => void;
  onUpdateColumnColor: (columnId: string, color: string) => void;
  onUpdateColumnIcon: (columnId: string, icon: string) => void;
  onQuickAddTask: (content: string, columnId: string) => void;
  onColumnClick: (columnId: string) => void;
  forms: Form[];
  onFormColumnChange: (formId: string, newColumnId: string) => void;
  onOpenForm: (formId: string) => void;
  onEditForm: (formId: string) => void;
  onTogglePinForm: (formId: string) => void;
  onMoveRequest: (formId: string) => void;
  currentUser: User;
  submissions: FormSubmission[];
}

const KanbanColumnComponent: React.FC<KanbanColumnComponentProps> = ({ column, tasks, projects, users, onTaskColumnChange, onSelectTask, onAddTask, onUpdateTask, onUpdateColumnTitle, onUpdateColumnColor, onUpdateColumnIcon, onQuickAddTask, onColumnClick, forms, onFormColumnChange, onOpenForm, onEditForm, onTogglePinForm, onMoveRequest, currentUser, submissions }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskContent, setNewTaskContent] = useState('');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);


    const colorScheme = KANBAN_COLOR_MAP[column.color || 'gray'] || KANBAN_COLOR_MAP.gray;

    useEffect(() => {
        if (isAddingTask) {
            textareaRef.current?.focus();
        }
    }, [isAddingTask]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
        e.dataTransfer.setData('text/plain', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleFormDragStart = (e: React.DragEvent<HTMLDivElement>, formId: string) => {
        e.dataTransfer.setData('text/plain', formId);
        e.dataTransfer.setData('type', 'form');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const type = e.dataTransfer.getData('type');
        if (type === 'form') {
            const formId = e.dataTransfer.getData('text/plain');
            if (formId) {
                onFormColumnChange(formId, column.id);
            }
        } else { // It's a task
            const taskId = e.dataTransfer.getData('text/plain');
            if (taskId) {
                onTaskColumnChange(taskId, column.id);
            }
        }
    };
    
    const handleColorSelect = (color: string) => {
        onUpdateColumnColor(column.id, color);
        setIsMenuOpen(false);
    }
    
    const handleIconSelect = (iconName: string) => {
        onUpdateColumnIcon(column.id, iconName);
        setIsIconPickerOpen(false);
    };

    const handleQuickAdd = () => {
        if (newTaskContent.trim()) {
            onQuickAddTask(newTaskContent.trim(), column.id);
            setNewTaskContent('');
            setIsAddingTask(false);
        }
    };

    return (
        <div className={`rounded-lg p-2 pt-1 flex flex-col flex-shrink-0 w-[calc(100vw-3rem)] sm:w-72 md:w-80 ${colorScheme.bg}`}>
            <div className="flex items-center justify-between font-semibold mb-3 px-2 py-1">
                <button
                    onClick={() => onColumnClick(column.id)}
                    className="flex items-center flex-grow min-w-0 text-right p-1 -m-1 rounded-md hover:bg-gray-500/10"
                >
                    <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${colorScheme.dot}`}></span>
                    <>
                        <h3 className={`text-sm font-semibold truncate ${colorScheme.text}`}>{column.title}</h3>
                        <span className="text-sm text-gray-400 font-normal mr-2">({tasks.length + forms.length})</span>
                    </>
                </button>
                <div className="relative">
                    <button ref={menuButtonRef} onClick={() => setIsMenuOpen(p => !p)} className="p-1 text-gray-400 hover:text-gray-700 rounded-md">
                        <ThreeDotsIcon className="w-4 h-4" />
                    </button>
                    {isMenuOpen && <MenuPopover 
                        onColorSelect={handleColorSelect} 
                        onIconChange={() => { setIsIconPickerOpen(true); setIsMenuOpen(false); }}
                        onClose={() => setIsMenuOpen(false)} 
                    />}
                     {isIconPickerOpen && menuButtonRef.current && (
                        <IconPickerPopover 
                            anchorEl={menuButtonRef.current} 
                            onSelect={handleIconSelect} 
                            onClose={() => setIsIconPickerOpen(false)} 
                        />
                    )}
                </div>
            </div>
            <div 
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragOver(true)}
                onDragLeave={() => setIsDragOver(false)}
                className={`space-y-2 h-full overflow-y-auto p-1 rounded-md transition-colors ${isDragOver ? 'bg-blue-100/50' : ''}`}
            >
                {tasks.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        project={projects.find(p => p.id === task.projectId)}
                        assignee={users.find(u => u.id === task.assigneeId)}
                        onDragStart={handleDragStart}
                        onUpdateTask={onUpdateTask}
                        onSelectTask={onSelectTask}
                    />
                ))}
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
                            draggable={true}
                            onDragStart={handleFormDragStart}
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

export default KanbanColumnComponent;