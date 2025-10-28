import { Objective, KeyResult, KRCategory } from '../types';

export const calculateKrProgress = (kr: KeyResult): number => {
    if (kr.isArchived) return 0;
    switch (kr.category) {
        case KRCategory.Standard:
        case KRCategory.Stretch: {
            const { startValue = 0, targetValue = 1, currentValue = 0 } = kr;
            if (targetValue === startValue) return currentValue >= targetValue ? 100 : 0;
            if (targetValue < startValue) { // Decreasing metric
              const progress = ((startValue - currentValue) / (startValue - targetValue)) * 100;
              return Math.max(0, Math.min(100, progress));
            }
            const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;
            return Math.max(0, Math.min(100, progress));
        }
        case KRCategory.Binary:
            return kr.currentValue === 1 ? 100 : 0;
        case KRCategory.Assignment: {
            const total = (kr.assignedTaskIds?.length || 0) + (kr.assignedFormIds?.length || 0);
            if (total === 0) return 0;
            const progress = (kr.currentValue / total) * 100;
            return Math.max(0, Math.min(100, progress));
        }
        default:
            return 0;
    }
};

export const calculateObjectiveProgress = (objective: Objective): number => {
    const visibleKRs = objective.keyResults.filter(kr => !kr.isArchived);
    if (!visibleKRs || visibleKRs.length === 0) return 0;
    
    const totalProgress = visibleKRs.reduce((acc, kr) => {
        return acc + calculateKrProgress(kr);
    }, 0);
    
    return totalProgress / visibleKRs.length;
};
