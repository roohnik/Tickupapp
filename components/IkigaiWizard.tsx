// This is a new file: components/IkigaiWizard.tsx
import React, { useState } from 'react';
import FullScreenModal from '../modals/FullScreenModal';
// FIX: Imported missing ICONS map and specific icon components to resolve reference errors.
import { HeartIcon, BrainIcon, StarIcon, GlobeAltIcon, BanknotesIcon, ICONS, SparklesIcon, CheckCircleIcon, UserGroupIcon, CubeIcon, ChartIcon, RocketIcon, MegaphoneIcon, ComputerDesktopIcon, UserIcon, LightbulbIcon, SettingsIcon, EditIcon, ClipboardListIcon, HandshakeIcon, GraduationCapIcon, DocumentTextIcon, TrophyIcon, CalendarIcon } from './Icons';
import { suggestMissions, SuggestedMission, suggestSkillsFromProfile } from '../services/geminiService';
import StarRating from './StarRating';

interface IkigaiWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onMissionSelect: (mission: SuggestedMission) => void;
}

const SKILLS_DATA = [
    { id: 'leadership', label: 'رهبری تیم', Icon: UserGroupIcon },
    { id: 'product-management', label: 'مدیریت محصول', Icon: CubeIcon },
    { id: 'data-analysis', label: 'تحلیل داده', Icon: ChartIcon },
    { id: 'strategy', label: 'استراتژی کسب‌وکار', Icon: RocketIcon },
    { id: 'marketing', label: 'بازاریابی', Icon: MegaphoneIcon },
    { id: 'sales', label: 'فروش', Icon: BanknotesIcon },
    { id: 'software-dev', label: 'توسعه نرم‌افزار', Icon: ComputerDesktopIcon },
    { id: 'ai-ml', label: 'هوش مصنوعی', Icon: BrainIcon },
    { id: 'finance', label: 'مالی و حسابداری', Icon: BanknotesIcon },
    { id: 'hr', label: 'منابع انسانی', Icon: UserIcon },
    { id: 'design', label: 'طراحی محصول/UX', Icon: LightbulbIcon },
    { id: 'operations', label: 'عملیات', Icon: SettingsIcon },
    { id: 'public-speaking', label: 'سخنرانی عمومی', Icon: MegaphoneIcon },
    { id: 'writing', label: 'نویسندگی', Icon: EditIcon },
    { id: 'project-management', label: 'مدیریت پروژه', Icon: ClipboardListIcon },
    { id: 'customer-service', label: 'خدمات مشتریان', Icon: HandshakeIcon },
    { id: 'teaching', label: 'آموزش', Icon: GraduationCapIcon },
    { id: 'research', label: 'تحقیق و توسعه', Icon: LightbulbIcon },
    { id: 'negotiation', label: 'مذاکره', Icon: HandshakeIcon },
    { id: 'networking', label: 'شبکه‌سازی', Icon: UserGroupIcon },
    { id: 'content-creation', label: 'تولید محتوا', Icon: DocumentTextIcon },
    { id: 'coaching', label: 'مربیگری', Icon: TrophyIcon },
    { id: 'event-planning', label: 'برنامه‌ریزی رویداد', Icon: CalendarIcon },
    { id: 'problem-solving', label: 'حل مسئله', Icon: LightbulbIcon },
];

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="flex justify-center space-x-2 space-x-reverse mb-8">
        {[1, 2, 3, 4].map(step => (
            <div key={step} className={`w-3 h-3 rounded-full transition-all duration-300 ${currentStep === step ? 'bg-blue-500 scale-125' : 'bg-gray-300'} ${currentStep > step ? 'bg-blue-500' : ''}`} />
        ))}
    </div>
);

