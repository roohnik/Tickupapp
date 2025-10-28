

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Objective, User, Team, CheckIn, Task, FormSubmission, Form, Strategy, CompanyVision, KRCategory, Project, FeedbackTag, ComponentStyles, GeneralFeedback, Process, FeedbackCategory } from '../types';
import { 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    ChatBubbleOvalLeftEllipsisIcon, 
    DocumentTextIcon, 
    SparklesIcon, 
    ChevronRightIcon, 
    CalendarIcon,
    TrophyIcon,
    LightbulbIcon,
    ThanksIcon,
    GraduationCapIcon,
    ICONS,
    XCircleIcon,
    CubeIcon,
    GoalIcon,
    RocketIcon,
    ClipboardListIcon,
    ClockIcon,
    CheckIcon,
    PlusIcon,
    ArrowLeftIcon,
    FunnelIcon,
    FlagIcon,
    ChecklistIcon
} from './Icons';
import { toPersianDate, getStartOfWeek, getStartOfQuarter } from '../utils/dateUtils';
import ProgressRingCard from './charts/ProgressRingCard';
import CreateFeedbackModal from '../modals/CreateFeedbackModal';
import { calculateScoreForSubmission, calculateMaxScoreForFields } from '../utils/formUtils';
import { calculateObjectiveProgress } from '../utils/objectiveUtils';
import { KANBAN_COLOR_MAP, FEEDBACK_CATEGORY_DETAILS } from '../constants';
import StarRating from './StarRating';
import PieChart from './charts/PieChart';
import TreemapChart from './charts/TreemapChart';
import ProcessStatusChart from './charts/ProcessStatusChart';


interface ReportsPageProps {
  objectives: Objective[];
  users: User[];
  teams: Team[];
  currentUser: User;
  tasks: Task[];
  submissions: FormSubmission[];
  forms: Form[];
  processes: Process[];
  strategies: Strategy[];
  companyVision: CompanyVision;
  projects: Project[];
  feedbackTags: FeedbackTag[];
  onAddGeneralFeedback: (data: Omit<GeneralFeedback, 'id' | 'giverId' | 'createdAt'>) => void;
  componentStyles: ComponentStyles;
  generalFeedbacks: GeneralFeedback[];
  onSelectFeedback: (feedback: GeneralFeedback) => void;
  dailyPerformance: { [date: string]: { rating?: number; feedback?: string; feeling?: string; } };
}

type ActiveReportTab = 'tasks' | 'processes' | 'objectives' | 'feedbacks';

const TABS: { id: ActiveReportTab, label: string, Icon: React.FC<any> }[] = [
    { id: 'tasks', label: 'وظایف', Icon: ClipboardListIcon },
    { id: 'processes', label: 'فرایندها', Icon: CubeIcon },
    { id: 'objectives', label: 'اهداف', Icon: GoalIcon },
    { id: 'feedbacks', label: 'بازخوردها', Icon: ChatBubbleOvalLeftEllipsisIcon },
];

const PIE_CHART_COLORS = [
    '#3b82f6', // blue-500
    '#8b5cf6', // purple-500
    '#10b981', // green-500
    '#f97316', // orange-500
    '#ef4444', // red-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
    '#f59e0b', // amber-500
    '#06b6d4', // cyan-500
    '#d946ef', // fuchsia-500
];

