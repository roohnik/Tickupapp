import React from 'react';

interface ProgressBarProps {
  progress: number;
  colorClass?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, colorClass = 'bg-teal-500' }) => {
  const cappedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-500 ease-out ${colorClass}`}
        style={{ width: `${cappedProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;