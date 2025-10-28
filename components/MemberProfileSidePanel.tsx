import React, { useMemo } from 'react';
import { User, Objective, Task, FormSubmission, Form, FeedbackTag, KeyResult } from '../types';
// FIX: Added ICONS to imports to resolve reference error.
import { CloseIcon, GoalIcon, ChartIcon, ChatBubbleOvalLeftEllipsisIcon, ICONS } from './Icons';
import { toPersianDate } from '../utils/dateUtils';
import KeyResultRow from './KeyResultRow';

interface MemberProfileSidePanelProps {
    user: User | null;
    onClose: () => void;
    objectives: Objective[];
    tasks: Task[];
    submissions: FormSubmission[];
    forms: Form[];
    feedbackTags: FeedbackTag[];
    // FIX: Added missing 'users' prop to the interface.
    users: User[];
}

const MemberProfileSidePanel: React.FC<MemberProfileSidePanelProps> = (props) => {
    // FIX: Destructured 'users' from props to make it available in the component scope.
    const { user, onClose, objectives, tasks, submissions, forms, feedbackTags, users } = props;

    const userData = useMemo(() => {
        if (!user) return null;

        const userObjectives = objectives.filter(o => o.ownerId === user.id && !o.isArchived);
        const userKRs = objectives.flatMap(o => o.keyResults).filter(kr => kr.ownerId === user.id && !kr.isArchived);
        
        const receivedFeedback = objectives.flatMap(o => o.keyResults)
            .filter(kr => kr.ownerId === user.id)
            .flatMap(kr => kr.checkIns.map(ci => ({ ...ci, krTitle: kr.title })))
            .filter(ci => ci.feedbackTagId && ci.feedbackGiverId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const userTasks = tasks.filter(t => t.assigneeId === user.id);
        const doneTasks = userTasks.filter(t => t.status === 'انجام شد');
        const userSubmissions = submissions.filter(s => s.submittedById === user.id);
        
        return {
            userObjectives,
            userKRs,
            receivedFeedback,
            tasksCompletedCount: doneTasks.length,
            formsSubmittedCount: userSubmissions.length,
        };
    }, [user, objectives, tasks, submissions]);

    if (!user || !userData) return null;
    
    const { userObjectives, receivedFeedback, tasksCompletedCount, formsSubmittedCount } = userData;

    return (
        <div className="fixed top-0 left-0 h-full w-full bg-black bg-opacity-40 z-40 animate-fade-in" onClick={onClose}>
            <div 
                className="absolute top-0 left-0 h-full w-full max-w-lg bg-white shadow-2xl animate-slide-in-left flex flex-col"
                onClick={e => e.stopPropagation()}
                dir="rtl"
            >
                <div className="p-4 border-b flex justify-between items-center bg-gray-50/70 flex-shrink-0">
                    <div className="flex items-center">
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div className="mr-3">
                            <h2 className="text-lg font-bold text-brand-text">{user.name}</h2>
                            <p className="text-sm text-brand-subtext capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-grow p-6 overflow-y-auto space-y-8">
                    {/* Objectives Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-brand-text mb-4 flex items-center"><GoalIcon className="w-5 h-5 ml-2 text-gray-500" />اهداف</h3>
                        <div className="space-y-4">
                            {userObjectives.length > 0 ? userObjectives.map(obj => (
                                <div key={obj.id} className="p-3 bg-gray-50 rounded-lg border">
                                    <p className="font-semibold text-sm mb-2">{obj.title}</p>
                                    <div className="space-y-2">
                                        {obj.keyResults.filter(kr => kr.ownerId === user.id && !kr.isArchived).map(kr => (
                                            <KeyResultRow key={kr.id} kr={kr} onUpdateKR={() => {}} onDelete={() => {}} onEdit={() => {}} onArchive={() => {}} onSelect={() => {}} isCompact />
                                        ))}
                                    </div>
                                </div>
                            )) : <p className="text-sm text-center text-gray-500">هدفی برای این کاربر تعریف نشده است.</p>}
                        </div>
                    </section>

                    {/* Assessment Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-brand-text mb-4 flex items-center"><ChartIcon className="w-5 h-5 ml-2 text-gray-500" />ارزیابی</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg text-center">
                                <p className="text-3xl font-bold text-blue-800">{tasksCompletedCount}</p>
                                <p className="text-sm font-medium text-blue-700 mt-1">تسک انجام شده</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg text-center">
                                <p className="text-3xl font-bold text-purple-800">{formsSubmittedCount}</p>
                                <p className="text-sm font-medium text-purple-700 mt-1">فرم تکمیل شده</p>
                            </div>
                        </div>
                    </section>

                    {/* Feedback Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-brand-text mb-4 flex items-center"><ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 ml-2 text-gray-500" />بازخوردهای دریافتی</h3>
                        <div className="space-y-3">
                            {receivedFeedback.length > 0 ? receivedFeedback.map(fb => {
                                const giver = users.find(u => u.id === fb.feedbackGiverId);
                                const tag = feedbackTags.find(t => t.id === fb.feedbackTagId);
                                if (!giver || !tag) return null;

                                const Icon = ICONS[tag.icon];

                                return (
                                    <div key={fb.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                            <div className="flex items-center">
                                                <img src={giver.avatarUrl} alt={giver.name} className="w-5 h-5 rounded-full ml-2"/>
                                                <span>{giver.name}</span>
                                            </div>
                                            <span>{toPersianDate(fb.date)}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: `${tag.color}20` }}>
                                                <Icon className="w-5 h-5" style={{ color: tag.color }} />
                                            </div>
                                            <div className="mr-3">
                                                <p className="font-semibold">{tag.description}</p>
                                                {fb.feedbackComment && <p className="text-sm text-gray-600 mt-1">"{fb.feedbackComment}"</p>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }) : <p className="text-sm text-center text-gray-500">بازخوردی دریافت نشده است.</p>}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MemberProfileSidePanel;