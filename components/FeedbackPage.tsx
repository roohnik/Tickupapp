import React, { useMemo, useState } from 'react';
import { Objective, User, FeedbackTag, CheckIn, LearningAssignment, MicroLearning, YouTubeVideo, Book, LearningResource, LearningResourceType, LearningAssignmentStatus } from '../types';
import { ICONS, BookOpenIcon, VideoCameraIcon, SparklesIcon, GraduationCapIcon, CheckCircleIcon } from './Icons';
import { toPersianDate } from '../utils/dateUtils';
import ManageFeedbackTagsModal from '../modals/ManageFeedbackTagsModal';

interface LearningItemCardProps {
    assignment: LearningAssignment;
    resource: LearningResource | undefined;
    assigner: User | undefined;
    objective?: Objective;
    onUpdateStatus: (assignmentId: string, status: LearningAssignmentStatus) => void;
}

const LearningItemCard: React.FC<LearningItemCardProps> = ({ assignment, resource, assigner, objective, onUpdateStatus }) => {
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
        <div className={`bg-white p-3 rounded-lg border flex items-start space-x-3 space-x-reverse transition-all ${isCompleted ? 'bg-green-50/50' : ''}`}>
            <div className="flex-shrink-0 pt-1">{getIcon(assignment.resourceType)}</div>
            <div className="flex-grow min-w-0">
                <h3 className="font-semibold text-brand-text text-sm">{title}</h3>
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
                    className={`flex items-center px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                        isCompleted 
                            ? 'bg-white border text-gray-500 hover:bg-gray-100'
                            : 'bg-brand-primary text-white hover:bg-blue-600'
                    }`}
                >
                    {isCompleted ? <CheckCircleIcon className="w-4 h-4 text-green-500 ml-1" /> : null}
                    {isCompleted ? 'مطالعه شد' : 'مطالعه کردم'}
                </button>
            </div>
        </div>
    );
};


interface Feedback {
    id: string;
    tag: FeedbackTag;
    comment?: string;
    giver: User;
    receiver: User;
    date: string;
    krTitle: string;
    linkedAssignment?: LearningAssignment;
    linkedResource?: LearningResource;
    assigner?: User;
}

