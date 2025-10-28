import React, { useState, useEffect, useRef } from 'react';
import { Task, User, KanbanColumn, WORKFLOW_STATES, CustomField, MonitoringData, CustomFieldDefinition } from '../types';
import { STATUS_TEXT_COLOR_MAP } from '../constants';

interface EditableCellProps {
    task: Task;
    colKey: string;
    users: User[];
    onSave: (newValue: any) => void;
    onCancel: () => void;
    customFieldDefinitions: CustomFieldDefinition[];
}

const EditableCell: React.FC<EditableCellProps> = ({ task, colKey, users, onSave, onCancel, customFieldDefinitions }) => {
    const inputRef = useRef<HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        if (inputRef.current?.select) {
          inputRef.current.select();
        }
    }, []);

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
        onSave((e.target as any).value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLElement).blur();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };
    
    const commonProps = {
        ref: inputRef as any,
        onBlur: handleBlur,
        onKeyDown: handleKeyDown,
        className: "w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary p-1"
    };

    if (colKey === 'assigneeId') {
        return (
            <select {...commonProps} defaultValue={task.assigneeId}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
        );
    }
     if (colKey === 'status') {
        return (
            <select {...commonProps} defaultValue={task.status}>
                {WORKFLOW_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        );
    }
    if (colKey === 'startDate' || colKey === 'dueDate') {
        const value = colKey === 'startDate' ? task.startDate : task.dueDate;
        return (
            <input
                {...commonProps}
                type="date"
                defaultValue={value ? new Date(value).toISOString().substring(0, 10) : ''}
            />
        );
    }

    if (colKey === 'recurrence') {
        const recurrenceLabels: { [key: string]: string } = {
            '': 'بدون تکرار',
            'hourly': 'هر ساعت', 'every-2-hours': 'هر ۲ ساعت', 'every-3-hours': 'هر سه ساعت', 'every-6-hours': 'هر شش ساعت', 'daily': 'روزانه',
            'weekly': 'هفتگی', 'bi-weekly': 'دو هفته یکبار', 'monthly': 'ماهانه', 'quarterly': 'فصلی', 'semi-annually': 'هر شش ماه', 'annually': 'سالانه',
        };
        return (
            <select {...commonProps} defaultValue={task.recurrence?.frequency || ''}>
                {Object.entries(recurrenceLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
        );
    }

    if (colKey === 'progress') {
        return <input {...commonProps} type="number" min="0" max="100" defaultValue={task.progress || 0} />;
    }
    if (colKey === 'numericValue') {
        return <input {...commonProps} type="number" defaultValue={task.numericValue ?? ''} />;
    }
     if (colKey.startsWith('monitoring_')) {
        const monitoringKey = colKey.replace('monitoring_', '') as keyof MonitoringData;
        const value = task.monitoring?.[monitoringKey];
        
        if (monitoringKey === 'responsiblePersonId') {
            return (
                 <select {...commonProps} defaultValue={value as string || ''}>
                    <option value="">هیچکدام</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            );
        }
        if (monitoringKey === 'category') {
             return (
                 <select {...commonProps} defaultValue={value as string || ''}>
                    <option value="">انتخاب کنید...</option>
                    <option value="دسته اول">دسته اول</option>
                    <option value="دسته دو">دسته دو</option>
                    <option value="دسته سوم">دسته سوم</option>
                </select>
            );
        }
        // temperature, cost, pieceCount
        return <input {...commonProps} type="number" defaultValue={value as number || 0} />;
    }

    const customFieldDef = customFieldDefinitions.find(def => def.id === colKey);
    if (customFieldDef) {
        const customField = task.customFields?.find(cf => cf.definitionId === colKey);
        const value = customField?.value;

        if (customFieldDef.type === 'NUMBER' || customFieldDef.type === 'COST') {
            return <input {...commonProps} type="number" defaultValue={value as number || ''} />;
        }
        // Includes TEXT_SHORT, PHONE, etc.
        return <input {...commonProps} type="text" defaultValue={value as string || ''} />;
    }


    return null; // Should not happen
};

export default EditableCell;