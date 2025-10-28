// This is a new file: components/AICreateMenu.tsx
import React, { useEffect, useRef } from 'react';
import { Form } from '../types';
import { PlusIcon, ClipboardListIcon, FolderIcon, GoalIcon, ExclamationTriangleIcon, ChatBubbleOvalLeftEllipsisIcon, RocketIcon } from './Icons';

interface AICreateMenuProps {
    isOpen: boolean;
    onClose: () => void;
    anchorEl: HTMLElement | null;
    onAddTask: () => void;
    pinnedForms: Form[];
    onSelectForm: (id: string) => void;
    onAddProject: () => void;
    onAddObjective: () => void;
}

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void, anchorRef?: React.RefObject<HTMLElement>) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node) || (anchorRef?.current && anchorRef.current.contains(event.target as Node))) {
                return;
            }
            handler();
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, anchorRef]);
};

const AICreateMenu: React.FC<AICreateMenuProps> = ({ isOpen, onClose, anchorEl, onAddTask, pinnedForms, onSelectForm, onAddProject, onAddObjective }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    useClickOutside(menuRef, onClose, { current: anchorEl });

    if (!isOpen || !anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const style: React.CSSProperties = {
        position: 'fixed',
        bottom: `${window.innerHeight - rect.top + 8}px`,
        left: `${rect.right + 8}px`,
        zIndex: 60,
    };
    
    const menuItems = [
        { label: 'ایجاد تسک جدید', Icon: PlusIcon, action: onAddTask },
        { label: 'ایجاد پروژه', Icon: FolderIcon, action: onAddProject },
        { label: 'تعریف هدف', Icon: GoalIcon, action: onAddObjective },
        { label: 'ثبت مسئله', Icon: ExclamationTriangleIcon, action: () => alert('Action: Log Issue') },
        { label: 'تصمیم‌گیری', Icon: ChatBubbleOvalLeftEllipsisIcon, action: () => alert('Action: Decision Making') },
        { label: 'تحلیل SWOT', Icon: RocketIcon, action: () => alert('Action: SWOT Analysis') },
    ];

    return (
        <div ref={menuRef} style={style} className="bg-white rounded-lg shadow-xl border w-64 animate-scale-in origin-bottom-left">
            <ul className="py-2">
                {menuItems.map(item => (
                    <li key={item.label}>
                        <button onClick={() => { item.action(); onClose(); }} className="w-full flex items-center px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-100">
                            <item.Icon className="w-5 h-5 ml-3 text-gray-500" />
                            <span>{item.label}</span>
                        </button>
                    </li>
                ))}
                 {pinnedForms.length > 0 && <li className="my-1 border-t"></li>}
                 {pinnedForms.map(form => (
                    <li key={form.id}>
                        <button onClick={() => { onSelectForm(form.id); onClose(); }} className="w-full flex items-center px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-100">
                             <ClipboardListIcon className="w-5 h-5 ml-3 text-gray-500" />
                            <span className="truncate">{form.title}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AICreateMenu;