interface FeedbackCardProps {
    feedback: Feedback;
    objectives: Objective[];
    onUpdateStatus: (assignmentId: string, status: LearningAssignmentStatus) => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, objectives, onUpdateStatus }) => {
    const { tag, giver, receiver, date, krTitle, comment, linkedAssignment, linkedResource, assigner } = feedback;
    const Icon = ICONS[tag.icon];

    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm animate-fade-in">
            <div className="flex items-start space-x-4 space-x-reverse">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tag.color}20`}}>
                    <Icon className="w-6 h-6" style={{ color: tag.color }} />
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-semibold text-brand-text">"{tag.description}"</p>
                    {comment && <p className="text-sm text-gray-600 mt-1 p-2 bg-gray-100/70 rounded-md">"{comment}"</p>}
                    <div className="text-xs text-brand-subtext mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center">
                            <span>از:</span>
                            <img src={giver.avatarUrl} alt={giver.name} className="w-5 h-5 rounded-full mx-1.5" />
                            <span>{giver.name}</span>
                        </div>
                         <div className="flex items-center">
                            <span>به:</span>
                            <img src={receiver.avatarUrl} alt={receiver.name} className="w-5 h-5 rounded-full mx-1.5" />
                            <span>{receiver.name}</span>
                        </div>
                        <span className="text-gray-400 hidden sm:inline">•</span>
                        <span className="truncate" title={krTitle}>در مورد: {krTitle}</span>
                        <span className="text-gray-400 hidden sm:inline">•</span>
                        <span>{toPersianDate(date)}</span>
                    </div>
                </div>
            </div>
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


interface FeedbackPageProps {
  objectives: Objective[];
  users: User[];
  feedbackTags: FeedbackTag[];
  onSaveFeedbackTag: (tag: FeedbackTag) => void;
  onDeleteFeedbackTag: (tagId: string) => void;
  learningAssignments: LearningAssignment[];
  resources: {
      microLearnings: MicroLearning[];
      youtubeVideos: YouTubeVideo[];
      books: Book[];
  };
  onUpdateLearningAssignmentStatus: (assignmentId: string, status: LearningAssignmentStatus) => void;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ objectives, users, feedbackTags, onSaveFeedbackTag, onDeleteFeedbackTag, learningAssignments, resources, onUpdateLearningAssignmentStatus }) => {
    const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    const { allFeedback, tagsWithCounts } = useMemo(() => {
        const feedbackItems: Omit<Feedback, 'linkedAssignment' | 'linkedResource' | 'assigner'>[] = [];

        objectives.forEach(obj => {
            obj.keyResults.forEach(kr => {
                const receiver = users.find(u => u.id === kr.ownerId);
                if (!receiver) return;

                kr.checkIns.forEach(ci => {
                    if (ci.feedbackTagId && ci.feedbackGiverId) {
                        const giver = users.find(u => u.id === ci.feedbackGiverId);
                        const tag = feedbackTags.find(t => t.id === ci.feedbackTagId);
                        if (!giver || !tag) return;
                        
                        feedbackItems.push({
                            id: ci.id,
                            tag: tag,
                            comment: ci.feedbackComment,
                            giver,
                            receiver,
                            date: ci.date,
                            krTitle: kr.title,
                        });
                    }
                });
            });
        });
        
        const sortedFeedback = feedbackItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const findResource = (assignment: LearningAssignment): LearningResource | undefined => {
            switch(assignment.resourceType) {
                case LearningResourceType.MICRO_LEARNING: return resources.microLearnings.find(r => r.id === assignment.resourceId);
                case LearningResourceType.YOUTUBE_VIDEO: return resources.youtubeVideos.find(r => r.id === assignment.resourceId);
                case LearningResourceType.BOOK: return resources.books.find(r => r.id === assignment.resourceId);
                default: return undefined;
            }
        };

        const augmentedFeedback = sortedFeedback.map(fb => {
            const linkedAssignment = learningAssignments.find(a => a.triggerFeedbackId === fb.id);
            if (!linkedAssignment) return fb as Feedback;

            const linkedResource = findResource(linkedAssignment);
            const assigner = users.find(u => u.id === linkedAssignment.assignerId);

            return { ...fb, linkedAssignment, linkedResource, assigner };
        });

        const counts: { [key: string]: number } = {};
        augmentedFeedback.forEach(fb => {
            counts[fb.tag.id] = (counts[fb.tag.id] || 0) + 1;
        });

        const tagsWithCounts = feedbackTags
            .map(tag => ({ ...tag, count: counts[tag.id] || 0 }))
            .filter(tag => tag.count > 0);

        return { allFeedback: augmentedFeedback, tagsWithCounts };
    }, [objectives, users, feedbackTags, learningAssignments, resources]);

    const filteredFeedback = useMemo(() => {
        if (!selectedTagId) {
            return allFeedback;
        }
        return allFeedback.filter(fb => fb.tag.id === selectedTagId);
    }, [allFeedback, selectedTagId]);

    const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
        '#fcd34d': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-400' },
        '#93c5fd': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-400' },
        '#f9a8d4': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-400' },
        '#86efac': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' },
        '#a78bfa': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-400' },
        '#fb923c': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-400' },
        '#6ee7b7': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400' },
        '#fca5a5': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' },
    };


    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-text">بازخوردها</h1>
                <button onClick={() => setIsManageModalOpen(true)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm">
                    مدیریت برچسب‌ها
                </button>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center mb-8">
                <button 
                    onClick={() => setSelectedTagId(null)}
                    className={`pl-4 pr-3 py-2 rounded-full border font-medium transition-colors text-sm h-10 flex items-center space-x-2 space-x-reverse ${
                        !selectedTagId 
                        ? 'bg-gray-800 border-gray-800 text-white' 
                        : 'bg-gray-100 border-gray-100 hover:border-gray-300 text-gray-700'
                    }`}
                >
                    <span>همه</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${!selectedTagId ? 'bg-white/20' : 'bg-gray-200/80'}`}>{allFeedback.length}</span>
                </button>
                {tagsWithCounts.map(tag => {
                    const isSelected = selectedTagId === tag.id;
                    const colors = colorMap[tag.color] || { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-400' };
                    const Icon = ICONS[tag.icon];

                    return (
                        <button
                            key={tag.id}
                            onClick={() => setSelectedTagId(tag.id)}
                            className={`flex items-center space-x-2 space-x-reverse pl-4 pr-3 py-2 rounded-full border font-medium transition-colors text-sm h-10 ${
                                isSelected 
                                ? `${colors.bg} ${colors.border} ${colors.text}` 
                                : 'bg-gray-100 border-gray-100 hover:border-gray-300 text-gray-700'
                            }`}
                        >
                            <Icon className="w-5 h-5" style={{ color: tag.color }} />
                            <span>{tag.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-gray-200/80'}`}>{tag.count}</span>
                        </button>
                    );
                })}
            </div>

            <div className="space-y-4">
                {filteredFeedback.map(fb => (
                    <FeedbackCard 
                        key={fb.id}
                        feedback={fb}
                        objectives={objectives}
                        onUpdateStatus={onUpdateLearningAssignmentStatus}
                    />
                ))}
                 {filteredFeedback.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                        <p className="text-brand-subtext">هیچ بازخوردی در این دسته یافت نشد.</p>
                    </div>
                )}
            </div>

            <ManageFeedbackTagsModal 
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                tags={feedbackTags}
                onSave={onSaveFeedbackTag}
                onDelete={onDeleteFeedbackTag}
            />
        </div>
    );
};

export default FeedbackPage;