import React from 'react';

interface PieChartData {
    label: string;
    value: number; // percentage
    color: string;
}

interface PieChartProps {
    data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    // Sort data from largest to smallest for better visual stacking
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    const radius = 50;
    const cx = 60;
    const cy = 60;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercentage = 0;

    const segments = sortedData
        .map(item => {
            if (item.value <= 0) return null;

            const startPercentage = accumulatedPercentage;
            accumulatedPercentage += item.value;

            // Calculate positions for segment arc
            const dashArray = (item.value / 100) * circumference;
            const dashOffset = (startPercentage / 100) * circumference;

            // Calculate position for text in the middle of the arc
            const midAnglePercentage = startPercentage + item.value / 2;
            // Convert to radians, accounting for the SVG's -90deg rotation
            const midAngleRadians = ((midAnglePercentage / 100) * 360 - 90) * (Math.PI / 180);

            // The ring has a stroke width of 20 and is centered on a radius of 50.
            // It visually spans from radius 40 to 60. We'll place the text
            // slightly inside the center line for better visual balance.
            const textRadius = radius - 5; // Place text at radius 45 instead of 50

            const textX = cx + textRadius * Math.cos(midAngleRadians);
            const textY = cy + textRadius * Math.sin(midAngleRadians);


            return {
                ...item,
                dashArray,
                dashOffset,
                textX,
                textY,
            };
        })
        .filter((segment): segment is NonNullable<typeof segment> => segment !== null);

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="relative w-48 h-48">
                <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle
                        r={radius}
                        cx={cx}
                        cy={cy}
                        fill="transparent"
                        stroke="#f3f4f6" // background track
                        strokeWidth="20"
                    />
                    {/* Render all segment arcs first */}
                    {segments.map((segment, index) => (
                        <circle
                            key={`segment-${index}`}
                            r={radius}
                            cx={cx}
                            cy={cy}
                            fill="transparent"
                            stroke={segment.color}
                            strokeWidth="20"
                            strokeDasharray={`${segment.dashArray} ${circumference}`}
                            strokeDashoffset={-segment.dashOffset}
                            className="transition-all duration-500"
                        />
                    ))}
                    
                    {/* Then render all text labels on top */}
                    {segments.map((segment, index) => (
                        // Only show text for segments large enough to contain it
                        segment.value > 5 && (
                            <text
                                key={`text-${index}`}
                                x={segment.textX}
                                y={segment.textY}
                                fill="white"
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                // Counter-rotate the text to make it upright
                                transform={`rotate(90 ${segment.textX} ${segment.textY})`}
                            >
                                {`${segment.value.toFixed(0)}%`}
                            </text>
                        )
                    ))}
                </svg>
                 <div className="absolute inset-5 bg-white rounded-full"></div>
            </div>
            <div className="w-full md:w-auto space-y-2">
                {sortedData.map((item, index) => (
                    <div key={index} className="flex items-center text-sm">
                        <span className="w-3 h-3 rounded-sm ml-2 flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-brand-subtext truncate" title={item.label}>{item.label}: </span>
                        <span className="font-semibold text-brand-text mr-1 whitespace-nowrap">{item.value.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChart;