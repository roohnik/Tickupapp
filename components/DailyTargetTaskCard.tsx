import React, { useState, useEffect, useRef } from 'react';
import { Task, KeyResult, User, KRType } from '../types';

const CircularProgress: React.FC<{ progress: number }> = ({ progress }) => {
    const radius = 45;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle
                stroke="#e5e7eb"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke="currentColor"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};


interface DailyTargetTaskCardProps {
  task: Task;
  kr: KeyResult & { objectiveId: string };
  owner?: User;
  onUpdateKR: (updates: Partial<KeyResult>) => void;
  onSelectTask: (taskId: string) => void;
}

const DailyTargetTaskCard: React.FC<DailyTargetTaskCardProps> = ({ task, kr, owner, onUpdateKR, onSelectTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(kr.dailyTarget?.current || 0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);
    
    useEffect(() => {
        setCurrentValue(kr.dailyTarget?.current || 0);
    }, [kr.dailyTarget?.current]);

    if (!kr.dailyTarget) return null;

    const progress = Math.min(100, (currentValue / (kr.dailyTarget.target || 1)) * 100);

    const getProgressColor = (p: number) => {
        if (p < 40) return 'text-red-500';
        if (p < 80) return 'text-yellow-500';
        return 'text-green-500';
    };

    const formatValue = (value: number, type: KRType) => {
        switch (type) {
            case 'PERCENTAGE':
                return `${value.toFixed(1)}%`;
            case 'CURRENCY':
                return value.toLocaleString('fa-IR');
            default: // NUMBER
                return value.toLocaleString('fa-IR');
        }
    };
    
    const handleUpdate = () => {
        if (kr.dailyTarget && currentValue !== kr.dailyTarget.current) {
            const updatedDailyTarget = { ...kr.dailyTarget, current: currentValue };
            onUpdateKR({ dailyTarget: updatedDailyTarget });
        }
        setIsEditing(false);
    };

    return (
        <div 
            onClick={() => onSelectTask(task.id)}
            className="bg-white p-4 rounded-lg border border-gray-200/80 shadow-sm cursor-pointer hover:border-gray-300 hover:shadow-md transition-all duration-200 min-h-[18rem] flex flex-col justify-between"
        >
            <div>
                <div className="flex items-start gap-2 mb-2">
                    <span className="text-xl leading-5 pt-0.5">🎯</span>
                    <p className="text-base font-medium text-brand-text flex-grow">{task.content}</p>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse mt-2">
                    {owner && (
                        <img src={owner.avatarUrl} alt={owner.name} title={owner.name} className="w-6 h-6 rounded-full" />
                    )}
                    <span className="text-sm text-gray-500">{owner?.name}</span>
                </div>
            </div>

            <div 
                className="mt-4 flex items-center justify-around cursor-pointer"
                onClick={(e) => { e.stopPropagation(); !isEditing && setIsEditing(true); }}
            >
                <div className={`relative w-24 h-24 ${getProgressColor(progress)}`}>
                    <CircularProgress progress={progress} />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-brand-text">
                        {progress.toFixed(0)}%
                    </div>
                </div>
                <div className="text-center">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="number"
                            value={currentValue}
                            onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                            onBlur={handleUpdate}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                            className="w-28 text-center text-3xl font-bold bg-transparent border-b-2 border-blue-400 focus:outline-none"
                        />
                    ) : (
                        <p className="text-3xl font-bold text-gray-800">
                            {formatValue(currentValue, kr.dailyTarget.type)}
                        </p>
                    )}
                    <p className="text-base text-gray-500 mt-1">از {formatValue(kr.dailyTarget.target, kr.dailyTarget.type)}</p>
                </div>
            </div>
        </div>
    );
};

export default DailyTargetTaskCard;