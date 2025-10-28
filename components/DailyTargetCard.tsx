import React, { useState, useEffect, useRef } from 'react';
import { KeyResult, User, KRType } from '../types';
import { EditIcon, ArchiveBoxIcon, TrashIcon, PlusIcon, CheckCircleIcon } from './Icons';

interface DailyTargetCardProps {
  kr: KeyResult & { objectiveId: string; objectiveTitle: string };
  owner?: User;
  onUpdateKR: (updates: Partial<KeyResult>) => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isAddedToAnjam: boolean;
  onToggleAnjamTask: () => void;
}

const CircularProgress: React.FC<{ progress: number }> = ({ progress }) => {
    const radius = 35;
    const stroke = 5;
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
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};

const DailyTargetCard: React.FC<DailyTargetCardProps> = ({ kr, owner, onUpdateKR, onEdit, onArchive, onDelete, isAddedToAnjam, onToggleAnjamTask }) => {
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
    
    const handleToggleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleAnjamTask();
    };

    const today = new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
    const progress = (currentValue / (kr.dailyTarget.target || 1)) * 100;

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
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative group">
             <div className="absolute top-2 left-2 flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-full p-1 z-10">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-blue-600" title="ویرایش"><EditIcon className="w-4 h-4"/></button>
                <button onClick={(e) => { e.stopPropagation(); onArchive(); }} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-yellow-600" title="آرشیو"><ArchiveBoxIcon className="w-4 h-4"/></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600" title="حذف"><TrashIcon className="w-4 h-4"/></button>
                <button
                    onClick={handleToggleClick}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200"
                    title={isAddedToAnjam ? "حذف از کارهای امروز" : "افزودن به کارهای امروز"}
                >
                    {isAddedToAnjam ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <PlusIcon className="w-4 h-4" />}
                </button>
            </div>
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        {owner && <img src={owner.avatarUrl} alt={owner.name} className="w-8 h-8 rounded-full" />}
                        <p className="font-semibold text-brand-text mr-3">{owner?.name}</p>
                    </div>
                    <div className="text-xs text-gray-400">{today}</div>
                </div>
                <div>
                    <p className="text-xs text-gray-500 truncate" title={kr.objectiveTitle}>از: {kr.objectiveTitle}</p>
                    <h3 className="font-semibold text-gray-800 mt-1">{kr.title}</h3>
                </div>
            </div>

            <div 
                className="mt-4 pt-4 border-t border-gray-100 flex flex-col items-center cursor-pointer"
                onClick={() => !isEditing && setIsEditing(true)}
            >
                <div className={`relative w-20 h-20 ${getProgressColor(progress)}`}>
                    <CircularProgress progress={progress} />
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-brand-text">
                        {progress.toFixed(0)}%
                    </div>
                </div>
                <div className="mt-2 text-center">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="number"
                            value={currentValue}
                            onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                            onBlur={handleUpdate}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                            className="w-24 text-center text-2xl font-bold bg-transparent border-b-2 border-blue-400 focus:outline-none"
                        />
                    ) : (
                        <p className="text-2xl font-bold text-gray-800">
                            {formatValue(currentValue, kr.dailyTarget.type)}
                        </p>
                    )}
                    <p className="text-sm text-gray-500">از {formatValue(kr.dailyTarget.target, kr.dailyTarget.type)}</p>
                </div>
            </div>
        </div>
    );
};

export default DailyTargetCard;