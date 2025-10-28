import React from 'react';
import { Task, Project, User, CustomField, Tag, CustomFieldDefinition, WORKFLOW_STATES, TaskWorkflowState } from '../types';
import { CalendarIcon, CheckCircleIcon, XCircleIcon, ChecklistIcon, ChatBubbleIcon, ClockIcon } from './Icons';
import { TAG_COLOR_MAP } from '../constants';
import { toPersianDate } from '../utils/dateUtils';


const DueDateBadge: React.FC<{ dueDate: string }> = ({ dueDate }) => {
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = date < today;
    const isToday = date.toDateString() === today.toDateString();

    const color = isPast 
        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' 
        : isToday 
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' 
        : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300';

    return (
        <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${color}`}>
            <CalendarIcon className="w-4 h-4 ml-1" />
            {toPersianDate(dueDate)}
        </span>
    );
};

interface CustomConfirmationFieldProps {
    // FIX: Update prop type to include `label` which comes from the definition.
    field: CustomField & { label: string };
    onUpdate: (newValue: boolean) => void;
}
const CustomConfirmationField: React.FC<CustomConfirmationFieldProps> = ({ field, onUpdate }) => {
    return (
        <div className="mt-2 p-2 border-t text-sm">
            <p className="text-gray-600 mb-2">{field.label}</p>
            <div className="flex items-center space-x-2 space-x-reverse">
                <button 
                    onClick={(e) => { e.stopPropagation(); onUpdate(true); }}
                    className={`p-1 rounded-full transition-colors ${field.value === true ? 'bg-green-500 text-white' : 'text-gray-400 hover:bg-green-100'}`}
                >
                    <CheckCircleIcon className="w-5 h-5" />
                </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onUpdate(false); }}
                    className={`p-1 rounded-full transition-colors ${field.value === false ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-red-100'}`}
                >
                    <XCircleIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const StatusIndicatorIcon: React.FC<{ status: TaskWorkflowState }> = ({ status }) => {
    switch (status) {
        case 'انجام شد':
            return <CheckCircleIcon className="w-6 h-6 text-green-500 animate-check-bounce" />;
        case 'در حال پیشرفت':
            return <ClockIcon className="w-6 h-6 text-orange-500" />;
        case 'برای انجام':
        default:
            return <div className="w-5 h-5 rounded-full border-2 border-gray-400 bg-white group-hover:border-gray-600 transition-colors" />;
    }
};


const TaskCard: React.FC<{ 
    task: Task; 
    project?: Project; 
    assignee?: User; 
    onDragStart?: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void; 
    onUpdateTask: (task: Task) => void;
    onSelectTask: (taskId: string) => void;
}> = ({ task, project, assignee, onDragStart, onUpdateTask, onSelectTask }) => {
    
    const handleFieldUpdate = (definitionId: string, newValue: any) => {
        // FIX: Safely map over customFields and match by `definitionId` instead of `id`.
        const updatedFields = (task.customFields || []).map(f => f.definitionId === definitionId ? {...f, value: newValue} : f);
        onUpdateTask({...task, customFields: updatedFields});
    };
    
    const draggableProps = onDragStart ? {
        draggable: true,
        onDragStart: (e: React.DragEvent<HTMLDivElement>) => onDragStart(e, task.id),
    } : {};

    const checklistProgress = task.checklist && task.checklist.length > 0
        ? (task.checklist.filter(item => item.completed).length / task.checklist.length) * 100
        : null;
    
    const handleStatusCycle = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentIndex = WORKFLOW_STATES.indexOf(task.status);
        if (currentIndex === -1) { return; } // Should not happen
        
        const nextIndex = (currentIndex + 1) % WORKFLOW_STATES.length;
        const newStatus = WORKFLOW_STATES[nextIndex];

        // If moving to 'Done' and prerequisites exist, open the side panel instead of changing status directly.
        // The side panel contains the full logic to check and display unmet prerequisites.
        if (newStatus === 'انجام شد' && task.prerequisites && task.prerequisites.length > 0) {
            onSelectTask(task.id);
            return;
        }

        onUpdateTask({ ...task, status: newStatus });
    };

    return (
        <div 
            {...draggableProps}
            onClick={() => onSelectTask(task.id)}
            className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-gray-200/80 dark:border-slate-600 shadow-sm cursor-pointer active:cursor-grabbing hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md transition-all duration-200 relative group"
        >
            <button
                onClick={handleStatusCycle}
                className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-200/50"
                title="تغییر وضعیت سریع"
            >
                <StatusIndicatorIcon status={task.status} />
            </button>

          <div className="flex items-start gap-2 mb-2">
            {task.icon && <span className="text-xl leading-5 pt-0.5">{task.icon}</span>}
            <p className="text-sm font-medium text-brand-text dark:text-slate-200 flex-grow">{task.content}</p>
          </div>
          
          {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                  {task.tags.map(tag => {
                      const colorScheme = TAG_COLOR_MAP[tag.color] || TAG_COLOR_MAP.gray;
                      return (
                          <span key={tag.id} className={`px-2 py-0.5 text-xs font-medium rounded-md ${colorScheme.bg} ${colorScheme.text}`}>
                              {tag.text}
                          </span>
                      );
                  })}
              </div>
          )}

          {/* FIX: Join custom fields with definitions to access properties like `type`, `id`, and `label`. */}
          {(task.customFields || [])
            .map(cf => {
                const definition = project?.customFieldDefinitions?.find(def => def.id === cf.definitionId);
                return definition ? { ...cf, ...definition } : null;
            })
            .filter((field): field is (CustomField & CustomFieldDefinition) => field !== null && field.type === 'CONFIRMATION')
            .map(field => (
              <CustomConfirmationField key={field.id} field={field} onUpdate={(newValue) => handleFieldUpdate(field.id, newValue)} />
            ))}

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-slate-600">
            <div className="flex items-center space-x-2 space-x-reverse">
              {assignee && (
                <img src={assignee.avatarUrl} alt={assignee.name} title={assignee.name} className="w-6 h-6 rounded-full" />
              )}
              {checklistProgress !== null && (
                  <span className={`flex items-center text-xs ${checklistProgress === 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'}`}>
                    <ChecklistIcon className="w-4 h-4 ml-1"/>
                    {task.checklist?.filter(i => i.completed).length}/{task.checklist?.length}
                  </span>
              )}
              {task.comments && task.comments.length > 0 && (
                  <span className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                    <ChatBubbleIcon className="w-4 h-4 ml-1"/>
                    {task.comments.length}
                  </span>
              )}
            </div>
            <div className="flex items-center space-x-1 space-x-reverse flex-wrap justify-end gap-1">
                {task.dueDate && <DueDateBadge dueDate={task.dueDate} />}
            </div>
          </div>
        </div>
    );
};

export default TaskCard;