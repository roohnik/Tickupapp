import React from 'react';
import { Objective, User, KeyResult } from '../types';
import { calculateObjectiveProgress } from '../utils/objectiveUtils';
import ProgressBar from './ProgressBar';
import KeyResultRow from './KeyResultRow';

interface ObjectiveDisplayProps {
    objective: Objective;
    users: User[];
    onSelectKeyResult: (objectiveId: string, krId: string) => void;
    onUpdateKeyResultDetails: (objectiveId: string, krId: string, updates: Partial<KeyResult>) => void;
    onDeleteKeyResult: (objectiveId: string, keyResultId: string) => void;
    onArchiveKeyResult: (objectiveId: string, keyResultId: string) => void;
}

const ObjectiveDisplay: React.FC<ObjectiveDisplayProps> = ({ objective, users, onSelectKeyResult, onUpdateKeyResultDetails, onDeleteKeyResult, onArchiveKeyResult }) => {
    const owner = users.find(u => u.id === objective.ownerId);
    const progress = calculateObjectiveProgress(objective);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-brand-text">{objective.title}</h2>
                {owner && (
                    <div className="flex items-center mt-2 text-sm text-brand-subtext">
                        <img src={owner.avatarUrl} alt={owner.name} className="w-6 h-6 rounded-full ml-2" />
                        <span>مالک: {owner.name}</span>
                    </div>
                )}
                <p className="mt-4 text-brand-text">{objective.description}</p>
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">پیشرفت کل</span>
                    <span className="text-sm font-bold">{progress.toFixed(1)}%</span>
                </div>
                <ProgressBar progress={progress} />
            </div>

            <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">نتایج کلیدی</h3>
                <div className="space-y-3">
                    {objective.keyResults.filter(kr => !kr.isArchived).map(kr => (
                        <KeyResultRow
                            key={kr.id}
                            kr={kr}
                            owner={users.find(u => u.id === kr.ownerId)}
                            isCompact
                            onSelect={() => onSelectKeyResult(objective.id, kr.id)}
                            onUpdateKR={(updates) => onUpdateKeyResultDetails(objective.id, kr.id, updates)}
                            onDelete={() => onDeleteKeyResult(objective.id, kr.id)}
                            onEdit={() => { /* Not implemented in this view */ }}
                            onArchive={() => onArchiveKeyResult(objective.id, kr.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ObjectiveDisplay;
