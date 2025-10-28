import React, { useState, useRef, useEffect } from 'react';
import { Form, User } from '../types';
import { ChecklistIcon, CalendarIcon, RepeatIcon, EditIcon, BookmarkIconSolid, BookmarkIconOutline, PencilIcon, ThreeDotsIcon, ArrowRightIcon } from './Icons';
import { toPersianDate } from '../utils/dateUtils';

const DueDateBadge: React.FC<{ dueDate: string }> = ({ dueDate }) => {
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = date < today;
    const isToday = date.toDateString() === today.toDateString();

    const color = isPast ? 'bg-red-100 text-red-700' : isToday ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700';

    return (
        <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${color}`}>
            <CalendarIcon className="w-4 h-4 ml-1" />
            {toPersianDate(dueDate)}
        </span>
    );
};


const FormCard: React.FC<{ 
    form: Form; 
    onOpen: () => void;
    onEdit: (formId: string) => void;
    onTogglePin: (formId: string) => void;
    currentUser: User;
    hasDraft?: boolean;
    onMoveRequest?: (formId: string) => void;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>, formId: string) => void;
}> = ({ form, onOpen, onEdit, onTogglePin, currentUser, hasDraft, onMoveRequest, draggable, onDragStart }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isMenuOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                menuButtonRef.current &&
                !menuButtonRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);


    const recurrenceLabels: { [key: string]: string } = {
        'hourly': 'هر ساعت',
        'every-2-hours': 'هر دو ساعت',
        'every-3-hours': 'هر سه ساعت',
        'every-6-hours': 'هر شش ساعت',
        'daily': 'روزانه',
        'weekly': 'هفتگی',
        'bi-weekly': 'هر دو هفته',
        'monthly': 'ماهانه',
        'quarterly': 'هر سه ماه',
        'semi-annually': 'هر شش ماه',
        'annually': 'سالانه',
    };

    const canEdit = currentUser.role === 'admin' || form.creatorId === currentUser.id;

    return (
        <div 
            onClick={onOpen}
            draggable={draggable}
            onDragStart={e => onDragStart?.(e, form.id)}
            className="bg-white p-3 rounded-lg border border-gray-200/80 shadow-sm cursor-pointer hover:border-gray-300 hover:shadow-md transition-all duration-200 group relative"
        >
          <p className="text-sm font-medium text-brand-text mb-2 pr-4">{form.title}</p>
          
          <div className="absolute top-2 left-2">
            {canEdit && (
                <div className="relative">
                    <button ref={menuButtonRef} onClick={(e) => { e.stopPropagation(); setIsMenuOpen(p => !p); }} className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-600">
                        <ThreeDotsIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                    </button>
                    {isMenuOpen && (
                        <div ref={menuRef} className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-800 shadow-lg rounded-md border dark:border-slate-700 z-10 py-1">
                            {onMoveRequest && (
                                <button onClick={(e) => { e.stopPropagation(); onMoveRequest(form.id); setIsMenuOpen(false); }} className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center">
                                    <ArrowRightIcon className="w-4 h-4 ml-2 text-gray-500 dark:text-slate-400"/> انتقال به برد
                                </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); onEdit(form.id); setIsMenuOpen(false); }} className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center">
                                <EditIcon className="w-4 h-4 ml-2 text-gray-500 dark:text-slate-400"/> ویرایش فرم
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onTogglePin(form.id); setIsMenuOpen(false); }} className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center">
                                {form.isPinned ? <BookmarkIconSolid className="w-4 h-4 ml-2 text-yellow-500"/> : <BookmarkIconOutline className="w-4 h-4 ml-2 text-gray-500 dark:text-slate-400"/>}
                                {form.isPinned ? 'برداشتن پین' : 'پین کردن'}
                            </button>
                        </div>
                    )}
                </div>
            )}
            </div>


          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-2 space-x-reverse">
              {hasDraft && (
                  <span className="flex items-center text-orange-500" title="پیش‌نویس ذخیره شده">
                      <PencilIcon className="w-4 h-4" />
                  </span>
              )}
              <span className="flex items-center text-xs text-gray-500" title={`${form.fields.length} فیلد`}>
                <ChecklistIcon className="w-4 h-4 ml-1"/>
                {form.fields.length}
              </span>
              {form.recurrence && (
                  <span className="text-gray-500" title={`تکرار ${recurrenceLabels[form.recurrence.frequency] || ''}`}>
                      <RepeatIcon className="w-4 h-4" />
                  </span>
              )}
            </div>
             {form.dueDate && <DueDateBadge dueDate={form.dueDate} />}
          </div>
        </div>
    );
};

export default FormCard;