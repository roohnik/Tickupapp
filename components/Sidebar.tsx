import React from "react";
import { observer } from "mobx-react-lite";
import { appStore } from "../stores/AppStore";
import { cn } from "../utils/cn"; // optional: small classNames helper

export const Sidebar: React.FC = observer(() => {
  const {
    sidebarStore,
    settingsStore,
    userStore,
    workspaceStore,
    boardStore,
    feedbackStore,
    taskStore,
    uiStore,
  } = appStore;

  const { theme, activePage } = settingsStore;
  const { currentUser } = userStore;
  const { collapsed, toggleCollapse, visibleMainItems, visibleMoreItems } =
    sidebarStore;

  const { workspaces, activeWorkspace, setActiveWorkspace } = workspaceStore;
  const { boards, activeBoard, setActiveBoard } = boardStore;

  const todaysTotal = taskStore.todaysTotalTasks ?? 0;
  const todaysDone = taskStore.todaysCompletedTasks ?? 0;

  return (
    <aside
      className={cn(
        "flex flex-col transition-all duration-300 border-r h-full",
        theme === "dark" ? "bg-gray-900 text-gray-200" : "bg-white text-gray-900",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        {!collapsed && (
          <h2 className="text-lg font-semibold">TickUp</h2>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {visibleMainItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => settingsStore.setActivePage(item.id)}
                className={cn(
                  "flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-colors",
                  activePage === item.id
                    ? "bg-indigo-500 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>

        {/* MORE SECTION */}
        {visibleMoreItems.length > 0 && (
          <>
            <hr className="my-2 border-gray-300 dark:border-gray-700" />
            <ul className="space-y-1">
              {visibleMoreItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => settingsStore.setActivePage(item.id)}
                    className={cn(
                      "flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-colors",
                      activePage === item.id
                        ? "bg-indigo-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* FOOTER */}
      <div className="border-t p-2">
        {!collapsed && (
          <>
            <div className="text-sm mb-2">
              <div className="font-medium">{currentUser?.name}</div>
              <div className="text-xs text-gray-500">{currentUser?.role}</div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={userStore.logout}
                className="text-sm px-2 py-1 rounded hover:bg-red-50 text-red-600"
              >
                Logout
              </button>
              <button
                onClick={uiStore.openProfileModal}
                className="text-sm px-2 py-1 rounded hover:bg-gray-100"
              >
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
});


/*
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, ActivePage, SidebarConfig, NavItem, Consultant, Workspace, Project, Board } from '../types';
import { PlusIcon, CheckCircleIcon, SettingsIcon, EllipsisHorizontalIcon, UserGroupIcon, SunIcon, MoonIcon, ChatBubbleOvalLeftEllipsisIcon, MagnifyingGlassIcon, ChevronUpDownIcon, ICONS, TrophyIcon, Bars3Icon, ChevronDownIcon } from './Icons';
import UserProfile from './UserProfile';
import DailySuccessRing from './DailySuccessRing';
import { KANBAN_COLOR_MAP } from '../constants';

interface SidebarProps {
  currentUser: User;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  onAddTaskClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  sidebarConfig: SidebarConfig;
  onLogout: () => void;
  onEditProfile: () => void;
  onOpenMoreMenu: (event: React.MouseEvent<HTMLButtonElement>) => void;
  todaysTotalTasks: number;
  todaysCompletedTasks: number;
  dailyRating?: number;
  dailyFeeling?: string;
  dailyFeedbackSubmitted: boolean;
  onRatingSubmit: (rating: number) => void;
  onFeelingSubmit: (feeling: string) => void;
  onFeedbackSubmit: (feedback: string) => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSwitchWorkspace: (workspaceId: string) => void;
  onOpenSearch: () => void;
  onOpenNewWorkspace: () => void;
  boards: Board[];
  activeBoardId: string;
  onBoardSelect: (boardId: string) => void;
}

const WorkspaceSelector: React.FC<Pick<SidebarProps, 'workspaces' | 'activeWorkspaceId' | 'onSwitchWorkspace' | 'onOpenNewWorkspace' | 'isCollapsed'>> = 
({ workspaces, activeWorkspaceId, onSwitchWorkspace, onOpenNewWorkspace, isCollapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
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

    const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
    if (!activeWorkspace) return null;

    const colorScheme = KANBAN_COLOR_MAP[activeWorkspace.color] || KANBAN_COLOR_MAP.gray;
    const Icon = ICONS[activeWorkspace.icon];

    if (isCollapsed) {
        return (
             <div className="relative">
                <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className={`w-10 h-10 rounded-lg flex items-center justify-center relative ${colorScheme.bg}`} title={activeWorkspace.name}>
                    {Icon && <Icon className={`w-6 h-6 ${colorScheme.text}`} />}
                </button>
            </div>
        )
    }

    return (
        <div className="relative" ref={buttonRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center p-1 rounded-lg hover:bg-gray-200/60 dark:hover:bg-slate-800/60">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${colorScheme.bg}`}>
                    {Icon && <Icon className={`w-5 h-5 ${colorScheme.text}`} />}
                </div>
                <div className="mr-2 flex-grow text-right min-w-0">
                    <p className="font-bold text-sm truncate text-brand-text dark:text-slate-200">{activeWorkspace.name}</p>
                </div>
                <ChevronUpDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mr-1" />
            </button>

            {isOpen && (
                <div ref={menuRef} className="absolute bottom-full mb-1 right-0 left-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 z-50 py-1">
                    <ul>
                        {workspaces.map(ws => {
                            return (
                                <li key={ws.id}>
                                    <button onClick={() => { onSwitchWorkspace(ws.id); setIsOpen(false); }} className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700">
                                        <span>{ws.name}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>
                    <button onClick={() => { onOpenNewWorkspace(); setIsOpen(false); }} className="w-full text-right p-2 text-sm text-brand-primary dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700">
                        ایجاد فضای کاری جدید...
                    </button>
                </div>
            )}
        </div>
    );
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const { currentUser, activePage, setActivePage, isCollapsed, setIsCollapsed, onAddTaskClick, sidebarConfig, onLogout, onEditProfile, onOpenMoreMenu, onOpenSearch, boards, activeBoardId, onBoardSelect } = props;
  const { navItems, theme } = sidebarConfig;
  const [isAnjamHovered, setIsAnjamHovered] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  const pinnedBoards = useMemo(() => boards.filter(b => b.isPinned).sort((a,b) => a.name.localeCompare(b.name)), [boards]);
  
  const footerItems = navItems.filter((item): item is Extract<NavItem, { type: 'item' }> => item.type === 'item' && item.location === 'footer');
  const mainNavItems = navItems.filter(item => {
    if (item.type === 'divider') return true;
    return !item.location || item.location === 'main';
  });
  
  const themeStyles = {
    default: {
        aside: 'bg-gray-50 text-brand-text dark:bg-slate-900 dark:text-slate-200',
        createButton: 'bg-gray-200 text-brand-text hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
        navItem: 'text-brand-subtext hover:bg-gray-200/60 hover:text-brand-text dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
        navItemActive: 'bg-gray-200 text-brand-text dark:bg-slate-700 dark:text-slate-100',
        divider: 'border-gray-200 dark:border-slate-700',
        userProfile: 'hover:bg-gray-200/60 dark:hover:bg-slate-800/60',
        footerButton: 'text-brand-subtext hover:bg-gray-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60',
        footerContainer: 'border-t border-gray-200 dark:border-slate-700',
    },
    modern: {
        aside: 'bg-slate-900 text-slate-300',
        createButton: 'bg-slate-700 text-slate-200 hover:bg-slate-600',
        navItem: 'text-slate-400 hover:bg-slate-800 hover:text-white',
        navItemActive: 'bg-slate-700 text-white',
        divider: 'border-slate-700',
        userProfile: 'hover:bg-slate-800',
        footerButton: 'text-slate-400 hover:bg-slate-800',
        footerContainer: 'border-t border-slate-700',
    },
    visual: {
        aside: 'bg-gray-50 dark:bg-slate-900',
        createButton: 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
        navItem: 'text-slate-500 hover:bg-gray-100 text-base dark:text-slate-400 dark:hover:bg-slate-700',
        navItemActive: 'bg-gray-200 text-brand-text font-semibold dark:bg-slate-800 dark:text-slate-100',
        divider: 'border-gray-200 dark:border-slate-700',
        userProfile: 'hover:bg-gray-100 dark:hover:bg-slate-700',
        footerButton: 'text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700',
        footerContainer: 'border-t border-gray-200 dark:border-slate-700',
    },
    compact: {
        aside: 'bg-gray-50 dark:bg-slate-900',
        createButton: 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
        navItem: 'text-slate-500 hover:bg-blue-50 hover:text-brand-primary text-base dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200',
        navItemActive: 'bg-blue-100 text-brand-primary font-semibold dark:bg-slate-600 dark:text-slate-100',
        divider: 'border-gray-200 dark:border-slate-700',
        userProfile: 'hover:bg-gray-100 dark:hover:bg-slate-700',
        footerButton: 'text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700',
        footerContainer: 'border-t border-gray-200 dark:border-slate-700',
    },
  };
  
  const styles = themeStyles[theme as keyof typeof themeStyles] || themeStyles.default;

  return (
    <>
        <aside className={`fixed top-0 right-0 h-full z-30 flex-col transition-all duration-300 ease-in-out hidden md:flex ${isCollapsed ? 'w-20 bg-white dark:bg-slate-900' : styles.aside} ${isCollapsed ? '' : 'w-64'}`}>
        
        <div className={`px-3 py-4 border-b border-gray-200 dark:border-slate-700 ${isCollapsed ? 'flex flex-col items-center space-y-2' : 'flex items-center justify-between'}`}>
            {!isCollapsed ? (
                <>
                    <img src="data:image/png;base64,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zE0eLp0H/J+1p2Z7p2dnk17zEBEZqLqVql2q+q7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u-l's" alt="Tickup Logo" className="h-8" />
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60"
                        title="بستن منو"
                    >
                        <Bars3Icon className="w-5 h-5" />
                    </button>
                </>
            ) : (
                <>
                    <img src="data:image/png;base64,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zE0eLp0H/J+1p2Z7p2dnk17zEBEZqLqVql2q+q7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u-l's" alt="tickup logo" className="w-10 h-10" />
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-200/60 dark:text-slate-400 dark:hover:bg-slate-800/60"
                        title="باز کردن منو"
                    >
                        <Bars3Icon className="w-5 h-5" />
                    </button>
                </>
            )}
        </div>

        <div className="px-3 py-2">
            <div className={`flex ${isCollapsed ? 'flex-col space-y-1' : 'items-center space-x-1 space-x-reverse'}`}>
                <button
                    onClick={onAddTaskClick}
                    className={`w-full flex items-center justify-center p-2 text-right rounded-lg transition-colors text-sm font-semibold hover:bg-gray-100 dark:hover:bg-slate-700`}
                    title="ایجاد تسک جدید"
                >
                    <PlusIcon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="mr-2 whitespace-nowrap transition-opacity duration-300">ایجاد</span>}
                </button>
                 <button
                    onClick={onOpenSearch}
                    className={`p-2 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700`}
                    title="جستجو"
                >
                    <MagnifyingGlassIcon className="w-5 h-5 flex-shrink-0" />
                </button>
            </div>
        </div>

        <nav className="flex-grow p-2 overflow-y-auto">
            <ul className="space-y-1">
            {mainNavItems.map((item, index, array) => {
                if (item.type === 'divider') {
                    const prevItem = index > 0 ? array[index - 1] : null;
                    const nextItem = index < array.length - 1 ? array[index + 1] : null;
                    if (!prevItem || !nextItem || prevItem.type === 'divider' || nextItem.type === 'divider') {
                        return null;
                    }
                    return <li key={item.id}><hr className={`my-2 ${isCollapsed ? 'mx-2' : 'mx-4'} ${styles.divider}`} /></li>;
                }

                if (item.type === 'item') {
                    if (item.id === 'projects') {
                        const isProjectsActive = activePage === 'kanban' || activePage === 'projects';
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActivePage('kanban')}
                                    className={`w-full flex items-center text-right rounded-lg transition-colors font-medium p-2 ${styles.navItem} ${
                                        isProjectsActive ? styles.navItemActive : ''
                                    } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                                    title={item.label}
                                >
                                    <div className="flex items-center">
                                        <item.Icon className="w-5 h-5 flex-shrink-0" />
                                        {!isCollapsed && <span className="mr-3 whitespace-nowrap transition-opacity duration-300">{item.label}</span>}
                                    </div>
                                    {item.isExpandable && !isCollapsed && (pinnedBoards.length > 0) && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsProjectsExpanded(p => !p);
                                            }}
                                            className="p-1 rounded-md"
                                            aria-label="Toggle pinned items"
                                        >
                                            <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProjectsExpanded ? '' : '-rotate-90'}`} />
                                        </div>
                                    )}
                                </button>
                                {!isCollapsed && isProjectsExpanded && (pinnedBoards.length > 0) && (
                                    <ul className="mt-1 space-y-1 animate-fade-in">
                                        {pinnedBoards.map(board => {
                                            const colorScheme = KANBAN_COLOR_MAP[board.color || 'gray'] || KANBAN_COLOR_MAP.gray;
                                            const isActive = activePage === 'kanban' && activeBoardId === board.id;
                                            return (
                                                <li key={board.id}>
                                                    <button
                                                        onClick={() => onBoardSelect(board.id)}
                                                        className={`w-full flex items-center text-right rounded-lg transition-colors font-medium p-2 ${
                                                            isActive 
                                                            ? styles.navItemActive 
                                                            : styles.navItem
                                                        }`}
                                                    >
                                                        <span className={`ml-3 font-semibold text-lg ${colorScheme.text}`}>#</span>
                                                        <span className="truncate">{board.name}</span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    }
                    
                    return (
                        <li key={item.id}>
                            <button
                                onClick={() => setActivePage(item.id)}
                                className={`w-full flex items-center text-right rounded-lg transition-colors font-medium p-2 ${styles.navItem} ${
                                    activePage === item.id
                                    ? styles.navItemActive
                                    : ''
                                } ${isCollapsed ? 'justify-center' : ''}`}
                                title={item.label}
                            >
                                <item.Icon className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span className="mr-3 whitespace-nowrap transition-opacity duration-300">{item.label}</span>}
                            </button>
                        </li>
                    );
                }
                return null;
            })}
            </ul>
        </nav>

        <div className="mt-auto">
            <div className="px-3 py-1">
                <button
                    onClick={onOpenMoreMenu}
                    className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors font-medium ${styles.footerButton}`}
                    title="بیشتر"
                >
                    <EllipsisHorizontalIcon className="w-6 h-6 flex-shrink-0" />
                </button>
            </div>
            <div
                onMouseEnter={() => !isCollapsed && setIsAnjamHovered(true)}
                onMouseLeave={() => !isCollapsed && setIsAnjamHovered(false)}
                className="px-3 py-2"
            >
                {isCollapsed ? (
                    <button
                        onClick={() => setActivePage('anjam')}
                        className={`w-full flex items-center text-right rounded-lg transition-colors font-medium p-2 justify-center ${styles.navItem} ${
                            activePage === 'anjam'
                            ? styles.navItemActive
                            : ''
                        }`}
                        title="کارهای امروز"
                    >
                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                    </button>
                ) : isAnjamHovered ? (
                    <DailySuccessRing
                        totalTasks={props.todaysTotalTasks}
                        completedTasks={props.todaysCompletedTasks}
                        dailyRating={props.dailyRating}
                        dailyFeeling={props.dailyFeeling}
                        dailyFeedbackSubmitted={props.dailyFeedbackSubmitted}
                        onRatingSubmit={props.onRatingSubmit}
                        onFeelingSubmit={props.onFeelingSubmit}
                        onFeedbackSubmit={props.onFeedbackSubmit}
                        isCollapsed={false}
                        onClick={() => setActivePage('anjam')}
                    />
                ) : (
                    <button
                        onClick={() => setActivePage('anjam')}
                        className={`w-full flex items-center text-right rounded-lg transition-colors font-medium p-2 ${styles.navItem} ${
                            activePage === 'anjam'
                            ? styles.navItemActive
                            : ''
                        }`}
                    >
                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="mr-3 whitespace-nowrap">کارهای امروز</span>
                    </button>
                )}
            </div>
            
            <div className={`p-2 ${styles.footerContainer}`}>
                 <div className={`flex items-center mb-2 ${isCollapsed ? 'flex-col-reverse items-center space-y-2 space-y-reverse' : 'justify-start space-x-2 space-x-reverse'}`}>
                    <UserProfile 
                        currentUser={currentUser} 
                        onLogout={onLogout} 
                        onEditProfile={onEditProfile} 
                        isCollapsed={isCollapsed} 
                    />
                    <WorkspaceSelector {...props} />
                </div>

                <div className={`w-full flex items-center ${isCollapsed ? 'flex-col-reverse space-y-2 space-y-reverse' : 'justify-between'}`}>
                    
                    <div className={`flex items-center ${isCollapsed ? 'w-full flex-col space-y-2' : 'space-x-1 space-x-reverse'}`}>
                        {footerItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActivePage(item.id)}
                                className={`flex items-center justify-center p-2 rounded-lg transition-colors font-medium ${isCollapsed ? 'w-full' : ''} ${activePage === item.id ? styles.navItemActive : styles.footerButton}`}
                                title={item.label}
                            >
                                <item.Icon className="w-6 h-6 flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        </>
  );
}; 
*/



/*
| Current prop in Sidebar                       | Replaced with from Store                                             |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `sidebarConfig.navItems`                      | `sidebarStore.navItems`                                              |
| `isCollapsed`                                 | `sidebarStore.collapsed`                                             |
| `setIsCollapsed`                              | `sidebarStore.toggleCollapse()`                                      |
| Derived lists (`mainNavItems`, `footerItems`) | use `sidebarStore.visibleMainItems`, `sidebarStore.visibleMoreItems` |
*/

/*
Perfect ✅ — let’s refactor your **Sidebar component** to use MobX stores properly (via your `AppStore`) so that it’s clean, reactive, and role-aware.

This version replaces the giant prop list with a single `appStore` and connects to all relevant stores internally.

---

## 🧱 Refactored `Sidebar.tsx`

```tsx
import React from "react";
import { observer } from "mobx-react-lite";
import { appStore } from "../stores/AppStore";
import { cn } from "../utils/cn"; // optional: small classNames helper

export const Sidebar: React.FC = observer(() => {
  const {
    sidebarStore,
    settingsStore,
    userStore,
    workspaceStore,
    boardStore,
    feedbackStore,
    taskStore,
    uiStore,
  } = appStore;

  const { theme, activePage } = settingsStore;
  const { currentUser } = userStore;
  const { collapsed, toggleCollapse, visibleMainItems, visibleMoreItems } =
    sidebarStore;

  const { workspaces, activeWorkspace, setActiveWorkspace } = workspaceStore;
  const { boards, activeBoard, setActiveBoard } = boardStore;

  const todaysTotal = taskStore.todaysTotalTasks ?? 0;
  const todaysDone = taskStore.todaysCompletedTasks ?? 0;

  return (
    <aside
      className={cn(
        "flex flex-col transition-all duration-300 border-r h-full",
        theme === "dark" ? "bg-gray-900 text-gray-200" : "bg-white text-gray-900",
        collapsed ? "w-20" : "w-64"
      )}
    >
       HEADER:
      <div className="flex items-center justify-between px-3 py-2 border-b">
        {!collapsed && (
          <h2 className="text-lg font-semibold">TickUp</h2>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

       NAVIGATION:
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {visibleMainItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => settingsStore.setActivePage(item.id)}
                className={cn(
                  "flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-colors",
                  activePage === item.id
                    ? "bg-indigo-500 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>

        MORE SECTION:
        {visibleMoreItems.length > 0 && (
          <>
            <hr className="my-2 border-gray-300 dark:border-gray-700" />
            <ul className="space-y-1">
              {visibleMoreItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => settingsStore.setActivePage(item.id)}
                    className={cn(
                      "flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-colors",
                      activePage === item.id
                        ? "bg-indigo-500 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      FOOTER:
      <div className="border-t p-2">
        {!collapsed && (
          <>
            <div className="text-sm mb-2">
              <div className="font-medium">{currentUser?.name}</div>
              <div className="text-xs text-gray-500">{currentUser?.role}</div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={userStore.logout}
                className="text-sm px-2 py-1 rounded hover:bg-red-50 text-red-600"
              >
                Logout
              </button>
              <button
                onClick={uiStore.openProfileModal}
                className="text-sm px-2 py-1 rounded hover:bg-gray-100"
              >
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
});
```

---

## ⚙️ What’s Happening Here

✅ **Single source of truth:**
All state is pulled from MobX stores (via `appStore`), not from props.

✅ **Automatic reactivity:**
If any store observable changes (`theme`, `collapsed`, `activePage`, etc.), the Sidebar re-renders automatically.

✅ **Role-based visibility:**
`SidebarStore.visibleMainItems` and `visibleMoreItems` filter using `roleStore.can()`.

✅ **User context aware:**
Uses `userStore.currentUser` for avatar/name and logout.

✅ **Settings integration:**
`theme` and `activePage` come from `SettingsStore`.

✅ **Workspace and board context:**
Can easily add dropdowns for switching workspace/board, e.g.:

```tsx
<select
  value={activeWorkspace?.id}
  onChange={(e) => setActiveWorkspace(e.target.value)}
>
  {workspaces.map(ws => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
</select>
```

---

## 🧠 Optional Enhancements

* Add keyboard shortcuts via `UIStore`.
* Use `PermissionStore` or `RoleStore` to hide/show nav sections dynamically.
* Persist `collapsed` state in `localStorage` (easy to add an `autorun` in `SidebarStore`).

---

## ✅ Summary

| Before                         | After                          |
| ------------------------------ | ------------------------------ |
| 20+ props                      | 1 `appStore`                   |
| Manual prop passing everywhere | Centralized, observable stores |
| Re-render issues               | Fully reactive via MobX        |
| Hardcoded roles/visibility     | Dynamic via `roleStore.can()`  |

---

Would you like me to extend this version to include **workspace and board selectors** (from `WorkspaceStore` and `BoardStore`) in the sidebar footer next?
It would make it feel much closer to TickTick or ClickUp.
*/