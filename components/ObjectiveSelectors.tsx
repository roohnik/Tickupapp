// components/ObjectiveSelectors.tsx
import React, { useState, useEffect, useRef } from 'react';
import { User, Index, ObjectiveCategoryId, Objective } from '../types';
import { ICONS, ChevronDownIcon, CheckCircleIcon, Squares2x2Icon } from './Icons';
import { OBJECTIVE_CATEGORIES, OBJECTIVE_CATEGORY_LIST } from '../constants';

// Custom hook for detecting outside clicks
export const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
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
  }, [ref, handler]);
};

// Custom User Selector Component
export const UserSelector: React.FC<{
    users: User[];
    selectedUserId: string;
    onChange: (userId: string) => void;
}> = ({ users, selectedUserId, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, () => setIsOpen(false));

    const selectedUser = users.find(u => u.id === selectedUserId);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-right p-2 rounded-lg hover:bg-gray-100"
            >
                {selectedUser ? (
                    <div className="flex items-center">
                        <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-6 h-6 rounded-full ml-2" />
                        <span className="font-medium text-brand-text">{selectedUser.name}</span>
                    </div>
                ) : (
                    <span>انتخاب مالک</span>
                )}
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border z-10 max-h-60 overflow-y-auto">
                    {users.map(user => (
                        <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                                onChange(user.id);
                                setIsOpen(false);
                            }}
                            className="w-full text-right flex items-center p-2 hover:bg-gray-100"
                        >
                            <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full ml-2" />
                            <span className="flex-grow">{user.name}</span>
                            {selectedUserId === user.id && <CheckCircleIcon className="w-5 h-5 text-brand-primary" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Custom Index Multi-Selector Component
export const IndexSelector: React.FC<{
    indices: Index[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}> = ({ indices, selectedIds, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, () => setIsOpen(false));
    
    const selectedIndices = indices.filter(i => selectedIds.includes(i.id));

    const toggleSelection = (indexId: string) => {
        if (selectedIds.includes(indexId)) {
            onChange(selectedIds.filter(id => id !== indexId));
        } else {
            onChange([...selectedIds, indexId]);
        }
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-right p-2 rounded-lg hover:bg-gray-100 min-h-[44px]"
            >
                <div className="flex flex-wrap gap-1">
                    {selectedIndices.length > 0 ? (
                        selectedIndices.map(index => (
                            <span key={index.id} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{index.name}</span>
                        ))
                    ) : (
                        <span className="text-gray-500">انتخاب شاخص‌ها...</span>
                    )}
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border z-10 max-h-60 overflow-y-auto">
                    {indices.map(index => (
                        <label key={index.id} className="w-full text-right flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(index.id)}
                                onChange={() => toggleSelection(index.id)}
                                className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary ml-3"
                            />
                            <span className="flex-grow">{index.name} <span className="text-xs text-gray-500">({index.category})</span></span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export const CategorySelector: React.FC<{
    selected: ObjectiveCategoryId | undefined,
    onSelect: (id: ObjectiveCategoryId) => void
}> = ({ selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, () => setIsOpen(false));

    const selectedCategory = selected ? OBJECTIVE_CATEGORIES[selected] : null;
    const Icon = selectedCategory ? ICONS[selectedCategory.IconName] : Squares2x2Icon;

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-right p-2 rounded-lg hover:bg-gray-100 min-h-[44px] border border-gray-200"
            >
                <div className="flex items-center">
                    <Icon className={`w-5 h-5 ml-2 ${selectedCategory ? 'text-brand-text' : 'text-gray-400'}`} />
                    <span className={selectedCategory ? 'font-medium text-brand-text' : 'text-gray-500'}>
                        {selectedCategory?.label || 'انتخاب دسته‌بندی...'}
                    </span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border z-10 max-h-60 overflow-y-auto">
                    {OBJECTIVE_CATEGORY_LIST.map(cat => {
                        const CatIcon = ICONS[cat.IconName];
                        return (
                             <button
                                key={cat.id}
                                type="button"
                                onClick={() => { onSelect(cat.id); setIsOpen(false); }}
                                className="w-full text-right flex items-center p-2 hover:bg-gray-100"
                            >
                                <CatIcon className="w-5 h-5 text-gray-500 ml-2" />
                                <span className="flex-grow">{cat.label}</span>
                                {selected === cat.id && <CheckCircleIcon className="w-5 h-5 text-brand-primary" />}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

// Helper function to find all descendants of an objective
const getDescendantIds = (objectiveId: string, allObjectives: Objective[]): string[] => {
    let descendants: string[] = [];
    const children = allObjectives.filter(o => o.parentId === objectiveId);
    for (const child of children) {
        descendants.push(child.id);
        descendants = descendants.concat(getDescendantIds(child.id, allObjectives));
    }
    return descendants;
};


export const ParentObjectiveSelector: React.FC<{
    objectives: Objective[];
    currentObjectiveId?: string;
    selectedParentId: string | undefined;
    onChange: (parentId: string | undefined) => void;
}> = ({ objectives, currentObjectiveId, selectedParentId, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, () => setIsOpen(false));

    const selectedParent = objectives.find(o => o.id === selectedParentId);
    
    // Filter out the current objective and its descendants to prevent circular dependencies
    const invalidIds = currentObjectiveId ? [currentObjectiveId, ...getDescendantIds(currentObjectiveId, objectives)] : [];
    const availableParents = objectives.filter(o => !invalidIds.includes(o.id));

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-right p-2 rounded-lg hover:bg-gray-100 min-h-[44px] border border-gray-200"
            >
                <div className="flex items-center">
                    {selectedParent ? (
                        <span className="font-medium text-brand-text">{selectedParent.title}</span>
                    ) : (
                        <span className="text-gray-500">بدون هدف بالادستی...</span>
                    )}
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border z-10 max-h-60 overflow-y-auto">
                    <button
                        type="button"
                        onClick={() => { onChange(undefined); setIsOpen(false); }}
                        className="w-full text-right p-2 hover:bg-gray-100 text-gray-500"
                    >
                        بدون هدف بالادستی
                    </button>
                    {availableParents.map(obj => (
                        <button
                            key={obj.id}
                            type="button"
                            onClick={() => { onChange(obj.id); setIsOpen(false); }}
                            className="w-full text-right flex items-center justify-between p-2 hover:bg-gray-100"
                        >
                            <span className="truncate">{obj.title}</span>
                            {selectedParentId === obj.id && <CheckCircleIcon className="w-5 h-5 text-brand-primary" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};