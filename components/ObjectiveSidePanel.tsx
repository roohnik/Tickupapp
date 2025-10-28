import React from 'react';
import { Objective, User, KeyResult, Strategy, Index } from '../types';
import { CloseIcon, UserIcon, RocketIcon, StarIcon, PlusIcon, Squares2x2Icon, ICONS, ArrowUpIcon, ArrowDownIcon } from './Icons';
import ProgressBar from './ProgressBar';
import KeyResultRow from './KeyResultRow';
import ProgressChart from './ProgressChart';
import { OBJECTIVE_CATEGORIES } from '../constants';
import { calculateObjectiveProgress } from '../utils/objectiveUtils';

interface ObjectiveSidePanelProps {
  objective: Objective | null;
  users: User[];
  strategies: Strategy[];
  indices: Index[];
  objectives: Objective[];
  onClose: () => void;
  onAddKeyResult: (objectiveId: string) => void;
  onDeleteKeyResult: (objectiveId: string, keyResultId: string) => void;
  onUpdateKeyResultDetails: (objectiveId: string, krId: string, updates: Partial<KeyResult>) => void;
  onEditKeyResult: (krId: string) => void;
  onArchiveKeyResult: (objectiveId: string, krId: string) => void;
  onSelectKeyResult: (objectiveId: string, krId: string) => void;
}

const ObjectiveSidePanel: React.FC<ObjectiveSidePanelProps> = ({ objective, users, strategies, indices, objectives, onClose, onAddKeyResult, onDeleteKeyResult, onUpdateKeyResultDetails, onEditKeyResult, onArchiveKeyResult, onSelectKeyResult }) => {
  if (!objective) return null;

  const owner = users.find(u => u.id === objective.ownerId);
  const strategy = strategies.find(s => s.id === objective.strategyId);
  const linkedIndices = indices.filter(i => objective.indexIds?.includes(i.id));
  const categoryInfo = objective.category ? OBJECTIVE_CATEGORIES[objective.category] : null;
  const CategoryIcon = categoryInfo ? ICONS[categoryInfo.IconName] : null;

  const parentObjective = objectives.find(o => o.id === objective.parentId);
  const childObjectives = objectives.filter(o => o.parentId === objective.id);
  
  const overallProgress = calculateObjectiveProgress(objective);

  const getStatus = (p: number): { text: string, bg: string, text_color: string } => {
    if (p < 40) return { text: 'در معرض خطر', bg: 'bg-red-100', text_color: 'text-red-800' };
    if (p < 70) return { text: 'عقب', bg: 'bg-yellow-100', text_color: 'text-yellow-800' };
    return { text: 'در مسیر', bg: 'bg-green-100', text_color: 'text-green-800' };
  };

  const status = getStatus(overallProgress);

  return (
    <div 
      className="fixed top-[61px] left-0 h-[calc(100%-61px)] w-full max-w-lg bg-white shadow-2xl animate-slide-in-left flex flex-col z-40"
      onClick={e => e.stopPropagation()}
      dir="rtl"
    >
      <div className="p-4 border-b flex justify-between items-center bg-gray-50/70 flex-shrink-0">
        <h2 className="text-lg font-bold text-brand-text">جزئیات هدف</h2>
        <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-grow p-6 overflow-y-auto space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-brand-text">{objective.title}</h3>
          <p className="mt-2 text-brand-subtext">{objective.description}</p>
        </div>
        
        <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${status.bg} ${status.text_color}`}>{status.text}</span>
              <span className="text-sm font-bold text-brand-text">{overallProgress.toFixed(1)}%</span>
            </div>
            <ProgressBar progress={overallProgress} />
        </div>

        <ProgressChart objective={objective} />
        
        <div className="space-y-3">
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 text-gray-400 ml-3" />
              <span className="w-24 text-sm text-brand-subtext">مالک</span>
              <div className="flex items-center">
                  {owner && <img src={owner.avatarUrl} alt={owner.name} className="w-6 h-6 rounded-full ml-2" />}
                  <span className="font-medium text-sm">{owner?.name}</span>
              </div>
            </div>
            {categoryInfo && (
              <div className="flex items-center">
                  <Squares2x2Icon className="w-5 h-5 text-gray-400 ml-3" />
                  <span className="w-24 text-sm text-brand-subtext">دسته‌بندی</span>
                  <div className="flex items-center">
                      {CategoryIcon && <CategoryIcon className="w-5 h-5 text-gray-500 ml-2" />}
                      <span className="font-medium text-sm">{categoryInfo.label}</span>
                  </div>
              </div>
            )}
            {strategy && (
              <div className="flex items-center">
                  <RocketIcon className="w-5 h-5 text-gray-400 ml-3" />
                  <span className="w-24 text-sm text-brand-subtext">استراتژی</span>
                  <span className="font-medium text-sm">{strategy.name}</span>
              </div>
            )}
            {parentObjective && (
              <div className="flex items-center">
                  <ArrowUpIcon className="w-5 h-5 text-gray-400 ml-3" />
                  <span className="w-24 text-sm text-brand-subtext">هم‌راستا با</span>
                  <span className="font-medium text-sm truncate">{parentObjective.title}</span>
              </div>
            )}
            {childObjectives.length > 0 && (
              <div className="flex items-start">
                  <ArrowDownIcon className="w-5 h-5 text-gray-400 ml-3 mt-1" />
                  <span className="w-24 text-sm text-brand-subtext pt-1">اهداف زیرمجموعه</span>
                  <div className="flex flex-wrap gap-1">
                      {childObjectives.map(child => (
                          <span key={child.id} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{child.title}</span>
                      ))}
                  </div>
              </div>
            )}
            {linkedIndices.length > 0 && (
                <div className="flex items-start">
                  <StarIcon className="w-5 h-5 text-gray-400 ml-3 mt-1" />
                  <span className="w-24 text-sm text-brand-subtext pt-1">شاخص‌ها</span>
                  <div className="flex flex-wrap gap-1">
                      {linkedIndices.map(i => <span key={i.id} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{i.name}</span>)}
                  </div>
              </div>
            )}
        </div>
        
        <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-brand-text">نتایج کلیدی</h4>
              <button onClick={() => onAddKeyResult(objective.id)} className="flex items-center text-sm px-3 py-1.5 bg-brand-primary text-white rounded-md hover:bg-blue-700">
                  <PlusIcon className="w-4 h-4 ml-2"/>
                  افزودن
              </button>
          </div>
          <div className="space-y-4">
              {objective.keyResults.map(kr => (
                  <KeyResultRow
                      key={kr.id}
                      kr={kr}
                      owner={users.find(u => u.id === kr.ownerId)}
                      onSelect={() => onSelectKeyResult(objective.id, kr.id)}
                      onUpdateKR={(updates) => onUpdateKeyResultDetails(objective.id, kr.id, updates)}
                      onDelete={() => onDeleteKeyResult(objective.id, kr.id)}
                      onEdit={() => onEditKeyResult(kr.id)}
                      onArchive={() => onArchiveKeyResult(objective.id, kr.id)}
                  />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectiveSidePanel;