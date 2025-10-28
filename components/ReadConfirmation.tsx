// This is a new file: components/ReadConfirmation.tsx
import React from 'react';
import { Task } from '../types';
import { CheckCircleIcon } from './Icons';

interface ReadConfirmationProps {
    headingBlockId: string;
    taskContext: Task;
    onUpdateTaskContext: (updatedTask: Task) => void;
    documentId: string;
}

const ReadConfirmation: React.FC<ReadConfirmationProps> = ({ headingBlockId, taskContext, onUpdateTaskContext, documentId }) => {
    const completedIds = taskContext.prerequisiteCompletion?.[documentId] || [];
    const isCompleted = completedIds.includes(headingBlockId);

    const handleToggle = () => {
        const currentCompletion = taskContext.prerequisiteCompletion || {};
        const currentDocCompletions = currentCompletion[documentId] || [];
        
        const newDocCompletions = isCompleted
            ? currentDocCompletions.filter(id => id !== headingBlockId)
            : [...currentDocCompletions, headingBlockId];

        onUpdateTaskContext({
            ...taskContext,
            prerequisiteCompletion: {
                ...currentCompletion,
                [documentId]: newDocCompletions,
            },
        });
    };

    return (
        <div className="flex justify-center my-8 py-4 border-t border-dashed">
            <button
                onClick={handleToggle}
                className={`flex items-center px-4 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
            >
                <div className="relative w-7 h-7 mr-2">
                    <div className={`w-7 h-7 rounded-full border-2 transition-colors ${isCompleted ? 'border-green-500' : 'border-gray-400'}`} />
                    {isCompleted && (
                        <CheckCircleIcon className="w-8 h-8 absolute -top-0.5 -left-0.5 text-green-500 bg-white rounded-full animate-check-bounce" />
                    )}
                </div>
                {isCompleted ? 'مطالعه شد' : 'علامت‌گذاری به‌عنوان خوانده‌شده'}
            </button>
        </div>
    );
};

export default ReadConfirmation;