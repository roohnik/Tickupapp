import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { PlusIcon } from './Icons';

interface ChecklistProps {
    items: ChecklistItem[];
    onUpdate: (itemId: string, completed: boolean) => void;
    onAdd: (text: string) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ items, onUpdate, onAdd }) => {
    const [newItemText, setNewItemText] = useState('');

    const completedCount = items.filter(item => item.completed).length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    const handleAdd = () => {
        if (newItemText.trim()) {
            onAdd(newItemText.trim());
            setNewItemText('');
        }
    };

    return (
        <div className="space-y-2">
            {totalCount > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}
            
            <div className="space-y-1">
                {items.map(item => (
                    <div key={item.id} className="flex items-center group">
                        <input
                            type="checkbox"
                            id={`checklist-${item.id}`}
                            checked={item.completed}
                            onChange={(e) => onUpdate(item.id, e.target.checked)}
                            className="ml-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                            htmlFor={`checklist-${item.id}`}
                            className={`flex-grow text-sm text-brand-text ${item.completed ? 'line-through text-gray-400' : ''}`}
                        >
                            {item.text}
                        </label>
                    </div>
                ))}
            </div>

            <div className="flex items-center">
                 <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="افزودن آیتم..."
                    className="flex-grow text-sm border-none bg-transparent focus:ring-0 p-1 rounded-md hover:bg-gray-200/60"
                />
                 {newItemText && (
                     <button onClick={handleAdd} className="text-sm px-2 py-1 bg-blue-500 text-white rounded-md">افزودن</button>
                 )}
            </div>
        </div>
    );
};

export default Checklist;