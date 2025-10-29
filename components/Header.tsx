//Use `userStore.currentUser` and `settingsStore.theme`.
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';

export const Header: React.FC = observer(() => {
  const { settingsStore, userStore } = useStore();
  
  return (
    <header className="h-16 border-b flex items-center justify-between px-4">
      <h1 className="text-xl font-bold">TickUp</h1>
      <div className="flex items-center gap-4">
        <span>{userStore.currentUser?.name || 'User'}</span>
      </div>
    </header>
  );
});

/*
// OLD HEADER IMPLEMENTATION - COMMENTED OUT FOR NEW MOBX ARCHITECTURE
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User, Objective, ActivePage, KeyResult, KRType, Notification } from '../types';
import { AIPrompts } from '../services/geminiService';
import { SparklesIcon, ThreeDotsIcon, ArrowDownIcon, SettingsIcon, TrashIcon, ArrowRightIcon, EyeIcon, ArchiveBoxIcon, BellIcon, AtSymbolIcon, CheckCircleIcon, ChatBubbleOvalLeftEllipsisIcon, GoalIcon } from './Icons';
import { toPersianDate } from '../utils/dateUtils';


interface NotificationBellProps {
  notifications: Notification[];
  onMarkRead: (notificationId: string | 'all') => void;
  onClick: (notification: Notification) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkRead, onClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIconForType = (type: Notification['type']) => {
        switch(type) {
            case 'task': return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
            case 'objective': return <GoalIcon className="w-5 h-5 text-green-500" />;
            case 'feedback': return <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-purple-500" />;
            case 'mention': return <AtSymbolIcon className="w-5 h-5 text-yellow-500" />;
            default: return <BellIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="relative">
            <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 relative">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div ref={menuRef} className="origin-top-left absolute left-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-30 animate-fade-in">
                    <div className="p-3 flex justify-between items-center border-b dark:border-slate-700">
                        <h4 className="font-semibold text-brand-text dark:text-slate-200">اعلان‌ها</h4>
                        {unreadCount > 0 && <button onClick={() => onMarkRead('all')} className="text-xs text-brand-primary dark:text-blue-400 font-semibold hover:underline">علامت‌گذاری همه به عنوان خوانده شده</button>}
                    </div>
                    <ul className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(notif => (
                            <li key={notif.id}>
                                <button onClick={() => onClick(notif)} className={`w-full text-right p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 border-b dark:border-slate-700 flex items-start space-x-3 space-x-reverse ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                                    <div className="flex-shrink-0 mt-1">{getIconForType(notif.type)}</div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm text-brand-text dark:text-slate-200">{notif.title}</p>
                                        <p className="text-xs text-brand-subtext dark:text-slate-400 mt-1">{notif.summary}</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{toPersianDate(notif.timestamp)}</p>
                                    </div>
                                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>}
                                </button>
                            </li>
                        )) : <p className="p-4 text-center text-sm text-brand-subtext dark:text-slate-400">هیچ اعلان جدیدی ندارید.</p>}
                    </ul>
                </div>
            )}
        </div>
    );
};


interface HeaderProps {
    currentUser: User;
    objectives: Objective[];
    users: User[];
    pageTitle: string;
    activePage: ActivePage;
    setActivePage: (page: ActivePage) => void;
    isListViewComfortable: boolean;
    onToggleListViewComfortable: () => void;
    onOpenArchivedModal?: () => void;
    onOpenArchivedStrategyModal?: () => void;
    dailyTargetInfo: {
        progress: number | null;
        krs: (KeyResult & { objectiveId: string })[];
        totalCurrent: number;
        totalTarget: number;
        targetType: KRType | null;
    };
    onUpdateKeyResultDetails: (objectiveId: string, krId: string, updates: Partial<KeyResult>) => void;
    aiPrompts: AIPrompts;
    onSetCardTemplate: (template: 'none' | 'business' | 'swot') => void;
    onOpenArchivedProjectsModal?: () => void;
    notifications: Notification[];
    onMarkNotificationRead: (notificationId: string | 'all') => void;
    onNotificationClick: (notification: Notification) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, objectives, users, pageTitle, activePage, setActivePage, isListViewComfortable, onToggleListViewComfortable, onOpenArchivedModal, onOpenArchivedStrategyModal, dailyTargetInfo, onUpdateKeyResultDetails, aiPrompts, onSetCardTemplate, onOpenArchivedProjectsModal, notifications, onMarkNotificationRead, onNotificationClick }) => {
    const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
    const optionsMenuRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    const { progress: dailyTargetProgress, krs: dailyTargetKRs, totalCurrent, totalTarget, targetType } = dailyTargetInfo;

    const formatValue = (value: number, type: KRType | null) => {
        if (type === null) return value.toLocaleString('fa-IR');
        switch (type) {
            case 'PERCENTAGE':
                return `${value.toFixed(1)}%`;
            case 'CURRENCY':
                return value.toLocaleString('fa-IR');
            default: // NUMBER
                return value.toLocaleString('fa-IR');
        }
    };

    const dailyTargetTitle = useMemo(() => {
        if (dailyTargetKRs.length === 1) {
            return dailyTargetKRs[0].title;
        }
        if (dailyTargetKRs.length > 1) {
            return "تارگت روزانه ترکیبی";
        }
        return "تارگت روزانه";
    }, [dailyTargetKRs]);

     const handleProgressUpdate = useCallback((clientX: number) => {
        if (!progressBarRef.current || !dailyTargetKRs || dailyTargetKRs.length === 0 || totalTarget === 0) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        // In RTL, 100% is on the right (min X), 0% is on the left (max X)
        const progressPercent = Math.max(0, Math.min(100, ((rect.right - clientX) / rect.width) * 100));

        let newTotalCurrent = (progressPercent / 100) * totalTarget;
        if (targetType === 'NUMBER') {
            newTotalCurrent = Math.round(newTotalCurrent);
        }
        
        const deltaCurrent = newTotalCurrent - totalCurrent;

        if (targetType === 'NUMBER' && Math.abs(deltaCurrent) < 1) return;
        if (targetType !== 'NUMBER' && Math.abs(deltaCurrent) < 0.01) return;
        
        const krToUpdate = dailyTargetKRs[0];
        if (!krToUpdate.dailyTarget) return;

        // Apply the delta to the first KR, ensuring it's not negative
        const newKrCurrent = Math.max(0, krToUpdate.dailyTarget.current + deltaCurrent);
        
        const updatedDailyTarget = { ...krToUpdate.dailyTarget, current: newKrCurrent };
        onUpdateKeyResultDetails(krToUpdate.objectiveId, krToUpdate.id, { dailyTarget: updatedDailyTarget });

    }, [dailyTargetKRs, onUpdateKeyResultDetails, totalCurrent, totalTarget, targetType]);

    const handlePointerMove = useCallback((event: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current) return;
        event.preventDefault();
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        handleProgressUpdate(clientX);
    }, [handleProgressUpdate]);

    const handlePointerUp = useCallback(() => {
        isDraggingRef.current = false;
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
    }, [handlePointerMove]);

    const handlePointerDown = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        isDraggingRef.current = true;
        const clientX = 'touches' in event.nativeEvent ? event.nativeEvent.touches[0].clientX : event.nativeEvent.clientX;
        handleProgressUpdate(clientX);

        window.addEventListener('mousemove', handlePointerMove, { passive: false });
        window.addEventListener('mouseup', handlePointerUp);
        window.addEventListener('touchmove', handlePointerMove, { passive: false });
        window.addEventListener('touchend', handlePointerUp);
    }, [handlePointerUp, handlePointerMove, handleProgressUpdate]);

    const handleExportWord = () => {
        alert('در حال آماده‌سازی خروجی ورد...');
        setIsOptionsMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
            setIsOptionsMenuOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showBackButtonOnMobile = activePage === 'kanban' || activePage === 'anjam';

    const renderMenuItems = () => {
        if (activePage === 'documents') {
            return (
                <>
                    <button className="w-full text-right flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                        <SettingsIcon className="w-4 h-4 ml-2 text-gray-500" />
                        تنظیمات سند
                    </button>
                    <button onClick={handleExportWord} className="w-full text-right flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                        <ArrowDownIcon className="w-4 h-4 ml-2 text-gray-500" />
                        خروجی ورد
                    </button>
                    <div className="border-t my-1"></div>
                    <button className="w-full text-right flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50" role="menuitem">
                        <TrashIcon className="w-4 h-4 ml-2" />
                        حذف سند
                    </button>
                </>
            );
        }

        if (activePage === 'dashboard') {
             return (
                <>
                    <button onClick={() => { onToggleListViewComfortable(); setIsOptionsMenuOpen(false); }} className="w-full text-right flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                        <EyeIcon className="w-4 h-4 ml-2 text-gray-500" />
                        {isListViewComfortable ? 'نمای فشرده' : 'نمای راحت'}
                    </button>
                    <button onClick={() => { onOpenArchivedModal?.(); setIsOptionsMenuOpen(false); }} className="w-full text-right flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                        <ArchiveBoxIcon className="w-4 h-4 ml-2 text-gray-500" />
                        آرشیو اهداف
                    </button>
                </>
            );
        }
        
        if (activePage === 'strategy') {
            return (
                <button onClick={() => { onOpenArchivedStrategyModal?.(); setIsOptionsMenuOpen(false); }} className="w-full text-right flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    <ArchiveBoxIcon className="w-4 h-4 ml-2 text-gray-500" />
                    آرشیو استراتژی و شاخص
                </button>
            )
        }
        
        if (activePage === 'kanban') {
            return (
                <>
                    <button onClick={() => { onOpenArchivedProjectsModal?.(); setIsOptionsMenuOpen(false); }} className="w-full text-right flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                        <ArchiveBoxIcon className="w-4 h-4 ml-2 text-gray-500" />
                        آرشیو پروژه‌ها
                    </button>
                     <div className="border-t my-1"></div>
                    <h4 className="px-4 pt-2 pb-1 text-xs text-gray-500">الگوهای کارت</h4>
                    <button onClick={() => { onSetCardTemplate('none'); setIsOptionsMenuOpen(false); }} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">پیش فرض</button>
                    <button onClick={() => { onSetCardTemplate('business'); setIsOptionsMenuOpen(false); }} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">بوم کسب و کار</button>
                    <button onClick={() => { onSetCardTemplate('swot'); setIsOptionsMenuOpen(false); }} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">تحلیل SWOT</button>
                </>
            )
        }

        return null;
    };

    return (
        <header className="flex-shrink-0 h-[61px] bg-white dark:bg-slate-800 border-b border-gray-200/80 dark:border-slate-700 z-20">
            <div className="px-4 h-full flex items-center justify-between">
                <div className="flex items-center min-w-0">
                    <button onClick={() => setActivePage('dashboard')} className="md:hidden p-2 -mr-2 text-gray-600 dark:text-gray-300">
                        <ArrowRightIcon className="w-5 h-5"/>
                    </button>
                    <h1 className="text-lg font-bold text-brand-text dark:text-slate-200 truncate">{pageTitle}</h1>
                </div>
                
                 {dailyTargetProgress !== null && activePage === 'dashboard' && (
                    <div className="hidden lg:flex items-center space-x-4 space-x-reverse w-1/3 max-w-sm">
                        <div className="text-right">
                             <p className="text-sm font-semibold text-brand-text dark:text-slate-200 truncate" title={dailyTargetTitle}>{dailyTargetTitle}</p>
                             <p className="text-xs text-brand-subtext dark:text-slate-400">
                                 {formatValue(totalCurrent, targetType)} / {formatValue(totalTarget, targetType)}
                             </p>
                        </div>
                         <div
                            ref={progressBarRef}
                            onMouseDown={handlePointerDown}
                            onTouchStart={handlePointerDown}
                            className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full cursor-pointer group"
                        >
                            <div
                                className="h-2 bg-teal-500 rounded-full relative"
                                style={{ width: `${dailyTargetProgress}%` }}
                            >
                                <div className="absolute top-1/2 -right-1 w-3 h-3 bg-white rounded-full border-2 border-teal-500 shadow transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex items-center space-x-2 space-x-reverse">
                    <NotificationBell
                        notifications={notifications}
                        onMarkRead={onMarkNotificationRead}
                        onClick={onNotificationClick}
                    />
                    <div className="relative" ref={optionsMenuRef}>
                        <button onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700">
                            <ThreeDotsIcon className="w-5 h-5" />
                        </button>
                        {isOptionsMenuOpen && (
                            <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-30 animate-fade-in" role="menu">
                                <div className="py-1" role="none">
                                    {renderMenuItems()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
*/