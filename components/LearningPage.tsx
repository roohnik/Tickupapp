import React, { useState, useMemo } from 'react';
import { 
    LearningAssignment, User, MicroLearning, YouTubeVideo, Book, LearningResource, 
    CheckIn, Objective, LearningResourceType, LearningAssignmentStatus 
} from '../types';
import { 
    GraduationCapIcon, SparklesIcon, ChartIcon, FolderIcon, BookOpenIcon, VideoCameraIcon, CheckCircleIcon, PlusIcon 
} from './Icons';
import StarRating from './StarRating';

interface LearningPageProps {
  assignments: LearningAssignment[];
  resources: {
      microLearnings: MicroLearning[];
      youtubeVideos: YouTubeVideo[];
      books: Book[];
  };
  users: User[];
  currentUser: User;
  objectives: Objective[];
  onUpdateStatus: (assignmentId: string, status: LearningAssignmentStatus) => void;
  onCreateMicroLearning: () => void;
  onViewMicroLearning: (learning: MicroLearning) => void;
}

const LearningItemCard: React.FC<{
    assignment: LearningAssignment;
    resource: LearningResource | undefined;
    assigner: User | undefined;
    objective?: Objective;
    onUpdateStatus: (assignmentId: string, status: LearningAssignmentStatus) => void;
}> = ({ assignment, resource, assigner, objective, onUpdateStatus }) => {
    if (!resource) return null;
    
    const getIcon = (type: LearningResourceType) => {
        switch(type) {
            case LearningResourceType.MICRO_LEARNING: return <SparklesIcon className="w-6 h-6 text-purple-500" />;
            case LearningResourceType.YOUTUBE_VIDEO: return <VideoCameraIcon className="w-6 h-6 text-red-500" />;
            case LearningResourceType.BOOK: return <BookOpenIcon className="w-6 h-6 text-blue-500" />;
            default: return <GraduationCapIcon className="w-6 h-6 text-gray-500" />;
        }
    }

    const title = assignment.resourceType === LearningResourceType.MICRO_LEARNING
        ? (resource as MicroLearning).topic
        : (resource as YouTubeVideo | Book).title;

    const handleStatusChange = () => {
        let newStatus: LearningAssignmentStatus;
        if (assignment.status === LearningAssignmentStatus.ASSIGNED || assignment.status === LearningAssignmentStatus.IN_PROGRESS) {
            newStatus = LearningAssignmentStatus.COMPLETED;
        } else {
            newStatus = LearningAssignmentStatus.IN_PROGRESS;
        }
        onUpdateStatus(assignment.id, newStatus);
    };

    const isCompleted = assignment.status === LearningAssignmentStatus.COMPLETED;

    return (
        <div className={`bg-white p-4 rounded-lg border flex items-start space-x-4 space-x-reverse transition-all ${isCompleted ? 'bg-green-50/50' : ''}`}>
            <div className="flex-shrink-0 pt-1">{getIcon(assignment.resourceType)}</div>
            <div className="flex-grow min-w-0">
                <h3 className="font-semibold text-brand-text">{title}</h3>
                <div className="text-xs text-brand-subtext mt-1 space-y-1">
                    {objective && (
                        <p>مرتبط با هدف: <span className="font-medium text-gray-600">{objective.title}</span></p>
                    )}
                    <p>اختصاص داده شده توسط <span className="font-medium text-gray-600">{assigner?.name || 'سیستم'}</span></p>
                </div>
            </div>
            <div className="flex-shrink-0">
                 <button 
                    onClick={handleStatusChange} 
                    className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                        isCompleted 
                            ? 'bg-white border text-gray-500 hover:bg-gray-100'
                            : 'bg-brand-primary text-white hover:bg-blue-600'
                    }`}
                >
                    {isCompleted ? <CheckCircleIcon className="w-4 h-4 text-green-500 ml-2" /> : null}
                    {isCompleted ? 'مطالعه شد' : 'مطالعه کردم'}
                </button>
            </div>
        </div>
    );
};

const LibraryItemCard: React.FC<{
    resource: LearningResource;
    type: LearningResourceType;
    onView: (resource: LearningResource) => void;
}> = ({ resource, type, onView }) => {
    const getIcon = (resType: LearningResourceType) => {
        switch(resType) {
            case LearningResourceType.MICRO_LEARNING: return <SparklesIcon className="w-8 h-8 text-purple-500" />;
            case LearningResourceType.YOUTUBE_VIDEO: return <VideoCameraIcon className="w-8 h-8 text-red-500" />;
            case LearningResourceType.BOOK: return <BookOpenIcon className="w-8 h-8 text-blue-500" />;
        }
    };
    
    const title = type === LearningResourceType.MICRO_LEARNING ? (resource as MicroLearning).topic : (resource as Book | YouTubeVideo).title;
    const subtitle = type === LearningResourceType.BOOK ? (resource as Book).author : type === LearningResourceType.YOUTUBE_VIDEO ? 'ویدیوی یوتیوب' : 'دوره هوش مصنوعی';

    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col justify-between h-full">
            <div>
                <div className="mb-3">{getIcon(type)}</div>
                <h3 className="font-semibold text-brand-text">{title}</h3>
                <p className="text-sm text-brand-subtext mt-1">{subtitle}</p>
            </div>
            <div className="mt-4">
                <button onClick={() => onView(resource)} className="w-full px-3 py-1.5 text-sm font-semibold rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">
                    شروع
                </button>
            </div>
        </div>
    );
};


const FeedbackCard: React.FC<{
    feedback: CheckIn & { krTitle: string };
    giver: User | undefined;
    linkedAssignment?: LearningAssignment;
    linkedResource?: LearningResource;
    assigner?: User;
    objectives: Objective[];
    onUpdateStatus: (assignmentId: string, status: LearningAssignmentStatus) => void;
}> = ({ feedback, giver, linkedAssignment, linkedResource, assigner, objectives, onUpdateStatus }) => {
    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center">
                <p className="text-xs text-brand-subtext">
                    بازخورد از <span className="font-semibold text-gray-600">{giver?.name || 'ناشناس'}</span> در نتیجه کلیدی "{feedback.krTitle}"
                </p>
                {feedback.feedbackRating && <StarRating rating={feedback.feedbackRating} size="h-4 w-4" />}
            </div>
            <p className="text-brand-text mt-2 font-medium">"{feedback.feedbackComment}"</p>

            {linkedAssignment && linkedResource && (
                <div className="mt-4 pt-4 border-t border-gray-200/80">
                    <h5 className="text-xs font-semibold text-gray-500 mb-2">منبع یادگیری پیشنهادی:</h5>
                    <LearningItemCard
                        assignment={linkedAssignment}
                        resource={linkedResource}
                        assigner={assigner}
                        objective={objectives.find(o => o.id === linkedAssignment.triggerObjectiveId)}
                        onUpdateStatus={onUpdateStatus}
                    />
                </div>
            )}
        </div>
    );
};


const LearningPage: React.FC<LearningPageProps> = ({ assignments, resources, users, currentUser, objectives, onUpdateStatus, onCreateMicroLearning, onViewMicroLearning }) => {
    const [activeTab, setActiveTab] = useState('plan');

    const userFeedback = useMemo(() => {
        const feedbackItems: (CheckIn & { krTitle: string })[] = [];
        objectives.forEach(obj => {
            obj.keyResults.forEach(kr => {
                if(kr.ownerId === currentUser.id) {
                    kr.checkIns.forEach(ci => {
                        if (ci.feedbackComment && ci.feedbackGiverId) {
                            feedbackItems.push({ ...ci, krTitle: kr.title });
                        }
                    });
                }
            })
        });
        return feedbackItems.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [objectives, currentUser.id]);

    const findResource = (assignment: LearningAssignment): LearningResource | undefined => {
        switch(assignment.resourceType) {
            case LearningResourceType.MICRO_LEARNING:
                return resources.microLearnings.find(r => r.id === assignment.resourceId);
            case LearningResourceType.YOUTUBE_VIDEO:
                return resources.youtubeVideos.find(r => r.id === assignment.resourceId);
            case LearningResourceType.BOOK:
                return resources.books.find(r => r.id === assignment.resourceId);
            default:
                return undefined;
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-brand-text flex items-center">
                    <GraduationCapIcon className="w-7 h-7 ml-3 text-brand-primary"/>
                    مرکز یادگیری
                </h1>
            </div>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6 space-x-reverse" aria-label="Tabs">
                    <button onClick={() => setActiveTab('plan')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'plan' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        برنامه من
                    </button>
                    <button onClick={() => setActiveTab('feedback')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'feedback' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        بازخوردها ({userFeedback.length})
                    </button>
                    <button onClick={() => setActiveTab('library')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'library' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        کتابخانه
                    </button>
                </nav>
            </div>

            {activeTab === 'plan' && (
                <div className="space-y-4">
                    {assignments.filter(a => a.assigneeId === currentUser.id).length > 0
                     ? assignments.filter(a => a.assigneeId === currentUser.id).map(assignment => {
                        const resource = findResource(assignment);
                        const assigner = users.find(u => u.id === assignment.assignerId);
                        const objective = objectives.find(o => o.id === assignment.triggerObjectiveId);
                        return (
                            <LearningItemCard 
                                key={assignment.id}
                                assignment={assignment}
                                resource={resource}
                                assigner={assigner}
                                objective={objective}
                                onUpdateStatus={onUpdateStatus}
                            />
                        )
                    })
                    : <p className="text-center text-brand-subtext py-8">هیچ برنامه یادگیری برای شما تعریف نشده است.</p>
                }
                </div>
            )}
             {activeTab === 'feedback' && (
                <div className="space-y-4">
                   {userFeedback.length > 0 ? userFeedback.map(fb => {
                       const giver = users.find(u => u.id === fb.feedbackGiverId);
                       const linkedAssignment = assignments.find(a => a.triggerFeedbackId === fb.id && a.assigneeId === currentUser.id);
                       const linkedResource = linkedAssignment ? findResource(linkedAssignment) : undefined;
                       const assigner = linkedAssignment ? users.find(u => u.id === linkedAssignment.assignerId) : undefined;
                       return (
                           <FeedbackCard
                                key={fb.id}
                                feedback={fb}
                                giver={giver}
                                linkedAssignment={linkedAssignment}
                                linkedResource={linkedResource}
                                assigner={assigner}
                                objectives={objectives}
                                onUpdateStatus={onUpdateStatus}
                           />
                       )
                   }) : <p className="text-center text-brand-subtext py-8">هنوز بازخوردی دریافت نکرده‌اید.</p>}
                </div>
            )}
            {activeTab === 'library' && (
                 <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-brand-text flex items-center">
                                <SparklesIcon className="w-5 h-5 ml-2 text-purple-500" /> دسته بندی هوش مصنوعی
                            </h2>
                            <button onClick={onCreateMicroLearning} className="flex items-center text-sm font-semibold text-purple-600 hover:text-purple-800">
                                <PlusIcon className="w-4 h-4 ml-1" />
                                ایجاد با AI
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {resources.microLearnings.map(r => <LibraryItemCard key={r.id} resource={r} type={LearningResourceType.MICRO_LEARNING} onView={res => onViewMicroLearning(res as MicroLearning)} />)}
                        </div>
                    </div>
                     <div>
                        <h2 className="text-lg font-semibold text-brand-text mb-3 flex items-center">
                            <VideoCameraIcon className="w-5 h-5 ml-2 text-red-500" /> ویدیوهای آموزشی
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {resources.youtubeVideos.map(r => <LibraryItemCard key={r.id} resource={r} type={LearningResourceType.YOUTUBE_VIDEO} onView={() => alert('Viewing YouTube videos is not implemented yet.')} />)}
                        </div>
                    </div>
                     <div>
                        <h2 className="text-lg font-semibold text-brand-text mb-3 flex items-center">
                            <BookOpenIcon className="w-5 h-5 ml-2 text-blue-500" /> کتاب‌ها
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {resources.books.map(r => <LibraryItemCard key={r.id} resource={r} type={LearningResourceType.BOOK} onView={() => alert('Viewing books is not implemented yet.')} />)}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default LearningPage;