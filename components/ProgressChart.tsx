import React from 'react';
import { Objective } from '../types';

interface ProgressChartProps {
  objective: Objective;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ objective }) => {
    const allCheckins = objective.keyResults
        .flatMap(kr => kr.checkIns.map(ci => ({ date: new Date(ci.date), value: kr.currentValue, start: kr.startValue, target: kr.targetValue })))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (allCheckins.length < 1) {
        return (
             <div className="w-full h-40 bg-gray-50/70 rounded-lg p-4 flex items-center justify-center border border-dashed">
                <p className="text-sm text-gray-500">داده کافی برای نمایش نمودار وجود ندارد.</p>
             </div>
        );
    }

    const dataPoints = objective.keyResults.map(kr => {
        const progress = kr.targetValue === kr.startValue ? (kr.currentValue >= kr.targetValue ? 100: 0) : Math.max(0, Math.min(100, ((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue)) * 100));
        return { date: kr.checkIns.length > 0 ? new Date(kr.checkIns[kr.checkIns.length - 1].date) : new Date(), progress };
    }).sort((a,b) => a.date.getTime() - b.date.getTime());


    const width = 300;
    const height = 100;
    const padding = 20;

    const minDate = dataPoints[0]?.date.getTime() || new Date().getTime();
    const maxDate = dataPoints[dataPoints.length-1]?.date.getTime() || new Date().getTime();
    
    const dateRange = maxDate - minDate || 1; // Avoid division by zero
    
    const getX = (date: Date) => ((date.getTime() - minDate) / dateRange) * (width - padding * 2) + padding;
    const getY = (progress: number) => height - padding - (progress / 100) * (height - padding * 2);

    const pathData = dataPoints.map((point, i) => {
        const x = getX(point.date);
        const y = getY(point.progress);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const lastPoint = dataPoints[dataPoints.length - 1];
    const lastPointX = lastPoint ? getX(lastPoint.date) : 0;
    const lastPointY = lastPoint ? getY(lastPoint.progress) : 0;

    return (
        <div className="w-full h-48 bg-gray-50/70 rounded-lg p-4 border relative">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                {/* Dashed line for 100% */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="2 2" />
                {/* Dashed line for 0% */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d1d5db" strokeWidth="0.5" />

                {pathData && (
                    <>
                        <path d={pathData} stroke="#14B8A6" strokeWidth="1.5" fill="none" />
                        <circle cx={lastPointX} cy={lastPointY} r="3" fill="#14B8A6" stroke="white" strokeWidth="1" />
                    </>
                )}
            </svg>
             <div className="absolute top-2 left-2 text-xs text-gray-400">100%</div>
             <div className="absolute bottom-2 left-2 text-xs text-gray-400">0%</div>
        </div>
    );
};

export default ProgressChart;
