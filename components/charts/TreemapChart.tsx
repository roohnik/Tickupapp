// This is a new file: components/charts/TreemapChart.tsx
import React, { useMemo, useState, useRef, useEffect } from 'react';

interface TreemapData {
    label: string;
    value: number;
    color: string;
}

interface TreemapProps {
    data: TreemapData[];
}

interface TreemapNode extends TreemapData {
    x: number;
    y: number;
    width: number;
    height: number;
}

const TreemapChart: React.FC<TreemapProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setContainerSize({ width, height });
            }
        });

        const currentRef = containerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    const nodes = useMemo<TreemapNode[]>(() => {
        if (!data || data.length === 0 || containerSize.width === 0 || containerSize.height === 0) {
            return [];
        }

        const sortedData = [...data].sort((a, b) => b.value - a.value);
        const finalNodes: TreemapNode[] = [];

        const layout = (items: TreemapData[], x: number, y: number, width: number, height: number) => {
            if (items.length === 0) return;

            const totalValue = items.reduce((sum, item) => sum + item.value, 0);
            if (totalValue === 0) return;

            const currentItem = items[0];
            const restItems = items.slice(1);

            const itemPortion = currentItem.value / totalValue;

            if (width > height) { // Split vertically
                const itemWidth = width * itemPortion;
                finalNodes.push({ ...currentItem, x, y, width: itemWidth, height });
                layout(restItems, x + itemWidth, y, width - itemWidth, height);
            } else { // Split horizontally
                const itemHeight = height * itemPortion;
                finalNodes.push({ ...currentItem, x, y, width, height: itemHeight });
                layout(restItems, x, y + itemHeight, width, height - itemHeight);
            }
        };
        
        layout(sortedData, 0, 0, containerSize.width, containerSize.height);

        return finalNodes;
    }, [data, containerSize]);

    const totalValue = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

    return (
        <div ref={containerRef} className="w-full h-72 relative rounded-lg overflow-hidden bg-gray-50">
            {nodes.map(node => {
                if (totalValue === 0) return null;
                const percentage = (node.value / totalValue) * 100;
                // Adjust font size based on rectangle area
                const area = node.width * node.height;
                let fontSize = 'text-[10px]';
                if (area > 8000) fontSize = 'text-xs';
                if (area > 15000) fontSize = 'text-sm';

                const canShowText = node.width > 50 && node.height > 25;

                return (
                    <div
                        key={node.label}
                        className="absolute p-2 box-border overflow-hidden transition-all duration-500 ease-in-out border-2 border-white dark:border-slate-800"
                        title={`${node.label}: ${percentage.toFixed(1)}%`}
                        style={{
                            left: `${node.x}px`,
                            top: `${node.y}px`,
                            width: `${node.width}px`,
                            height: `${node.height}px`,
                            backgroundColor: node.color,
                        }}
                    >
                        {canShowText && (
                            <div className="text-white font-bold h-full flex flex-col justify-start">
                                <p className={`${fontSize} leading-tight`}>{node.label}</p>
                                <p className="text-xs opacity-80 mt-1">{percentage.toFixed(0)}%</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default TreemapChart;
