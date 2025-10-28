import React, { useMemo, useState } from 'react';
import { Objective, User, Team, CheckIn, Task, FormSubmission, Form, Strategy, CompanyVision, KRCategory, Project, FeedbackTag, ComponentStyles, GeneralFeedback } from '../types';
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
} from './Icons';
import { toPersianDate, getStartOfWeek, getStartOfQuarter } from '../utils/dateUtils';
import ProgressRingCard from './charts/ProgressRingCard';
import CreateFeedbackModal from './CreateFeedbackModal';


interface ReportsPageProps {
  objectives: Objective[];
  users: User[];
  teams: Team[];
  currentUser: User;
  tasks: Task[];
  submissions: FormSubmission[];
  forms: Form[];
  strategies: Strategy[];
  companyVision: CompanyVision;
  projects: Project[];
  feedbackTags: FeedbackTag[];
  onAddGeneralFeedback: (data: Omit<GeneralFeedback, 'id' | 'giverId' | 'createdAt'>) => void;
  componentStyles: ComponentStyles;
}

type ActiveReportTab = 'tasks' | 'processes' | 'objectives' | 'strategies' | 'mission';


const TABS: { id: ActiveReportTab, label: string, Icon: React.FC<any> }[] = [
    { id: 'tasks', label: 'وظایف', Icon: ClipboardListIcon },
    { id: 'processes', label: 'فرایندها', Icon: CubeIcon },
    { id: 'objectives', label: 'اهداف', Icon: GoalIcon },
    { id: 'strategies', label: 'استراتژی ها', Icon: RocketIcon },
    { id: 'mission', label: 'ماموریت', Icon: TrophyIcon },
];

