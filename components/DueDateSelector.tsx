import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from './Icons';
import { toPersianDate } from '../utils/dateUtils';

interface DueDateSelectorProps {
    value: string; // ISO string
    onChange: (date: string) => void;
}

const getLocalDateAsUTCISO = (date: Date): string => {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
};

const DueDateSelector: React.FC<DueDateSelectorProps> = ({ value, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isEditing && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsEditing(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditing]);
    
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);


    const handleSetToday = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(getLocalDateAsUTCISO(new Date()));
        setIsEditing(false);
    };

    const handleSetTomorrow = (e: React.MouseEvent) => {
        e.stopPropagation();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        onChange(getLocalDateAsUTCISO(tomorrow));
        setIsEditing(false);
    };

    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        if (dateValue) {
            const [year, month, day] = dateValue.split('-').map(Number);
            const newDate = new Date(Date.UTC(year, month - 1, day));
            onChange(newDate.toISOString());
        } else {
            onChange('');
        }
    };
    
    const handleClearDate = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setIsEditing(false);
    };

    const inputValueForPicker = value ? new Date(value).toISOString().substring(0, 10) : '';

    return (
        <div ref={containerRef} className="flex items-center space-x-2 space-x-reverse w-full group">
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="date"
                    value={inputValueForPicker}
                    onChange={handleDateInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                            setIsEditing(false);
                            (e.target as HTMLInputElement).blur();
                        }
                    }}
                    className="w-full text-sm font-medium p-0 border-none bg-transparent focus:ring-0"
                />
            ) : (
                <div onClick={() => setIsEditing(true)} className="w-full cursor-pointer p-0">
                    <span className="text-sm font-medium">
                        {value ? toPersianDate(value) : <span className="text-gray-400">بدون تاریخ</span>}
                    </span>
                </div>
            )}
           
            <div className={`flex items-center space-x-1 space-x-reverse flex-shrink-0 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button type="button" onClick={handleSetToday} title="امروز" className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded">امروز</button>
                <button type="button" onClick={handleSetTomorrow} title="فردا" className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded">فردا</button>
                {value && (
                    <button type="button" onClick={handleClearDate} className="p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200" aria-label="حذف تاریخ">
                        <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default DueDateSelector;
