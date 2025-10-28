import React from 'react';
import { KanbanColumn, Task, Form } from '../types';
import { CheckCircleIcon, CubeIcon, ICONS } from './Icons';

const StartCircle: React.FC = () => (
    <div className="flex-shrink-0 flex flex-col items-center w-28">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" transform="rotate(180 10 10)"></path></svg>
        </div>
        <div className="text-sm font-semibold mt-2 text-gray-600">شروع</div>
    </div>
);

const EndCircle: React.FC = () => (
    <div className="flex-shrink-0 flex flex-col items-center w-28">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
        </div>
        <div className="text-sm font-semibold mt-2 text-green-700">پایان</div>
    </div>
);

const Arrow: React.FC = () => (
    <div className="flex-shrink-0 w-8 h-px bg-gray-300 hidden md:block"></div>
);

const VerticalArrow: React.FC = () => (
    <div className="h-8 w-px bg-gray-300 my-2 self-center md:hidden"></div>
);

const ProgressCircle: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const completed = tasks.filter(t => t.status === 'انجام شد').length;
    const total = tasks.length;
    if (total === 0) {
        return (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                -
            </div>
        );
    }
    const percentage = (completed / total) * 100;

    if (percentage === 100) {
        return (
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
            </div>
        );
    }
    
    return (
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-600 bg-blue-50 flex-shrink-0">
            {Math.round(percentage)}%
        </div>
    );
};

interface ProcessStepCardProps {
    column: KanbanColumn;
    tasks: Task[];
    forms: Form[];
    onClick: () => void;
    isSelected: boolean;
}

const ProcessStepCard: React.FC<ProcessStepCardProps> = ({ column, tasks, forms, onClick, isSelected }) => {
    const Icon = ICONS[column.icon || 'CubeIcon'] || CubeIcon;
    const totalItems = tasks.length + forms.length;

    return (
        <div 
            onClick={onClick} 
            className={`flex-shrink-0 w-48 md:w-56 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'border-brand-primary bg-blue-50/50 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow'}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center min-w-0">
                    <Icon className="w-6 h-6 text-gray-500 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                        <h4 className="font-semibold text-brand-text truncate">{column.title}</h4>
                        <p className="text-xs text-brand-subtext mt-1">{totalItems} آیتم</p>
                    </div>
                </div>
                <ProgressCircle tasks={tasks} />
            </div>
        </div>
    );
};

interface ProcessViewProps {
    columns: KanbanColumn[];
    tasks: Task[];
    forms: Form[];
    onStepSelect: (columnId: string) => void;
    selectedStepId: string | null;
}

export const ProcessView: React.FC<ProcessViewProps> = ({ columns, tasks, forms, onStepSelect, selectedStepId }) => {
    return (
        <div className="p-4 md:p-8 overflow-x-auto">
            <div className="flex flex-col md:flex-row items-center">
                <StartCircle />
                {columns.map((col, index) => (
                    <React.Fragment key={col.id}>
                         {index > 0 ? <VerticalArrow /> : <div className="md:hidden h-4"></div>}
                        <Arrow />
                        <ProcessStepCard 
                            column={col} 
                            tasks={tasks.filter(t => t.columnId === col.id)}
                            forms={forms.filter(f => f.columnId === col.id)}
                            onClick={() => onStepSelect(col.id)}
                            isSelected={selectedStepId === col.id}
                        />
                    </React.Fragment>
                ))}
                <VerticalArrow />
                <Arrow />
                <EndCircle />
            </div>
        </div>
    );
};