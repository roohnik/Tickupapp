import React, { useRef, useEffect } from 'react';
import { Consultant } from '../types';
import { SparklesIcon } from './Icons';

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


const AIAvatar: React.FC<{ consultant: Consultant; sizeClass: string; className?: string }> = ({ consultant, sizeClass, className }) => (
    <div className={`rounded-full flex-shrink-0 flex items-center justify-center ${sizeClass} ${className}`} style={{ backgroundColor: consultant.color, border: '2px solid rgba(255,255,255,0.5)' }}>
        <SparklesIcon className="w-3/5 h-3/5 text-white" />
    </div>
);

interface ConsultantPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    anchorEl: HTMLElement | null;
    consultants: Consultant[];
    onSelect: (consultant: Consultant) => void;
}

const ConsultantPopover: React.FC<ConsultantPopoverProps> = ({ isOpen, onClose, anchorEl, consultants, onSelect }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    useClickOutside(popoverRef, onClose, { current: anchorEl });
    
    if (!isOpen || !anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const popoverWidth = 240; // More minimal width
    
    const style: React.CSSProperties = {
        position: 'fixed',
        width: `${popoverWidth}px`,
        zIndex: 50,
        // Position it 8px above the anchor element
        bottom: `${window.innerHeight - rect.top + 8}px`,
        // Align the right edge of the popover with the right edge of the anchor element
        right: `${window.innerWidth - rect.right}px`,
    };

    return (
        <div ref={popoverRef} style={style} className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 z-50 animate-fade-in">
            <h4 className="px-3 pt-3 pb-1 text-sm font-semibold text-gray-600 dark:text-slate-300">مشاوران هوش مصنوعی</h4>
            <ul className="py-1">
                {consultants.map(consultant => (
                    <li key={consultant.id}>
                        <button onClick={() => onSelect(consultant)} className="w-full flex items-center px-3 py-2 text-right text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700">
                            <AIAvatar consultant={consultant} sizeClass="w-8 h-8" className="ml-3" />
                            <div className="text-right">
                                <span className="font-semibold">{consultant.name}</span>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{consultant.specialty}</p>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConsultantPopover;