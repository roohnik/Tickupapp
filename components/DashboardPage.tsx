import React, { useState, useMemo } from 'react';
import { Objective, User, KeyResult, ObjectiveSettings, Task } from '../types';
import ObjectiveRow from './ObjectiveRow';
import KeyResultRow from './KeyResultRow';
import DailyTargetCard from './DailyTargetCard';
import { OBJECTIVE_CATEGORIES, OBJECTIVE_COLOR_MAP } from '../constants';
import HierarchicalView from './HierarchicalView';
import { SparklesIcon } from './Icons';


interface DashboardPageProps {
  objectives: Objective[];
  users: User[];
  tasks: Task[];
  onSelectObjective: (objective: Objective) => void;
  onAddNewObjective: () => void;
  onAddKeyResult: (objectiveId: string) => void;
  onSelectKeyResult: (objectiveId: string, krId: string) => void;
  onEditObjective: (objective: Objective) => void;
  onDeleteObjective: (objectiveId: string) => void;
  onDeleteKeyResult: (objectiveId: string, keyResultId: string) => void;
  onUpdateKeyResultDetails: (objectiveId: string, krId: string, updates: Partial<KeyResult>) => void;
  objectiveSettings: ObjectiveSettings;
  onArchiveObjective: (objectiveId: string) => void;
  onArchiveKeyResult: (objectiveId: string, krId: string) => void;
  onToggleDailyTargetTaskInAnjam: (krId: string) => void;
  onStartSmartWizard: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
    objectives, 
    users, 
    tasks,
    onSelectObjective,
    onAddNewObjective,
    onAddKeyResult,
    onSelectKeyResult,
    onEditObjective,
    onDeleteObjective,
    onDeleteKeyResult,
    onUpdateKeyResultDetails,
    objectiveSettings,
    onArchiveObjective,
    onArchiveKeyResult,
    onToggleDailyTargetTaskInAnjam,
    onStartSmartWizard,
}) => {
    const [expandedObjectiveId, setExpandedObjectiveId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'list' | 'hierarchy' | 'dailyTargets'>('list');
    const [listViewMode, setListViewMode] = useState<'objectives' | 'keyResults'>('objectives');

    const visibleObjectives = useMemo(() => objectives.filter(o => !o.isArchived), [objectives]);

    const dailyTargetKRs = useMemo(() => {
        return objectives
            .filter(obj => !obj.isArchived)
            .flatMap(obj => 
                obj.keyResults
                    .filter(kr => !!kr.dailyTarget && !kr.isArchived)
                    .map(kr => ({ ...kr, objectiveId: obj.id, objectiveTitle: obj.title }))
        );
    }, [objectives]);

    const todaysDailyTargetTaskKrIds = useMemo(() => {
        const todayString = new Date().toDateString();
        return new Set(
            tasks
                .filter(t => t.dailyTargetKrId && t.dueDate && new Date(t.dueDate).toDateString() === todayString)
                .map(t => t.dailyTargetKrId!)
        );
    }, [tasks]);

    const toggleExpand = (objectiveId: string) => {
        setExpandedObjectiveId(prev => (prev === objectiveId ? null : objectiveId));
    };
    
    // Placeholder handlers for new actions
    const handleEditKeyResult = (krId: string) => {
        alert(`Editing key result ${krId}`);
    };


    return (
        <div>
            <div className="flex justify-end items-center mb-6">
                 <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                        onClick={onStartSmartWizard}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold shadow-sm hover:bg-purple-700 transition-all"
                    >
                        <SparklesIcon className="w-5 h-5 ml-2" />
                        طراحی هدف
                    </button>
                    <button
                        onClick={onAddNewObjective}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold shadow-sm hover:bg-blue-600"
                    >
                        ایجاد هدف جدید
                    </button>
                </div>
            </div>

            <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6 space-x-reverse" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('list')}
                        onDoubleClick={() => setListViewMode(prev => prev === 'objectives' ? 'keyResults' : 'objectives')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'list' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                        title="برای جابجایی بین نمای اهداف و نتایج کلیدی، دوبار کلیک کنید"
                    >
                        {activeTab === 'list' && listViewMode === 'keyResults' ? 'نمای نتایج کلیدی' : 'نمای لیست'}
                    </button>
                    <button
                        onClick={() => setActiveTab('hierarchy')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'hierarchy' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                    >
                        نمای سلسله مراتبی
                    </button>
                    <button
                        onClick={() => setActiveTab('dailyTargets')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'dailyTargets' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                    >
                        تارگت روزانه
                    </button>
                </nav>
            </div>
            
            <div className="mt-6">
                {activeTab === 'list' ? (
                    listViewMode === 'objectives' ? (
                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
                            {/* Table Header */}
                            <div className="hidden md:flex items-center text-xs text-gray-500 dark:text-slate-400 font-semibold border-b dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/50 px-2">
                                <div className="w-10 pl-2 flex-shrink-0"></div>
                                <div className="flex-1 py-2 pr-2">عنوان هدف</div>
                                <div className="w-48 px-4 py-2 flex-shrink-0">وضعیت و پیشرفت</div>
                                <div className="w-32 px-4 py-2 flex-shrink-0">مالک</div>
                                <div className="w-28 px-2 py-2 flex-shrink-0"></div> {/* For action buttons column */}
                            </div>
                            
                            {visibleObjectives.map(obj => (
                                <div key={obj.id}>
                                    <ObjectiveRow
                                        objective={obj}
                                        owner={users.find(u => u.id === obj.ownerId)}
                                        isExpanded={expandedObjectiveId === obj.id}
                                        onToggleExpand={() => toggleExpand(obj.id)}
                                        onSelectObjective={() => onSelectObjective(obj)}
                                        onEditObjective={() => onEditObjective(obj)}
                                        onDeleteObjective={() => onDeleteObjective(obj.id)}
                                        onArchiveObjective={() => onArchiveObjective(obj.id)}
                                        categories={OBJECTIVE_CATEGORIES}
                                    />
                                    {expandedObjectiveId === obj.id && (
                                        <div className="pl-10 pr-5 bg-gray-50/50 dark:bg-slate-800/50">
                                            {obj.keyResults.filter(kr => !kr.isArchived).map(kr => (
                                                <KeyResultRow
                                                    key={kr.id}
                                                    kr={kr}
                                                    owner={users.find(u => u.id === kr.ownerId)}
                                                    onSelect={() => onSelectKeyResult(obj.id, kr.id)}
                                                    onUpdateKR={(updates) => onUpdateKeyResultDetails(obj.id, kr.id, updates)}
                                                    onDelete={() => onDeleteKeyResult(obj.id, kr.id)}
                                                    onEdit={() => handleEditKeyResult(kr.id)}
                                                    onArchive={() => onArchiveKeyResult(obj.id, kr.id)}
                                                    isCompact
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {visibleObjectives.map((obj, index) => {
                                const visibleKRs = obj.keyResults.filter(kr => !kr.isArchived);
                                if (visibleKRs.length === 0) return null;

                                const colorClass = OBJECTIVE_COLOR_MAP[obj.color || 'gray']?.bg || 'bg-gray-400';
                                return (
                                    <div key={obj.id} className="relative pr-3">
                                        <div className={`absolute top-0 right-0 bottom-0 w-1 rounded-full ${colorClass}`}></div>
                                        <div className="space-y-2">
                                            {visibleKRs.map(kr => (
                                                <KeyResultRow
                                                    key={kr.id}
                                                    kr={kr}
                                                    owner={users.find(u => u.id === kr.ownerId)}
                                                    onSelect={() => onSelectKeyResult(obj.id, kr.id)}
                                                    onUpdateKR={(updates) => onUpdateKeyResultDetails(obj.id, kr.id, updates)}
                                                    onDelete={() => onDeleteKeyResult(obj.id, kr.id)}
                                                    onEdit={() => handleEditKeyResult(kr.id)}
                                                    onArchive={() => onArchiveKeyResult(obj.id, kr.id)}
                                                    objectiveTitle={obj.title}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : null}
                {activeTab === 'hierarchy' && (
                     <HierarchicalView
                        objectives={objectives}
                        users={users}
                        onSelectObjective={onSelectObjective}
                        hierarchicalViewStyle={objectiveSettings.hierarchicalViewStyle}
                        onEditObjective={onEditObjective}
                        onArchiveObjective={onArchiveObjective}
                        onDeleteObjective={onDeleteObjective}
                    />
                )}
                {activeTab === 'dailyTargets' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dailyTargetKRs.length > 0 ? (
                            dailyTargetKRs.map(kr => (
                                <DailyTargetCard
                                    key={kr.id}
                                    kr={kr}
                                    owner={users.find(u => u.id === kr.ownerId)}
                                    onUpdateKR={(updates) => onUpdateKeyResultDetails(kr.objectiveId, kr.id, updates)}
                                    onEdit={() => handleEditKeyResult(kr.id)}
                                    onArchive={() => onArchiveKeyResult(kr.objectiveId, kr.id)}
                                    onDelete={() => onDeleteKeyResult(kr.objectiveId, kr.id)}
                                    isAddedToAnjam={todaysDailyTargetTaskKrIds.has(kr.id)}
                                    onToggleAnjamTask={() => onToggleDailyTargetTaskInAnjam(kr.id)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full dark:border-slate-700">
                                <p className="text-brand-subtext dark:text-slate-400">هیچ تارگت روزانه‌ای برای نمایش وجود ندارد.</p>
                                <p className="text-sm text-gray-400 dark:text-slate-500 mt-2">می‌توانید هنگام ایجاد یا ویرایش نتایج کلیدی، برای آن‌ها تارگت روزانه تعریف کنید.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
