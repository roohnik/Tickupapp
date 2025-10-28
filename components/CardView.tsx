import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, KanbanColumn, User } from '../types';
import { STICKER_COLOR_MAP } from '../constants';
import { ThreeDotsIcon, XCircleIcon, TrashIcon } from './Icons';

type CardSize = 'micro' | 'xs' | 'sm' | 'md' | 'lg';

const sizeLabels: Record<CardSize, string> = {
    micro: 'میکرو',
    xs: 'خیلی کوچک',
    sm: 'کوچک',
    md: 'استاندارد',
    lg: 'بزرگ',
};

const sizeStyles: Record<CardSize, { width: string; minHeight: string; titleClass: string; }> = {
    micro: { width: '120px', minHeight: '60px', titleClass: 'font-bold text-xs' },
    xs: { width: '150px', minHeight: '80px', titleClass: 'font-bold text-sm' },
    sm: { width: '200px', minHeight: '100px', titleClass: 'font-bold text-base' },
    md: { width: '250px', minHeight: '120px', titleClass: 'font-bold text-lg' },
    lg: { width: '320px', minHeight: '160px', titleClass: 'font-bold text-xl' },
};


interface CardViewProps {
    tasks: Task[];
    columns: KanbanColumn[];
    users: User[];
    currentUser: User;
    activeProjectId: string | 'all';
    onSelectTask: (taskId: string) => void;
    onInlineAddTask: (taskData: Omit<Task, 'id' | 'tags' | 'comments' | 'checklist' | 'status'>) => void;
    onUpdateTask: (updatedTask: Task) => void;
    onDeleteTasks: (taskIds: string[]) => void;
    activeTemplate: 'none' | 'business' | 'swot';
}

