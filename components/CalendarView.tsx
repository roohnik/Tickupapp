import React, { useState, useEffect, useRef } from 'react';
import { Task, Project } from '../types';
import { getMonthDays, getWeekDays, toPersianDate } from '../utils/dateUtils';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ChevronDownIcon, CalendarIcon, ChatBubbleIcon } from './Icons';

interface CalendarViewProps {
    tasks: Task[];
    projects: Project[];
    onSelectTask: (taskId: string) => void;
    onAddTask: (defaultStatus?: string, defaultDate?: string) => void;
    onUpdateTask: (updatedTask: Task) => void;
}

type CalendarViewMode = 'day' | 'week' | 'month' | 'year';

const VIEW_OPTIONS: { key: CalendarViewMode, label: string }[] = [
    { key: 'day', label: 'روز' },
    { key: 'week', label: 'هفته' },
    { key: 'month', label: 'ماه' },
    { key: 'year', label: 'سال' },
];

const PERSIAN_WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const PERSIAN_FULL_WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
};

const isToday = (date: Date) => isSameDay(date, new Date());

// New Upcoming Task Item Component
const UpcomingTaskItem: React.FC<{
  task: Task;
  project?: Project;
  isOverdue?: boolean;
  onUpdateTask: (task: Task) => void;
  onSelectTask: (taskId: string) => void;
}> = ({ task, project, isOverdue = false, onUpdateTask, onSelectTask }) => {
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'انجام شد' ? 'برای انجام' : 'انجام شد';
    onUpdateTask({ ...task, status: newStatus });
  };

  const isComplete = task.status === 'انجام شد';

  // Mock priority for colors - this can be replaced with real data later
  const priorityColors: { [key: string]: string } = {
    'p1': 'border-red-500',
    'p2': 'border-orange-500'
  };
  const priorityColor = priorityColors[task.projectId as keyof typeof priorityColors] || 'border-gray-300';
  
  return (
    <div onClick={() => onSelectTask(task.id)} className="flex items-start py-2.5 border-b border-gray-100 group cursor-pointer">
      <div className="flex-shrink-0 pt-1">
        <button onClick={handleToggleComplete} className="w-5 h-5 rounded-full border-2 flex items-center justify-center hover:bg-gray-100 transition-colors" style={{ borderColor: isComplete ? '#22c55e' : priorityColor }}>
          {isComplete && <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 16 16" style={{ backgroundColor: '#22c55e', borderRadius: '50%' }}><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>}
        </button>
      </div>
      
      <div className="flex-grow mx-3 min-w-0">
        <p className={`text-sm ${isComplete ? 'line-through text-gray-400' : 'text-brand-text'}`}>{task.content}</p>
        {task.description && <p className="text-xs text-gray-500 truncate">{task.description}</p>}
        <div className="flex items-center space-x-3 space-x-reverse text-xs mt-1 text-gray-500">
          {task.dueDate && isOverdue && <span className="flex items-center text-red-600"><CalendarIcon className="w-3.5 h-3.5 ml-1" />{toPersianDate(task.dueDate)}</span>}
          {task.comments && task.comments.length > 0 && <span className="flex items-center"><ChatBubbleIcon className="w-3.5 h-3.5 ml-1"/>{task.comments.length}</span>}
        </div>
      </div>

      <div className="text-xs text-gray-500 flex items-center flex-shrink-0 text-right">
        <span>{project?.name}</span>
        {/* Hashtags for tags could go here */}
      </div>
    </div>
  );
};