const ProcessReportCard: React.FC<{
    process: Process & { percentage: number };
    dailyScores: { date: Date, score: number | null }[];
}> = ({ process, dailyScores }) => {
    const Icon = ICONS[process.icon] || CubeIcon;
    const colorScheme = KANBAN_COLOR_MAP[process.color] || KANBAN_COLOR_MAP.gray;

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start">
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorScheme.bg} mr-3`}>
                        <Icon className={`w-6 h-6 ${colorScheme.text}`} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-brand-text dark:text-slate-200">{process.name}</h4>
                        <p className="text-xs text-brand-subtext dark:text-slate-400">{process.description}</p>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-brand-text dark:text-slate-200">{process.percentage.toFixed(0)}%</p>
                    <p className="text-xs text-brand-subtext dark:text-slate-400">میانگین ۹۰ روز</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t dark:border-slate-700">
                <ProcessStatusChart dailyScores={dailyScores} />
            </div>
        </div>
    );
};

interface FeedbackRowProps {
    feedback: GeneralFeedback;
    giver: User | undefined;
    receiver: User | undefined;
    categoryDetails: { label: string, color: string, Icon: React.FC<any> };
    onClick: () => void;
}
const FeedbackRow: React.FC<FeedbackRowProps> = ({ feedback, giver, receiver, categoryDetails, onClick }) => {
    return (
        <tr onClick={onClick} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer">
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                    <categoryDetails.Icon className="w-5 h-5 ml-2" style={{ color: categoryDetails.color }} />
                    <span className="font-medium text-brand-text dark:text-slate-200">{categoryDetails.label}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <p className="text-sm text-gray-700 dark:text-slate-300 max-w-md truncate" title={feedback.comment}>
                    {feedback.comment}
                </p>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                    {giver && <img src={giver.avatarUrl} alt={giver.name} className="w-6 h-6 rounded-full" />}
                    <span className="ml-2 text-sm text-gray-600 dark:text-slate-400">{giver?.name}</span>
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                    {receiver && <img src={receiver.avatarUrl} alt={receiver.name} className="w-6 h-6 rounded-full" />}
                    <span className="ml-2 text-sm text-gray-600 dark:text-slate-400">{receiver?.name}</span>
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                {toPersianDate(feedback.createdAt)}
            </td>
        </tr>
    );
};


const isOnDate = (isoString: string | undefined, date: Date): boolean => {
    if (!isoString) return false;
    const itemDate = new Date(isoString);
    return itemDate.getUTCFullYear() === date.getFullYear() &&
           itemDate.getUTCMonth() === date.getMonth() &&
           itemDate.getUTCDate() === date.getDate();
};

const DayPerformanceCard: React.FC<{ 
    day: Date; 
    completedTasksCount: number; 
    totalTasksCount: number; 
    rating?: number;
    feeling?: string;
    feedback?: string;
}> = ({ day, completedTasksCount, totalTasksCount, rating, feeling, feedback }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isFuture = day > today;
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    
    if (isFuture) {
        return (
            <div className="w-24 h-32 rounded-lg flex flex-col items-center justify-center p-2 bg-gray-100/50 border border-dashed border-gray-300">
                <div className="text-xs font-semibold text-gray-400">
                    {day.toLocaleDateString('fa-IR', { weekday: 'short' })}
                </div>
            </div>
        );
    }

    const allTasksDone = totalTasksCount > 0 && completedTasksCount === totalTasksCount;
    const hasTooltipContent = feeling || feedback;

    return (
        <div
            className={`relative w-24 h-32 rounded-lg flex flex-col items-center p-2 transition-all duration-300 ${allTasksDone ? 'bg-green-100/60 border border-green-300/70 justify-between' : 'bg-gray-50/70 border border-gray-200/80'} ${hasTooltipContent ? 'cursor-pointer' : ''}`}
            onMouseEnter={() => hasTooltipContent && setIsTooltipVisible(true)}
            onMouseLeave={() => hasTooltipContent && setIsTooltipVisible(false)}
            onClick={() => hasTooltipContent && setIsTooltipVisible(p => !p)}
        >
            {allTasksDone ? (
                <>
                    <div className="text-sm font-semibold text-green-800">
                        {day.toLocaleDateString('fa-IR', { weekday: 'short' })}
                    </div>
                    <CheckCircleIcon className="w-10 h-10 text-green-500" />
                    <div className="w-full">
                         <StarRating rating={rating || 0} size="w-4 h-4" />
                    </div>
                </>
            ) : (
                <>
                    <div className="text-sm font-semibold text-gray-700 flex-shrink-0">
                        {day.toLocaleDateString('fa-IR', { weekday: 'short' })}
                    </div>
                    <div className="flex-grow flex items-center justify-center">
                        <span className="text-3xl font-light text-gray-300 dark:text-gray-600">
                            {completedTasksCount}
                        </span>
                    </div>
                    <div className="w-full flex-shrink-0">
                         <StarRating rating={rating || 0} size="w-4 h-4" />
                    </div>
                </>
            )}
            {isTooltipVisible && hasTooltipContent && (
                 <div
                    className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-sm rounded-lg shadow-lg p-3 z-10 animate-fade-in"
                >
                    {feeling && (
                        <div className="flex items-center mb-2">
                            <span className="text-2xl ml-2">{feeling.split(' ')[1]}</span>
                            <span className="font-semibold">{feeling.split(' ')[0]}</span>
                        </div>
                    )}
                    {feedback && <p className="text-xs whitespace-pre-wrap">{feedback}</p>}
                    <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                </div>
            )}
        </div>
    );
};

const WeeklyPerformanceTracker: React.FC<{
    tasks: Task[];
    dailyPerformance: { [date: string]: { rating?: number; feedback?: string; feeling?: string; } };
}> = ({ tasks, dailyPerformance }) => {

    const performanceData = useMemo(() => {
        const startOfWeek = getStartOfWeek(new Date());

        const currentWeekDays = Array.from({ length: 7 }).map((_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            return day;
        });

        return currentWeekDays.map(day => {
            const tasksForDay = tasks.filter(t => t.dueDate && isOnDate(t.dueDate, day));
            const completedTasksCount = tasksForDay.filter(t => t.status === 'انجام شد').length;
            const totalTasksCount = tasksForDay.length;

            const dateKey = day.toISOString().split('T')[0];
            const rating = dailyPerformance[dateKey]?.rating;
            const feeling = dailyPerformance[dateKey]?.feeling;
            const feedback = dailyPerformance[dateKey]?.feedback;

            return { day, completedTasksCount, totalTasksCount, rating, feeling, feedback };
        });
    }, [tasks, dailyPerformance]);
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-8">
            <h3 className="font-medium text-lg mb-4 text-gray-600 dark:text-gray-400">چقدر از کارهای این هفته‌ت رو انجام دادی؟</h3>
            <div className="flex justify-around items-center space-x-2 space-x-reverse">
                {performanceData.map(data => (
                    <DayPerformanceCard 
                        key={data.day.toISOString()} 
                        day={data.day} 
                        completedTasksCount={data.completedTasksCount} 
                        totalTasksCount={data.totalTasksCount}
                        rating={data.rating} 
                        feeling={data.feeling}
                        feedback={data.feedback}
                    />
                ))}
            </div>
        </div>
    );
};


const ReportsPage: React.FC<ReportsPageProps> = (props) => {
    const { objectives, tasks, submissions, strategies, companyVision, projects, users, feedbackTags, onAddGeneralFeedback, componentStyles, processes, forms, generalFeedbacks, onSelectFeedback, dailyPerformance } = props;
    const [activeTab, setActiveTab] = useState<ActiveReportTab>('objectives');
    const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all');
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);
    
    const projectFilterButtonRef = useRef<HTMLButtonElement>(null);
    const projectFilterPopoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (
            isProjectFilterOpen &&
            projectFilterPopoverRef.current &&
            !projectFilterPopoverRef.current.contains(event.target as Node) &&
            projectFilterButtonRef.current &&
            !projectFilterButtonRef.current.contains(event.target as Node)
        ) {
            setIsProjectFilterOpen(false);
        }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProjectFilterOpen]);
    
    // States for Feedbacks Tab
    const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<'all' | FeedbackCategory>('all');
    const [showAllFeedbacks, setShowAllFeedbacks] = useState(false);
    
    const today = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const startOfWeek = getStartOfWeek(today);

    // Memoized data for Tasks Tab
    const tasksData = useMemo(() => {
        const baseTasks = selectedProjectId === 'all'
            ? tasks
            : tasks.filter(t => t.projectId === selectedProjectId);

        const dailyTasks = baseTasks.filter(t => t.dueDate && new Date(t.dueDate) >= startOfToday);
        const weeklyTasks = baseTasks.filter(t => t.dueDate && new Date(t.dueDate) >= startOfWeek);

        const calculateStats = (taskList: Task[]) => {
            if (taskList.length === 0) return { done: 0, inProgress: 0, todo: 0, total: 0 };
            const done = taskList.filter(t => t.status === 'انجام شد').length;
            const inProgress = taskList.filter(t => t.status === 'در حال پیشرفت').length;
            const todo = taskList.filter(t => t.status === 'برای انجام').length;
            return { done, inProgress, todo, total: taskList.length };
        };

        return {
            daily: calculateStats(dailyTasks),
            weekly: calculateStats(weeklyTasks),
        };
    }, [tasks, startOfToday, startOfWeek, selectedProjectId]);
    
    const processedProcessesData = useMemo(() => {
        const startTime = new Date(); // 90 days ago for average
        startTime.setDate(startTime.getDate() - 90);
        startTime.setHours(0,0,0,0);

        return processes.map(process => {
            const relevantVariables = process.variableIds;
            if (relevantVariables.length === 0) return { ...process, percentage: 0 };
            
            const relevantFormsAndFields = forms.reduce((acc, form) => {
                const formVars = form.variables?.filter(v => relevantVariables.includes(v.id));
                if (formVars && formVars.length > 0) {
                    const fieldIds = formVars.flatMap(v => v.fieldIds);
                    acc.push({ form, fieldIds });
                }
                return acc;
            }, [] as { form: Form, fieldIds: string[] }[]);

            if (relevantFormsAndFields.length === 0) return { ...process, percentage: 0 };

            const relevantFormIds = relevantFormsAndFields.map(item => item.form.id);
            const relevantSubmissions = submissions.filter(s =>
                relevantFormIds.includes(s.formId) && new Date(s.submittedAt) >= startTime
            );

            if (relevantSubmissions.length === 0) return { ...process, percentage: 0 };

            let totalPercentageSum = 0;
            let countedSubmissions = 0;

            relevantSubmissions.forEach(submission => {
                const formAndFields = relevantFormsAndFields.find(item => item.form.id === submission.formId);
                if (!formAndFields) return;
                const { form, fieldIds } = formAndFields;

                if (!form.enableCalculations) return;

                const fieldsForMaxScore = form.fields.filter(f => fieldIds.includes(f.id));
                const maxScore = calculateMaxScoreForFields(fieldsForMaxScore);

                if (maxScore > 0) {
                    const actualScore = calculateScoreForSubmission(submission, form, fieldIds);
                    totalPercentageSum += (actualScore / maxScore) * 100;
                    countedSubmissions++;
                }
            });
            
            return { ...process, percentage: countedSubmissions > 0 ? totalPercentageSum / countedSubmissions : 0 };
        });
    }, [processes, forms, submissions]);

    const processDailyScores = useMemo(() => {
        const last90Days = Array.from({ length: 90 }).map((_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            return d;
        }).reverse();

        const scoresByProcess = new Map<string, { date: Date, score: number | null }[]>();

        processes.forEach(process => {
            const relevantVariables = process.variableIds;
            if (relevantVariables.length === 0) {
                scoresByProcess.set(process.id, last90Days.map(date => ({ date, score: Math.random() * 100 })));
                return;
            }

            const relevantFormsAndFields = forms.reduce((acc, form) => {
                const formVars = form.variables?.filter(v => relevantVariables.includes(v.id));
                if (formVars && formVars.length > 0) {
                    const fieldIds = formVars.flatMap(v => v.fieldIds);
                    acc.push({ form, fieldIds });
                }
                return acc;
            }, [] as { form: Form, fieldIds: string[] }[]);
            
            if (relevantFormsAndFields.length === 0) {
                scoresByProcess.set(process.id, last90Days.map(date => ({ date, score: Math.random() * 100 })));
                return;
            }

            const relevantFormIds = relevantFormsAndFields.map(item => item.form.id);
            const relevantSubmissions = submissions.filter(s =>
                relevantFormIds.includes(s.formId) && new Date(s.submittedAt) >= last90Days[0]
            );

            const dailyScores = last90Days.map(day => {
                const submissionsForDay = relevantSubmissions.filter(s => 
                    new Date(s.submittedAt).toDateString() === day.toDateString()
                );

                if (submissionsForDay.length === 0) {
                    // Weighted random score for demo purposes: mostly green, some orange/red.
                    const random = Math.random();
                    let score;
                    if (random < 0.7) { // 70% chance of green
                        score = 81 + Math.random() * 19;
                    } else if (random < 0.9) { // 20% chance of orange
                        score = 50 + Math.random() * 30;
                    } else { // 10% chance of red
                        score = Math.random() * 49;
                    }
                    return { date: day, score };
                }

                let totalPercentageSum = 0;
                let countedSubmissions = 0;

                submissionsForDay.forEach(submission => {
                    const formAndFields = relevantFormsAndFields.find(item => item.form.id === submission.formId);
                    if (!formAndFields) return;
                    const { form, fieldIds } = formAndFields;

                    if (!form.enableCalculations) return;

                    const fieldsForMaxScore = form.fields.filter(f => fieldIds.includes(f.id));
                    const maxScore = calculateMaxScoreForFields(fieldsForMaxScore);

                    if (maxScore > 0) {
                        const actualScore = calculateScoreForSubmission(submission, form, fieldIds);
                        totalPercentageSum += (actualScore / maxScore) * 100;
                        countedSubmissions++;
                    }
                });

                const averagePercentage = countedSubmissions > 0 ? totalPercentageSum / countedSubmissions : 0;
                return { date: day, score: averagePercentage };
            });

            scoresByProcess.set(process.id, dailyScores);
        });

        return scoresByProcess;
    }, [processes, forms, submissions]);
    
    // Memoized data for Objectives Tab
    const roadmapObjective = useMemo(() => objectives.find(o => !o.isArchived), [objectives]);
    const objectiveProgress = useMemo(() => {
        if (!roadmapObjective) return 0;
        return calculateObjectiveProgress(roadmapObjective);
    }, [roadmapObjective]);

    const latestCheckIn = useMemo(() => {
        if (!roadmapObjective) return null;

        const allCheckIns = roadmapObjective.keyResults.flatMap(kr => kr.checkIns);

        if (allCheckIns.length === 0) return null;

        // Sort by date descending
        allCheckIns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return allCheckIns[0];
    }, [roadmapObjective]);
    
    // Memoized data for Strategies Tab
    const strategiesData = useMemo(() => {
        return strategies.filter(s => !s.isArchived).map(strategy => {
            const linkedObjectives = objectives.filter(o => o.strategyId === strategy.id && !o.isArchived);
            if(linkedObjectives.length === 0) return { strategy, objectiveProgress: 0, tasksDonePercent: 0 };
            
            const objectiveProgress = linkedObjectives.reduce((sum, obj) => sum + calculateObjectiveProgress(obj), 0) / linkedObjectives.length;
            
            const objectiveIds = new Set(linkedObjectives.map(o => o.id));
            const relevantTasks = tasks.filter(t => {
                const project = projects.find(p => p.id === t.projectId);
                return project && objectiveIds.has(project.objectiveId);
            });
            const doneTasks = relevantTasks.filter(t => t.status === 'انجام شد').length;
            const tasksDonePercent = relevantTasks.length > 0 ? (doneTasks / relevantTasks.length) * 100 : 0;
            
            return { strategy, objectiveProgress, tasksDonePercent, objectivesCount: linkedObjectives.length };
        });
    }, [strategies, objectives, tasks, projects]);
    
     // Memoized data for Mission Tab
    const missionData = useMemo(() => {
        const visibleObjectives = objectives.filter(o => !o.isArchived);
        if (visibleObjectives.length === 0) return { overallProgress: 0, activeStrategies: 0 };
        const overallProgress = visibleObjectives.reduce((sum, obj) => sum + calculateObjectiveProgress(obj), 0) / visibleObjectives.length;
        return {
            overallProgress,
            activeStrategies: strategies.filter(s => !s.isArchived).length
        };
    }, [objectives, strategies]);

    // Memoized data for Feedbacks Tab
    const filteredFeedbacks = useMemo(() => {
        let feedbacks = props.generalFeedbacks;
        if (feedbackCategoryFilter !== 'all') {
            feedbacks = feedbacks.filter(fb => fb.category === feedbackCategoryFilter);
        }
        return feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [props.generalFeedbacks, feedbackCategoryFilter]);

    const visibleFeedbacks = showAllFeedbacks ? filteredFeedbacks : filteredFeedbacks.slice(0, 5);

    const objectiveTaskDistribution = useMemo(() => {
        const taskCounts: { [objectiveId: string]: number } = {};

        const projectToObjectiveMap = new Map<string, string>();
        projects.forEach(project => {
            if (project.objectiveId) {
                projectToObjectiveMap.set(project.id, project.objectiveId);
            }
        });

        tasks.forEach(task => {
            const objectiveId = projectToObjectiveMap.get(task.projectId);
            if (objectiveId) {
                const objective = objectives.find(o => o.id === objectiveId);
                if (objective && !objective.isArchived) {
                    taskCounts[objectiveId] = (taskCounts[objectiveId] || 0) + 1;
                }
            }
        });

        const totalTasksWithObjectives = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);

        if (totalTasksWithObjectives === 0) {
            return [];
        }
        
        const distributionData = Object.entries(taskCounts).map(([objectiveId, count], index) => {
            const objective = objectives.find(o => o.id === objectiveId);
            return {
                label: objective?.title || 'هدف ناشناس',
                value: (count / totalTasksWithObjectives) * 100, // percentage
                color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]
            };
        });

        return distributionData.sort((a, b) => b.value - a.value);
    }, [tasks, projects, objectives]);

     const projectTaskDistribution = useMemo(() => {
        const taskCounts: { [projectId: string]: number } = {};
        tasks.forEach(task => {
            taskCounts[task.projectId] = (taskCounts[task.projectId] || 0) + 1;
        });

        const objectiveColorMap = new Map<string, string>();
        const objectiveIds = [...new Set(projects.map(p => p.objectiveId))];
        objectiveIds.forEach((id, index) => {
            if (id) {
                objectiveColorMap.set(id, PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]);
            }
        });

        const getShade = (hex: string, percent: number) => {
            const f = parseInt(hex.slice(1), 16),
                t = percent < 0 ? 0 : 255,
                p = percent < 0 ? percent * -1 : percent,
                R = f >> 16,
                G = (f >> 8) & 0x00ff,
                B = f & 0x0000ff;
            return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
        };

        const projectsByObjective = new Map<string, Project[]>();
        projects.forEach(p => {
            if (!p.objectiveId || !taskCounts[p.id]) return;
            const group = projectsByObjective.get(p.objectiveId) || [];
            group.push(p);
            projectsByObjective.set(p.objectiveId, group);
        });

        const treemapData: { label: string; value: number; color: string }[] = [];

        projectsByObjective.forEach((projectGroup, objectiveId: string) => {
            const baseColor = objectiveColorMap.get(objectiveId) || '#cccccc';
            const groupSize = projectGroup.length;
            
            projectGroup.forEach((project, index) => {
                const value = taskCounts[project.id];
                if (value > 0) {
                    const shadePercent = groupSize > 1 ? (index / (groupSize - 1)) * 0.4 - 0.2 : 0;
                    const color = getShade(baseColor, shadePercent);
                    treemapData.push({ label: project.name, value: value, color: color });
                }
            });
        });

        return treemapData.sort((a, b) => b.value - a.value);
    }, [tasks, projects, objectives]);
    
    const mainTabs = TABS.filter(t => t.id !== 'feedbacks');
    const feedbackTabInfo = TABS.find(t => t.id === 'feedbacks')!;


    return (
        <div className="bg-gray-50/70 dark:bg-slate-900/50 p-4 sm:p-6 rounded-lg">
             <div className="flex justify-between items-center mb-4">
                <div className="border-b border-gray-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6 space-x-reverse" aria-label="Tabs">
                        {mainTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-brand-primary text-brand-primary'
                                        : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <tab.Icon className="w-5 h-5 ml-2" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                 <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                        key={feedbackTabInfo.id}
                        onClick={() => setActiveTab(feedbackTabInfo.id)}
                        title={feedbackTabInfo.label}
                        className={`p-2 rounded-lg transition-colors ${
                            activeTab === feedbackTabInfo.id
                                ? 'bg-blue-100 text-brand-primary'
                                : 'bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600'
                        }`}
                    >
                        <feedbackTabInfo.Icon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setIsFeedbackModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold shadow-sm hover:bg-gray-50 text-sm dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
                    >
                        <PlusIcon className="w-5 h-5 ml-2"/>
                        ایجاد بازخورد
                    </button>
                </div>
            </div>
            
            {activeTab === 'tasks' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-end">
                        <div className="relative">
                            <button
                                ref={projectFilterButtonRef}
                                onClick={() => setIsProjectFilterOpen(prev => !prev)}
                                className="p-2 rounded-lg border bg-white dark:bg-slate-700 dark:border-slate-600 shadow-sm hover:bg-gray-100 dark:hover:bg-slate-600"
                                title="فیلتر بر اساس پروژه"
                            >
                                <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                            </button>
                            {isProjectFilterOpen && (
                                <div
                                    ref={projectFilterPopoverRef}
                                    className="absolute top-full left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5 z-10 animate-fade-in"
                                >
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setSelectedProjectId('all');
                                                setIsProjectFilterOpen(false);
                                            }}
                                            className="w-full text-right block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                                        >
                                            همه پروژه‌ها
                                        </button>
                                        <div className="border-t my-1 dark:border-slate-700"></div>
                                        {projects.filter(p => !p.isArchived).map((project: Project) => (
                                            <button
                                                key={project.id}
                                                onClick={() => {
                                                    setSelectedProjectId(project.id);
                                                    setIsProjectFilterOpen(false);
                                                }}
                                                className="w-full text-right block px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                                            >
                                                {project.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <WeeklyPerformanceTracker tasks={tasks} dailyPerformance={dailyPerformance} />
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border dark:border-slate-700">
                        <h3 className="font-medium text-lg mb-4 text-gray-600 dark:text-gray-400">بیشترین تمرکز شما روی کدام اهداف بوده است؟</h3>
                        {objectiveTaskDistribution.length > 0 ? (
                            <PieChart data={objectiveTaskDistribution} />
                        ) : (
                            <p className="text-center text-sm text-brand-subtext dark:text-slate-400 py-8">
                                هیچ تسکی به اهداف متصل نشده است.
                            </p>
                        )}
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border dark:border-slate-700">
                        <h3 className="font-medium text-lg mb-4 text-gray-600 dark:text-gray-400">روی چه پروژه های بیشتر تمرکز داشتید؟</h3>
                        {projectTaskDistribution.length > 0 ? (
                            <TreemapChart data={projectTaskDistribution} />
                        ) : (
                            <p className="text-center text-sm text-brand-subtext dark:text-slate-400 py-8">
                                داده‌ای برای نمایش وجود ندارد.
                            </p>
                        )}
                    </div>
                </div>
            )}
            
            {activeTab === 'processes' && (
                 <div className="animate-fade-in">
                    <div className="space-y-4">
                        {processedProcessesData.map(process => {
                            const dailyScores = processDailyScores.get(process.id) || [];
                            return (
                                <ProcessReportCard 
                                    key={process.id}
                                    process={process} 
                                    dailyScores={dailyScores}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
            
            {activeTab === 'objectives' && (
                <div className="animate-fade-in space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border dark:border-slate-700">
                        {roadmapObjective ? (() => {
                            const CURRENT_WEEK = 4; // Assuming we are in week 4 of a 12-week quarter for demonstration
                            const timeElapsedPercent = (CURRENT_WEEK / 12) * 100;

                            const getObjectiveHealthStatus = (progress: number) => {
                                if (progress < timeElapsedPercent - 20) {
                                    return {
                                        label: 'در معرض خطر',
                                        color: 'text-red-600 dark:text-red-400',
                                        bg: 'bg-red-100 dark:bg-red-900/40',
                                        progressBar: 'bg-red-500',
                                    };
                                }
                                if (progress < timeElapsedPercent - 5) {
                                    return {
                                        label: 'عقب',
                                        color: 'text-amber-600 dark:text-amber-400',
                                        bg: 'bg-amber-100 dark:bg-amber-900/40',
                                        progressBar: 'bg-amber-500',
                                    };
                                }
                                return {
                                    label: 'در مسیر',
                                    color: 'text-green-600 dark:text-green-400',
                                    bg: 'bg-green-100 dark:bg-green-900/40',
                                    progressBar: 'bg-green-500',
                                };
                            };

                            const objectiveHealth = getObjectiveHealthStatus(objectiveProgress);

                            return (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{roadmapObjective.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                                        {roadmapObjective.description}
                                    </p>

                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">پیشرفت کلی</span>
                                            <p className={`text-5xl font-bold ${objectiveHealth.color}`}>{objectiveProgress.toFixed(0)}%</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${objectiveHealth.bg} ${objectiveHealth.color}`}>
                                            {objectiveHealth.label}
                                        </div>
                                    </div>

                                    <div className="relative h-12">
                                        <div className="absolute top-0 h-full flex flex-col items-center" style={{ left: `${timeElapsedPercent}%`, transform: 'translateX(-50%)', zIndex: 10 }}>
                                            <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-gray-700 dark:border-t-gray-300"></div>
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">اکنون</span>
                                        </div>
                                        <div className="absolute top-[14px] w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full">
                                            <div className={`h-full rounded-full transition-all duration-500 ${objectiveHealth.progressBar}`} style={{ width: `${objectiveProgress}%` }}></div>
                                        </div>
                                        <div className="absolute top-[26px] w-full flex justify-between px-[1.5px]">
                                            {Array.from({ length: 13 }).map((_, i) => (
                                                <div key={i} className="w-px h-2 bg-gray-300 dark:bg-slate-500"></div>
                                            ))}
                                        </div>
                                        <div className="absolute top-[38px] w-full flex justify-between text-xs text-gray-400">
                                            <span>هفته ۰</span>
                                            <span>هفته ۱۲</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })() : (
                            <div className="text-center py-10">
                                <p className="text-gray-500">هیچ هدف فعالی برای نمایش وجود ندارد.</p>
                            </div>
                        )}
                    </div>

                    {latestCheckIn && (
                        <div>
                            {typeof latestCheckIn.report === 'object' ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                                            <ChecklistIcon className="w-5 h-5 ml-2 text-green-500" />
                                            کارهای انجام شده
                                        </h4>
                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: latestCheckIn.report.tasksDone || '<p class="italic text-gray-400">موردی گزارش نشده.</p>' }}></div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                                            <CalendarIcon className="w-5 h-5 ml-2 text-blue-500" />
                                            کارهای هفته بعد
                                        </h4>
                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: latestCheckIn.report.tasksNext || '<p class="italic text-gray-400">موردی گزارش نشده.</p>' }}></div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                                            <ExclamationTriangleIcon className="w-5 h-5 ml-2 text-red-500" />
                                            چالش‌ها
                                        </h4>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{latestCheckIn.report.challenges || <span className="italic text-gray-400">موردی گزارش نشده.</span>}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700 shadow-sm">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">آخرین گزارش</h4>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{latestCheckIn.report}</p>
                                </div>
                            )}
                        </div>
                    )}
                    {!latestCheckIn && roadmapObjective && (
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                            <p>هنوز گزارشی برای این هدف ثبت نشده است.</p>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'feedbacks' && (
                 <div className="animate-fade-in">
                    <div className="flex items-center space-x-2 space-x-reverse p-1 bg-gray-200 dark:bg-slate-700 rounded-lg max-w-min mb-6">
                        <button onClick={() => setFeedbackCategoryFilter('all')} className={`px-4 py-1 text-sm font-semibold rounded-md ${feedbackCategoryFilter === 'all' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>همه</button>
                        {(Object.keys(FEEDBACK_CATEGORY_DETAILS) as (keyof typeof FEEDBACK_CATEGORY_DETAILS)[]).map((categoryKey) => {
                            const details = FEEDBACK_CATEGORY_DETAILS[categoryKey];
                            return (
                                <button key={categoryKey} onClick={() => setFeedbackCategoryFilter(categoryKey)} className={`px-4 py-1 text-sm font-semibold rounded-md ${feedbackCategoryFilter === categoryKey ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>{details.label}</button>
                            );
                        })}
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">دسته</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">خلاصه بازخورد</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">ارسال کننده</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">دریافت کننده</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">تاریخ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {visibleFeedbacks.map(fb => (
                                    <FeedbackRow
                                        key={fb.id}
                                        feedback={fb}
                                        giver={users.find(u => u.id === fb.giverId)}
                                        receiver={users.find(u => u.id === fb.receiverId)}
                                        categoryDetails={FEEDBACK_CATEGORY_DETAILS[fb.category]}
                                        onClick={() => onSelectFeedback(fb)}
                                    />
                                ))}
                            </tbody>
                        </table>
                        {visibleFeedbacks.length === 0 && <p className="text-center text-gray-500 py-8">بازخوردی در این دسته یافت نشد.</p>}
                    </div>
                     {filteredFeedbacks.length > 5 && (
                        <div className="text-center mt-4">
                            <button onClick={() => setShowAllFeedbacks(p => !p)} className="text-sm font-semibold text-brand-primary">
                                {showAllFeedbacks ? 'نمایش کمتر' : 'نمایش همه'}
                            </button>
                        </div>
                    )}
                 </div>
            )}

            <CreateFeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                users={users}
                feedbackTags={feedbackTags}
                onSubmit={(data) => {
                    onAddGeneralFeedback(data);
                    setIsFeedbackModalOpen(false);
                }}
                styleSettings={componentStyles.popups}
                // FIX: Pass missing `tasks` and `forms` props to the `CreateFeedbackModal` component.
                tasks={tasks}
                forms={forms}
            />
        </div>
    );
};

export default ReportsPage;