const ReportsPage: React.FC<ReportsPageProps> = (props) => {
    const { objectives, tasks, submissions, strategies, companyVision, projects, users, feedbackTags, onAddGeneralFeedback, componentStyles } = props;
    const [activeTab, setActiveTab] = useState<ActiveReportTab>('tasks');
    const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all');
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    
    const today = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const startOfWeek = getStartOfWeek(today);
    const startOfQuarter = getStartOfQuarter(today);

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
    
    // Memoized data for Processes Tab
    const processesData = useMemo(() => {
        const dailySubmissions = submissions.filter(s => new Date(s.submittedAt) >= startOfToday);
        const weeklySubmissions = submissions.filter(s => new Date(s.submittedAt) >= startOfWeek);
        
        return {
            dailyCount: dailySubmissions.length,
            weeklyCount: weeklySubmissions.length,
        };
    }, [submissions, startOfToday, startOfWeek]);

    // Memoized data for Objectives Tab
    const objectivesData = useMemo(() => {
        const allKRs = objectives.flatMap(obj => obj.keyResults);
        
        const calculateAvgProgress = (filterDate: Date) => {
            const relevantKRs = allKRs.filter(kr => kr.checkIns.some(ci => new Date(ci.date) >= filterDate));
            if (relevantKRs.length === 0) return 0;
            const totalProgress = relevantKRs.reduce((sum, kr) => {
                const latestCheckin = kr.checkIns.filter(ci => new Date(ci.date) >= filterDate).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                const value = latestCheckin.value;
                const { startValue = 0, targetValue = 1 } = kr;
                if (targetValue === startValue) return sum + (value >= targetValue ? 100 : 0);
                const progress = ((value - startValue) / (targetValue - startValue)) * 100;
                return sum + Math.max(0, Math.min(100, progress));
            }, 0);
            return totalProgress / relevantKRs.length;
        };

        return {
            daily: calculateAvgProgress(startOfToday),
            weekly: calculateAvgProgress(startOfWeek),
            quarterly: calculateAvgProgress(startOfQuarter),
        };
    }, [objectives, startOfToday, startOfWeek, startOfQuarter]);
    
    // Memoized data for Strategies Tab
    const strategiesData = useMemo(() => {
        return strategies.filter(s => !s.isArchived).map(strategy => {
            const linkedObjectives = objectives.filter(o => o.strategyId === strategy.id && !o.isArchived);
            if(linkedObjectives.length === 0) return { strategy, objectiveProgress: 0, tasksDonePercent: 0 };
            
            const totalObjectiveProgress = linkedObjectives.reduce((sum, obj) => {
                const krProgress = obj.keyResults.length > 0 ? obj.keyResults.reduce((krSum, kr) => {
                    const { startValue = 0, targetValue = 1, currentValue = 0 } = kr;
                    if (targetValue === startValue) return krSum + (currentValue >= targetValue ? 100 : 0);
                    const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;
                    return krSum + Math.max(0, Math.min(100, progress));
                }, 0) / obj.keyResults.length : 0;
                return sum + krProgress;
            }, 0);

            const objectiveProgress = totalObjectiveProgress / linkedObjectives.length;
            
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
        if (visibleObjectives.length === 0) return { overallProgress: 0 };
        const totalProgress = visibleObjectives.reduce((sum, obj) => {
             const krProgress = obj.keyResults.length > 0 ? obj.keyResults.reduce((krSum, kr) => {
                const { startValue = 0, targetValue = 1, currentValue = 0 } = kr;
                if (targetValue === startValue) return krSum + (currentValue >= targetValue ? 100 : 0);
                const progress = ((currentValue - startValue) / (targetValue - startValue)) * 100;
                return krSum + Math.max(0, Math.min(100, progress));
            }, 0) / obj.keyResults.length : 0;
            return sum + krProgress;
        }, 0);
        return {
            overallProgress: totalProgress / visibleObjectives.length,
            activeStrategies: strategies.filter(s => !s.isArchived).length
        };
    }, [objectives, strategies]);


    return (
        <div className="bg-gray-50/70 p-4 sm:p-6 rounded-lg">
             <div className="flex justify-between items-center mb-4">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 space-x-reverse" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-brand-primary text-brand-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.Icon className="w-5 h-5 ml-2" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <button 
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold shadow-sm hover:bg-gray-50 text-sm"
                >
                    <PlusIcon className="w-5 h-5 ml-2"/>
                    ایجاد بازخورد
                </button>
            </div>
            
            {activeTab === 'tasks' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="max-w-xs">
                        <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700">
                            فیلتر بر اساس پروژه
                        </label>
                        <select
                            id="project-filter"
                            name="project-filter"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
                        >
                            <option value="all">همه پروژه‌ها</option>
                            {projects.filter(p => !p.isArchived).map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-lg mb-4">ارزیابی روزانه - {toPersianDate(today.toISOString())}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <ProgressRingCard title="انجام شده" percentage={tasksData.daily.total > 0 ? (tasksData.daily.done / tasksData.daily.total) * 100 : 0} Icon={CheckCircleIcon} color="green" valueText={`${tasksData.daily.done}/${tasksData.daily.total}`} />
                            <ProgressRingCard title="در حال پیشرفت" percentage={tasksData.daily.total > 0 ? (tasksData.daily.inProgress / tasksData.daily.total) * 100 : 0} Icon={ClockIcon} color="orange" valueText={`${tasksData.daily.inProgress}/${tasksData.daily.total}`} />
                            <ProgressRingCard title="برای انجام" percentage={tasksData.daily.total > 0 ? (tasksData.daily.todo / tasksData.daily.total) * 100 : 0} Icon={ClipboardListIcon} color="gray" valueText={`${tasksData.daily.todo}/${tasksData.daily.total}`} />
                        </div>
                    </div>
                     <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-lg mb-4">ارزیابی هفتگی - هفته جاری</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <ProgressRingCard title="انجام شده" percentage={tasksData.weekly.total > 0 ? (tasksData.weekly.done / tasksData.weekly.total) * 100 : 0} Icon={CheckCircleIcon} color="green" valueText={`${tasksData.weekly.done}/${tasksData.weekly.total}`} />
                            <ProgressRingCard title="در حال پیشرفت" percentage={tasksData.weekly.total > 0 ? (tasksData.weekly.inProgress / tasksData.weekly.total) * 100 : 0} Icon={ClockIcon} color="orange" valueText={`${tasksData.weekly.inProgress}/${tasksData.weekly.total}`} />
                            <ProgressRingCard title="برای انجام" percentage={tasksData.weekly.total > 0 ? (tasksData.weekly.todo / tasksData.weekly.total) * 100 : 0} Icon={ClipboardListIcon} color="gray" valueText={`${tasksData.weekly.todo}/${tasksData.weekly.total}`} />
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'processes' && (
                 <div className="space-y-8 animate-fade-in">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-lg mb-4">فرایندهای روزانه - {toPersianDate(today.toISOString())}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <ProgressRingCard title="فرم‌های ثبت شده" percentage={processesData.dailyCount > 0 ? 100: 0} Icon={DocumentTextIcon} color="purple" valueText={`${processesData.dailyCount}`} />
                           <ProgressRingCard title="امتیاز میانگین" percentage={0} Icon={CheckIcon} color="yellow" valueText={`N/A`} />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-lg mb-4">فرایندهای هفتگی - هفته جاری</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <ProgressRingCard title="فرم‌های ثبت شده" percentage={processesData.weeklyCount > 0 ? 100: 0} Icon={DocumentTextIcon} color="purple" valueText={`${processesData.weeklyCount}`} />
                           <ProgressRingCard title="امتیاز میانگین" percentage={0} Icon={CheckIcon} color="yellow" valueText={`N/A`} />
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'objectives' && (
                <div className="bg-white p-4 rounded-lg shadow-sm border animate-fade-in">
                     <h3 className="font-semibold text-lg mb-4">پیشرفت اهداف (نتایج کلیدی)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ProgressRingCard title="پیشرفت امروز" percentage={objectivesData.daily} Icon={GoalIcon} color="blue" />
                        <ProgressRingCard title="پیشرفت هفته" percentage={objectivesData.weekly} Icon={GoalIcon} color="blue" />
                        <ProgressRingCard title="پیشرفت فصل" percentage={objectivesData.quarterly} Icon={GoalIcon} color="blue" />
                    </div>
                </div>
            )}
            
             {activeTab === 'strategies' && (
                <div className="space-y-6 animate-fade-in">
                    {strategiesData.map(({ strategy, objectiveProgress, tasksDonePercent, objectivesCount }) => (
                         <div key={strategy.id} className="bg-white p-4 rounded-lg shadow-sm border">
                            <h3 className="font-semibold text-lg mb-4">{strategy.name}</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <ProgressRingCard title="پیشرفت اهداف" percentage={objectiveProgress} Icon={GoalIcon} color="indigo" valueText={`${objectivesCount} هدف`}/>
                                <ProgressRingCard title="تسک‌های انجام شده" percentage={tasksDonePercent} Icon={CheckCircleIcon} color="green" />
                                <ProgressRingCard title="سلامت استراتژی" percentage={(objectiveProgress + tasksDonePercent) / 2} Icon={RocketIcon} color="red" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'mission' && (
                <div className="animate-fade-in">
                    <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                        <h3 className="font-bold text-2xl text-brand-text">
                            {companyVision.missionTitle || 'بیانیه ماموریت تعریف نشده است.'}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                        <ProgressRingCard title="پیشرفت کل اهداف" percentage={missionData.overallProgress} Icon={GoalIcon} color="blue"/>
                        <ProgressRingCard title="استراتژی‌های فعال" percentage={missionData.activeStrategies > 0 ? 100 : 0} Icon={RocketIcon} color="indigo" valueText={`${missionData.activeStrategies}`} />
                        <ProgressRingCard title="سلامت کلی" percentage={missionData.overallProgress} Icon={TrophyIcon} color="amber" />
                    </div>
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
            />
        </div>
    );
};

export default ReportsPage;
