import React from 'react';
import { Objective, User, ObjectiveCategoryId } from '../types';
import { ChevronRightIcon, TrashIcon, EditIcon, ICONS, ArchiveBoxIcon } from './Icons';
import ProgressBar from './ProgressBar';
import { OBJECTIVE_COLOR_MAP } from '../constants';

const calculateObjectiveProgress = (objective: Objective) => {
    if (!objective.keyResults || objective.keyResults.length === 0) return 0;
    const totalProgress = objective.keyResults.reduce((acc, kr) => {
        let progress = 0;
        if (kr.targetValue !== kr.startValue) {
            if (kr.targetValue < kr.startValue) { // Decreasing metric
                progress = ((kr.startValue - kr.currentValue) / (kr.startValue - kr.targetValue)) * 100;
            } else {
                progress = ((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue)) * 100;
            }
        } else if (kr.currentValue >= kr.targetValue) {
            progress = 100;
        }
        return acc + Math.max(0, Math.min(100, progress));
    }, 0);
    return totalProgress / objective.keyResults.length;
};


interface ObjectiveRowProps {
  objective: Objective;
  owner?: User;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectObjective: () => void;
  onDeleteObjective: () => void;
  onEditObjective: () => void;
  onArchiveObjective: () => void;
  categories: { [key in ObjectiveCategoryId]: { IconName: string } };
}

const ObjectiveRow: React.FC<ObjectiveRowProps> = ({ objective, owner, isExpanded, onToggleExpand, onSelectObjective, onDeleteObjective, onEditObjective, onArchiveObjective, categories }) => {
    const progress = calculateObjectiveProgress(objective);
    
    const getStatus = (p: number): { text: string, bg: string, text_color: string } => {
        if (p < 40) return { text: 'در معرض خطر', bg: 'bg-red-100 dark:bg-red-900/50', text_color: 'text-red-800 dark:text-red-200' };
        if (p < 70) return { text: 'عقب', bg: 'bg-yellow-100 dark:bg-yellow-900/50', text_color: 'text-yellow-800 dark:text-yellow-200' };
        return { text: 'در مسیر', bg: 'bg-green-100 dark:bg-green-900/50', text_color: 'text-green-800 dark:text-green-200' };
    };

    const status = getStatus(progress);

    const categoryInfo = objective.category ? categories[objective.category] : null;
    const CategoryIcon = categoryInfo ? ICONS[categoryInfo.IconName] : null;

    const colorClass = OBJECTIVE_COLOR_MAP[objective.color || 'gray']?.bg || 'bg-gray-400';

    return (
        <div className="border-b dark:border-slate-700 bg-white dark:bg-slate-800 group relative">
            <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${colorClass}`} />
            <div className="flex flex-wrap items-center text-sm p-2 md:p-0 pr-4">
                {/* Expand Button */}
                <div className="w-10 pl-2 text-center flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); onToggleExpand(); }} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700">
                        <ChevronRightIcon className={`w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                </div>

                {/* Title and Mobile Owner */}
                <div onClick={onSelectObjective} className="flex-1 py-1 md:py-3 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-slate-700/50 min-w-[150px] pr-2 flex items-center">
                     {CategoryIcon && <CategoryIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 ml-3 flex-shrink-0" />}
                     <div className="min-w-0">
                        <p className="font-semibold text-brand-text dark:text-slate-200 truncate">{objective.title}</p>
                        <div className="md:hidden flex items-center mt-1">
                            {owner && <img src={owner.avatarUrl} alt={owner.name} className="w-4 h-4 rounded-full ml-1.5" />}
                            <span className="text-xs text-brand-subtext dark:text-slate-400">{owner?.name || 'ناشناس'}</span>
                        </div>
                     </div>
                </div>

                {/* Status & Progress */}
                <div onClick={onSelectObjective} className="w-full md:w-48 px-2 py-1 md:py-3 md:px-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-slate-700/50 flex items-center flex-shrink-0">
                    <div className="w-full flex items-center">
                        <div className="flex-1 flex items-center">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.text_color}`}>{status.text}</span>
                            <span className="text-xs text-gray-500 dark:text-slate-400 mr-2">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-16">
                            <ProgressBar progress={progress} />
                        </div>
                    </div>
                </div>
                
                {/* Desktop Owner */}
                <div onClick={onSelectObjective} className="hidden md:flex w-32 px-4 py-3 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-slate-700/50 items-center flex-shrink-0">
                    {owner && (
                        <>
                            <img src={owner.avatarUrl} alt={owner.name} title={owner.name} className="w-6 h-6 rounded-full" />
                            <span className="text-xs text-brand-subtext dark:text-slate-400 mr-2 truncate">{owner.name}</span>
                        </>
                    )}
                </div>

                 {/* Action buttons */}
                <div className="w-28 px-2 flex-shrink-0 flex items-center justify-end space-x-1 space-x-reverse">
                     <button
                        onClick={(e) => { e.stopPropagation(); onEditObjective(); }}
                        className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="ویرایش هدف"
                    >
                        <EditIcon className="w-4 h-4" />
                    </button>
                     <button
                        onClick={(e) => { e.stopPropagation(); onArchiveObjective(); }}
                        className="p-2 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="آرشیو هدف"
                    >
                        <ArchiveBoxIcon className="w-4 h-4" />
                    </button>
                     <button
                        onClick={(e) => { e.stopPropagation(); onDeleteObjective(); }}
                        className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="حذف هدف"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ObjectiveRow;