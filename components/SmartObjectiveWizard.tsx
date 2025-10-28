// This is a new file: components/SmartObjectiveWizard.tsx
import React, { useState } from 'react';
// FIX: Added KRCategory and SuggestedObjectiveWithKRs to imports.
import { Objective, KeyResult, User, Strategy, StyleSettings, SuggestedPerspective, ObjectiveCategoryId, KRType, SuggestedKR, CompanyVision, KRCategory, SuggestedObjectiveWithKRs } from '../types';
// FIX: Added generateSmartObjectives to imports.
import { generateSmartObjectives, AIPrompts } from '../services/geminiService';
import { OBJECTIVE_CATEGORY_LIST } from '../constants';
import StarRating from './StarRating';
import FullScreenModal from '../modals/FullScreenModal';
import { SparklesIcon, ChevronDownIcon, CheckCircleIcon, ICONS } from './Icons';

interface SmartObjectiveWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (objectiveData: Omit<Objective, 'id' | 'keyResults'>, keyResults: Omit<KeyResult, 'id'>[]) => void;
  users: User[];
  strategies: Strategy[];
  defaultOwnerId: string;
  styleSettings: StyleSettings;
  aiPrompts: AIPrompts;
  companyVision: any; // Assuming CompanyVision is available
}

const StepIndicator: React.FC<{ currentStep: number; onStepClick: (step: number) => void }> = ({ currentStep, onStepClick }) => (
    <div className="flex justify-center space-x-2 space-x-reverse mb-8">
        {[1, 2, 3, 4].map(step => (
            <button
                key={step}
                onClick={() => onStepClick(step)}
                disabled={step >= currentStep && step !== 4}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${currentStep === step ? 'bg-blue-500 scale-125' : 'bg-gray-300'} ${currentStep > step ? 'bg-blue-500 cursor-pointer' : 'cursor-not-allowed'}`}
            />
        ))}
    </div>
);


const DimensionSlider: React.FC<{
    title: string;
    question: string;
    labelLeft: string;
    labelRight: string;
    value: number;
    onChange: (value: number) => void;
}> = ({ title, question, labelLeft, labelRight, value, onChange }) => (
    <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-500 mt-1 mb-4 italic">"{question}"</p>
        <div className="flex items-center space-x-4 space-x-reverse">
            <span className="text-xs font-medium text-gray-600 w-24 text-center">{labelLeft}</span>
            <input
                type="range"
                min="1"
                max="100"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-medium text-gray-600 w-24 text-center">{labelRight}</span>
        </div>
    </div>
);


const SmartObjectiveWizard: React.FC<SmartObjectiveWizardProps> = (props) => {
    const [step, setStep] = useState(1);
    
    // Step 1 State
    const [goalDescription, setGoalDescription] = useState('');
    const [priorityStrategyIds, setPriorityStrategyIds] = useState<string[]>([]);
    
    // Step 2 State
    const [topicRatings, setTopicRatings] = useState<Map<ObjectiveCategoryId, number>>(new Map());

    // Step 3 State
    const [dimensions, setDimensions] = useState({
        ambition: 50,
        focus: 50,
        horizon: 50,
        certainty: 50,
    });
    
    // Step 4 State
    const [perspectives, setPerspectives] = useState<SuggestedPerspective[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // FIX: Corrected type for the `objective` property in the final selection state.
    const [finalSelection, setFinalSelection] = useState<{
        objective: SuggestedObjectiveWithKRs;
        keyResults: Map<string, SuggestedKR>;
    } | null>(null);


    const handleClose = () => {
        // Reset all state
        setStep(1);
        setGoalDescription('');
        setPriorityStrategyIds([]);
        setTopicRatings(new Map());
        setDimensions({ ambition: 50, focus: 50, horizon: 50, certainty: 50 });
        setPerspectives([]);
        setIsLoading(false);
        setFinalSelection(null);
        props.onClose();
    };
    
    const handleStepClick = (targetStep: number) => {
        if (targetStep < step || step === 4) { // Allow going back or jumping if results are loaded
            setStep(targetStep);
        }
    };
    
    const fetchSuggestions = async (append = false) => {
        if (!append) {
            setIsLoading(true);
            setStep(4);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const results = await generateSmartObjectives({
                goalDescription,
                priorityStrategyIds,
                strategies: props.strategies,
                companyVision: props.companyVision,
                topicRatings,
                dimensions,
                existingPerspectives: append ? perspectives.map(p => p.perspectiveTitle) : [],
            }, props.aiPrompts.generateSmartObjectives);

            if (append) {
                setPerspectives(prev => [...prev, ...results]);
            } else {
                setPerspectives(results);
            }
        } catch (error) {
            console.error("Error generating smart objectives:", error);
            alert("خطا در دریافت پیشنهادات هوشمند. لطفا دوباره تلاش کنید.");
            if (!append) setStep(3); // Go back if initial fetch fails
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleSelectObjective = (perspectiveIndex: number, objectiveIndex: number) => {
        const objective = perspectives[perspectiveIndex].objectives[objectiveIndex];
        const initialKRs = new Map<string, SuggestedKR>();
        objective.keyResults.forEach(kr => initialKRs.set(kr.title, kr));
        
        // FIX: Corrected state update to use the correct type without `as any`.
        setFinalSelection({
            objective: objective,
            keyResults: initialKRs,
        });
    };

    const handleToggleKR = (kr: SuggestedKR) => {
        if (!finalSelection) return;
        const newKRs = new Map(finalSelection.keyResults);
        if (newKRs.has(kr.title)) {
            newKRs.delete(kr.title);
        } else {
            newKRs.set(kr.title, kr);
        }
        setFinalSelection({ ...finalSelection, keyResults: newKRs });
    };

    const handleFinalSubmit = () => {
        if (!finalSelection) return;
        // FIX: Corrected category type to avoid 'unknown' error.
        const objectiveData: Omit<Objective, 'id' | 'keyResults'> = {
            title: finalSelection.objective.objectiveTitle,
            description: finalSelection.objective.objectiveDescription,
            ownerId: props.defaultOwnerId,
            category: (Array.from(topicRatings.keys())[0] as ObjectiveCategoryId | undefined) ?? 'BUSINESS_GROWTH',
            isArchived: false,
        };
        // FIX: Added explicit type for `kr` to resolve property access errors on 'unknown'.
        const keyResultsData = Array.from(finalSelection.keyResults.values()).map((kr: SuggestedKR) => ({
            title: kr.title,
            type: kr.type,
            startValue: kr.startValue,
            targetValue: kr.targetValue,
            ownerId: props.defaultOwnerId,
            // FIX: Resolved 'Cannot find name' error for KRCategory.
            category: KRCategory.Standard, // Default to standard
            currentValue: kr.startValue,
            checkIns: [],
        }));
        props.onSubmit(objectiveData, keyResultsData);
        handleClose();
    };


    const renderStep = () => {
        switch (step) {
            case 1: return (
                <div className="w-full max-w-2xl mx-auto text-center animate-fade-in">
                    <h2 className="text-3xl font-bold text-gray-800">ایده اولیه شما</h2>
                    <p className="text-gray-600 mt-2">چه هدف اجرایی در ذهن دارید؟ به طور خلاصه توصیف کنید و استراتژی‌های مرتبط را انتخاب کنید.</p>
                    <div className="space-y-6 mt-8 text-right">
                        <div>
                            <label className="font-semibold">توضیحات هدف</label>
                            <textarea value={goalDescription} onChange={e => setGoalDescription(e.target.value)} rows={4} className="input-style w-full mt-2" placeholder="مثال: افزایش سهم بازار در منطقه شمال کشور و معرفی محصول جدید به مشتریان فعلی..."/>
                        </div>
                        <div>
                            <label className="font-semibold">کدام استراتژی‌ها در اولویت هستند؟</label>
                             <div className="mt-2 p-2 border rounded-lg max-h-40 overflow-y-auto space-y-1 bg-white">
                                {props.strategies.filter(s => !s.isArchived).map(strategy => (
                                    <label key={strategy.id} className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                                        <input type="checkbox" checked={priorityStrategyIds.includes(strategy.id)} onChange={() => {
                                            setPriorityStrategyIds(prev => prev.includes(strategy.id) ? prev.filter(id => id !== strategy.id) : [...prev, strategy.id])
                                        }} className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary ml-3" />
                                        <span>{strategy.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setStep(2)} className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105">قدم بعدی</button>
                </div>
            );
            case 2: return (
                <div className="w-full max-w-4xl mx-auto text-center animate-fade-in">
                     <h2 className="text-3xl font-bold text-gray-800">انتخاب موضوعات</h2>
                     <p className="text-gray-600 mt-2">به موضوعات زیر امتیاز دهید تا اولویت‌های خود را مشخص کنید (۱ کمترین، ۵ بیشترین).</p>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
                        {OBJECTIVE_CATEGORY_LIST.map(cat => {
                            const Icon = ICONS[cat.IconName];
                            const rating = topicRatings.get(cat.id) || 0;
                            return (
                                <div key={cat.id} className={`p-4 rounded-lg border-2 transition-all ${rating > 0 ? 'border-blue-500 bg-blue-50' : 'bg-white hover:border-gray-300'}`}>
                                    <Icon className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                                    <p className="font-semibold text-sm mb-3">{cat.label}</p>
                                    <StarRating rating={rating} setRating={(r) => {
                                        const newRatings = new Map(topicRatings);
                                        newRatings.set(cat.id, r);
                                        setTopicRatings(newRatings);
                                    }} size="w-5 h-5" />
                                </div>
                            );
                        })}
                     </div>
                     <div className="flex justify-between mt-8">
                         <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">بازگشت</button>
                         <button onClick={() => setStep(3)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105">قدم بعدی</button>
                    </div>
                </div>
            );
             case 3: return (
                <div className="w-full max-w-3xl mx-auto animate-fade-in">
                     <h2 className="text-3xl font-bold text-gray-800 text-center">تنظیم ابعاد استراتژیک</h2>
                     <p className="text-gray-600 mt-2 mb-8 text-center">با تنظیم این نوارها، به هوش مصنوعی کمک کنید تا ماهیت هدف شما را بهتر درک کند.</p>
                     <div className="space-y-6">
                        <DimensionSlider title="سطح جاه‌طلبی" question="آیا می‌خواهیم کاری که انجام می‌دهیم را بهتر کنیم یا کار کاملاً جدیدی انجام دهیم؟" labelLeft="بهینه‌سازی" labelRight="تحول" value={dimensions.ambition} onChange={v => setDimensions(d => ({...d, ambition: v}))} />
                        <DimensionSlider title="تمرکز هدف" question="آیا الان زمان ساختن یک خانه قوی‌تر است یا زمان فتح سرزمین‌های جدید؟" labelLeft="تمرکز داخلی" labelRight="تمرکز خارجی" value={dimensions.focus} onChange={v => setDimensions(d => ({...d, focus: v}))} />
                        <DimensionSlider title="افق زمانی تأثیر" question="آیا به دنبال تأمین سوخت برای حرکت امروز هستیم یا ساختن یک موتور قدرتمندتر برای آینده؟" labelLeft="دستاورد کوتاه‌مدت" labelRight="سرمایه‌گذاری بلندمدت" value={dimensions.horizon} onChange={v => setDimensions(d => ({...d, horizon: v}))} />
                        <DimensionSlider title="میزان قطعیت" question="آیا نقشه گنج را در دست داریم و فقط باید حرکت کنیم، یا هنوز باید به دنبال نقشه بگردیم؟" labelLeft="مسیر اکتشافی" labelRight="مسیر اجرایی" value={dimensions.certainty} onChange={v => setDimensions(d => ({...d, certainty: v}))} />
                     </div>
                      <div className="flex justify-between mt-8">
                         <button onClick={() => setStep(2)} className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">بازگشت</button>
                         <button onClick={() => fetchSuggestions()} disabled={isLoading} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition-transform hover:scale-105 disabled:bg-gray-400 flex items-center justify-center min-w-[200px]">
                             {isLoading ? 'در حال تحلیل...' : <><SparklesIcon className="w-5 h-5 ml-2" /> دریافت پیشنهادات</>}
                         </button>
                    </div>
                </div>
            );
             case 4: return (
                 <div className="w-full max-w-6xl mx-auto animate-fade-in">
                     <h2 className="text-3xl font-bold text-gray-800 text-center">پیشنهادات هوشمند</h2>
                     <p className="text-gray-600 mt-2 mb-8 text-center">بر اساس ورودی‌های شما، این زوایای دید و اهداف پیشنهاد می‌شوند. بهترین گزینه را انتخاب کنید.</p>
                     {isLoading ? <p className="text-center py-20">در حال دریافت پیشنهادات...</p> : (
                        <div className="space-y-6">
                            {perspectives.map((p, pIndex) => (
                                <div key={pIndex} className="bg-white border rounded-lg p-4">
                                    <h3 className="font-bold text-lg mb-1">{p.perspectiveTitle}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{p.perspectiveDescription}</p>
                                    <div className="space-y-4">
                                        {p.objectives.map((obj, oIndex) => {
                                            const isSelected = finalSelection?.objective === obj;
                                            return (
                                                <div key={oIndex} className={`p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'bg-gray-50'}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-semibold">{obj.objectiveTitle}</h4>
                                                            <p className="text-xs text-gray-500">{obj.objectiveDescription}</p>
                                                        </div>
                                                        <button onClick={() => handleSelectObjective(pIndex, oIndex)} className={`px-3 py-1 text-sm font-semibold rounded-md ${isSelected ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}>
                                                            {isSelected ? 'تغییر' : 'انتخاب'}
                                                        </button>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="mt-4 pt-3 border-t space-y-2">
                                                            <h5 className="text-sm font-semibold">نتایج کلیدی پیشنهادی (برای اضافه کردن انتخاب کنید):</h5>
                                                            {obj.keyResults.map(kr => (
                                                                <label key={kr.title} className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                                                                    <input type="checkbox" checked={finalSelection.keyResults.has(kr.title)} onChange={() => handleToggleKR(kr)} className="w-4 h-4 ml-3"/>
                                                                    <span className="text-sm">{kr.title} ({kr.startValue} &rarr; {kr.targetValue})</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}
                     <div className="flex justify-between items-center mt-8">
                         <button onClick={() => setStep(3)} className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">بازگشت</button>
                         {finalSelection ? (
                            <button onClick={handleFinalSubmit} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700">ایجاد هدف نهایی</button>
                         ) : (
                             <button onClick={() => fetchSuggestions(true)} disabled={isLoadingMore} className="px-6 py-3 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 disabled:opacity-50 flex items-center justify-center min-w-[180px]">
                                {isLoadingMore ? 'در حال دریافت...' : 'پیشنهادات بیشتر'}
                             </button>
                         )}
                    </div>
                 </div>
             );
            default: return null;
        }
    };

    return (
        <FullScreenModal isOpen={props.isOpen} onClose={handleClose}>
            <div className="p-4 sm:p-8 pt-16">
                <StepIndicator currentStep={step} onStepClick={handleStepClick} />
                {renderStep()}
            </div>
        </FullScreenModal>
    );
};

export default SmartObjectiveWizard;