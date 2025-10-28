import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// FIX: Imported KRType to resolve reference error.
import { KeyResult, KRCategory, FeedbackTag, Objective, Project, Task, User, KRType } from '../types';
import Modal from './Modal';
import StarRating from '../components/StarRating';
import { CheckCircleIcon, XCircleIcon, TrophyIcon, TagIcon, ICONS } from '../components/Icons';

interface ProgressSliderProps {
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
    step?: number;
}

const ProgressSlider: React.FC<ProgressSliderProps> = ({ min, max, value, onChange, step = 1 }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const getPercentage = useCallback((val: number) => {
        if (max === min) return val >= max ? 100 : 0;
        const total = max - min;
        const current = val - min;
        if (total < 0) { // Decreasing metric
            return Math.max(0, Math.min(100, ((min - val) / (min - max)) * 100));
        }
        return Math.max(0, Math.min(100, (current / total) * 100));
    }, [min, max]);

    const getValueFromX = useCallback((clientX: number) => {
        if (!sliderRef.current) return value;
        const rect = sliderRef.current.getBoundingClientRect();
        // In RTL, 0 is on the right, max is on the left
        const percentage = Math.max(0, Math.min(100, ((rect.right - clientX) / rect.width) * 100));
        let newValue: number;
        if (max < min) { // Decreasing
            newValue = min - (percentage / 100) * (min - max);
        } else {
            newValue = min + (percentage / 100) * (max - min);
        }

        if (step >= 1) {
            return Math.round(newValue / step) * step;
        }
        return newValue;
    }, [min, max, value, step]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging.current) {
            onChange(getValueFromX(e.clientX));
        }
    }, [onChange, getValueFromX]);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        isDragging.current = true;
        onChange(getValueFromX(e.clientX));
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [onChange, getValueFromX, handleMouseMove, handleMouseUp]);

    const percentage = getPercentage(value);

    return (
        <div ref={sliderRef} onMouseDown={handleMouseDown} className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative">
            <div className="h-2 bg-teal-500 rounded-full" style={{ width: `${percentage}%` }}></div>
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-teal-500 shadow" style={{ right: `calc(${percentage}% - 8px)` }}></div>
        </div>
    );
};

interface TaskSuggestionMenuProps {
    tasks: Task[];
    users: User[];
    project?: Project;
    onSelect: (task: Task) => void;
    onClose: () => void;
    position: { top: number; left: number };
}

const TaskSuggestionMenu: React.FC<TaskSuggestionMenuProps> = ({ tasks, users, project, onSelect, onClose, position }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={menuRef} style={{ top: position.top, left: position.left }} className="fixed w-72 bg-white rounded-md shadow-lg border z-50 p-2 max-h-60 overflow-y-auto">
            {tasks.length > 0 ? tasks.map(task => {
                const assignee = users.find(u => u.id === task.assigneeId);
                return (
                    <button key={task.id} onClick={() => onSelect(task)} className="w-full flex items-center p-2 text-right rounded-md hover:bg-gray-100">
                        {assignee && <img src={assignee.avatarUrl} alt={assignee.name} className="w-6 h-6 rounded-full ml-2 flex-shrink-0" />}
                        <div className="min-w-0">
                            <p className="text-sm truncate font-medium">{task.content}</p>
                            {project && <p className="text-xs text-gray-500">{project.name}</p>}
                        </div>
                    </button>
                );
            }) : <div className="p-2 text-sm text-center text-gray-500">موردی یافت نشد.</div>}
        </div>
    );
};


interface UpdateKRModalProps {
    isOpen: boolean;
    onClose: () => void;
    kr: KeyResult;
    onSubmit: (krId: string, value: number, rating: number, report: { tasksDone: string; tasksNext: string; challenges: string; }, challengeDifficulty: number, challengeTagIds: string[]) => void;
    challengeTags: FeedbackTag[];
    objectives: Objective[];
    projects: Project[];
    tasks: Task[];
    users: User[];
    onSelectTask: (taskId: string) => void;
}

