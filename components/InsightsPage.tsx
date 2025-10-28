import React, { useMemo } from 'react';
import { Objective, CheckIn } from '../types';
import ProgressBar from './ProgressBar';

interface InsightsPageProps {
  objectives: Objective[];
}

const calculateProgress = (item: Objective | { keyResults: Objective['keyResults'] }) => {
    if (!item.keyResults || item.keyResults.length === 0) return 0;
    const totalProgress = item.keyResults.reduce((acc, kr) => {
      let progress = 0;
      if (kr.targetValue !== kr.startValue) {
        if (kr.targetValue < kr.startValue) {
            progress = ((kr.startValue - kr.currentValue) / (kr.startValue - kr.targetValue)) * 100;
        } else {
            progress = ((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue)) * 100;
        }
      } else if (kr.currentValue >= kr.targetValue) {
        progress = 100;
      }
      return acc + Math.max(0, Math.min(100, progress));
    }, 0);
    return totalProgress / item.keyResults.length;
};


const InsightsPage: React.FC<InsightsPageProps> = ({ objectives }) => {
    const insightsData = useMemo(() => {
        if (objectives.length === 0) {
            return {
                totalObjectives: 0,
                averageProgress: 0,
                sortedObjectives: [],
                allChallenges: [],
            };
        }

        const objectivesWithProgress = objectives.map(obj => ({
            ...obj,
            progress: calculateProgress(obj),
        }));
        
        const sortedObjectives = [...objectivesWithProgress].sort((a, b) => b.progress - a.progress);
        
        const totalProgressSum = objectivesWithProgress.reduce((sum, obj) => sum + obj.progress, 0);
        const averageProgress = totalProgressSum / objectives.length;

        const allChallenges = objectives.flatMap(obj => 
            obj.keyResults.flatMap(kr => 
                kr.checkIns
                    .filter(ci => typeof ci.report === 'object' && ci.report.challenges)
                    .map(ci => ({
                        text: (ci.report as {challenges: string}).challenges,
                        difficulty: ci.challengeDifficulty,
                        krTitle: kr.title,
                        date: ci.date,
                    }))
            )
        ).sort((a, b) => b.difficulty - a.difficulty);

        return {
            totalObjectives: objectives.length,
            averageProgress,
            sortedObjectives,
            allChallenges,
        };
    }, [objectives]);
    
    const { totalObjectives, averageProgress, sortedObjectives, allChallenges } = insightsData;
    const bestObjective = sortedObjectives[0];
    const worstObjectives = sortedObjectives.slice(-3).reverse();
    
    const difficultyColors: {[key: number]: string} = {
        1: 'bg-green-100 text-green-800', 2: 'bg-yellow-100 text-yellow-800', 3: 'bg-orange-100 text-orange-800', 4: 'bg-red-100 text-red-800', 5: 'bg-red-200 text-red-900 font-bold'
    };
    const difficultyLabels: {[key: number]: string} = {1: 'بسیار کم', 2: 'کم', 3: 'متوسط', 4: 'زیاد', 5: 'بسیار زیاد'};

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-2xl font-bold text-brand-text mb-6">داشبورد بینش</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-brand-subtext text-sm font-medium">کل اهداف</h3>
                <p className="text-3xl font-bold text-brand-text mt-2">{totalObjectives}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-brand-subtext text-sm font-medium">میانگین پیشرفت</h3>
                <p className="text-3xl font-bold text-brand-text mt-2">{averageProgress.toFixed(1)}%</p>
                <div className="mt-3">
                    <ProgressBar progress={averageProgress} />
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-brand-subtext text-sm font-medium">قوی‌ترین هدف</h3>
                {bestObjective ? (
                    <>
                        <p className="text-md font-semibold text-brand-primary mt-2 truncate">{bestObjective.title}</p>
                        <p className="text-sm text-brand-subtext">{bestObjective.progress.toFixed(1)}% پیشرفت</p>
                    </>
                ) : <p className="text-sm text-gray-500 mt-2">هدفی یافت نشد.</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weakest Objectives */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-brand-text mb-4">اهدافی که نیاز به توجه دارند</h2>
                 {worstObjectives.length > 0 ? (
                    <div className="space-y-4">
                        {worstObjectives.map(obj => (
                            <div key={obj.id}>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-medium text-brand-text text-sm">{obj.title}</p>
                                    <p className="font-semibold text-sm">{obj.progress.toFixed(1)}%</p>
                                </div>
                                <ProgressBar progress={obj.progress} />
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-gray-500">تمام اهداف در وضعیت خوبی هستند.</p>}
            </div>

            {/* Obstacles */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-brand-text mb-4">موانع و چالش‌ها (به ترتیب سختی)</h2>
                {allChallenges.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {allChallenges.map((challenge, index) => (
                        <div key={index} className="p-3 rounded-md border bg-gray-50/50">
                            <p className="text-sm text-brand-text">{challenge.text}</p>
                            <div className="flex items-center justify-between mt-2 text-xs text-brand-subtext">
                                <span>مرتبط با: {challenge.krTitle}</span>
                                <span className={`px-2 py-0.5 rounded-full ${difficultyColors[challenge.difficulty]}`}>
                                    سختی: {difficultyLabels[challenge.difficulty]}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                ) : <p className="text-sm text-gray-500">هیچ چالشی گزارش نشده است.</p>}
            </div>
        </div>
    </main>
  );
};

export default InsightsPage;