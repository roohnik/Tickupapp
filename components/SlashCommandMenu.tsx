import React, { useState, useEffect, useRef } from 'react';
import { DocumentBlockType } from '../types';
import { Heading1Icon, ParagraphIcon, TableCellsIcon, ChecklistIcon, NumberedListIcon, PhotoIcon, PaperClipIcon, CalendarIcon, AtSymbolIcon, CheckCircleIcon, DocumentTextIcon } from './Icons';

interface SlashCommandMenuProps {
  position: { top: number; left: number };
  query: string;
  onSelect: (type: DocumentBlockType) => void;
  onClose: () => void;
}

const COMMANDS: { type: DocumentBlockType; label: string; Icon: React.FC<any> }[] = [
  { type: 'paragraph', label: 'متن', Icon: ParagraphIcon },
  { type: 'heading1', label: 'سربرگ ۱', Icon: Heading1Icon },
  { type: 'table', label: 'جدول', Icon: TableCellsIcon },
  { type: 'checklist', label: 'چک‌لیست', Icon: ChecklistIcon },
  { type: 'numberedList', label: 'لیست شماره‌دار', Icon: NumberedListIcon },
  { type: 'image', label: 'عکس', Icon: PhotoIcon },
  { type: 'file', label: 'فایل', Icon: PaperClipIcon },
  { type: 'date', label: 'تاریخ', Icon: CalendarIcon },
  { type: 'mention', label: 'منشن کاربر', Icon: AtSymbolIcon },
  { type: 'taskLink', label: 'لینک تسک', Icon: CheckCircleIcon },
  { type: 'formLink', label: 'لینک فرم', Icon: DocumentTextIcon },
];

const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({ position, query, onSelect, onClose }) => {
  const [filteredCommands, setFilteredCommands] = useState(COMMANDS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const searchQuery = query.startsWith('/') ? query.substring(1).toLowerCase() : '';
    const newFilteredCommands = COMMANDS.filter(command =>
      command.label.toLowerCase().includes(searchQuery)
    );
    setFilteredCommands(newFilteredCommands);
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if(filteredCommands[selectedIndex]) {
            onSelect(filteredCommands[selectedIndex].type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onSelect, onClose, filteredCommands]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ top: position.top, left: position.left }}
      className="fixed w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50 p-2 max-h-80 overflow-y-auto"
      aria-label="دستورات بلوک"
      role="menu"
    >
      <div className="font-semibold text-xs text-gray-500 px-2 pb-1">بلوک‌ها</div>
      <ul>
        {filteredCommands.map((command, index) => (
          <li key={command.type}>
            <button
              onClick={() => onSelect(command.type)}
              className={`w-full flex items-center text-right p-2 rounded-md text-sm ${
                selectedIndex === index ? 'bg-gray-100' : ''
              }`}
              role="menuitem"
            >
              <command.Icon className="w-5 h-5 ml-3 text-gray-800" />
              <span>{command.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SlashCommandMenu;