import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Task, Project, User, KanbanColumn } from '../types';
import { ChevronRightIcon, ChevronLeftIcon, ChevronDownIcon, ColorPaletteIcon } from './Icons';
import { KANBAN_COLOR_OPTIONS, KANBAN_COLOR_MAP } from '../constants';

const ROW_HEIGHT = 40; // in pixels
const COL_WIDTH = 40; // in pixels
const SIDEBAR_WIDTH = 280; // in pixels

const dayDiff = (date1: Date, date2: Date) => {
    const utc1 = Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate());
    const utc2 = Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate());
    return Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
};

const isSameUTCDay = (date1: Date, date2: Date) => {
    return date1.getUTCFullYear() === date2.getUTCFullYear() &&
           date1.getUTCMonth() === date2.getUTCMonth() &&
           date1.getUTCDate() === date2.getUTCDate();
};

interface TimelineViewProps {
    tasks: Task[];
    projects: Project[];
    users: User[];
    columns: KanbanColumn[];
    onSelectTask: (taskId: string) => void;
    onUpdateTask: (task: Task) => void;
}

type TimelineScale = 'week' | 'month' | 'quarter' | 'year';

const TimelineView: React.FC<TimelineViewProps> = ({ tasks, projects, users, columns, onSelectTask, onUpdateTask }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [scale, setScale] = useState<TimelineScale>('week');
    const [locale, setLocale] = useState<'fa-IR' | 'en-US'>('fa-IR');
    const [expandedStatuses, setExpandedStatuses] = useState<Set<string>>(() => new Set(columns.map(c => c.id)));
    const [now, setNow] = useState(new Date());

    const timelineContainerRef = useRef<HTMLDivElement>(null);
    const [hoveredTask, setHoveredTask] = useState<string | null>(null);
    const [dragInfo, setDragInfo] = useState<{ 
        type: 'move' | 'resize-start' | 'resize-end' | 'create', 
        task: Task, 
        startX: number, 
        originalStartDate: Date,
        originalEndDate: Date
    } | null>(null);
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        content: React.ReactNode;
        x: number;
        y: number;
    } | null>(null);
    const [colorPicker, setColorPicker] = useState<{ task: Task, top: number, left: number } | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update "now" every minute
        return () => clearInterval(timer);
    }, []);

    const { startDate, endDate, primaryHeaders, secondaryHeaders, headerTitle } = useMemo(() => {
        const vd = new Date(viewDate);
        // Create a date object representing midnight UTC to avoid timezone issues
        const d = new Date(Date.UTC(vd.getFullYear(), vd.getMonth(), vd.getDate()));

        const localNow = new Date();
        const todayUTC = new Date(Date.UTC(localNow.getFullYear(), localNow.getMonth(), localNow.getDate()));

        let startDate: Date, endDate: Date;
        let primaryHeaders: { label: string, span: number }[] = [];
        let secondaryHeaders: { label: string, isToday: boolean }[] = [];
        let headerTitle = '';
        const timeZoneOption = { timeZone: 'UTC' };
        const localeOption = { calendar: locale === 'fa-IR' ? 'persian' : 'gregory' };


        switch (scale) {
            case 'week': {
                const dayOfWeek = d.getUTCDay(); // Use UTC day
                const diff = (dayOfWeek + 1) % 7; // Start from Saturday (6 -> 0, 0 -> 1, 5 -> 6)
                startDate = new Date(d);
                startDate.setUTCDate(d.getUTCDate() - diff);

                endDate = new Date(startDate);
                endDate.setUTCDate(startDate.getUTCDate() + 27); // 4 weeks

                for (let week = 0; week < 4; week++) {
                    const weekStartDate = new Date(startDate);
                    weekStartDate.setUTCDate(startDate.getUTCDate() + week * 7);
                    const weekLabel = `هفته ${weekStartDate.toLocaleDateString(locale, { day: 'numeric', month: 'short', ...timeZoneOption, ...localeOption })}`;
                    primaryHeaders.push({ label: weekLabel, span: 7 });
                }

                for (let i = 0; i < 28; i++) {
                    const day = new Date(startDate);
                    day.setUTCDate(startDate.getUTCDate() + i);
                    secondaryHeaders.push({
                        label: day.toLocaleDateString(locale, { day: 'numeric', ...timeZoneOption, ...localeOption }),
                        isToday: isSameUTCDay(day, todayUTC)
                    });
                }
                
                const startMonth = startDate.toLocaleDateString(locale, { month: 'long', ...timeZoneOption, ...localeOption });
                const endMonth = endDate.toLocaleDateString(locale, { month: 'long', ...timeZoneOption, ...localeOption });
                const startYear = startDate.toLocaleDateString(locale, { year: 'numeric', ...timeZoneOption, ...localeOption });
                const endYear = endDate.toLocaleDateString(locale, { year: 'numeric', ...timeZoneOption, ...localeOption });

                if (startYear !== endYear) {
                    headerTitle = `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
                } else if (startMonth !== endMonth) {
                    headerTitle = `${startMonth} - ${endMonth} ${startYear}`;
                } else {
                    headerTitle = `${startMonth} ${startYear}`;
                }
                break;
            }
            
            case 'month':
                startDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
                endDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
                const numDays = endDate.getUTCDate();
                 for (let i = 1; i <= numDays; i++) {
                    const day = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), i));
                    secondaryHeaders.push({
                        label: day.toLocaleDateString(locale, { day: 'numeric', ...timeZoneOption, ...localeOption }),
                        isToday: isSameUTCDay(day, todayUTC)
                    });
                }
                primaryHeaders.push({ label: startDate.toLocaleDateString(locale, { month: 'long', year: 'numeric', ...timeZoneOption, ...localeOption }), span: numDays });
                headerTitle = startDate.toLocaleDateString(locale, { month: 'long', year: 'numeric', ...timeZoneOption, ...localeOption });
                break;
            
             case 'quarter':
                const quarter = Math.floor(d.getUTCMonth() / 3);
                startDate = new Date(Date.UTC(d.getUTCFullYear(), quarter * 3, 1));
                endDate = new Date(Date.UTC(d.getUTCFullYear(), quarter * 3 + 3, 0));
                for (let i = 0; i < 3; i++) {
                    const month = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + i, 1));
                    const daysInMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
                    primaryHeaders.push({ label: month.toLocaleDateString(locale, { month: 'long', ...timeZoneOption, ...localeOption }), span: daysInMonth });
                    for (let j = 1; j <= daysInMonth; j++) {
                        const day = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), j));
                        secondaryHeaders.push({ 
                            label: day.toLocaleDateString(locale, { day: 'numeric', ...timeZoneOption, ...localeOption }),
                            isToday: isSameUTCDay(day, todayUTC)
                        });
                    }
                }
                headerTitle = `Q${quarter + 1} ${d.toLocaleDateString(locale, { year: 'numeric', ...timeZoneOption, ...localeOption })}`;
                break;

            case 'year':
                 startDate = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
                 endDate = new Date(Date.UTC(d.getUTCFullYear(), 11, 31));
                 for (let i = 0; i < 12; i++) {
                     const month = new Date(Date.UTC(startDate.getUTCFullYear(), i, 1));
                     const daysInMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
                     primaryHeaders.push({ label: month.toLocaleDateString(locale, { month: 'short', ...timeZoneOption, ...localeOption }), span: daysInMonth});
                 }
                secondaryHeaders = []; // Secondary header not needed for year view
                headerTitle = startDate.toLocaleDateString(locale, { year: 'numeric', ...timeZoneOption, ...localeOption });
                break;
        }

        return { startDate, endDate, primaryHeaders, secondaryHeaders, headerTitle };

    }, [viewDate, scale, locale]);
    
    const { tasksByStatus, displayableRows } = useMemo(() => {
        const tasksByStatus = new Map<string, Task[]>();
        columns.forEach(column => tasksByStatus.set(column.id, []));

        tasks.forEach(task => {
            if (tasksByStatus.has(task.columnId)) {
                tasksByStatus.get(task.columnId)!.push(task);
            }
        });

        tasksByStatus.forEach(groupTasks => {
            groupTasks.sort((a, b) => a.content.localeCompare(b.content));
        });

        type DisplayRow = { type: 'group'; column: KanbanColumn } | { type: 'task'; task: Task };
        const rows: DisplayRow[] = [];
        columns.forEach(column => {
            rows.push({ type: 'group', column });
            if (expandedStatuses.has(column.id)) {
                const tasksInStatus = tasksByStatus.get(column.id) || [];
                tasksInStatus.forEach(task => {
                    rows.push({ type: 'task', task });
                });
            }
        });

        return { tasksByStatus, displayableRows: rows };
    }, [tasks, columns, expandedStatuses]);

    const todayMarkerPosition = useMemo(() => {
        const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        if (todayUTC >= startDate && todayUTC <= endDate) {
            const daysFromStart = dayDiff(todayUTC, startDate);
            const fractionOfDay = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
            return (daysFromStart + fractionOfDay) * COL_WIDTH;
        }
        return null;
    }, [startDate, endDate, now]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragInfo) return;
        const dx = e.clientX - dragInfo.startX;
        const daysDelta = Math.round(dx / COL_WIDTH);

        const { task, type, originalStartDate, originalEndDate } = dragInfo;
        let newStartDate = new Date(originalStartDate);
        let newEndDate = new Date(originalEndDate);

        if (type === 'move') {
            newStartDate.setUTCDate(originalStartDate.getUTCDate() + daysDelta);
            newEndDate.setUTCDate(originalEndDate.getUTCDate() + daysDelta);
        } else if (type === 'resize-end' || type === 'create') {
            newEndDate.setUTCDate(originalEndDate.getUTCDate() + daysDelta);
            if (newEndDate < newStartDate) {
                newEndDate = newStartDate;
            }
        } else if (type === 'resize-start') {
            newStartDate.setUTCDate(originalStartDate.getUTCDate() + daysDelta);
            if (newStartDate > newEndDate) {
                newStartDate = newEndDate;
            }
        }
        
        onUpdateTask({ ...task, startDate: newStartDate.toISOString(), dueDate: newEndDate.toISOString() });
        
        const localeOption = { calendar: locale === 'fa-IR' ? 'persian' : 'gregory' };
        const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', timeZone: 'UTC', ...localeOption };
    
        const tooltipContent = (
             <div>
                <div>شروع: {originalStartDate.toLocaleDateString(locale, dateOptions)} <span className="mx-1">&rarr;</span> {newStartDate.toLocaleDateString(locale, dateOptions)}</div>
                <div>پایان: {originalEndDate.toLocaleDateString(locale, dateOptions)} <span className="mx-1">&rarr;</span> {newEndDate.toLocaleDateString(locale, dateOptions)}</div>
            </div>
        );

        setTooltip({
            visible: true,
            content: tooltipContent,
            x: e.clientX,
            y: e.clientY
        });

    }, [dragInfo, onUpdateTask, locale]);

    const handleMouseUp = useCallback(() => {
        setDragInfo(null);
        setTooltip(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    useEffect(() => {
        if (dragInfo) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp, { once: true });
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragInfo, handleMouseMove, handleMouseUp]);
    
    const handleMoveStart = (e: React.MouseEvent, task: Task) => {
        e.stopPropagation();
        const taskStart = task.startDate ? new Date(task.startDate) : (task.dueDate ? new Date(task.dueDate) : null);
        const taskEnd = task.dueDate ? new Date(task.dueDate) : taskStart;
        if (!taskStart || !taskEnd) return;

        setDragInfo({
            type: 'move',
            task,
            startX: e.clientX,
            originalStartDate: taskStart,
            originalEndDate: taskEnd
        });
    };

    const handleResizeStart = (e: React.MouseEvent, task: Task, handle: 'start' | 'end') => {
        e.stopPropagation();
        const taskStart = task.startDate ? new Date(task.startDate) : (task.dueDate ? new Date(task.dueDate) : null);
        const taskEnd = task.dueDate ? new Date(task.dueDate) : taskStart;
        if (!taskStart || !taskEnd) return;

        setDragInfo({
            type: handle === 'start' ? 'resize-start' : 'resize-end',
            task,
            startX: e.clientX,
            originalStartDate: taskStart,
            originalEndDate: taskEnd
        });
    };

    const handleGridMouseDown = (e: React.MouseEvent, task: Task) => {
        if (task.startDate) return; // Don't create if bar exists
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const dayIndex = Math.floor(x / COL_WIDTH);
        const newStartDate = new Date(startDate);
        newStartDate.setUTCDate(newStartDate.getUTCDate() + dayIndex);
        
        const newTask = { ...task, startDate: newStartDate.toISOString(), dueDate: newStartDate.toISOString() };
        onUpdateTask(newTask); // optimistically update
        setDragInfo({ 
            type: 'create', 
            task: newTask, 
            startX: e.clientX, 
            originalStartDate: newStartDate,
            originalEndDate: newStartDate
        });
    };
    
    const totalDays = dayDiff(endDate, startDate) + 1;

    const navigate = (amount: number, unit: 'day' | 'week' | 'month' | 'year') => {
        const newDate = new Date(viewDate);
        if (unit === 'day') newDate.setDate(newDate.getDate() + amount);
        if (unit === 'week') newDate.setDate(newDate.getDate() + amount * 7);
        if (unit === 'month') newDate.setMonth(newDate.getMonth() + amount);
        if (unit === 'year') newDate.setFullYear(newDate.getFullYear() + amount);
        setViewDate(newDate);
    };

    const handlePrev = () => {
        if (scale === 'week') navigate(-4, 'week');
        else if (scale === 'month') navigate(-1, 'month');
        else if (scale === 'quarter') navigate(-3, 'month');
        else navigate(-1, 'year');
    };
    const handleNext = () => {
        if (scale === 'week') navigate(4, 'week');
        else if (scale === 'month') navigate(1, 'month');
        else if (scale === 'quarter') navigate(3, 'month');
        else navigate(1, 'year');
    };

    const handleSetColor = (task: Task, color: string) => {
        onUpdateTask({ ...task, color });
        setColorPicker(null);
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-lg border">
            {/* Header */}
            <div className="p-3 border-b flex justify-between items-center">
                <div className="flex items-center space-x-2 space-x-reverse">
                    <button onClick={() => setViewDate(new Date())} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100">امروز</button>
                    <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-5 h-5" /></button>
                    <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <h2 className="font-semibold text-lg">{headerTitle}</h2>
                </div>
                 <div className="flex items-center space-x-2 space-x-reverse">
                    <button onClick={() => setLocale(l => l === 'fa-IR' ? 'en-US' : 'fa-IR')} className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100">
                        {locale === 'fa-IR' ? 'میلادی' : 'شمسی'}
                    </button>
                    <select value={scale} onChange={e => setScale(e.target.value as TimelineScale)} className="text-sm border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary">
                        <option value="week">هفته</option>
                        <option value="month">ماه</option>
                        <option value="quarter">فصل</option>
                        <option value="year">سال</option>
                    </select>
                </div>
            </div>

            {/* Body */}
            <div className="flex-grow flex relative overflow-auto">
                <div className="relative" style={{ height: displayableRows.length * ROW_HEIGHT + 60 }}>
                    {/* Left Panel - Task List */}
                    <div className="absolute top-0 right-0 h-full bg-gray-50/70 border-l" style={{ width: SIDEBAR_WIDTH, zIndex: 10 }}>
                        <div className="h-[60px] border-b flex items-center px-4 font-semibold text-sm">وظایف</div>
                        {displayableRows.map(row => {
                            if (row.type === 'group') {
                                const { column } = row;
                                const tasksInStatus = tasksByStatus.get(column.id) || [];
                                const isExpanded = expandedStatuses.has(column.id);
                                return (
                                    <div key={column.id} style={{ height: ROW_HEIGHT }} className="flex items-center px-4 border-b font-semibold bg-gray-100/80">
                                        <button onClick={() => {
                                            const newSet = new Set(expandedStatuses);
                                            if (isExpanded) newSet.delete(column.id);
                                            else newSet.add(column.id);
                                            setExpandedStatuses(newSet);
                                        }} className="flex items-center p-1 -mr-1">
                                            <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                                        </button>
                                        <span className="truncate">{column.title}</span>
                                        <span className="text-xs text-gray-400 font-normal mr-2">({tasksInStatus.length})</span>
                                    </div>
                                );
                            } else { // type is 'task'
                                const { task } = row;
                                return (
                                    <div key={task.id} style={{ height: ROW_HEIGHT }} className={`flex items-center px-4 border-b ${hoveredTask === task.id ? 'bg-gray-100' : ''}`}>
                                        <div className="flex items-center w-full text-right text-sm">
                                            <div className="w-4 h-4 ml-2 flex-shrink-0"></div> {/* Placeholder */}
                                            <div onClick={() => onSelectTask(task.id)} onMouseEnter={() => setHoveredTask(task.id)} onMouseLeave={() => setHoveredTask(null)} className="truncate cursor-pointer flex-grow ml-2">{task.content}</div>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>

                    {/* Right Panel - Timeline */}
                    <div ref={timelineContainerRef} className="absolute top-0 right-0 h-full" style={{ left: 0, paddingRight: SIDEBAR_WIDTH }}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white z-20">
                            <div className="h-[30px] flex border-b" style={{ width: totalDays * COL_WIDTH }}>
                                {primaryHeaders.map((h, i) => (
                                    <div key={i} className="flex-shrink-0 flex items-center justify-center border-r font-semibold text-xs text-gray-600" style={{ width: h.span * COL_WIDTH }}>{h.label}</div>
                                ))}
                            </div>
                            <div className="h-[30px] flex border-b" style={{ width: totalDays * COL_WIDTH }}>
                                {secondaryHeaders.map((h, i) => (
                                    <div key={i} className="flex-shrink-0 flex items-center justify-center border-r text-xs text-gray-500" style={{ width: COL_WIDTH }}>
                                        <span className={h.isToday ? 'font-bold text-blue-600 bg-blue-100/60 rounded-full w-5 h-5 flex items-center justify-center' : ''}>
                                            {h.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Grid */}
                        <div className="relative" style={{ width: totalDays * COL_WIDTH, height: displayableRows.length * ROW_HEIGHT }}>
                            {/* Vertical Lines */}
                            {Array.from({ length: totalDays }).map((_, i) => {
                                const isWeekSeparator = scale === 'week' && (i + 1) % 7 === 0 && (i + 1) < totalDays;
                                return (
                                <div
                                    key={i}
                                    className={`absolute top-0 bottom-0 border-r ${isWeekSeparator ? 'border-gray-300' : 'border-gray-200/70'}`}
                                    style={{ left: (i + 1) * COL_WIDTH, zIndex: 1 }}
                                ></div>
                                );
                            })}
                            {/* Horizontal Lines & Bars */}
                            {displayableRows.map((row, index) => {
                                let bar = null;
                                if (row.type === 'task') {
                                    const { task } = row;
                                    let taskStart: Date | null = task.startDate ? new Date(task.startDate) : null;
                                    let taskEnd: Date | null = task.dueDate ? new Date(task.dueDate) : null;

                                    if (taskStart && !taskEnd) {
                                        taskEnd = taskStart;
                                    } else if (!taskStart && taskEnd) {
                                        taskStart = taskEnd;
                                    }

                                    if (taskStart && taskEnd) {
                                        if (taskEnd < taskStart) {
                                            taskEnd = taskStart;
                                        }

                                        const left = dayDiff(taskStart, startDate) * COL_WIDTH;
                                        const durationDays = dayDiff(taskEnd, taskStart);
                                        const width = (durationDays + 1) * COL_WIDTH;
                                        
                                        const displayWidth = Math.max(1, width);

                                        const color = task.color || 'gray';
                                        const colorClasses = KANBAN_COLOR_MAP[color] || KANBAN_COLOR_MAP.gray;
                                        
                                        bar = (
                                            <div 
                                                onMouseDown={(e) => handleMoveStart(e, task)}
                                                className={`absolute h-8 rounded-md flex items-center px-2 text-white text-xs font-semibold shadow-sm cursor-move ${colorClasses.dot} ${dragInfo?.task.id === task.id ? 'opacity-75 ring-2 ring-blue-500' : ''}`}
                                                style={{ top: 6, left, width: displayWidth, zIndex: 5 }}
                                            >
                                                <div 
                                                    onMouseDown={(e) => handleResizeStart(e, task, 'start')} 
                                                    className="absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize z-10"
                                                ></div>
                                                <div className="truncate flex-grow flex items-center">
                                                    <button onClick={(e) => { e.stopPropagation(); setColorPicker({ task, top: e.clientY, left: e.clientX }); }} className="w-3 h-3 rounded-sm bg-white/30 mr-1.5 flex-shrink-0"></button>
                                                    {task.content}
                                                </div>
                                                <div 
                                                    onMouseDown={(e) => handleResizeStart(e, task, 'end')} 
                                                    className="absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize z-10"
                                                ></div>
                                            </div>
                                        );
                                    }
                                }
                                return (
                                    <div 
                                        key={row.type === 'group' ? row.column.id : row.task.id}
                                        onMouseEnter={row.type === 'task' ? () => setHoveredTask(row.task.id) : undefined}
                                        onMouseLeave={row.type === 'task' ? () => setHoveredTask(null) : undefined}
                                        onMouseDown={row.type === 'task' ? (e) => handleGridMouseDown(e, row.task) : undefined}
                                        className={`absolute right-0 border-b border-gray-200/70 ${row.type === 'task' && hoveredTask === row.task.id ? 'bg-blue-50/50' : ''} ${row.type === 'group' ? 'bg-gray-100/50' : ''}`}
                                        style={{ top: index * ROW_HEIGHT, height: ROW_HEIGHT, width: '100%' }}
                                    >
                                        {bar}
                                    </div>
                                );
                            })}
                            {/* Today Marker */}
                            {todayMarkerPosition !== null && (
                                <div
                                    className="absolute top-0 bottom-0 pointer-events-none"
                                    style={{ right: todayMarkerPosition, zIndex: 20 }}
                                >
                                    <div className="w-px h-full bg-red-500"></div>
                                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
             {colorPicker && (
                <div ref={r => {
                    if (!r) return;
                    const rect = r.getBoundingClientRect();
                    if (window.innerHeight - colorPicker.top < rect.height) {
                        r.style.top = `${colorPicker.top - rect.height}px`;
                    }
                }} className="fixed bg-white p-2 rounded-md shadow-lg border z-50" style={{ top: colorPicker.top + 10, left: colorPicker.left }}>
                    <div className="grid grid-cols-4 gap-1">
                        {KANBAN_COLOR_OPTIONS.map(color => (
                            <button key={color} onClick={() => handleSetColor(colorPicker.task, color)} className={`w-6 h-6 rounded-full ${KANBAN_COLOR_MAP[color].dot} border-2 border-white hover:ring-2 hover:ring-blue-400`} />
                        ))}
                    </div>
                </div>
            )}
            {tooltip && tooltip.visible && (
                <div 
                    className="fixed bg-gray-800 text-white text-xs rounded-md px-2 py-1 z-50 pointer-events-none shadow-lg"
                    style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}
                >
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};

export default TimelineView;