const IkigaiWizard: React.FC<IkigaiWizardProps> = ({ isOpen, onClose, onMissionSelect }) => {
    const [step, setStep] = useState(1);
    const [passionAnswers, setPassionAnswers] = useState({ q1: '', q2: '', q3: '' });
    const [expertiseAnswers, setExpertiseAnswers] = useState({ q1: '', q2: '' });
    const [suggestedSkills, setSuggestedSkills] = useState<typeof SKILLS_DATA>([]);
    const [selectedSkills, setSelectedSkills] = useState<Map<string, number>>(new Map());
    const [suggestedMissions, setSuggestedMissions] = useState<SuggestedMission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedMissionTitle, setSelectedMissionTitle] = useState<string | null>(null);


    const handlePassionChange = (q: 'q1' | 'q2' | 'q3', value: string) => {
        setPassionAnswers(prev => ({ ...prev, [q]: value }));
    };
    
    const handleExpertiseChange = (q: 'q1' | 'q2', value: string) => {
        setExpertiseAnswers(prev => ({ ...prev, [q]: value }));
    };

    const handleNextToSkills = async () => {
        setIsLoading(true);
        setStep(3);
        try {
            const passionText = Object.values(passionAnswers).join('\n');
            const expertiseText = Object.values(expertiseAnswers).join('\n');
            const skillIds = await suggestSkillsFromProfile(passionText, expertiseText, SKILLS_DATA.map(s => ({id: s.id, label: s.label})));
            const filteredSkills = SKILLS_DATA.filter(s => skillIds.includes(s.id));
            setSuggestedSkills(filteredSkills.length > 0 ? filteredSkills : SKILLS_DATA); // Fallback to all if AI returns empty
        } catch (error) {
             console.error("Failed to get skill suggestions:", error);
             // Fallback to all skills if AI fails
             setSuggestedSkills(SKILLS_DATA);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkillToggle = (skillId: string) => {
        const newSkills = new Map(selectedSkills);
        if (newSkills.has(skillId)) {
            newSkills.delete(skillId);
        } else {
            newSkills.set(skillId, 3); // Default rating
        }
        setSelectedSkills(newSkills);
    };

    const handleSkillRating = (skillId: string, rating: number) => {
        const newSkills = new Map(selectedSkills);
        newSkills.set(skillId, rating);
        setSelectedSkills(newSkills);
    };
    
    const fetchMissions = async (append = false) => {
        if (!append) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }
        
        const passionText = Object.values(passionAnswers).join('\n');
        const expertiseText = Object.values(expertiseAnswers).join('\n');
        const skills = Array.from(selectedSkills.entries()).map(([skillId, rating]) => ({
            skill: SKILLS_DATA.find(s => s.id === skillId)?.label || skillId,
            rating
        }));
        const existingMissionTitles = append ? suggestedMissions.map(m => m.missionTitle) : [];

        try {
            const missions = await suggestMissions(passionText, expertiseText, skills, existingMissionTitles);
            if (append) {
                setSuggestedMissions(prev => [...prev, ...missions]);
            } else {
                setSuggestedMissions(missions);
                setStep(4);
            }
        } catch (error) {
            console.error("Failed to get missions:", error);
            alert("خطا در دریافت پیشنهادات. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };
    
    const handleSelectMission = (mission: SuggestedMission) => {
        setSelectedMissionTitle(mission.missionTitle);
        onMissionSelect(mission);
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Passion
                return (
                    <div className="w-full max-w-2xl mx-auto text-center animate-fade-in">
                        <HeartIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        <h2 className="text-3xl font-bold font-sans text-gray-800">آنچه عاشقش هستید</h2>
                        <p className="text-gray-600 mt-2">بیایید با کشف عمیق‌ترین علایق شما شروع کنیم.</p>
                        <div className="space-y-6 mt-8 text-right">
                            <div>
                                <label className="font-semibold">کدام فعالیت‌ها شما را کاملاً غرق در خود می‌کند و گذر زمان را فراموش می‌کنید؟</label>
                                <textarea value={passionAnswers.q1} onChange={e => handlePassionChange('q1', e.target.value)} rows={3} className="input-style w-full mt-2" />
                            </div>
                            <div>
                                <label className="font-semibold">اگر دغدغه مالی نداشتید، چه کاری را با اشتیاق دنبال می‌کردید؟</label>
                                <textarea value={passionAnswers.q2} onChange={e => handlePassionChange('q2', e.target.value)} rows={3} className="input-style w-full mt-2" />
                            </div>
                             <div>
                                <label className="font-semibold">درباره چه موضوعاتی با هیجان و علاقه برای دیگران صحبت می‌کنید؟</label>
                                <textarea value={passionAnswers.q3} onChange={e => handlePassionChange('q3', e.target.value)} rows={3} className="input-style w-full mt-2" />
                            </div>
                        </div>
                        <button onClick={() => setStep(2)} className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105">قدم بعدی</button>
                    </div>
                );
            case 2: // Expertise
                 return (
                    <div className="w-full max-w-2xl mx-auto text-center animate-fade-in">
                        <BrainIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                        <h2 className="text-3xl font-bold font-sans text-gray-800">آنچه در آن مهارت دارید</h2>
                        <p className="text-gray-600 mt-2">تجربه، دانش و تخصص شما سرمایه‌های ارزشمندی هستند.</p>
                        <div className="space-y-6 mt-8 text-right">
                            <div>
                                <label className="font-semibold">در چه زمینه‌هایی بیش از ۵ سال تجربه کاری عمیق دارید؟</label>
                                <textarea value={expertiseAnswers.q1} onChange={e => handleExpertiseChange('q1', e.target.value)} rows={3} className="input-style w-full mt-2" />
                            </div>
                            <div>
                                <label className="font-semibold">دیگران معمولاً برای چه مشاوره‌ای به سراغ شما می‌آیند؟</label>
                                <textarea value={expertiseAnswers.q2} onChange={e => handleExpertiseChange('q2', e.target.value)} rows={3} className="input-style w-full mt-2" />
                            </div>
                        </div>
                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">بازگشت</button>
                            <button onClick={handleNextToSkills} disabled={isLoading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 disabled:bg-gray-400">
                                {isLoading ? 'در حال تحلیل...' : 'قدم بعدی'}
                            </button>
                        </div>
                    </div>
                );
            case 3: // Skills
                 return (
                    <div className="w-full max-w-4xl mx-auto animate-fade-in">
                        <h2 className="text-3xl font-bold font-sans text-gray-800 text-center">مهارت‌های شما</h2>
                        <p className="text-gray-600 mt-2 mb-8 text-center">مهارت‌های پیشنهادی را انتخاب و به آن‌ها از ۱ تا ۵ امتیاز دهید.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {suggestedSkills.map(skill => {
                                const isSelected = selectedSkills.has(skill.id);
                                return (
                                    <div key={skill.id} className={`p-3 rounded-lg border-2 transition-all duration-200 ${isSelected ? 'border-blue-500 bg-blue-50' : 'bg-white hover:border-gray-300'}`}>
                                        <div onClick={() => handleSkillToggle(skill.id)} className="flex items-center cursor-pointer">
                                            <skill.Icon className="w-6 h-6 text-gray-600 mr-2" />
                                            <h4 className="font-semibold text-sm flex-grow">{skill.label}</h4>
                                            {isSelected && <CheckCircleIcon className="w-5 h-5 text-blue-500" />}
                                        </div>
                                        {isSelected && (
                                            <div className="mt-3 pt-2 border-t">
                                                <StarRating rating={selectedSkills.get(skill.id) || 0} setRating={(r) => handleSkillRating(skill.id, r)} size="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                         <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(2)} className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">بازگشت</button>
                            <button onClick={() => fetchMissions()} disabled={selectedSkills.size === 0 || isLoading} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition-transform hover:scale-105 disabled:bg-gray-400 flex items-center justify-center min-w-[200px]">
                                {isLoading ? 'در حال تحلیل...' : <><SparklesIcon className="w-5 h-5 ml-2" /> پیدا کردن ماموریت من</>}
                            </button>
                        </div>
                    </div>
                );
            case 4: return (
                <div className="w-full max-w-6xl mx-auto animate-fade-in">
                    <h2 className="text-3xl font-bold text-gray-800 text-center">پیشنهادات هوشمند</h2>
                    <p className="text-gray-600 mt-2 mb-8 text-center">بر اساس ورودی‌های شما, این ماموریت‌ها پیشنهاد می‌شوند. بهترین گزینه را انتخاب کنید.</p>
                    {isLoading ? <p className="text-center py-20">در حال دریافت پیشنهادات...</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {suggestedMissions.map((mission, index) => {
                                const Icon = ICONS[mission.iconName] || SparklesIcon;
                                const isSelected = selectedMissionTitle === mission.missionTitle;
                                return (
                                    <div
                                        key={index}
                                        className={`p-6 rounded-xl border-2 flex flex-col transition-all duration-300 ${
                                            isSelected ? 'border-blue-500 bg-blue-50 scale-105' : 'bg-white hover:border-gray-300 hover:shadow-lg'
                                        }`}
                                    >
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                                                <Icon className="w-8 h-8 text-gray-700" />
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-800 flex-grow">{mission.missionTitle}</h3>
                                        </div>
                                        <div className="space-y-3 text-sm text-gray-600 flex-grow">
                                            <p><strong className="font-semibold text-red-600">اشتیاق:</strong> {mission.reasoning.passion}</p>
                                            <p><strong className="font-semibold text-blue-600">مهارت:</strong> {mission.reasoning.skill}</p>
                                            <p><strong className="font-semibold text-green-600">نیاز بازار:</strong> {mission.reasoning.market}</p>
                                            <p><strong className="font-semibold text-yellow-600">کسب درآمد:</strong> {mission.reasoning.business}</p>
                                        </div>
                                        <button
                                            onClick={() => handleSelectMission(mission)}
                                            className={`w-full mt-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center ${
                                                isSelected ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            {isSelected ? <CheckCircleIcon className="w-5 h-5 ml-2" /> : null}
                                            {isSelected ? 'انتخاب شد' : 'انتخاب این ماموریت'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-8">
                        <button onClick={() => setStep(3)} className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">بازگشت</button>
                        <button onClick={() => fetchMissions(true)} disabled={isLoadingMore} className="px-6 py-3 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 disabled:opacity-50 flex items-center justify-center min-w-[180px]">
                           {isLoadingMore ? 'در حال دریافت...' : 'پیشنهادات بیشتر'}
                        </button>
                   </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <FullScreenModal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 sm:p-8 pt-16">
                <StepIndicator currentStep={step} />
                {renderStep()}
            </div>
        </FullScreenModal>
    );
};

export default IkigaiWizard;