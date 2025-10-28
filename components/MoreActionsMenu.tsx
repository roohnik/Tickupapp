import React, { useRef, useEffect } from 'react';
import { ActivePage, NavItem } from '../types';
import { SettingsIcon, SunIcon, MoonIcon, ChatBubbleOvalLeftEllipsisIcon } from './Icons';

interface MoreActionsMenuProps {
    anchorEl: HTMLElement | null;
    isOpen: boolean;
    onClose: () => void;
    items: Extract<NavItem, { type: 'item' }>[];
    onNavigate: (page: ActivePage) => void;
    onCustomizeClick: () => void;
    onThemeToggle: () => void;
    colorTheme: 'light' | 'dark';
    onOpenConsultants: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const MoreActionsMenu: React.FC<MoreActionsMenuProps> = ({ anchorEl, isOpen, onClose, items, onNavigate, onCustomizeClick, onThemeToggle, colorTheme, onOpenConsultants }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node) && !anchorEl?.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorEl]);

    if (!isOpen || !anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const isBottomNav = anchorEl.closest('.fixed.bottom-0');
    
    const style: React.CSSProperties = {
        position: 'fixed',
        width: '256px',
        zIndex: 50,
    };

    if (isBottomNav) {
        style.bottom = `${window.innerHeight - rect.top + 8}px`;
        style.left = `${rect.left + rect.width / 2 - 128}px`; // Center above anchor
    } else { // Sidebar case
        const sidebar = anchorEl.closest('aside');
        if (sidebar) {
            const sidebarRect = sidebar.getBoundingClientRect();
            const menuWidth = 256;
            
            // Position horizontally to the left of the sidebar with a small gap
            style.left = `${sidebarRect.left - menuWidth - 8}px`;

            // Position vertically relative to the button
            const isBottomHalf = rect.top > window.innerHeight / 2;
            if (isBottomHalf) {
                // Align menu bottom with button bottom for a clean upward opening
                style.bottom = `${window.innerHeight - rect.bottom}px`;
            } else {
                // Align menu top with button top for a clean downward opening
                style.top = `${rect.top}px`;
            }
        } else {
            // Fallback for safety, opens inward from the button
            style.left = `${rect.right - 256}px`;
            style.top = `${rect.bottom + 8}px`;
        }
    }

    return (
        <div ref={menuRef} style={style} className="bg-white rounded-lg shadow-xl border z-50 animate-fade-in py-2">
            <ul>
                {items.map(item => (
                    <li key={item.id}>
                        <button onClick={() => onNavigate(item.id)} className="w-full flex items-center px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-100">
                            <item.Icon className="w-5 h-5 ml-3 text-gray-500" />
                            <span>{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
            <div className="border-t my-1"></div>
            <ul>
                <li>
                    <button onClick={onOpenConsultants} className="w-full flex items-center px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-100">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 ml-3 text-gray-500" />
                        <span>مشاوران AI</span>
                    </button>
                </li>
                <li>
                    <button onClick={onThemeToggle} className="w-full flex items-center px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-100">
                        {colorTheme === 'dark' ? <SunIcon className="w-5 h-5 ml-3 text-gray-500" /> : <MoonIcon className="w-5 h-5 ml-3 text-gray-500" />}
                        <span>{colorTheme === 'dark' ? 'حالت روز' : 'حالت شب'}</span>
                    </button>
                </li>
            </ul>
            <div className="border-t my-1"></div>
            <button onClick={onCustomizeClick} className="w-full flex items-center px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-100">
                <SettingsIcon className="w-5 h-5 ml-3 text-gray-500" />
                <span>شخصی‌سازی منو</span>
            </button>
        </div>
    );
};

export default MoreActionsMenu;