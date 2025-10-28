// This is a new file: components/charts/ProgressRingCard.tsx
import React from 'react';
import { CheckIcon } from '../Icons';

interface ProgressRingCardProps {
    title: string;
    percentage: number;
    Icon: React.FC<{ className?: string }>;
    color: 'green' | 'orange' | 'gray' | 'blue' | 'purple' | 'indigo' | 'yellow' | 'red' | 'amber';
    valueText?: string;
}

const colorMap = {
    green: 'text-green-500',
    orange: 'text-orange-500',
    gray: 'text-gray-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    indigo: 'text-indigo-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    amber: 'text-amber-500',
};

const ProgressRingCard: React.FC<ProgressRingCardProps> = ({ title, percentage, Icon, color, valueText }) => {
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="p-4 rounded-lg bg-gray-50/50 border flex flex-col items-center">
            <h4 className="font-semibold text-brand-text mb-3">{title}</h4>
            <div className={`relative w-32 h-32 ${colorMap[color]}`}>
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90 absolute inset-0 m-auto"
                >
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
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <Icon className={`w-10 h-10 ${colorMap[color]}`} />
                    </div>
                </div>
            </div>
            <div className="text-center mt-3">
                {valueText && <p className="font-bold text-lg text-brand-text">{valueText}</p>}
                <p className="font-bold text-2xl text-brand-text">{percentage.toFixed(0)}%</p>
            </div>
        </div>
    );
};

export default ProgressRingCard;
