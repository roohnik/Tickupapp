//Use `settingsStore.activePage` and `sidebarStore.navItems` to render dynamic nav.


import React from 'react';
// FIX: Corrected import path for ActivePage type.
import { ActivePage } from '../types';
import { GoalIcon, PlusIcon, KanbanIcon, CheckCircleIcon, ThreeDotsIcon } from './Icons';

interface BottomNavBarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onAddTaskClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMoreClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isMoreMenuActive: boolean;
}

const NavButton: React.FC<{
    page: ActivePage | 'more';
    label: string;
    Icon: React.FC<any>;
    isActive: boolean;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ page, label, Icon, isActive, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center w-full h-full text-gray-500">
        <Icon className={`w-6 h-6 mb-1 transition-colors ${isActive ? 'text-brand-primary' : ''}`} />
        <span className={`text-xs transition-colors ${isActive ? 'text-brand-primary font-semibold' : ''}`}>{label}</span>
    </button>
);


const BottomNavBar: React.FC<BottomNavBarProps> = ({ activePage, setActivePage, onAddTaskClick, onMoreClick, isMoreMenuActive }) => {
    return (
        <div className="fixed bottom-0 right-0 w-full h-16 bg-white border-t border-gray-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-40 md:hidden">
            <div className="flex justify-around items-center h-full">
                {/* Right Side */}
                <NavButton page="dashboard" label="اهداف" Icon={GoalIcon} isActive={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
                <NavButton page="kanban" label="برنامه" Icon={KanbanIcon} isActive={activePage === 'kanban'} onClick={() => setActivePage('kanban')} />

                {/* Center simple create button */}
                <button 
                    onClick={onAddTaskClick}
                    data-menu-position="top"
                    className="flex flex-col items-center justify-center w-full h-full text-gray-500"
                    aria-label="ایجاد"
                >
                    <PlusIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs">ایجاد</span>
                </button>
                
                {/* Left Side */}
                <NavButton page="anjam" label="انجام" Icon={CheckCircleIcon} isActive={activePage === 'anjam'} onClick={() => setActivePage('anjam')} />
                <NavButton page="more" label="بیشتر" Icon={ThreeDotsIcon} isActive={isMoreMenuActive} onClick={onMoreClick} />
            </div>
        </div>
    );
};

export default BottomNavBar;