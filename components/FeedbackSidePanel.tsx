import React from 'react';
import { GeneralFeedback, User, Task, Form } from '../types';
import { CloseIcon, ICONS } from './Icons';
import { toPersianDate } from '../utils/dateUtils';
import { FEEDBACK_CATEGORY_DETAILS } from '../constants';

interface FeedbackSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    feedback: GeneralFeedback | null;
    giver: User | undefined;
    receiver: User | undefined;
    tasks: Task[];
    forms: Form[];
    onSelectTask: (taskId: string) => void;
    onOpenForm: (formId: string) => void;
}

const FeedbackSidePanel: React.FC<FeedbackSidePanelProps> = ({ isOpen, onClose, feedback, giver, receiver, tasks, forms, onSelectTask, onOpenForm }) => {
    if (!isOpen || !feedback) return null;

    const categoryDetails = FEEDBACK_CATEGORY_DETAILS[feedback.category];
    const attachedTasks = (feedback.attachedTaskIds || []).map(id => tasks.find(t => t.id === id)).filter((t): t is Task => !!t);
    const attachedForms = (feedback.attachedFormIds || []).map(id => forms.find(f => f.id === id)).filter((f): f is Form => !!f);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 animate-fade-in" onClick={onClose}>
            <div 
                className="absolute top-0 left-0 h-full w-full max-w-lg bg-white shadow-2xl animate-slide-in-left flex flex-col"
                onClick={e => e.stopPropagation()}
                dir="rtl"
            >
                <div className="p-4 border-b flex justify-between items-center bg-gray-50/70 flex-shrink-0">
                    <div className="flex items-center">
                        <categoryDetails.Icon className="w-6 h-6 ml-3" style={{ color: categoryDetails.color }} />
                        <h2 className="text-lg font-bold text-brand-text">جزئیات بازخورد</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b">
                        <div className="flex items-center" title={`از: ${giver?.name}`}>
                            <img src={giver?.avatarUrl} className="w-10 h-10 rounded-full" />
                            <div className="mr-3">
                                <p className="font-semibold">{giver?.name}</p>
                                <p className="text-xs text-gray-500">ارسال کننده</p>
                            </div>
                        </div>
                        <ICONS.ArrowLeftIcon className="w-6 h-6 text-gray-400" />
                        <div className="flex items-center" title={`به: ${receiver?.name}`}>
                            <img src={receiver?.avatarUrl} className="w-10 h-10 rounded-full" />
                             <div className="mr-3">
                                <p className="font-semibold">{receiver?.name}</p>
                                <p className="text-xs text-gray-500">دریافت کننده</p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-sm text-gray-500 mb-1">تاریخ: {toPersianDate(feedback.createdAt)}</p>
                        <p className="text-sm text-gray-500 mb-1">دسته: {categoryDetails.label}</p>
                    </div>

                    <div className="p-4 bg-gray-100/70 rounded-lg">
                        <h4 className="font-semibold text-brand-text mb-2">متن بازخورد</h4>
                        <p className="text-brand-text whitespace-pre-wrap">"{feedback.comment}"</p>
                    </div>

                    {(attachedTasks.length > 0 || attachedForms.length > 0) && (
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-brand-text mb-3">پیوست‌ها</h4>
                            <div className="space-y-2">
                                {attachedTasks.map(task => (
                                    <button onClick={() => onSelectTask(task.id)} key={task.id} className="w-full text-right flex items-center bg-gray-200/80 dark:bg-slate-700 px-3 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                                        <ICONS.ClipboardListIcon className="w-5 h-5 ml-2 flex-shrink-0" />
                                        <span className="truncate">{task.content}</span>
                                    </button>
                                ))}
                                {attachedForms.map(form => (
                                    <button onClick={() => onOpenForm(form.id)} key={form.id} className="w-full text-right flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-2 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                                        <ICONS.DocumentTextIcon className="w-5 h-5 ml-2 flex-shrink-0" />
                                        <span className="truncate">{form.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackSidePanel;
