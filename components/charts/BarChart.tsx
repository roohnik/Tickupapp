import React from 'react';

interface ChartData {
    label: string;
    value: number;
    color?: string;
}

interface BarChartProps {
    data: ChartData[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="w-full h-full flex items-end justify-around space-x-2 space-x-reverse px-2 pt-6">
            {data.map((item, index) => (
                <div key={item.label} className="flex-1 flex flex-col items-center h-full">
                    <div className="relative w-full flex-grow flex items-end justify-center">
                        <div
                            className="w-3/4 max-w-[50px] rounded-t-md transition-all duration-500 hover:opacity-80 relative"
                            style={{
                                height: `${(item.value / maxValue) * 100}%`,
                                backgroundColor: item.color || '#3b82f6',
                            }}
                        >
                            <span className="absolute -top-5 right-1/2 transform translate-x-1/2 text-xs font-semibold text-brand-text">
                                {item.value.toLocaleString('fa-IR')}
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-brand-subtext text-center break-words h-8 flex-shrink-0">
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BarChart;