const UpcomingView: React.FC<CalendarViewProps & { currentDate: Date, setCurrentDate: (d: Date) => void }> = ({ tasks, projects, onSelectTask, onAddTask, onUpdateTask, currentDate, setCurrentDate }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [overdueExpanded, setOverdueExpanded] = useState(true);

    const today = new Date();
    today.setHours(0,0,0,0);
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'انجام شد').sort((a,b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    const selectedDayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === selectedDate.toDateString());
    
    const weekDaysForNav = getWeekDays(currentDate);

    return (
        <div className="flex flex-col h-full">
            <div className="flex border-b pb-2 mb-2">
                {weekDaysForNav.map(day => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isDayToday = isToday(day);
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            className={`flex-1 flex flex-col items-center p-2 rounded-lg transition-colors ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                            <span className="text-xs text-gray-500">{day.toLocaleDateString('fa-IR', { weekday: 'short' })}</span>
                            <span className={`text-lg font-bold mt-1 ${isDayToday ? 'text-brand-primary' : 'text-gray-800'}`}>{day.getDate()}</span>
                        </button>
                    )
                })}
            </div>
            
            <div className="flex-grow overflow-y-auto px-2 space-y-6">
                {overdueTasks.length > 0 && (
                     <div>
                        <div className="flex justify-between items-center">
                            <button onClick={() => setOverdueExpanded(!overdueExpanded)} className="flex items-center font-semibold text-red-600">
                                <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${overdueExpanded ? '' : '-rotate-90'}`} />
                                معوقه
                            </button>
                            <button className="text-xs font-semibold text-gray-500 hover:text-black">زمانبندی مجدد</button>
                        </div>
                        {overdueExpanded && (
                            <div className="pt-2 space-y-px animate-fade-in">
                                {overdueTasks.map(task => 
                                    <UpcomingTaskItem 
                                        key={task.id} 
                                        task={task}
                                        project={projects.find(p => p.id === task.projectId)}
                                        isOverdue={true}
                                        onUpdateTask={onUpdateTask}
                                        onSelectTask={onSelectTask}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
               
                <div>
                     <h3 className="font-semibold text-brand-text mb-2">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                     </h3>
                     {selectedDayTasks.length > 0 ? (
                         <div className="space-y-px">
                            {selectedDayTasks.map(task => 
                                <UpcomingTaskItem 
                                    key={task.id} 
                                    task={task}
                                    project={projects.find(p => p.id === task.projectId)}
                                    onUpdateTask={onUpdateTask}
                                    onSelectTask={onSelectTask}
                                />
                            )}
                        </div>
                     ) : (
                         <p className="text-sm text-center text-gray-400 py-4">هیچ تسکی برای این روز وجود ندارد.</p>
                     )}
                     <button onClick={() => onAddTask(undefined, selectedDate.toISOString())} className="w-full mt-2 p-2 text-sm font-semibold rounded-md flex items-center text-brand-primary hover:bg-gray-100 transition-colors">
                        <PlusIcon className="w-4 h-4 ml-2" /> افزودن تسک
                    </button>
                </div>
            </div>
        </div>
    );
};

const MonthView: React.FC<Pick<CalendarViewProps, 'tasks' | 'onSelectTask' | 'onAddTask'> & { currentDate: Date }> = ({ tasks, onSelectTask, onAddTask, currentDate }) => {
    const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
    const tasksByDate: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
        if (task.dueDate) {
            const dateKey = new Date(task.dueDate).toDateString();
            if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
            tasksByDate[dateKey].push(task);
        }
    });

    return (
        <div className="grid grid-cols-7 border-t border-l border-gray-200/80">
            {monthDays.map((day, index) => {
                const tasksForDay = day ? tasksByDate[day.toDateString()] || [] : [];
                const isCurrentMonth = day ? day.getMonth() === currentDate.getMonth() : false;
                
                return (
                    <div key={index} className={`relative h-32 border-b border-r border-gray-200/80 p-1.5 group ${!isCurrentMonth ? 'bg-gray-50/70' : ''}`}>
                        {day && (
                            <>
                                <span className={`text-sm ${isToday(day) ? 'bg-brand-primary text-white rounded-full w-6 h-6 flex items-center justify-center font-bold' : ''} ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                                    {day.getDate()}
                                </span>
                                <div className="mt-1 space-y-1 overflow-y-auto max-h-24">
                                    {tasksForDay.map(task => (
                                        <div key={task.id} onClick={() => onSelectTask(task.id)} className="bg-blue-100 text-blue-800 text-xs rounded p-1 truncate cursor-pointer hover:bg-blue-200">
                                            {task.content}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => onAddTask(undefined, day.toISOString())} className="absolute top-1 left-1 w-5 h-5 bg-gray-200/80 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-300">
                                    <PlusIcon className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const DayView: React.FC<Pick<CalendarViewProps, 'tasks' | 'projects' | 'onSelectTask'> & { currentDate: Date }> = ({ tasks, projects, onSelectTask, currentDate }) => {
    const tasksForDay = tasks.filter(task => task.dueDate && new Date(task.dueDate).toDateString() === currentDate.toDateString());

    return (
        <div className="border-t">
            {tasksForDay.length > 0 ? (
                <div className="space-y-2 p-4">
                    {tasksForDay.map(task => (
                        <div key={task.id} onClick={() => onSelectTask(task.id)} className="p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-gray-100 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{task.content}</p>
                                <p className="text-sm text-gray-500">{projects.find(p => p.id === task.projectId)?.name}</p>
                            </div>
                            <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 text-gray-500">
                    هیچ تسکی برای این روز وجود ندارد.
                </div>
            )}
        </div>
    );
};

const YearView: React.FC<Pick<CalendarViewProps, 'tasks'> & { currentDate: Date, setCurrentDate: (date: Date) => void, setView: (view: CalendarViewMode) => void }> = ({ tasks, currentDate, setCurrentDate, setView }) => {
    const year = currentDate.getFullYear();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
            {Array.from({ length: 12 }).map((_, monthIndex) => {
                const monthDate = new Date(year, monthIndex, 1);
                const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
                const monthDays = getMonthDays(year, monthIndex);
                
                return (
                    <div key={monthIndex} onClick={() => { setCurrentDate(monthDate); setView('month'); }} className="border rounded-lg p-2 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-shadow">
                        <h3 className="font-semibold text-center text-sm mb-2">{monthName}</h3>
                        <div className="grid grid-cols-7 text-center text-xs text-gray-400">
                            {PERSIAN_WEEK_DAYS.map(d => <span key={d} className="w-6 h-6 flex items-center justify-center">{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 text-center text-xs">
                            {monthDays.map((day, dayIndex) => {
                                if (!day) return <div key={dayIndex} className="w-6 h-6"></div>;
                                const hasTask = tasks.some(t => t.dueDate && new Date(t.dueDate).toDateString() === day.toDateString());
                                return (
                                    <div key={dayIndex} className="relative w-6 h-6 flex items-center justify-center">
                                        <span className={isToday(day) ? 'bg-brand-primary text-white rounded-full w-5 h-5 flex items-center justify-center' : ''}>
                                            {day.getDate()}
                                        </span>
                                        {hasTask && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


const CalendarView: React.FC<CalendarViewProps> = (props) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarViewMode>('week');
    const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
    const viewMenuButtonRef = useRef<HTMLButtonElement>(null);
    const viewMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node) && viewMenuButtonRef.current && !viewMenuButtonRef.current.contains(event.target as Node)) {
                setIsViewMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        switch(view) {
            case 'day': newDate.setDate(newDate.getDate() - 1); break;
            case 'week': newDate.setDate(newDate.getDate() - 7); break;
            case 'year': newDate.setFullYear(newDate.getFullYear() - 1); break;
            case 'month': default: newDate.setMonth(newDate.getMonth() - 1); break;
        }
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        switch(view) {
            case 'day': newDate.setDate(newDate.getDate() + 1); break;
            case 'week': newDate.setDate(newDate.getDate() + 7); break;
            case 'year': newDate.setFullYear(newDate.getFullYear() + 1); break;
            case 'month': default: newDate.setMonth(newDate.getMonth() + 1); break;
        }
        setCurrentDate(newDate);
    };

    const handleGoToToday = () => setCurrentDate(new Date());

    const getHeaderTitle = () => {
        switch(view) {
            case 'day':
                return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            case 'week':
            case 'year':
            case 'month':
            default:
                return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
    };

    const renderView = () => {
        const commonProps = { ...props, currentDate };
        switch (view) {
            case 'day': return <DayView {...commonProps} />;
            case 'week': return <UpcomingView {...commonProps} setCurrentDate={setCurrentDate}/>;
            case 'year': return <YearView tasks={props.tasks} currentDate={currentDate} setCurrentDate={setCurrentDate} setView={setView} />;
            case 'month': default: return <MonthView {...commonProps} />;
        }
    };

    return (
        <div className="bg-white border border-gray-200/80 rounded-lg p-4 min-h-[40rem]">
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="font-semibold text-lg text-brand-text min-w-0 truncate">{view === 'week' ? 'Upcoming' : getHeaderTitle()}</h2>
                <div className="flex items-center space-x-1 space-x-reverse">
                     <div className="relative">
                        <button ref={viewMenuButtonRef} onClick={() => setIsViewMenuOpen(p => !p)} className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 flex items-center">
                            {VIEW_OPTIONS.find(v => v.key === view)?.label}
                            <ChevronDownIcon className="w-4 h-4 mr-1"/>
                        </button>
                        {isViewMenuOpen && (
                            <div ref={viewMenuRef} className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg border z-10 w-32">
                                {VIEW_OPTIONS.map(option => (
                                    <button key={option.key} onClick={() => { setView(option.key); setIsViewMenuOpen(false); }} className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-100 ${view === option.key ? 'bg-gray-100 font-semibold' : ''}`}>
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={handleGoToToday} className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100">امروز</button>
                    <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-5 h-5" /></button>
                    <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-5 h-5" /></button>
                </div>
            </div>
            
            {(view === 'month') && (
                 <div className="grid grid-cols-7">
                    {PERSIAN_WEEK_DAYS.map(day => (
                        <div key={day} className="text-center font-medium text-xs text-brand-subtext py-2">
                            {day}
                        </div>
                    ))}
                </div>
            )}

            {renderView()}
        </div>
    );
};

export default CalendarView;