const UpdateKRModal: React.FC<UpdateKRModalProps> = ({ isOpen, onClose, kr, onSubmit, challengeTags, objectives, projects, tasks, users, onSelectTask }) => {
    const [currentValue, setCurrentValue] = useState(kr.currentValue);
    const [rating, setRating] = useState(3);
    const [challengeDifficulty, setChallengeDifficulty] = useState(3);
    const [selectedChallengeTags, setSelectedChallengeTags] = useState<string[]>([]);
    
    const tasksDoneRef = useRef<HTMLDivElement>(null);
    const tasksNextRef = useRef<HTMLDivElement>(null);
    const challengesRef = useRef<HTMLTextAreaElement>(null);
    
    const [taskMenu, setTaskMenu] = useState<{ field: 'done' | 'next'; filter: string; position: { top: number; left: number }; range: Range } | null>(null);

    const relatedProject = useMemo(() => {
        const objective = objectives.find(o => o.keyResults.some(k => k.id === kr.id));
        if (!objective) return null;
        return projects.find(p => p.objectiveId === objective.id);
    }, [kr.id, objectives, projects]);

    const { doneTasks, nextTasks } = useMemo(() => {
        if (!relatedProject) return { doneTasks: [], nextTasks: [] };
        const projectTasks = tasks.filter(t => t.projectId === relatedProject.id);
        return {
            doneTasks: projectTasks.filter(t => t.status === 'انجام شد'),
            nextTasks: projectTasks.filter(t => t.status !== 'انجام شد'),
        };
    }, [relatedProject, tasks]);

    const filteredTasks = useMemo(() => {
        if (!taskMenu) return [];
        const sourceTasks = taskMenu.field === 'done' ? doneTasks : nextTasks;
        return sourceTasks.filter(t => t.content.toLowerCase().includes(taskMenu.filter.toLowerCase()));
    }, [taskMenu, doneTasks, nextTasks]);


    useEffect(() => {
        setCurrentValue(kr.currentValue);
        setRating(3);
        setChallengeDifficulty(3);
        setSelectedChallengeTags([]);
        if (tasksDoneRef.current) tasksDoneRef.current.innerHTML = '';
        if (tasksNextRef.current) tasksNextRef.current.innerHTML = '';
        if (challengesRef.current) challengesRef.current.value = '';
    }, [kr, isOpen]);

    const handleTagToggle = (tagId: string) => {
        setSelectedChallengeTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const report = {
            tasksDone: tasksDoneRef.current?.innerHTML || '',
            tasksNext: tasksNextRef.current?.innerHTML || '',
            challenges: challengesRef.current?.value || '',
        };
        onSubmit(kr.id, currentValue, rating, report, challengeDifficulty, selectedChallengeTags);
        onClose();
    };
    
    const handleEditorInput = (e: React.FormEvent<HTMLDivElement>, field: 'done' | 'next') => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        
        if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
            const textContent = textNode.textContent;
            const slashIndex = textContent.lastIndexOf('/');
            if (slashIndex !== -1) {
                const query = textContent.substring(slashIndex + 1);
                const rect = range.getBoundingClientRect();

                const menuWidth = 288; // w-72 in TailwindCSS (18rem * 16px/rem)
                
                // For RTL layout, position the menu so its right edge aligns near the cursor.
                // This makes the menu appear to the left of the cursor.
                const left = rect.right - menuWidth;

                setTaskMenu({
                    field,
                    filter: query,
                    position: { 
                        top: rect.bottom, // Use viewport coordinates directly for fixed position
                        left: Math.max(0, left) // Ensure it doesn't go off-screen to the left
                    },
                    range: range.cloneRange()
                });
                return;
            }
        }
        setTaskMenu(null);
    };

    const handleTaskSelect = (task: Task) => {
        if (!taskMenu) return;

        const { range, filter } = taskMenu;
        
        range.setStart(range.startContainer, range.startContainer.textContent!.lastIndexOf('/'));
        range.deleteContents();

        const chip = document.createElement('span');
        chip.contentEditable = "false";
        chip.dataset.taskId = task.id;
        chip.className = "inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 cursor-pointer m-1";
        
        const assignee = users.find(u => u.id === task.assigneeId);
        if (assignee) {
            const img = document.createElement('img');
            img.src = assignee.avatarUrl;
            img.className = "w-4 h-4 rounded-full -ml-1 mr-1.5";
            chip.appendChild(img);
        }
        
        chip.appendChild(document.createTextNode(task.content));
        range.insertNode(chip);

        // Add a space after the chip and move cursor
        const space = document.createTextNode('\u00A0'); // Non-breaking space
        range.insertNode(space);
        range.setStartAfter(space);
        range.collapse(true);

        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }

        setTaskMenu(null);
    };
    
    const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Disabled as per user request. Clicking a task chip will no longer open the side panel.
        
        const target = e.target as HTMLElement;
        const chip = target.closest('[data-task-id]');
        if (chip) {
            const taskId = chip.getAttribute('data-task-id');
            if (taskId) {
                onSelectTask(taskId);
            }
        }
        
    };

    const renderProgressInput = () => {
        switch(kr.category) {
            case KRCategory.Standard:
            case KRCategory.Stretch:
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">مقدار جدید</label>
                        <ProgressSlider 
                            min={kr.startValue || 0} 
                            max={kr.targetValue || 100} 
                            value={currentValue}
                            onChange={setCurrentValue} 
                            step={kr.type === KRType.Number ? 1 : 0.1}
                        />
                        <input
                            type="number"
                            value={currentValue}
                            onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                            className="input-style mt-2 w-full text-center"
                        />
                    </div>
                );
            case KRCategory.Binary:
                return (
                     <div className="flex items-center space-x-4 space-x-reverse">
                        <button type="button" onClick={() => setCurrentValue(0)} className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg text-lg transition-all ${currentValue === 0 ? 'bg-red-50 border-red-500 text-red-800 font-semibold' : 'text-gray-600 border-gray-300 hover:border-red-400'}`}><XCircleIcon className="w-6 h-6 ml-2"/> {kr.binaryLabels?.incomplete || 'انجام نشده'}</button>
                        <button type="button" onClick={() => setCurrentValue(1)} className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg text-lg transition-all ${currentValue === 1 ? 'bg-green-50 border-green-500 text-green-800 font-semibold' : 'text-gray-600 border-gray-300 hover:border-green-400'}`}><CheckCircleIcon className="w-6 h-6 ml-2"/> {kr.binaryLabels?.complete || 'انجام شد'}</button>
                    </div>
                );
            case KRCategory.Assignment:
                 const total = (kr.assignedTaskIds?.length || 0) + (kr.assignedFormIds?.length || 0);
                 return (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">تعداد موارد تکمیل شده</label>
                         <ProgressSlider 
                            min={0} 
                            max={total} 
                            value={currentValue}
                            onChange={setCurrentValue} 
                            step={1}
                        />
                        <input
                            type="number"
                            value={currentValue}
                            onChange={(e) => setCurrentValue(parseInt(e.target.value) || 0)}
                            max={total}
                            min={0}
                            className="input-style mt-2 w-full text-center"
                        />
                    </div>
                 );
            default: return null;
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`بروزرسانی: ${kr.title}`} size="2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                {renderProgressInput()}

                <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700">وضعیت پیشرفت</label>
                    <StarRating rating={rating} setRating={setRating} />
                </div>
                
                <div className="border-t pt-6 space-y-4">
                    <div>
                        <label htmlFor="tasks-done" className="block text-sm font-medium text-gray-700 mb-1">کارهایی که این هفته انجام شده است</label>
                        <div
                            ref={tasksDoneRef}
                            id="tasks-done"
                            contentEditable
                            onInput={(e) => handleEditorInput(e, 'done')}
                            onClick={handleEditorClick}
                            className="input-style min-h-[80px] whitespace-pre-wrap"
                        />
                    </div>
                    <div>
                        <label htmlFor="tasks-next" className="block text-sm font-medium text-gray-700 mb-1">کارهایی که برای هفته بعد برنامه‌ریزی شده</label>
                        <div
                            ref={tasksNextRef}
                            id="tasks-next"
                            contentEditable
                            onInput={(e) => handleEditorInput(e, 'next')}
                            onClick={handleEditorClick}
                            className="input-style min-h-[80px] whitespace-pre-wrap"
                        />
                    </div>
                    <div>
                        <label htmlFor="challenges" className="block text-sm font-medium text-gray-700 mb-1">چالش‌ها و موانع</label>
                        <textarea ref={challengesRef} id="challenges" rows={3} className="input-style" />
                    </div>
                </div>

                <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700">میزان سختی چالش‌ها</label>
                    <StarRating rating={challengeDifficulty} setRating={setChallengeDifficulty} />
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">برچسب چالش</label>
                    <div className="flex flex-wrap gap-2">
                        {challengeTags.map(tag => {
                            const Icon = ICONS[tag.icon];
                            const isSelected = selectedChallengeTags.includes(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleTagToggle(tag.id)}
                                    className={`flex items-center px-3 py-1.5 border rounded-full text-sm font-medium transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 hover:border-gray-400'}`}
                                >
                                    <Icon className="w-4 h-4 ml-2" style={{ color: isSelected ? '#fff' : tag.color }} />
                                    {tag.name}
                                </button>
                            );
                        })}
                    </div>
                 </div>

                <div className="flex justify-end pt-6 border-t">
                    <button type="submit" className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg">ثبت بروزرسانی</button>
                </div>
            </form>
            {taskMenu && (
                <TaskSuggestionMenu
                    tasks={filteredTasks}
                    users={users}
                    project={relatedProject || undefined}
                    onSelect={handleTaskSelect}
                    onClose={() => setTaskMenu(null)}
                    position={taskMenu.position}
                />
            )}
        </Modal>
    );
};

export default UpdateKRModal;
