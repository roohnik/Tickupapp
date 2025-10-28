import React, { useState, useEffect, useRef } from 'react';

interface TaskPropertyRowProps {
  icon: React.ReactNode;
  label: string; // The current label text
  onLabelChange?: (newLabel: string) => void; // Optional callback to make it editable
  children: React.ReactNode;
}

const TaskPropertyRow: React.FC<TaskPropertyRowProps> = ({ icon, label, onLabelChange, children }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentLabel, setCurrentLabel] = useState(label);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCurrentLabel(label);
    }, [label]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleLabelBlur = () => {
        setIsEditing(false);
        if (currentLabel.trim() && currentLabel.trim() !== label) {
            onLabelChange?.(currentLabel.trim());
        } else {
            setCurrentLabel(label);
        }
    };
    
    const renderLabel = () => {
        if (onLabelChange) { // Only make it editable if the handler is provided
            if (isEditing) {
                return (
                    <input
                        ref={inputRef}
                        type="text"
                        value={currentLabel}
                        onChange={(e) => setCurrentLabel(e.target.value)}
                        onBlur={handleLabelBlur}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleLabelBlur();
                            if (e.key === 'Escape') {
                                setIsEditing(false);
                                setCurrentLabel(label);
                            }
                        }}
                        className="p-0 border-0 focus:ring-1 focus:ring-blue-400 rounded-sm bg-gray-200/50"
                    />
                );
            }
            return <span onClick={() => setIsEditing(true)} className="cursor-pointer">{label}</span>;
        }
        return <span>{label}</span>; // Not editable
    };

    return (
        <div className="grid grid-cols-3 items-center text-sm group hover:bg-gray-100/70 rounded px-1 py-1.5 transition-colors">
          <div className="col-span-1 flex items-center text-brand-subtext">
            <div className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center">{icon}</div>
            {renderLabel()}
          </div>
          <div className="col-span-2">
            {children}
          </div>
        </div>
    );
};

export default TaskPropertyRow;