const StickerCard: React.FC<{
    task: Task;
    position: { x: number; y: number };
    assignee?: User;
    colorScheme: { bg: string; text: string };
    onMouseDown: (e: React.MouseEvent, taskId: string) => void;
    onDoubleClick: () => void;
    size: CardSize;
    isSelected: boolean;
}> = ({ task, position, assignee, colorScheme, onMouseDown, onDoubleClick, size, isSelected }) => {
    
    const currentSizeStyle = sizeStyles[size];

    return (
        <div
            onMouseDown={(e) => onMouseDown(e, task.id)}
            onDoubleClick={onDoubleClick}
            className={`absolute p-4 rounded-lg shadow-lg cursor-grab active:cursor-grabbing transition-transform duration-200 hover:scale-105 group ${colorScheme.bg} ${colorScheme.text} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
            style={{
                left: position.x,
                top: position.y,
                width: currentSizeStyle.width,
                minHeight: currentSizeStyle.minHeight,
            }}
        >
            <h3 className={currentSizeStyle.titleClass}>{task.content}</h3>
            <div className="absolute bottom-2 right-2">
                {assignee && (
                    <img
                        src={assignee.avatarUrl}
                        alt={assignee.name}
                        title={assignee.name}
                        className="w-6 h-6 rounded-full border-2 border-white/50"
                    />
                )}
            </div>
        </div>
    );
};


const SelectionToolbar: React.FC<{
    count: number;
    onSizeChange: (newSize: CardSize) => void;
    onDelete: () => void;
    onClear: () => void;
}> = ({ count, onSizeChange, onClear, onDelete }) => {
    const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
    const sizeMenuButtonRef = useRef<HTMLButtonElement>(null);
    const sizeMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                sizeMenuRef.current &&
                !sizeMenuRef.current.contains(event.target as Node) &&
                sizeMenuButtonRef.current &&
                !sizeMenuButtonRef.current.contains(event.target as Node)
            ) {
                setIsSizeMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white rounded-lg shadow-2xl flex items-center p-2 z-30 animate-slide-in-up">
            <span className="px-3 text-sm font-semibold">{count} کارت انتخاب شده</span>
            <div className="w-px h-6 bg-gray-600 mx-2"></div>
            <div className="relative">
                <button
                    ref={sizeMenuButtonRef}
                    onClick={() => setIsSizeMenuOpen(prev => !prev)}
                    className="px-3 py-1 text-sm rounded-md hover:bg-gray-700"
                >
                    تغییر سایز
                </button>
                {isSizeMenuOpen && (
                    <div ref={sizeMenuRef} className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-white text-gray-800 rounded-md shadow-lg border z-20 py-1">
                        {Object.entries(sizeLabels).map(([sizeKey, sizeLabel]) => (
                            <button
                                key={sizeKey}
                                onClick={() => {
                                    onSizeChange(sizeKey as CardSize);
                                    setIsSizeMenuOpen(false);
                                }}
                                className="w-full text-right px-3 py-1.5 text-sm hover:bg-gray-100"
                            >
                                {sizeLabel}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <button
                onClick={onDelete}
                className="px-3 py-1 text-sm rounded-md hover:bg-gray-700 flex items-center text-red-400 hover:text-red-300"
                title="حذف"
            >
                <TrashIcon className="w-4 h-4 mr-1" />
                حذف
            </button>
            <div className="w-px h-6 bg-gray-600 mx-2"></div>
            <button onClick={onClear} className="p-2 rounded-full hover:bg-gray-700" title="لغو انتخاب">
                <XCircleIcon className="w-5 h-5" />
            </button>
        </div>
    );
};


const SwotTemplate: React.FC = () => (
    <svg width="100%" height="100%" className="absolute inset-0 z-0 pointer-events-none" style={{ minWidth: '1000px', minHeight: '700px' }}>
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#e0e0e0" strokeWidth="2" strokeDasharray="8 8" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e0e0e0" strokeWidth="2" strokeDasharray="8 8" />
        <text x="20" y="40" fill="#d1d5db" fontSize="24" fontWeight="bold" dominantBaseline="middle" textAnchor="start">نقاط قوت</text>
        <text x="98%" y="40" fill="#d1d5db" fontSize="24" fontWeight="bold" dominantBaseline="middle" textAnchor="end" direction="rtl">نقاط ضعف</text>
        <text x="20" y="98%" dy="-20" fill="#d1d5db" fontSize="24" fontWeight="bold" dominantBaseline="text-bottom" textAnchor="start">فرصت‌ها</text>
        <text x="98%" y="98%" dy="-20" fill="#d1d5db" fontSize="24" fontWeight="bold" dominantBaseline="text-bottom" textAnchor="end" direction="rtl">تهدیدها</text>
    </svg>
);

const BusinessBoardTemplate: React.FC = () => (
    <svg width="100%" height="100%" className="absolute inset-0 z-0 pointer-events-none" style={{minWidth: '1200px', minHeight: '800px'}}>
        {/* Vertical Lines */}
        <line x1="20%" y1="0" x2="20%" y2="65%" stroke="#e0e0e0" strokeWidth="2" strokeDasharray="8 8" />
        <line x1="40%" y1="0" x2="40%" y2="65%" stroke="#e0e0e0" strokeWidth="2" strokeDasharray="8 8" />
        <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#e0e0e0" strokeWidth="2" strokeDasharray="8 8" />
        <line x1="80%" y1="0" x2="80%" y2="65%" stroke="#e0e0e0" strokeWidth="2" strokeDasharray="8 8" />
        <line x1="20%" y1="32.5%" x2="40%" y2="32.5%" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="60%" y1="32.5%" x2="80%" y2="32.5%" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4 4" />

        {/* Horizontal Lines */}
        <line x1="0" y1="65%" x2="60%" y2="65%" stroke="#e0e0e0" strokeWidth="2" strokeDasharray="8 8" />

        {/* Labels */}
        <text x="10%" y="40" fill="#d1d5db" fontSize="18" fontWeight="bold" textAnchor="middle">شرکای کلیدی</text>
        <text x="30%" y="40" fill="#d1d5db" fontSize="18" fontWeight="bold" textAnchor="middle">فعالیت‌های کلیدی</text>
        <text x="50%" y="40" fill="#d1d5db" fontSize="18" fontWeight="bold" textAnchor="middle">ارزش‌های پیشنهادی</text>
        <text x="70%" y="40" fill="#d1d5db" fontSize="18" fontWeight="bold" textAnchor="middle">ارتباط با مشتریان</text>
        <text x="90%" y="40" fill="#d1d5db" fontSize="18" fontWeight="bold" textAnchor="middle">بخش‌های مشتریان</text>
        
        <text x="30%" y="50%" fill="#d1d5db" fontSize="18" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">منابع کلیدی</text>
        <text x="70%" y="50%" fill="#d1d5db" fontSize="18" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">کانال‌ها</text>

        <text x="30%" y="82.5%" fill="#d1d5db" fontSize="18" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">ساختار هزینه‌ها</text>
        <text x="80%" y="82.5%" fill="#d1d5db" fontSize="18" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">جریان‌های درآمدی</text>
    </svg>
);


export const CardView: React.FC<CardViewProps> = ({ tasks, columns, users, currentUser, activeProjectId, onSelectTask, onInlineAddTask, onUpdateTask, onDeleteTasks, activeTemplate }) => {
    const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
    const [cardSizes, setCardSizes] = useState<Map<string, CardSize>>(new Map());
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
    const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number; } | null>(null);
    const [dragState, setDragState] = useState<{
        type: 'card' | 'selection';
        startX: number;
        startY: number;
        initialCardPositions?: Map<string, { x: number; y: number }>;
        draggedTaskId?: string;
    } | null>(null);

    const boardRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const newPositions = new Map(positions);
        const newSizes = new Map(cardSizes);
        let updated = false;
        tasks.forEach((task, index) => {
            if (!newPositions.has(task.id)) {
                const gridX = (index % 4) * 280 + 20;
                const gridY = Math.floor(index / 4) * 150 + 20;
                newPositions.set(task.id, { x: gridX, y: gridY });
                updated = true;
            }
            if (!newSizes.has(task.id)) {
                newSizes.set(task.id, 'md');
                updated = true;
            }
        });
        if (updated) {
            setPositions(newPositions);
            setCardSizes(newSizes);
        }
    }, [tasks]);

    const handleBulkSizeChange = (newSize: CardSize) => {
        const newSizes = new Map(cardSizes);
        selectedTaskIds.forEach((id) => {
            newSizes.set(id, newSize);
        });
        setCardSizes(newSizes);
    };

    const handleDeleteSelected = () => {
        onDeleteTasks([...selectedTaskIds]);
        setSelectedTaskIds(new Set());
    };

    const handleMouseDownOnBoard = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.absolute')) {
            return;
        }
        setDragState({
            type: 'selection',
            startX: e.clientX,
            startY: e.clientY
        });
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragState || !boardRef.current) return;
        
        const boardRect = boardRef.current.getBoundingClientRect();
        const currentX = e.clientX;
        const currentY = e.clientY;
        
        const dx = currentX - dragState.startX;
        const dy = currentY - dragState.startY;

        if (dragState.type === 'card' && dragState.initialCardPositions) {
            const newPositions = new Map(positions);
            if (dragState.draggedTaskId && selectedTaskIds.size <= 1) {
                const initialPos = dragState.initialCardPositions.get(dragState.draggedTaskId);
                if (initialPos) {
                    newPositions.set(dragState.draggedTaskId, { x: initialPos.x + dx, y: initialPos.y + dy });
                }
            } else {
                selectedTaskIds.forEach(id => {
                    const initialPos = dragState.initialCardPositions!.get(id);
                    if (initialPos) {
                        newPositions.set(id, { x: initialPos.x + dx, y: initialPos.y + dy });
                    }
                });
            }
            setPositions(newPositions);
        } else if (dragState.type === 'selection') {
            const boardRelativeStartX = dragState.startX - boardRect.left;
            const boardRelativeStartY = dragState.startY - boardRect.top;
            const boardRelativeCurrentX = e.clientX - boardRect.left;
            const boardRelativeCurrentY = e.clientY - boardRect.top;
            
            const x = Math.min(boardRelativeStartX, boardRelativeCurrentX);
            const y = Math.min(boardRelativeStartY, boardRelativeCurrentY);
            const width = Math.abs(boardRelativeCurrentX - boardRelativeStartX);
            const height = Math.abs(boardRelativeCurrentY - boardRelativeStartY);
            setSelectionRect({ x, y, width, height });
        }
    };
    
    const handleMouseUp = () => {
        if (dragState?.type === 'selection' && selectionRect && boardRef.current) {
            const newSelectedIds = new Set<string>();
            tasks.forEach(task => {
                const pos = positions.get(task.id);
                const size = sizeStyles[cardSizes.get(task.id) || 'md'];
                if (pos) {
                    const taskRect = {
                        x: pos.x,
                        y: pos.y,
                        width: parseInt(size.width),
                        height: parseInt(size.minHeight)
                    };
                    if (
                        taskRect.x < selectionRect.x + selectionRect.width &&
                        taskRect.x + taskRect.width > selectionRect.x &&
                        taskRect.y < selectionRect.y + selectionRect.height &&
                        taskRect.y + taskRect.height > selectionRect.y
                    ) {
                        newSelectedIds.add(task.id);
                    }
                }
            });
            setSelectedTaskIds(newSelectedIds);
        }
        setDragState(null);
        setSelectionRect(null);
    };

    const handleMouseDownOnCard = (e: React.MouseEvent, taskId: string) => {
        e.stopPropagation();

        const isSelected = selectedTaskIds.has(taskId);

        if (!e.ctrlKey && !e.metaKey && !isSelected) {
            setSelectedTaskIds(new Set([taskId]));
        }

        const initialPositions = new Map<string, { x: number, y: number }>();
        if (isSelected) {
            selectedTaskIds.forEach(id => {
                initialPositions.set(id, positions.get(id)!);
            });
        } else {
            initialPositions.set(taskId, positions.get(taskId)!);
        }

        setDragState({
            type: 'card',
            startX: e.clientX,
            startY: e.clientY,
            initialCardPositions: initialPositions,
            draggedTaskId: taskId
        });
    };

    return (
        <div
            ref={boardRef}
            className="relative w-full h-full bg-gray-50/70 overflow-auto"
            onMouseDown={handleMouseDownOnBoard}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {activeTemplate === 'swot' && <SwotTemplate />}
            {activeTemplate === 'business' && <BusinessBoardTemplate />}

            {tasks.map(task => {
                const position = positions.get(task.id);
                if (!position) return null;
                const assignee = users.find(u => u.id === task.assigneeId);
                const colorScheme = STICKER_COLOR_MAP[task.color || 'yellow'];
                const size = cardSizes.get(task.id) || 'md';

                return (
                    <StickerCard
                        key={task.id}
                        task={task}
                        position={position}
                        assignee={assignee}
                        colorScheme={colorScheme}
                        onMouseDown={(e) => handleMouseDownOnCard(e, task.id)}
                        onDoubleClick={() => onSelectTask(task.id)}
                        size={size}
                        isSelected={selectedTaskIds.has(task.id)}
                    />
                );
            })}

            {selectionRect && (
                <div
                    className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none"
                    style={{
                        left: selectionRect.x,
                        top: selectionRect.y,
                        width: selectionRect.width,
                        height: selectionRect.height,
                    }}
                />
            )}
            
            {selectedTaskIds.size > 0 && (
                 <SelectionToolbar
                    count={selectedTaskIds.size}
                    onSizeChange={handleBulkSizeChange}
                    onDelete={handleDeleteSelected}
                    onClear={() => setSelectedTaskIds(new Set())}
                />
            )}
        </div>
    );
};
