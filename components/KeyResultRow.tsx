import React, { useState, useEffect } from 'react';
import { KeyResult, User, KRCategory, DailyTarget } from '../types';
import ProgressBar from './ProgressBar';
import { TrashIcon, EditIcon, ArchiveBoxIcon } from './Icons';

interface KeyResultRowProps {
  kr: KeyResult;
  owner?: User;
  onSelect: () => void;
  onUpdateKR: (updates: Partial<KeyResult>) => void;
  onDelete: () => void;
  onEdit: () => void;
  onArchive: () => void;
  isCompact?: boolean;
  objectiveTitle?: string;
}

const KeyResultRow: React.FC<KeyResultRowProps> = ({ kr, owner, onSelect, onUpdateKR, onDelete, onEdit, onArchive, isCompact = false, objectiveTitle }) => {
  const [dailyCurrentValue, setDailyCurrentValue] = useState(kr.dailyTarget?.current || 0);

  useEffect(() => {
    setDailyCurrentValue(kr.dailyTarget?.current || 0);
  }, [kr.dailyTarget]);

  const handleDailyUpdate = () => {
    if (kr.dailyTarget) {
      const updatedDailyTarget = { ...kr.dailyTarget, current: dailyCurrentValue };
      onUpdateKR({ dailyTarget: updatedDailyTarget });
    }
  };
  
  const formatDailyTargetProgress = (dailyTarget: DailyTarget) => {
    const { current, target, type } = dailyTarget;
    switch (type) {
        case 'PERCENTAGE':
            return `${current.toFixed(1)}% / ${target.toFixed(1)}%`;
        case 'CURRENCY':
            return `${current.toLocaleString('fa-IR')} / ${target.toLocaleString('fa-IR')} ت`;
        default: // NUMBER
            return `${current.toLocaleString('fa-IR')} / ${target.toLocaleString('fa-IR')}`;
    }
  }

  const calculateProgress = () => {
    switch (kr.category) {
        case KRCategory.Standard:
        case KRCategory.Stretch: {
            const { startValue = 0, targetValue = 1, currentValue = 0 } = kr;
            if (targetValue === startValue) return currentValue >= targetValue ? 100 : 0;
            if (targetValue < startValue) { // Decreasing metric
              const progress = ((startValue - currentValue) / (startValue - targetValue)) * 100;
              return Math.max(0, Math.min(100, progress));
            }
            const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;
            return Math.max(0, Math.min(100, progress));
        }
        case KRCategory.Binary:
            return kr.currentValue === 1 ? 100 : 0;
        case KRCategory.Assignment: {
            const total = (kr.assignedTaskIds?.length || 0) + (kr.assignedFormIds?.length || 0);
            if (total === 0) return 0;
            const progress = (kr.currentValue / total) * 100;
            return Math.max(0, Math.min(100, progress));
        }
        default:
            return 0;
    }
  };
  
  const progress = calculateProgress();

  const getProgressText = () => {
    switch (kr.category) {
        case KRCategory.Standard:
             switch (kr.type) {
                case 'PERCENTAGE': return `${kr.currentValue.toFixed(1)}%`;
                case 'CURRENCY': return `${kr.currentValue.toLocaleString('fa-IR')} تومان`;
                default: return `${kr.currentValue.toLocaleString('fa-IR')} از ${kr.targetValue?.toLocaleString('fa-IR')}`;
             }
        case KRCategory.Stretch:
            return `${kr.currentValue.toLocaleString('fa-IR')} از ${kr.targetValue?.toLocaleString('fa-IR')}`;
        case KRCategory.Binary:
            return kr.currentValue === 1 ? kr.binaryLabels?.complete || 'انجام شد' : kr.binaryLabels?.incomplete || 'انجام نشده';
        case KRCategory.Assignment:
            const total = (kr.assignedTaskIds?.length || 0) + (kr.assignedFormIds?.length || 0);
            return `${kr.currentValue} از ${total} انجام شده`;
        default:
             return '';
    }
  };

  if (isCompact) {
    return (
      <div className="py-2 px-2 flex flex-col md:flex-row items-start md:items-center justify-between border-t border-gray-200/60 dark:border-slate-700/60 group">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-text dark:text-slate-200 truncate">{kr.title}</p>
        </div>
        <div className="w-full mt-2 md:mt-0 md:w-2/3 md:pl-4 flex items-center">
          <div className="flex-1">
            <ProgressBar progress={progress} />
          </div>
          <span className="text-xs font-semibold text-brand-subtext dark:text-slate-400 w-12 text-left">{progress.toFixed(0)}%</span>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="mr-2 px-2 py-0.5 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 text-xs font-semibold text-brand-text dark:text-slate-200 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-500"
          >
            بروزرسانی
          </button>
           <div className="flex items-center">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-1 rounded-full text-gray-400 dark:text-slate-500 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="ویرایش نتیجه کلیدی"
                >
                    <EditIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onArchive(); }}
                    className="p-1 rounded-full text-gray-400 dark:text-slate-500 hover:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="آرشیو نتیجه کلیدی"
                >
                    <ArchiveBoxIcon className="w-4 h-4" />
                </button>
                 <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1 rounded-full text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="حذف نتیجه کلیدی"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 px-4 rounded-lg bg-gray-50/70 dark:bg-slate-800/50 group">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-text dark:text-slate-200 truncate">{kr.title}</p>
          {objectiveTitle && (
            <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-1">از هدف: {objectiveTitle}</p>
          )}
          <div className="flex items-center mt-1">
            {owner && <img src={owner.avatarUrl} alt={owner.name} className="w-5 h-5 rounded-full ml-2" />}
            <span className="text-xs text-brand-subtext dark:text-slate-400">{owner?.name || 'ناشناس'}</span>
          </div>
        </div>
        <div className="w-1/3 pl-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">{progress.toFixed(0)}%</span>
                <span className="text-xs text-brand-subtext dark:text-slate-400">{getProgressText()}</span>
            </div>
          <ProgressBar progress={progress} />
        </div>
        <div className="flex items-center">
            <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="mr-4 px-3 py-1 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 text-xs font-semibold text-brand-text dark:text-slate-200 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-500"
            >
            بروزرسانی
            </button>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-1 rounded-full text-gray-400 dark:text-slate-500 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-slate-700"
                    title="ویرایش نتیجه کلیدی"
                >
                    <EditIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onArchive(); }}
                    className="p-1 rounded-full text-gray-400 dark:text-slate-500 hover:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-700"
                    title="آرشیو نتیجه کلیدی"
                >
                    <ArchiveBoxIcon className="w-4 h-4" />
                </button>
                 <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1 rounded-full text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-slate-700"
                    title="حذف نتیجه کلیدی"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
           </div>
        </div>
      </div>
       {!objectiveTitle && kr.dailyTarget && (kr.category === 'STANDARD' || kr.category === 'STRETCH') && (
        <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-slate-700/60 animate-fade-in">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-brand-subtext dark:text-slate-400">تارگت روزانه</h4>
                <div className="flex items-center space-x-2 space-x-reverse">
                    <input 
                        type="number"
                        value={dailyCurrentValue}
                        onChange={e => setDailyCurrentValue(parseFloat(e.target.value) || 0)}
                        onBlur={handleDailyUpdate}
                        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                        className="w-24 border-gray-300 rounded-md shadow-sm py-1 text-sm focus:ring-brand-primary focus:border-brand-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                    />
                </div>
            </div>
            <div className="flex items-center mt-2">
                <div className="flex-grow">
                  <ProgressBar progress={(dailyCurrentValue / (kr.dailyTarget.target || 1)) * 100} />
                </div>
                <span className="text-xs text-brand-subtext dark:text-slate-400 w-32 text-left">{formatDailyTargetProgress(kr.dailyTarget)}</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default KeyResultRow;
