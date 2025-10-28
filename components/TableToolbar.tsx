import React, { useEffect, useRef, useState } from 'react';
import { TABLE_BACKGROUND_COLOR_OPTIONS, TABLE_COLOR_MAP, TEXT_COLOR_MAP, TEXT_COLOR_OPTIONS } from '../constants';
import { ColorPaletteIcon, ArrowLeftIcon, ArrowRightIcon, ClipboardCopyIcon, XCircleIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';

interface TableActionMenuProps {
  targetElement: HTMLElement;
  type: 'row' | 'col';
  onAction: (action: string) => void;
  onClose: () => void;
}

// FIX: Define props interface for ColorButton
interface ColorButtonProps {
    color: string;
    type: 'text' | 'bg';
    onClick: () => void;
}

const TableActionMenu: React.FC<TableActionMenuProps> = ({ targetElement, type, onAction, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<'color' | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node) && !targetElement.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, targetElement]);

  const rect = targetElement.getBoundingClientRect();
  const style = {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.right + 8}px`,
  } as React.CSSProperties;

  const MainMenu = () => (
    <>
      <div className="px-3 pb-2">
        <input type="text" placeholder="جستجوی عملکرد..." className="w-full text-sm p-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400"/>
      </div>
      <MenuItem icon={ColorPaletteIcon} label="رنگ" onClick={() => setActiveSubMenu('color')} hasMore />
      {type === 'col' && (
        <>
            <MenuItem icon={ArrowLeftIcon} label="درج ستون چپ" onClick={() => onAction('insert_left')} />
            <MenuItem icon={ArrowRightIcon} label="درج ستون راست" onClick={() => onAction('insert_right')} />
        </>
      )}
      {type === 'row' && (
        <>
            <MenuItem icon={ArrowUpIcon} label="درج سطر بالا" onClick={() => onAction('insert_above')} />
            <MenuItem icon={ArrowDownIcon} label="درج سطر پایین" onClick={() => onAction('insert_below')} />
        </>
      )}
      <MenuItem icon={ClipboardCopyIcon} label="کپی" shortcut="Ctrl+D" onClick={() => onAction('duplicate')} />
      <MenuItem icon={XCircleIcon} label="پاک کردن محتوا" onClick={() => onAction('clear_contents')} />
      <div className="border-t my-1"></div>
      <MenuItem icon={TrashIcon} label={`حذف ${type === 'row' ? 'سطر' : 'ستون'}`} onClick={() => onAction('delete')} />
      <MenuItem icon={TrashIcon} label="حذف کل جدول" onClick={() => onAction('delete_table')} />
    </>
  );
  
  // FIX: Explicitly type ColorButton as a React.FC to allow special props like 'key'.
  const ColorButton: React.FC<ColorButtonProps> = ({ color, type, onClick }) => {
      const isDefault = color === 'default';
      const colorClass = isDefault ? 'bg-transparent border-gray-300' : (type === 'bg' ? TABLE_COLOR_MAP[color].bg : '');

      return (
          <button onClick={onClick} className={`w-full h-8 rounded-md flex items-center justify-center ${colorClass} hover:ring-2 hover:ring-blue-400`}>
              {isDefault && <div className="w-5 h-5 rounded-full bg-red-500 bg-clip-content" style={{backgroundImage: 'linear-gradient(to top right, transparent calc(50% - 1px), #f00, transparent calc(50% + 1px))'}}></div>}
              {type === 'text' && !isDefault && <div className={`font-bold text-lg ${TEXT_COLOR_MAP[color].text}`}>A</div>}
          </button>
      );
  }

  const ColorMenu = () => (
     <div className="w-64">
        <div className="flex items-center p-2 border-b">
            <button onClick={() => setActiveSubMenu(null)} className="p-1 rounded-full hover:bg-gray-100">
                <ChevronLeftIcon className="w-5 h-5 text-gray-600"/>
            </button>
            <span className="text-sm font-semibold text-gray-700 mr-2">رنگ</span>
        </div>
        <div className="p-2">
            <h4 className="text-xs text-gray-500 font-semibold px-1 py-1">رنگ نوشته</h4>
             <div className="grid grid-cols-5 gap-1 p-1">
                 <ColorButton color="default" type="text" onClick={() => onAction('text_color:')}/>
                {TEXT_COLOR_OPTIONS.map(color => <ColorButton key={color} color={color} type="text" onClick={() => onAction(`text_color:${color}`)} />)}
            </div>
        </div>
         <div className="p-2 border-t">
            <h4 className="text-xs text-gray-500 font-semibold px-1 py-1">رنگ پس‌زمینه</h4>
             <div className="grid grid-cols-5 gap-1 p-1">
                 <ColorButton color="default" type="bg" onClick={() => onAction('bg_color:')}/>
                {TABLE_BACKGROUND_COLOR_OPTIONS.map(color => <ColorButton key={color} color={color} type="bg" onClick={() => onAction(`bg_color:${color}`)} />)}
            </div>
        </div>
    </div>
  );
  
  const MenuItem = ({ icon: Icon, label, shortcut, onClick, hasMore }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between text-sm p-2 rounded-md text-gray-800 hover:bg-gray-100">
        <div className="flex items-center">
            <Icon className="w-4 h-4 text-gray-500 ml-3" />
            <span>{label}</span>
        </div>
        <div className="flex items-center">
            {shortcut && <span className="text-xs text-gray-400">{shortcut}</span>}
            {hasMore && <ChevronRightIcon className="w-4 h-4 text-gray-400 mr-1" />}
        </div>
    </button>
  );

  return (
    <div
      ref={ref}
      style={style}
      className="bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-1"
      onClick={e => e.stopPropagation()}
    >
        {activeSubMenu === 'color' ? <ColorMenu /> : <MainMenu />}
    </div>
  );
};

export default TableActionMenu;
