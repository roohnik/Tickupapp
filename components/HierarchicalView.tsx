import React from 'react';
import { Objective, User, HierarchicalViewStyle, KeyResult, KRCategory } from '../types';
import { CalendarIcon, EditIcon, ArchiveBoxIcon, TrashIcon, UserIcon } from './Icons';

// =================================================================
// Progress Calculation Logic
// =================================================================

const calculateKrProgress = (kr: KeyResult): number => {
    switch (kr.category) {
        case KRCategory.Standard:
        case KRCategory.Stretch: {
            const { startValue = 0, targetValue = 1, currentValue = 0 } = kr;
            if (targetValue === startValue) return currentValue >= targetValue ? 100 : 0;
            if (targetValue < startValue) {
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

const calculateObjectiveProgress = (objective: Objective): number => {
    if (!objective.keyResults || objective.keyResults.length === 0) return 0;
    const totalProgress = objective.keyResults.reduce((acc, kr) => {
        return acc + calculateKrProgress(kr);
    }, 0);
    return totalProgress / objective.keyResults.length;
};

// Action Buttons Component
const ActionButtons: React.FC<{ onEdit: () => void; onArchive: () => void; onDelete: () => void; }> = ({ onEdit, onArchive, onDelete }) => (
    <div className="absolute top-1 left-1 flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-full p-1 z-20">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-blue-600" title="ویرایش"><EditIcon className="w-4 h-4"/></button>
        <button onClick={(e) => { e.stopPropagation(); onArchive(); }} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-yellow-600" title="آرشیو"><ArchiveBoxIcon className="w-4 h-4"/></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600" title="حذف"><TrashIcon className="w-4 h-4"/></button>
    </div>
);


// =================================================================
// Circular View Components
// =================================================================

interface CircularNodeProps {
    objective: Objective;
    allObjectives: Objective[];
    users: User[];
    onSelectObjective: (objective: Objective) => void;
    center: { x: number; y: number };
    radius: number;
    startAngle: number;
    angleSpan: number;
    onEditObjective: (objective: Objective) => void;
    onArchiveObjective: (objectiveId: string) => void;
    onDeleteObjective: (objectiveId: string) => void;
}

const CircularNode: React.FC<CircularNodeProps> = ({
    objective,
    allObjectives,
    users,
    onSelectObjective,
    center,
    radius,
    startAngle,
    angleSpan,
    onEditObjective,
    onArchiveObjective,
    onDeleteObjective
}) => {
    const children = allObjectives.filter(o => o.parentId === objective.id);
    const owner = users.find(u => u.id === objective.ownerId);
    const progress = calculateObjectiveProgress(objective);

    const childAngleSpan = children.length > 0 ? angleSpan / children.length : 0;
    const childRadius = 150; // Distance to next level of children

    return (
        <React.Fragment>
            {/* The node itself */}
            <foreignObject x={center.x - 80} y={center.y - 30} width="160" height="60">
                <div
                    onClick={() => onSelectObjective(objective)}
                    className="p-2 bg-white rounded-lg border shadow-sm cursor-pointer hover:bg-gray-50 hover:border-blue-300 w-full h-full flex flex-col justify-center group relative"
                >
                    <ActionButtons onEdit={() => onEditObjective(objective)} onArchive={() => onArchiveObjective(objective.id)} onDelete={() => onDeleteObjective(objective.id)} />
                    <div className="flex items-center">
                        {owner && <img src={owner.avatarUrl} alt={owner.name} className="w-5 h-5 rounded-full ml-2" />}
                        <p className="font-semibold text-brand-text text-xs truncate">{objective.title}</p>
                    </div>
                    <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                            <div className="h-1 rounded-full bg-blue-500" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-brand-subtext w-8 text-left">{progress.toFixed(0)}%</span>
                    </div>
                </div>
            </foreignObject>

            {/* Recursively render children and draw lines to them */}
            {children.map((child, index) => {
                const angle = startAngle + (index + 0.5) * childAngleSpan;
                const childCenter = {
                    x: center.x + radius * Math.cos(angle * Math.PI / 180),
                    y: center.y + radius * Math.sin(angle * Math.PI / 180),
                };

                return (
                    <React.Fragment key={child.id}>
                        <line
                            x1={center.x}
                            y1={center.y}
                            x2={childCenter.x}
                            y2={childCenter.y}
                            stroke="#cbd5e1"
                            strokeWidth="1.5"
                        />
                        <CircularNode
                            objective={child}
                            allObjectives={allObjectives}
                            users={users}
                            onSelectObjective={onSelectObjective}
                            center={childCenter}
                            radius={childRadius}
                            startAngle={angle - 45} // Give children a 90-degree arc
                            angleSpan={90}
                            onEditObjective={onEditObjective}
                            onArchiveObjective={onArchiveObjective}
                            onDeleteObjective={onDeleteObjective}
                        />
                    </React.Fragment>
                );
            })}
        </React.Fragment>
    );
};


// =================================================================
// Mind Map View Components
// =================================================================

interface MindMapNodeProps {
    objective: Objective;
    allObjectives: Objective[];
    users: User[];
    onSelectObjective: (objective: Objective) => void;
    onEditObjective: (objective: Objective) => void;
    onArchiveObjective: (objectiveId: string) => void;
    onDeleteObjective: (objectiveId: string) => void;
}

const MindMapNode: React.FC<MindMapNodeProps> = ({ objective, allObjectives, users, onSelectObjective, onEditObjective, onArchiveObjective, onDeleteObjective }) => {
    const children = allObjectives.filter(o => o.parentId === objective.id);
    const owner = users.find(u => u.id === objective.ownerId);
    const progress = calculateObjectiveProgress(objective);

    return (
        <div className="flex items-start">
            {/* Parent Node */}
            <div 
                onClick={() => onSelectObjective(objective)}
                className="p-3 bg-white rounded-lg border shadow-sm cursor-pointer hover:bg-gray-50 hover:border-blue-300 w-64 flex-shrink-0 group relative"
            >
                <ActionButtons onEdit={() => onEditObjective(objective)} onArchive={() => onArchiveObjective(objective.id)} onDelete={() => onDeleteObjective(objective.id)} />
                <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                        {owner && <img src={owner.avatarUrl} alt={owner.name} className="w-6 h-6 rounded-full ml-2" />}
                        <p className="font-semibold text-brand-text truncate">{objective.title}</p>
                    </div>
                </div>
                <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-brand-subtext w-10 text-left">{progress.toFixed(0)}%</span>
                </div>
            </div>

            {/* Children Section */}
            {children.length > 0 && (
                <div className="flex items-start pl-8 pt-6 relative">
                    {/* Vertical line connecting all children */}
                    <div className="absolute top-0 bottom-0 left-4 w-px bg-gray-300"></div>
                    
                    <div className="flex flex-col space-y-4">
                        {children.map(child => (
                             <div key={child.id} className="flex items-start relative">
                                {/* Horizontal line from vertical connector to child */}
                                <div className="absolute top-1/2 -mt-px left-[-2rem] w-4 h-px bg-gray-300"></div>
                                <MindMapNode
                                    objective={child}
                                    allObjectives={allObjectives}
                                    users={users}
                                    onSelectObjective={onSelectObjective}
                                    onEditObjective={onEditObjective}
                                    onArchiveObjective={onArchiveObjective}
                                    onDeleteObjective={onDeleteObjective}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


// =================================================================
// Org Chart View Components
// =================================================================

const ORG_CHART_COLORS = [
  'bg-blue-400', 'bg-red-400', 'bg-green-400', 'bg-teal-400',
  'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-orange-400'
];

const getColorForObjective = (objectiveId: string): string => {
  let hash = 0;
  for (let i = 0; i < objectiveId.length; i++) {
    hash = objectiveId.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const index = Math.abs(hash % ORG_CHART_COLORS.length);
  return ORG_CHART_COLORS[index];
};

interface OrgChartNodeProps {
  objective: Objective;
  allObjectives: Objective[];
  users: User[];
  onSelectObjective: (objective: Objective) => void;
  onEditObjective: (objective: Objective) => void;
  onArchiveObjective: (objectiveId: string) => void;
  onDeleteObjective: (objectiveId: string) => void;
}

const OrgChartNode: React.FC<OrgChartNodeProps> = ({ objective, allObjectives, users, onSelectObjective, onEditObjective, onArchiveObjective, onDeleteObjective }) => {
    const children = allObjectives.filter(o => o.parentId === objective.id);
    const owner = users.find(u => u.id === objective.ownerId);

    return (
        <div className="flex flex-col items-center relative px-4">
            {/* Node card */}
            <div 
                onClick={() => onSelectObjective(objective)}
                className="px-3 py-2 bg-white rounded-md border shadow-sm flex items-center cursor-pointer hover:border-blue-400 z-10 group relative"
            >
                <ActionButtons onEdit={() => onEditObjective(objective)} onArchive={() => onArchiveObjective(objective.id)} onDelete={() => onDeleteObjective(objective.id)} />
                <span className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${getColorForObjective(objective.id)}`}></span>
                <span className="font-semibold text-sm">{objective.title}</span>
                {owner && <img src={owner.avatarUrl} title={owner.name} className="w-5 h-5 rounded-full ml-2" />}
            </div>

            {/* Children container */}
            {children.length > 0 && (
                <div className="flex justify-center items-start pt-8 relative">
                    {/* Vertical line from parent to horizontal line */}
                    <div className="absolute bottom-full h-8 w-px bg-gray-300"></div>

                    {children.map((child, index) => (
                        <div key={child.id} className="relative px-4">
                             {/* Vertical line from child up to horizontal line */}
                            <div className="absolute bottom-full h-8 w-px bg-gray-300"></div>
                             {/* Horizontal connector line */}
                             <div className={`absolute top-[-32px] h-px bg-gray-300 
                                ${children.length === 1 ? 'hidden' : ''}
                                ${index === 0 ? 'left-1/2 right-0' : ''}
                                ${index === children.length - 1 ? 'right-1/2 left-0' : ''}
                                ${index > 0 && index < children.length - 1 ? 'left-0 right-0' : ''}
                            `}></div>
                            <OrgChartNode 
                                objective={child}
                                allObjectives={allObjectives}
                                users={users}
                                onSelectObjective={onSelectObjective}
                                onEditObjective={onEditObjective}
                                onArchiveObjective={onArchiveObjective}
                                onDeleteObjective={onDeleteObjective}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// =================================================================
// Advanced Org Chart (Card View 2) Components
// =================================================================

interface ObjectiveDisplayCardProps {
    objective: Objective;
    owner?: User;
    progress: number;
    onEdit: () => void;
    onArchive: () => void;
    onDelete: () => void;
}

const ObjectiveDisplayCard: React.FC<ObjectiveDisplayCardProps> = ({ objective, owner, progress, onEdit, onArchive, onDelete }) => {
    
    const getStatus = (p: number): { text: string; bg: string; text_color: string, progress_bar: string } => {
        if (p < 40) return { text: 'At risk', bg: 'bg-red-100', text_color: 'text-red-800', progress_bar: 'bg-red-400' };
        if (p < 70) return { text: 'Behind', bg: 'bg-yellow-100', text_color: 'text-yellow-800', progress_bar: 'bg-yellow-400' };
        return { text: 'On track', bg: 'bg-green-100', text_color: 'text-green-800', progress_bar: 'bg-green-400' };
    };

    const status = getStatus(progress);
    
    const statusTextMap: { [key: string]: string } = {
        'At risk': 'در معرض خطر',
        'Behind': 'عقب',
        'On track': 'در مسیر'
    };

    const completedKRs = objective.keyResults.filter(kr => calculateKrProgress(kr) === 100).length;

    return (
        <div className="bg-white p-3 rounded-lg border shadow-md w-72 flex flex-col space-y-3 cursor-pointer hover:border-blue-400 transition-colors relative group">
            <ActionButtons onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} />
            <div className="flex items-start justify-between">
                <div className="flex-grow min-w-0 pr-2">
                    <p className="font-semibold text-brand-text">{objective.title}</p>
                    <p className="text-sm text-brand-subtext mt-1">{completedKRs} / {objective.keyResults.length} تکمیل شده</p>
                </div>
                 {owner ? (
                    <img src={owner.avatarUrl} alt={owner.name} title={owner.name} className="w-10 h-10 rounded-full flex-shrink-0 ml-3" />
                 ) : (
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200 ml-3">
                        <UserIcon className="w-6 h-6 text-gray-400" />
                    </div>
                 )}
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
                 <div className={`px-2 py-0.5 text-xs font-medium rounded ${status.bg} ${status.text_color}`}>
                    {statusTextMap[status.text]}
                </div>
                <div className="flex-grow h-2 bg-gray-200 rounded-full">
                    <div className={`h-2 rounded-full ${status.progress_bar} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-sm font-semibold text-brand-subtext w-10 text-left">{progress.toFixed(0)}%</span>
            </div>

            <div className="flex items-center text-xs text-brand-subtext pt-2 border-t border-gray-100">
                <CalendarIcon className="w-4 h-4 ml-1" />
                <span>سالانه ۲۰۲۴ (۱ ژانویه - ۳۱ دسامبر)</span>
            </div>
        </div>
    );
};

interface AdvancedOrgChartNodeProps {
  objective: Objective;
  allObjectives: Objective[];
  users: User[];
  onSelectObjective: (objective: Objective) => void;
  onEditObjective: (objective: Objective) => void;
  onArchiveObjective: (objectiveId: string) => void;
  onDeleteObjective: (objectiveId: string) => void;
}

const AdvancedOrgChartNode: React.FC<AdvancedOrgChartNodeProps> = ({ objective, allObjectives, users, onSelectObjective, onEditObjective, onArchiveObjective, onDeleteObjective }) => {
    const children = allObjectives.filter(o => o.parentId === objective.id);
    const owner = users.find(u => u.id === objective.ownerId);
    const progress = calculateObjectiveProgress(objective);

    return (
        <div className="flex flex-col items-center">
            <div onClick={() => onSelectObjective(objective)} className="z-10">
                <ObjectiveDisplayCard 
                    objective={objective} 
                    owner={owner} 
                    progress={progress}
                    onEdit={() => onEditObjective(objective)}
                    onArchive={() => onArchiveObjective(objective.id)}
                    onDelete={() => onDeleteObjective(objective.id)}
                />
            </div>

            {children.length > 0 && (
                <div className="flex justify-center items-start pt-8 relative">
                    {children.map((child, index) => (
                        <div key={child.id} className="px-4 flex-shrink-0 relative">
                            <AdvancedOrgChartNode
                                objective={child}
                                allObjectives={allObjectives}
                                users={users}
                                onSelectObjective={onSelectObjective}
                                onEditObjective={onEditObjective}
                                onArchiveObjective={onArchiveObjective}
                                onDeleteObjective={onDeleteObjective}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// =================================================================
// Main HierarchicalView Component (Router)
// =================================================================

interface HierarchicalViewProps {
  objectives: Objective[];
  users: User[];
  onSelectObjective: (objective: Objective) => void;
  hierarchicalViewStyle: HierarchicalViewStyle;
  onEditObjective: (objective: Objective) => void;
  onArchiveObjective: (objectiveId: string) => void;
  onDeleteObjective: (objectiveId: string) => void;
}

const HierarchicalView: React.FC<HierarchicalViewProps> = ({ objectives, users, onSelectObjective, hierarchicalViewStyle, onEditObjective, onArchiveObjective, onDeleteObjective }) => {
  const visibleObjectives = objectives.filter(o => !o.isArchived);
  const rootObjectives = visibleObjectives.filter(o => !o.parentId || !visibleObjectives.some(p => p.id === o.parentId));

  switch (hierarchicalViewStyle) {
      case 'ADVANCED_ORG_CHART':
          return (
             <div className="overflow-x-auto p-8 bg-gray-50/70 rounded-lg">
                  <div className="inline-flex flex-col items-center min-w-full">
                      {rootObjectives.map(objective => (
                          <div key={objective.id} className="mb-8">
                              <AdvancedOrgChartNode 
                                  objective={objective}
                                  allObjectives={visibleObjectives}
                                  users={users}
                                  onSelectObjective={onSelectObjective}
                                  onEditObjective={onEditObjective}
                                  onArchiveObjective={onArchiveObjective}
                                  onDeleteObjective={onDeleteObjective}
                              />
                          </div>
                      ))}
                  </div>
              </div>
          );

      case 'ORG_CHART':
          return (
              <div className="overflow-x-auto p-8 bg-gray-50/70 rounded-lg">
                  <div className="inline-flex flex-col items-center min-w-full">
                      {rootObjectives.map(objective => (
                          <div key={objective.id} className="mb-8">
                              <OrgChartNode 
                                  objective={objective}
                                  allObjectives={visibleObjectives}
                                  users={users}
                                  onSelectObjective={onSelectObjective}
                                  onEditObjective={onEditObjective}
                                  onArchiveObjective={onArchiveObjective}
                                  onDeleteObjective={onDeleteObjective}
                              />
                          </div>
                      ))}
                  </div>
              </div>
          );
      
      case 'CIRCULAR': {
          const svgSize = 1000;
          const center = { x: svgSize / 2, y: svgSize / 2 };
          
          if (rootObjectives.length === 0) {
              return <div className="text-center p-8">No objectives to display.</div>;
          }

          if (rootObjectives.length === 1) {
              return (
                  <div className="overflow-auto p-4 bg-gray-50/70 rounded-lg flex justify-center items-center">
                      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                          <CircularNode
                              objective={rootObjectives[0]}
                              allObjectives={visibleObjectives}
                              users={users}
                              onSelectObjective={onSelectObjective}
                              center={center}
                              radius={250}
                              startAngle={0}
                              angleSpan={360}
                              onEditObjective={onEditObjective}
                              onArchiveObjective={onArchiveObjective}
                              onDeleteObjective={onDeleteObjective}
                          />
                      </svg>
                  </div>
              );
          }
          
          const rootAngleSpan = 360 / rootObjectives.length;
          const rootRadius = 150;
          return (
                <div className="overflow-auto p-4 bg-gray-50/70 rounded-lg flex justify-center items-center">
                    <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                        <circle cx={center.x} cy={center.y} r="8" fill="#9ca3af" />
                        {rootObjectives.map((root, index) => {
                            const angle = index * rootAngleSpan;
                            const rootCenter = {
                                x: center.x + rootRadius * Math.cos(angle * Math.PI / 180),
                                y: center.y + rootRadius * Math.sin(angle * Math.PI / 180),
                            };
                            return (
                                <React.Fragment key={root.id}>
                                    <line
                                        x1={center.x}
                                        y1={center.y}
                                        x2={rootCenter.x}
                                        y2={rootCenter.y}
                                        stroke="#cbd5e1"
                                        strokeWidth="1.5"
                                    />
                                    <CircularNode
                                        objective={root}
                                        allObjectives={visibleObjectives}
                                        users={users}
                                        onSelectObjective={onSelectObjective}
                                        center={rootCenter}
                                        radius={200}
                                        startAngle={angle - 45}
                                        angleSpan={90}
                                        onEditObjective={onEditObjective}
                                        onArchiveObjective={onArchiveObjective}
                                        onDeleteObjective={onDeleteObjective}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </svg>
                </div>
          );
      }

      case 'MIND_MAP':
      default:
          return (
              <div className="space-y-4">
                  {rootObjectives.map(objective => (
                      <MindMapNode
                          key={objective.id}
                          objective={objective}
                          allObjectives={visibleObjectives}
                          users={users}
                          onSelectObjective={onSelectObjective}
                          onEditObjective={onEditObjective}
                          onArchiveObjective={onArchiveObjective}
                          onDeleteObjective={onDeleteObjective}
                      />
                  ))}
              </div>
          );
  }
};

export default HierarchicalView;