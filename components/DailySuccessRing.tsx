import React, { useState, useEffect, useRef } from 'react';
import { CheckIcon, XCircleIcon } from './Icons';
import StarRating from './StarRating';

declare var confetti: any;

interface DailySuccessRingProps {
    totalTasks: number;
    completedTasks: number;
    dailyRating?: number;
    dailyFeeling?: string;
    dailyFeedbackSubmitted: boolean;
    onRatingSubmit: (rating: number) => void;
    onFeelingSubmit: (feeling: string) => void;
    onFeedbackSubmit: (feedback: string) => void;
    isCollapsed?: boolean;
    onClick?: () => void;
}

const usePrevious = <T,>(value: T): T | undefined => {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

const feelings = [
    { label: 'با انگیزه', emoji: '💪' },
    { label: 'کسب دستاورد', emoji: '🏆' },
    { label: 'شاد', emoji: '😊' },
    { label: 'معمولی', emoji: '🙂' },
    { label: 'غمگین', emoji: '😢' },
    { label: 'ترس و نگرانی', emoji: '😨' },
];


const DailySuccessRing: React.FC<DailySuccessRingProps> = ({
    totalTasks,
    completedTasks,
    dailyRating,
    dailyFeeling,
    dailyFeedbackSubmitted,
    onRatingSubmit,
    onFeelingSubmit,
    onFeedbackSubmit,
    isCollapsed = false,
    onClick,
}) => {
    const [status, setStatus] = useState<'progress' | 'celebrating' | 'rating' | 'feeling' | 'feedback' | 'done'>('progress');
    const [rating, setRating] = useState<number | undefined>(dailyRating);
    const [showFeedbackPopover, setShowFeedbackPopover] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [showFeelingPopover, setShowFeelingPopover] = useState(false);

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const prevProgress = usePrevious(progress);

    useEffect(() => {
        if (prevProgress !== undefined && prevProgress < 100 && progress >= 100 && dailyRating === undefined) {
            setStatus('celebrating');
            if (buttonRef.current && typeof confetti === 'function') {
                const rect = buttonRef.current.getBoundingClientRect();
                const origin = {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight
                };
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: origin,
                    zIndex: 1000
                });
            }
            setTimeout(() => {
                setStatus('rating');
            }, 1500); // Duration of celebration
        }
    }, [progress, prevProgress, dailyRating]);

    useEffect(() => {
        if (progress < 100) {
            setStatus('progress');
            return;
        }
        if (status === 'celebrating') {
            return;
        }
        if (dailyRating === undefined) {
            setStatus('rating');
            return;
        }
        if (dailyFeeling === undefined) {
            setStatus('feeling');
            return;
        }
        if (!dailyFeedbackSubmitted) {
            setStatus('feedback');
            return;
        }
        setStatus('done');
    }, [progress, dailyRating, dailyFeeling, dailyFeedbackSubmitted, status]);
    
    useEffect(() => {
        setShowFeelingPopover(status === 'feeling' && !isCollapsed);
        setShowFeedbackPopover(status === 'feedback' && !isCollapsed);
    }, [status, isCollapsed]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                if (showFeelingPopover) {
                    setShowFeelingPopover(false);
                    onFeelingSubmit('skipped');
                }
                if (showFeedbackPopover) {
                    setShowFeedbackPopover(false);
                    setStatus('done');
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFeelingPopover, showFeedbackPopover, onFeelingSubmit]);
    
    const handleRatingSelect = (newRating: number) => {
        setRating(newRating);
        onRatingSubmit(newRating);
    };

    const handleFeelingSelect = (feeling: string) => {
        onFeelingSubmit(feeling);
        setShowFeelingPopover(false);
    };
    
    const handleFeedbackSubmit = () => {
        onFeedbackSubmit(feedbackText);
        setShowFeedbackPopover(false);
        setStatus('done');
    };
    
    const handleSkipFeedback = () => {
        setShowFeedbackPopover(false);
        setStatus('done');
    }

    const handleClick = () => {
        if (showFeedbackPopover || showFeelingPopover) {
            return;
        }
        if (onClick) {
            onClick();
        }
    };

    const radius = isCollapsed ? 28 : 32;
    const stroke = 4;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const checkClass = `transition-all duration-500 ${isCollapsed ? 'w-12 h-12' : 'w-16 h-16'}`;

    const renderContent = () => {
        if (status === 'done' || status === 'feedback' || status === 'rating' || status === 'feeling') {
             return <CheckIcon className={`${checkClass} text-green-500`} />;
        }
        
        const isCelebrating = status === 'celebrating';
        
        if (progress >= 100) {
            return (
                 <>
                    <CheckIcon
                        className={`${checkClass} absolute transition-all duration-300
                        ${isCelebrating ? 'text-green-500 animate-check-bounce' : 'text-green-500'}
                    `}
                    />
                    {isCelebrating && <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></div>}
                </>
            );
        }
        
        return null;
    };

    return (
        <div className="relative flex flex-col items-center">
            {status === 'rating' && !isCollapsed && (
                <div className="absolute bottom-full mb-2 w-full flex flex-col items-center animate-fade-in text-center">
                    <span className="text-xs font-semibold mb-2 text-brand-text dark:text-slate-300">عملکرد امروزت چطور بود؟</span>
                    <StarRating rating={0} setRating={handleRatingSelect} size={'w-5 h-5'}/>
                </div>
            )}
            {showFeelingPopover && !isCollapsed && (
                <div
                    ref={popoverRef}
                    className="absolute bottom-full mb-2 w-64 bg-white dark:bg-slate-700 rounded-lg shadow-xl border dark:border-slate-600 z-50 p-4 animate-slide-in-up"
                    style={{ left: isCollapsed ? '50%' : 'auto', right: isCollapsed ? 'auto' : 0, transform: isCollapsed ? 'translateX(-50%)' : 'none' }}
                >
                    <h4 className="font-semibold text-sm text-brand-text dark:text-slate-200 text-center mb-4">امروز چه احساسی داشتی؟</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {feelings.map(feeling => (
                            <button
                                key={feeling.label}
                                onClick={() => handleFeelingSelect(`${feeling.label} ${feeling.emoji}`)}
                                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                            >
                                <span className="text-3xl">{feeling.emoji}</span>
                                <span className="text-xs mt-1 text-brand-subtext dark:text-slate-300">{feeling.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {status === 'done' && !showFeedbackPopover && !isCollapsed && (
                <div className="absolute bottom-full mb-2 w-full text-center animate-fade-in">
                     <span className="text-xs font-semibold text-green-700 dark:text-green-400">عالی بود! 💪</span>
                </div>
            )}
             <button
                ref={buttonRef}
                onClick={handleClick}
                className={`relative flex items-center justify-center rounded-lg transition-colors font-semibold group
                ${isCollapsed ? 'h-14 w-14' : 'h-24 w-full bg-gray-100 dark:bg-slate-800'}`}
             >
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="absolute inset-0 m-auto"
                    aria-hidden="true"
                >
                    <circle
                        stroke="#e5e7eb"
                        className="dark:stroke-slate-700"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s ease-out' }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className={`transition-colors duration-500 ${progress >= 100 ? 'text-green-500' : 'text-brand-primary'}`}
                    />
                </svg>
                {renderContent()}
                 {!isCollapsed && status === 'progress' && progress < 100 && (
                    <div className="text-center">
                        <div className="font-bold text-2xl text-brand-text dark:text-slate-200">
                            {completedTasks}/{totalTasks}
                        </div>
                        <div className="text-xs text-brand-subtext dark:text-slate-400">انجام شده</div>
                    </div>
                )}
            </button>
            {showFeedbackPopover && (
                 <div 
                    ref={popoverRef}
                    className="absolute bottom-full mb-2 w-64 bg-white dark:bg-slate-700 rounded-lg shadow-xl border dark:border-slate-600 z-50 p-4 animate-slide-in-up"
                    style={{ left: isCollapsed ? '50%' : 'auto', right: isCollapsed ? 'auto' : 0, transform: isCollapsed ? 'translateX(-50%)' : 'none' }}
                 >
                    <h4 className="font-semibold text-sm text-brand-text dark:text-slate-200">بازخورد روزانه</h4>
                    <p className="text-xs text-brand-subtext dark:text-slate-400 mb-2">یک دستاورد یا نکته مهم امروز رو بنویس...</p>
                    <textarea 
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={3}
                        className="input-style w-full text-sm"
                        aria-label="Daily feedback input"
                    />
                    <div className="flex justify-end items-center mt-2 space-x-2 space-x-reverse">
                        <button onClick={handleSkipFeedback} className="text-xs font-semibold text-gray-500 dark:text-slate-400">فعلاً نه</button>
                        <button onClick={handleFeedbackSubmit} className="px-3 py-1 bg-brand-primary text-white text-xs font-semibold rounded-md">ثبت</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailySuccessRing;