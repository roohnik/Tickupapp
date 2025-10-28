import React from 'react';

interface DailyScore {
  date: Date;
  score: number | null; // null if no data for the day
}

interface ProcessStatusChartProps {
  dailyScores: DailyScore[]; // Should be an array of 90 days
}

const ProcessStatusChart: React.FC<ProcessStatusChartProps> = ({ dailyScores }) => {
  const getColor = (score: number | null) => {
    if (score === null) {
      return 'bg-gray-200 dark:bg-slate-700'; // Adjusted for better visibility on both themes
    }
    if (score > 80) {
      return 'bg-emerald-400'; // Vibrant green
    }
    if (score >= 50) {
      return 'bg-amber-400'; // Golden yellow
    }
    return 'bg-rose-500'; // Hot pink/red
  };

  // Ensure we have exactly 90 days for display, padding if necessary
  const displayScores = [...dailyScores].slice(-90);
  while (displayScores.length < 90) {
      const firstDate = displayScores[0]?.date || new Date();
      const prevDate = new Date(firstDate);
      prevDate.setDate(prevDate.getDate() - 1);
      displayScores.unshift({ date: prevDate, score: null });
  }

  return (
    <div>
      <div className="flex w-full items-center h-14 overflow-hidden rounded-sm" dir="ltr">
        {displayScores.map((day, index) => (
          <div
            key={index}
            className={`flex-1 h-full transition-colors duration-300 ${getColor(day.score)}`}
            title={`${day.date.toLocaleDateString('fa-IR')}: ${
              day.score !== null ? day.score.toFixed(0) : 'N/A'
            }`}
          ></div>
        ))}
      </div>
      <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
        <span>۹۰ روز گذشته</span>
        <span>امروز</span>
      </div>
    </div>
  );
};

export default ProcessStatusChart;