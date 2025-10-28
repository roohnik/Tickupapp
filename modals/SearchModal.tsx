import React, { useState, useEffect, useMemo } from 'react';
import { Task, Objective, Project, Document } from '../types';
import FullScreenModal from './FullScreenModal';
import { MagnifyingGlassIcon, ICONS } from '../components/Icons';

type SearchResultItem = (Task | Objective | Project | Document) & { itemType: 'task' | 'objective' | 'project' | 'document' };

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    objectives: Objective[];
    projects: Project[];
    documents: Document[];
    onNavigate: (item: SearchResultItem) => void;
}

const SearchResultGroup: React.FC<{
    title: string;
    Icon: React.FC<any>;
    items: SearchResultItem[];
    onNavigate: (item: SearchResultItem) => void;
}> = ({ title, Icon, items, onNavigate }) => (
    <div>
        <h3 className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            <Icon className="w-4 h-4 mr-2" />
            {title}
        </h3>
        <ul>
            {items.map(item => (
                <li key={`${item.itemType}-${item.id}`}>
                    <button onClick={() => onNavigate(item)} className="w-full text-right p-4 flex items-center hover:bg-gray-100/50 dark:hover:bg-slate-700/50 rounded-lg">
                        <div className="flex-grow">
                            <p className="font-semibold text-brand-text dark:text-slate-200">
                                {item.itemType === 'document' || item.itemType === 'objective' ? item.title : (item as Task).content}
                            </p>
                            {(item.itemType === 'task' || item.itemType === 'objective') &&
                                <p className="text-sm text-brand-subtext dark:text-slate-400">{item.itemType === 'task' ? 'وظیفه' : 'هدف'}</p>
                            }
                        </div>
                    </button>
                </li>
            ))}
        </ul>
    </div>
);

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, tasks, objectives, projects, documents, onNavigate }) => {
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
        }
    }, [isOpen]);

    const searchResults = useMemo(() => {
        if (!query.trim()) {
            return {
                tasks: [],
                objectives: [],
                projects: [],
                documents: [],
            };
        }

        const lowerCaseQuery = query.toLowerCase();

        const filteredTasks = tasks
            .filter(t => t.content.toLowerCase().includes(lowerCaseQuery))
            .map(t => ({ ...t, itemType: 'task' as const }));

        const filteredObjectives = objectives
            .filter(o => o.title.toLowerCase().includes(lowerCaseQuery))
            .map(o => ({ ...o, itemType: 'objective' as const }));

        const filteredProjects = projects
            .filter(p => p.name.toLowerCase().includes(lowerCaseQuery))
            .map(p => ({ ...p, itemType: 'project' as const }));

        const filteredDocuments = documents
            .filter(d => d.title.toLowerCase().includes(lowerCaseQuery))
            .map(d => ({ ...d, itemType: 'document' as const }));

        return {
            tasks: filteredTasks,
            objectives: filteredObjectives,
            projects: filteredProjects,
            documents: filteredDocuments,
        };
    }, [query, tasks, objectives, projects, documents]);

    return (
        <FullScreenModal isOpen={isOpen} onClose={onClose}>
            <div className="max-w-2xl mx-auto w-full pt-8 md:pt-20">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="جستجو در همه چیز..."
                        className="w-full bg-white/80 dark:bg-slate-700/80 border-2 border-gray-200 dark:border-slate-600 rounded-xl py-4 pr-14 pl-6 text-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent shadow-lg"
                        autoFocus
                    />
                </div>

                {query.trim() && (
                    <div className="mt-8 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {searchResults.tasks.length > 0 && <SearchResultGroup title="وظایف" Icon={ICONS.ClipboardListIcon} items={searchResults.tasks} onNavigate={onNavigate} />}
                        {searchResults.objectives.length > 0 && <SearchResultGroup title="اهداف" Icon={ICONS.GoalIcon} items={searchResults.objectives} onNavigate={onNavigate} />}
                        {searchResults.projects.length > 0 && <SearchResultGroup title="پروژه‌ها" Icon={ICONS.FolderIcon} items={searchResults.projects} onNavigate={onNavigate} />}
                        {searchResults.documents.length > 0 && <SearchResultGroup title="دستورالعمل‌ها" Icon={ICONS.DocumentTextIcon} items={searchResults.documents} onNavigate={onNavigate} />}
                    </div>
                )}
            </div>
        </FullScreenModal>
    );
};

export default SearchModal;