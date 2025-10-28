import React from 'react';

interface ChartData {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: ChartData[];
    totalValue: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, totalValue }) => {
    let cumulativePercentage = 0;
    const gradients = data
        .filter(item => item.value > 0)
        .map(item => {
            const percentage = (item.value / totalValue) * 100;
            const startAngle = cumulativePercentage;
            cumulativePercentage += percentage;
            const endAngle = cumulativePercentage;
            return `${item.color} ${startAngle}% ${endAngle}%`;
        })
        .join(', ');

    const conicGradient = `conic-gradient(${gradients})`;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div 
                className="relative w-40 h-40 rounded-full" 
                style={{ background: totalValue > 0 ? conicGradient : '#e5e7eb' }}
            >
                <div className="absolute inset-2 bg-brand-secondary rounded-full flex items-center justify-center">
                    <div className="text-center">
                        <span className="text-3xl font-bold text-brand-text">{totalValue}</span>
                        <span className="block text-xs text-brand-subtext">کل</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
                {data.map(item => (
                    <div key={item.label} className="flex items-center text-xs">
                        <span className="w-2.5 h-2.5 rounded-full ml-1.5" style={{ backgroundColor: item.color }}></span>
                        <span className="text-brand-subtext">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart;
