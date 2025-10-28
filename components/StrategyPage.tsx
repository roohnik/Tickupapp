import React, { useState, useEffect, useRef } from 'react';
import { Strategy, Index, CompanyVision, User, Objective, StyleSettings, CompanyValue, SwotData, StrategyCategory, StrategyStatus, CustomerNeed, CustomerNeedCategory } from '../types';
import { PlusIcon, InfoIcon, EditIcon, ICONS, ArchiveBoxIcon, TrashIcon, CloseIcon, RocketIcon, StarIcon, UserIcon, HeartIcon, BrainIcon, GlobeAltIcon, BanknotesIcon, EyeIcon, CalendarIcon } from './Icons';
import Modal from '../modals/Modal';
import GuideModal from '../modals/GuideModal';
import IkigaiWizard from './IkigaiWizard';
import { SuggestedMission } from '../services/geminiService';
import { STICKER_COLOR_MAP, STRATEGY_CATEGORIES, STRATEGY_STATUSES, STRATEGY_STATUS_COLORS } from '../constants';
import DueDateSelector from './DueDateSelector';
import { toPersianDate } from '../utils/dateUtils';

type InfoCardData = {
    type: 'Strategy' | 'Index';
    item: Strategy | Index;
    linkedObjectives: Objective[];
};

// Custom hook for detecting outside clicks
const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void, enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
};

const VALUE_ICONS = ['LightbulbIcon', 'HandshakeIcon', 'HeartIcon', 'StarIcon', 'TrophyIcon', 'SparklesIcon', 'BrainIcon', 'GlobeAltIcon'];
const VALUE_COLORS: Record<string, { bg: string, text: string, border: string, hex: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', hex: '#60a5fa' },
    red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', hex: '#f87171' },
    green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', hex: '#4ade80' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', hex: '#c084fc' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', hex: '#facc15' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300', hex: '#f9a8d4' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', hex: '#fb923c' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', hex: '#9ca3af' },
};

interface ValueEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (value: Omit<CompanyValue, 'id'> & { id?: string }) => void;
    valueToEdit: CompanyValue | null;
}

const ValueEditorModal: React.FC<ValueEditorModalProps> = ({ isOpen, onClose, onSave, valueToEdit }) => {
    const [text, setText] = useState('');
    const [icon, setIcon] = useState(VALUE_ICONS[0]);
    const [color, setColor] = useState(Object.keys(VALUE_COLORS)[0]);

    useEffect(() => {
        if (isOpen) {
            if (valueToEdit) {
                setText(valueToEdit.text);
                setIcon(valueToEdit.icon);
                setColor(valueToEdit.color);
            } else {
                setText('');
                setIcon(VALUE_ICONS[0]);
                setColor(Object.keys(VALUE_COLORS)[0]);
            }
        }
    }, [valueToEdit, isOpen]);

    const handleSave = () => {
        if (!text.trim()) return;
        onSave({ id: valueToEdit?.id, text, icon, color });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={valueToEdit ? 'ویرایش ارزش' : 'افزودن ارزش جدید'}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">عنوان ارزش</label>
                    <input type="text" value={text} onChange={e => setText(e.target.value)} className="input-style" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">آیکون</label>
                    <div className="mt-2 grid grid-cols-8 gap-2">
                        {VALUE_ICONS.map(iconName => {
                            const IconComponent = ICONS[iconName];
                            return (
                                <button key={iconName} onClick={() => setIcon(iconName)} className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 ${icon === iconName ? 'border-brand-primary' : 'border-gray-200'}`}>
                                    <IconComponent className="w-6 h-6" style={{ color: VALUE_COLORS[color as keyof typeof VALUE_COLORS].hex }} />
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">رنگ</label>
                    <div className="mt-2 grid grid-cols-8 gap-2">
                        {Object.entries(VALUE_COLORS).map(([colorName, colorValue]) => (
                            <button key={colorName} onClick={() => setColor(colorName)} className={`w-8 h-8 rounded-full border-2 ${color === colorName ? 'ring-2 ring-offset-1 ring-brand-primary border-white' : 'border-transparent'} ${colorValue.bg}`} />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md">لغو</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white rounded-md">ذخیره</button>
                </div>
            </div>
        </Modal>
    );
};


const StrategyIndexDetailModal: React.FC<{
    item: Strategy | Index;
    type: 'Strategy' | 'Index';
    users: User[];
    objectives: Objective[];
    onClose: () => void;
}> = ({ item, type, users, objectives, onClose }) => {
    const modalContentRef = useRef<HTMLDivElement>(null);
    useClickOutside(modalContentRef, onClose);

    const Icon = ICONS[item.icon] || InfoIcon;
    const description = type === 'Strategy' ? (item as Strategy).description : (item as Index).category;
    const owners = users.filter(u => item.ownerIds.includes(u.id));
    const linkedObjectives = objectives.filter(o => type === 'Strategy' ? o.strategyId === item.id : o.indexIds?.includes(item.id));

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" dir="rtl">
            <div
                ref={modalContentRef}
                className="bg-gray-50 max-w-2xl w-full max-h-[90vh] rounded-lg flex flex-col shadow-2xl border"
            >
                <header className="flex-shrink-0 p-4 flex justify-end items-center">
                     <button onClick={onClose} className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-full">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto p-8 pt-0">
                    <div className="text-center mb-12">
                        <div className="inline-block bg-white p-4 rounded-xl shadow-sm border mb-4">
                            <Icon className="w-12 h-12 text-brand-primary" />
                        </div>
                        <h2 className="text-4xl font-bold text-gray-800">{item.name}</h2>
                        <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">{description}</p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><UserIcon className="w-5 h-5 ml-2 text-gray-400"/> مالکین</h3>
                            <div className="flex flex-wrap gap-4">
                                {owners.map(owner => (
                                    <div key={owner.id} className="flex items-center">
                                        <img src={owner.avatarUrl} alt={owner.name} className="w-10 h-10 rounded-full"/>
                                        <span className="mr-3 font-medium text-brand-text">{owner.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><RocketIcon className="w-5 h-5 ml-2 text-gray-400"/> اهداف مرتبط</h3>
                             {linkedObjectives.length > 0 ? (
                                <ul className="space-y-3">
                                    {linkedObjectives.map(o => <li key={o.id} className="p-3 bg-gray-50/70 rounded-md border">{o.title}</li>)}
                                </ul>
                            ) : <p className="text-sm text-center text-gray-500 py-4">هیچ هدفی به این مورد متصل نیست.</p>}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

interface StrategyPageProps {
    strategies: Strategy[];
    indices: Index[];
    objectives: Objective[];
    users: User[];
    companyVision: CompanyVision;
    onAddStrategy: (data: Omit<Strategy, 'id' | 'isArchived'>) => void;
    onUpdateStrategy: (data: Strategy) => void;
    onDeleteStrategy: (id: string) => void;
    onArchiveStrategy: (id: string) => void;
    onAddIndex: (data: Omit<Index, 'id' | 'isArchived'>) => void;
    onUpdateIndex: (data: Index) => void;
    onDeleteIndex: (id: string) => void;
    onArchiveIndex: (id: string) => void;
    setCompanyVision: React.Dispatch<React.SetStateAction<CompanyVision>>;
    cardSettings: StyleSettings;
    popupSettings: StyleSettings;
    customerNeeds: CustomerNeed[];
    onAddCustomerNeed: (description: string, category: CustomerNeedCategory) => void;
    onUpdateCustomerNeed: (updatedNeed: CustomerNeed) => void;
    onDeleteCustomerNeed: (needId: string) => void;
}

const MissionEditor: React.FC<{
    vision: CompanyVision;
    onStartWizard: () => void;
    setVision: React.Dispatch<React.SetStateAction<CompanyVision>>;
}> = ({ vision, onStartWizard, setVision }) => {
    const [isValueModalOpen, setIsValueModalOpen] = useState(false);
    const [editingValue, setEditingValue] = useState<CompanyValue | null>(null);

    const handleInputChange = (field: keyof Omit<CompanyVision, 'values' | 'id'>, e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setVision(prev => ({ ...prev, [field]: e.target.value }));
        if (e.target.tagName.toLowerCase() === 'textarea') {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
        }
    };

    const handleOpenAddValueModal = () => {
        setEditingValue(null);
        setIsValueModalOpen(true);
    };

    const handleOpenEditValueModal = (value: CompanyValue) => {
        setEditingValue(value);
        setIsValueModalOpen(true);
    };
    
    const handleDeleteValue = (valueId: string) => {
        const newValues = vision.values?.filter(v => v.id !== valueId) || [];
        setVision(prev => ({...prev, values: newValues}));
    };

    const handleSaveValue = (valueData: Omit<CompanyValue, 'id'> & { id?: string }) => {
        if (valueData.id) { // Editing
            const newValues = vision.values?.map(v => v.id === valueData.id ? valueData as CompanyValue : v) || [];
            setVision(prev => ({ ...prev, values: newValues }));
        } else { // Adding
            const newValue: CompanyValue = { ...valueData, id: `v-${Date.now()}` };
            const newValues = [...(vision.values || []), newValue];
            setVision(prev => ({ ...prev, values: newValues }));
        }
        setIsValueModalOpen(false);
    };
    
    const placeholders = {
        missionTitle: 'مثال: با ارائه ابزارهای هوشمند، به تیم‌ها برای دستیابی به بهترین عملکردشان کمک می‌کنیم.',
        passion: 'ما عاشق حل مشکلات پیچیده و توانمندسازی دیگران هستیم.',
        skill: 'تیم ما در توسعه نرم‌افزار، هوش مصنوعی و طراحی تجربه کاربری تخصص دارد.',
        market: 'سازمان‌ها برای رشد و باقی ماندن در رقابت، به بهینه‌سازی عملکرد نیاز دارند.',
        business: 'از طریق اشتراک‌های ماهانه (SaaS) برای پلتفرم خود درآمدزایی می‌کنیم.',
    };

    return (
        <>
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                    <input
                        type="text"
                        placeholder={placeholders.missionTitle}
                        value={vision.missionTitle}
                        onChange={(e) => handleInputChange('missionTitle', e)}
                        className="text-2xl font-bold text-brand-text w-full border-none focus:ring-0 p-1 -m-1 placeholder-gray-400/70"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4 border-t">
                        {/* Passion */}
                        <div className="flex items-start">
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-red-100 rounded-full ml-4">
                                <HeartIcon className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="w-full">
                                <h4 className="font-bold text-gray-700">اشتیاق (چرا؟)</h4>
                                <textarea
                                    value={vision.passion}
                                    onChange={(e) => handleInputChange('passion', e)}
                                    placeholder={placeholders.passion}
                                    className="w-full mt-1 p-0 border-none focus:ring-0 resize-none text-gray-600 placeholder-gray-400/70 bg-transparent"
                                    rows={3}
                                />
                            </div>
                        </div>
                        {/* Skill */}
                        <div className="flex items-start">
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-100 rounded-full ml-4">
                                <BrainIcon className="w-6 h-6 text-blue-500" />
                            </div>
                            <div className="w-full">
                                <h4 className="font-bold text-gray-700">مهارت (چگونه؟)</h4>
                                <textarea
                                    value={vision.skill}
                                    onChange={(e) => handleInputChange('skill', e)}
                                    placeholder={placeholders.skill}
                                    className="w-full mt-1 p-0 border-none focus:ring-0 resize-none text-gray-600 placeholder-gray-400/70 bg-transparent"
                                    rows={3}
                                />
                            </div>
                        </div>
                        {/* Market */}
                        <div className="flex items-start">
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-green-100 rounded-full ml-4">
                                <GlobeAltIcon className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="w-full">
                                <h4 className="font-bold text-gray-700">نیاز جهان (برای چه کسی؟)</h4>
                                <textarea
                                    value={vision.market}
                                    onChange={(e) => handleInputChange('market', e)}
                                    placeholder={placeholders.market}
                                    className="w-full mt-1 p-0 border-none focus:ring-0 resize-none text-gray-600 placeholder-gray-400/70 bg-transparent"
                                    rows={3}
                                />
                            </div>
                        </div>
                        {/* Business */}
                        <div className="flex items-start">
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-yellow-100 rounded-full ml-4">
                                <BanknotesIcon className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div className="w-full">
                                <h4 className="font-bold text-gray-700">کسب درآمد (چه چیزی؟)</h4>
                                <textarea
                                    value={vision.business}
                                    onChange={(e) => handleInputChange('business', e)}
                                    placeholder={placeholders.business}
                                    className="w-full mt-1 p-0 border-none focus:ring-0 resize-none text-gray-600 placeholder-gray-400/70 bg-transparent"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-12">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                        <EyeIcon className="w-6 h-6 ml-3 text-gray-500"/>
                        چشم‌انداز ۵ ساله
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">چشم‌انداز الهام‌بخش خود را برای ۵ سال آینده اینجا بنویسید.</p>
                    <textarea
                        value={vision.fiveYearVision || ''}
                        onChange={(e) => handleInputChange('fiveYearVision', e)}
                        placeholder="چشم انداز سازمان شما در 5 سال آینده..."
                        rows={4}
                        className="input-style w-full bg-white p-4"
                    />
                </div>

                <div className="mt-12">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <StarIcon className="w-6 h-6 ml-3 text-gray-500"/>
                            ارزش‌های سازمانی
                        </h3>
                         <button onClick={handleOpenAddValueModal} className="flex items-center text-sm px-3 py-1.5 bg-gray-200/80 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
                            <PlusIcon className="w-4 h-4 ml-2" />
                            افزودن ارزش
                        </button>
                    </div>
                    <div className="p-4 border-2 border-dashed rounded-lg min-h-[80px] flex flex-wrap gap-4 items-center">
                        {vision.values && vision.values.length > 0 ? (
                            vision.values.map(value => {
                                const Icon = ICONS[value.icon];
                                const colors = VALUE_COLORS[value.color as keyof typeof VALUE_COLORS] || VALUE_COLORS.gray;
                                return (
                                    <div key={value.id} className={`group relative flex items-center pl-2 pr-4 py-2 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
                                        <Icon className="w-5 h-5 ml-2" />
                                        <span>{value.text}</span>
                                        <div className="absolute -top-2 -left-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenEditValueModal(value)} className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"><EditIcon className="w-3 h-3 text-gray-600"/></button>
                                            <button onClick={() => handleDeleteValue(value.id)} className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 mr-1"><TrashIcon className="w-3 h-3 text-red-500"/></button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-400 text-sm">ارزشی اضافه نشده است. برای شروع روی دکمه "افزودن ارزش" کلیک کنید.</p>
                        )}
                    </div>
                </div>

                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <button onClick={onStartWizard} className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-105">
                        شروع کن
                    </button>
                    <p className="mt-4 text-brand-subtext">ماموریت خود یا سازمان خود را هوشمندانه پیدا کنید!</p>
                </div>
            </div>
            <ValueEditorModal 
                isOpen={isValueModalOpen}
                onClose={() => setIsValueModalOpen(false)}
                onSave={handleSaveValue}
                valueToEdit={editingValue}
            />
        </>
    );
};

const ActionButtons: React.FC<{ onEdit: () => void; onArchive: () => void; onDelete: () => void; }> = ({ onEdit, onArchive, onDelete }) => (
    <div className="absolute top-2 left-2 flex items-center space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-full p-1 z-10">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-blue-600" title="ویرایش"><EditIcon className="w-4 h-4"/></button>
        <button onClick={(e) => { e.stopPropagation(); onArchive(); }} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-yellow-600" title="آرشیو"><ArchiveBoxIcon className="w-4 h-4"/></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600" title="حذف"><TrashIcon className="w-4 h-4"/></button>
    </div>
);

const SwotAnalysis: React.FC<{
    swotData: SwotData;
    onUpdate: (field: keyof SwotData, value: string) => void;
}> = ({ swotData, onUpdate }) => {
    
    const Quadrant: React.FC<{ title: string; color: string; field: keyof SwotData; value: string }> = ({ title, color, field, value }) => {
        const [text, setText] = useState(value);
        
        const handleBlur = () => {
            if (text !== value) {
                onUpdate(field, text);
            }
        };

        useEffect(() => {
            setText(value);
        }, [value]);

        return (
            <div className={`p-3 rounded-lg ${color}`}>
                <h4 className="font-bold text-sm mb-2">{title}</h4>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onBlur={handleBlur}
                    rows={5}
                    className="w-full text-sm bg-transparent border-0 focus:ring-1 focus:ring-white/50 rounded-md resize-none p-1 placeholder-gray-500/50"
                    placeholder="..."
                />
            </div>
        );
    };
    
    return (
        <div className="grid grid-cols-2 gap-2">
            <Quadrant title="نقاط قوت" color="bg-green-100/70 text-green-900" field="strengths" value={swotData.strengths} />
            <Quadrant title="نقاط ضعف" color="bg-red-100/70 text-red-900" field="weaknesses" value={swotData.weaknesses} />
            <Quadrant title="فرصت‌ها" color="bg-blue-100/70 text-blue-900" field="opportunities" value={swotData.opportunities} />
            <Quadrant title="تهدیدها" color="bg-orange-100/70 text-orange-900" field="threats" value={swotData.threats} />
        </div>
    );
};

const StrategyCard: React.FC<{
    strategy: Strategy;
    users: User[];
    cardSettings: StyleSettings;
    onSelect: () => void;
    onEdit: () => void;
    onArchive: () => void;
    onDelete: () => void;
    onUpdate: (updatedStrategy: Strategy) => void;
}> = ({ strategy, users, cardSettings, onSelect, onEdit, onArchive, onDelete, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'swot'>('info');

    const FONT_SIZE_CLASSES: Record<StyleSettings['fontSize'], string> = { sm: 'text-sm', base: 'text-base', lg: 'text-lg' };
    const IconComponent = ICONS[strategy.icon] || InfoIcon;
    const owners = users.filter(u => strategy.ownerIds.includes(u.id));

    const handleSwotUpdate = (field: keyof SwotData, value: string) => {
        const updatedSwot = { ...(strategy.swot || { strengths: '', weaknesses: '', opportunities: '', threats: '' }), [field]: value };
        onUpdate({ ...strategy, swot: updatedSwot });
    };

    const statusInfo = STRATEGY_STATUS_COLORS[strategy.status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
        <div 
            className={`${cardSettings.backgroundColor} p-4 rounded-xl shadow-sm border flex flex-col group relative transition-all hover:shadow-lg hover:border-blue-200 ${FONT_SIZE_CLASSES[cardSettings.fontSize]}`}
            style={{ fontFamily: cardSettings.fontFamily }}
        >
            <ActionButtons onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} />
            
            <div className="flex items-center" onClick={onSelect}>
                <div className="flex-shrink-0 bg-gray-100 p-3 rounded-lg cursor-pointer">
                    <IconComponent className="w-8 h-8" style={{ color: cardSettings.primaryColor }} />
                </div>
                <div className="mr-4 min-w-0 cursor-pointer">
                    <h3 className="font-bold text-brand-text truncate">{strategy.name}</h3>
                    <p className="text-sm text-brand-subtext mt-1">{strategy.description}</p>
                </div>
            </div>

            <div className="flex border-b text-sm my-3">
                <button onClick={() => setActiveTab('info')} className={`px-3 py-1 ${activeTab === 'info' ? 'font-semibold border-b-2 border-brand-primary' : 'text-gray-500'}`}>اطلاعات</button>
                <button onClick={() => setActiveTab('swot')} className={`px-3 py-1 ${activeTab === 'swot' ? 'font-semibold border-b-2 border-brand-primary' : 'text-gray-500'}`}>SWOT</button>
            </div>
            
            <div className="flex-grow">
                {activeTab === 'info' && (
                    <div className="space-y-3 text-sm animate-fade-in">
                        <div className="flex justify-between items-center">
                            <span className="text-brand-subtext">وضعیت:</span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusInfo.bg} ${statusInfo.text}`}>
                                {strategy.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-brand-subtext">دسته:</span>
                            <span className="font-medium text-brand-text">{strategy.category}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-brand-subtext">بازه زمانی:</span>
                            <span className="font-medium text-brand-text text-xs">
                                {toPersianDate(strategy.startDate) || 'N/A'} - {toPersianDate(strategy.endDate) || 'N/A'}
                            </span>
                        </div>
                         <div className="pt-3 border-t flex items-center justify-between">
                            <span className="text-brand-subtext">مالکین:</span>
                            <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                                {owners.map(owner => (
                                    <img key={owner.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={owner.avatarUrl} alt={owner.name} title={owner.name} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'swot' && (
                    <SwotAnalysis
                        swotData={strategy.swot || { strengths: '', weaknesses: '', opportunities: '', threats: '' }}
                        onUpdate={handleSwotUpdate}
                    />
                )}
            </div>
        </div>
    );
};

const IndexCard: React.FC<{
    indexItem: Index;
    users: User[];
    cardSettings: StyleSettings;
    onSelect: () => void;
    onEdit: () => void;
    onArchive: () => void;
    onDelete: () => void;
}> = ({ indexItem, users, cardSettings, onSelect, onEdit, onArchive, onDelete }) => {
    const FONT_SIZE_CLASSES: Record<StyleSettings['fontSize'], string> = { sm: 'text-sm', base: 'text-base', lg: 'text-lg' };
    const IconComponent = ICONS[indexItem.icon] || InfoIcon;
    const owners = users.filter(u => indexItem.ownerIds.includes(u.id));

    return (
        <div 
            onClick={onSelect}
            className={`${cardSettings.backgroundColor} p-6 rounded-xl shadow-sm border flex flex-col justify-between group relative transition-all hover:shadow-lg hover:border-blue-200 cursor-pointer ${FONT_SIZE_CLASSES[cardSettings.fontSize]}`}
            style={{ fontFamily: cardSettings.fontFamily }}
        >
            <ActionButtons onEdit={onEdit} onArchive={onArchive} onDelete={onDelete} />

            <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-100 p-3 rounded-lg">
                    <IconComponent className="w-10 h-10" style={{ color: cardSettings.primaryColor }} />
                </div>
                <div className="mr-4 min-w-0">
                    <h3 className="font-bold text-brand-text truncate">{indexItem.name}</h3>
                    <p className="text-sm text-brand-subtext mt-1">{indexItem.category}</p>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                    {owners.map(owner => (
                        <img key={owner.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={owner.avatarUrl} alt={owner.name} title={owner.name} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const DefineValueTab: React.FC<{
    customerNeeds: CustomerNeed[];
    onAdd: (description: string, category: CustomerNeedCategory) => void;
    onUpdate: (updatedNeed: CustomerNeed) => void;
    onDelete: (needId: string) => void;
}> = ({ customerNeeds, onAdd, onUpdate, onDelete }) => {

    const NeedItem: React.FC<{ need: CustomerNeed }> = ({ need }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [text, setText] = useState(need.description);
        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (isEditing) {
                inputRef.current?.focus();
            }
        }, [isEditing]);

        const handleSave = () => {
            if (text.trim() && text.trim() !== need.description) {
                onUpdate({ ...need, description: text.trim() });
            }
            setIsEditing(false);
        };

        return (
            <div className="bg-white p-3 rounded-md border shadow-sm group flex items-center">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                        className="flex-grow text-sm border-none bg-transparent focus:ring-1 focus:ring-blue-300 rounded-sm"
                    />
                ) : (
                    <p className="flex-grow text-sm text-gray-800" onDoubleClick={() => setIsEditing(true)}>
                        {need.description}
                    </p>
                )}
                <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-blue-500"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(need.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>
        );
    };

    const ValueColumn: React.FC<{ title: string, category: CustomerNeedCategory, color: string }> = ({ title, category, color }) => {
        const [isAdding, setIsAdding] = useState(false);
        const [newNeedText, setNewNeedText] = useState("");
        const addInputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (isAdding) {
                addInputRef.current?.focus();
            }
        }, [isAdding]);

        const handleAdd = () => {
            if (newNeedText.trim()) {
                onAdd(newNeedText.trim(), category);
            }
            setNewNeedText("");
            setIsAdding(false);
        };

        const needs = customerNeeds.filter(n => n.category === category);

        return (
            <div className="bg-gray-100/70 p-3 rounded-lg flex-1">
                <h3 className={`font-bold mb-4 text-center ${color}`}>{title}</h3>
                <div className="space-y-2">
                    {needs.map(need => <NeedItem key={need.id} need={need} />)}
                    {isAdding && (
                         <input
                            ref={addInputRef}
                            type="text"
                            value={newNeedText}
                            onChange={e => setNewNeedText(e.target.value)}
                            onBlur={handleAdd}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            className="w-full text-sm p-3 border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                            placeholder="توضیح نیاز..."
                        />
                    )}
                </div>
                <button onClick={() => setIsAdding(true)} className="w-full mt-3 p-2 text-sm font-semibold rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-200/80">
                    <PlusIcon className="w-4 h-4 ml-2" /> افزودن نیاز
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-4 md:space-y-0 md:flex md:space-x-4 md:space-x-reverse animate-fade-in">
            <ValueColumn title="نیازهای ضروری" category="ESSENTIAL" color="text-red-600" />
            <ValueColumn title="نیازهای عملکردی" category="PERFORMANCE" color="text-blue-600" />
            <ValueColumn title="نیازهای انگیزشی" category="MOTIVATIONAL" color="text-green-600" />
        </div>
    );
};


const StrategyPage: React.FC<StrategyPageProps> = (props) => {
    const { strategies, indices, objectives, users, companyVision, onAddStrategy, onUpdateStrategy, onDeleteStrategy, onArchiveStrategy, onAddIndex, onUpdateIndex, onDeleteIndex, onArchiveIndex, setCompanyVision, cardSettings, popupSettings, customerNeeds, onAddCustomerNeed, onUpdateCustomerNeed, onDeleteCustomerNeed } = props;
    const [activeTab, setActiveTab] = useState<'vision' | 'strategies' | 'indices' | 'defineValue'>('vision');
    const [editingItem, setEditingItem] = useState<{ type: 'Strategy' | 'Index', item: Strategy | Index | null } | null>(null);
    const [detailItem, setDetailItem] = useState<{ type: 'Strategy' | 'Index', item: Strategy | Index } | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isIkigaiWizardOpen, setIsIkigaiWizardOpen] = useState(false);

    useEffect(() => {
        const hasSeenGuide = localStorage.getItem('hasSeenStrategyGuide_v1');
        if (!hasSeenGuide) {
            setIsGuideOpen(true);
        }
    }, []);

    const handleCloseGuide = () => {
        setIsGuideOpen(false);
        localStorage.setItem('hasSeenStrategyGuide_v1', 'true');
    };

    const handleFormSubmit = (data: { id?: string; name: string; descriptionOrCategory: string; icon: string; ownerIds: string[], category?: StrategyCategory, status?: StrategyStatus, startDate?: string, endDate?: string }) => {
        const { id, name, descriptionOrCategory, icon, ownerIds, category, status, startDate, endDate } = data;
        if (editingItem?.type === 'Strategy') {
            const strategyData = { name, description: descriptionOrCategory, icon, ownerIds, category: category!, status: status!, startDate, endDate };
            if (id) {
                onUpdateStrategy({ ...(editingItem.item as Strategy), ...strategyData, id });
            } else {
                onAddStrategy(strategyData);
            }
        } else if (editingItem?.type === 'Index') {
            const indexData = { name, category: descriptionOrCategory, icon, ownerIds };
            if (id) {
                onUpdateIndex({ ...(editingItem.item as Index), ...indexData, id });
            } else {
                onAddIndex(indexData);
            }
        }
        setEditingItem(null);
    };

    const handleAddButtonClick = () => {
        if (activeTab === 'strategies') {
            setEditingItem({ type: 'Strategy', item: null });
        } else if (activeTab === 'indices') {
            setEditingItem({ type: 'Index', item: null });
        }
    };
    
     const handleMissionSelect = (mission: SuggestedMission) => {
        const newVision: CompanyVision = {
            ...companyVision,
            missionTitle: mission.missionTitle,
            passion: mission.reasoning.passion,
            skill: mission.reasoning.skill,
            market: mission.reasoning.market,
            business: mission.reasoning.business,
        };
        setCompanyVision(newVision);
        // Add a small delay for the user to see the selection feedback in the wizard
        setTimeout(() => {
            setIsIkigaiWizardOpen(false);
        }, 400);
    };

    return (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6 space-x-reverse overflow-x-auto">
                    <button onClick={() => setActiveTab('vision')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'vision' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        ماموریت
                    </button>
                    <button onClick={() => setActiveTab('defineValue')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'defineValue' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        تعریف ارزش
                    </button>
                    <button onClick={() => setActiveTab('strategies')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'strategies' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        استراتژی‌ها
                    </button>
                     <button onClick={() => setActiveTab('indices')} className={`flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'indices' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        شاخص‌ها
                    </button>
                </nav>
            </div>
            
            <div className="mb-6 flex justify-end">
                { (activeTab === 'strategies' || activeTab === 'indices') && (
                    <button onClick={handleAddButtonClick} className="flex items-center text-sm px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold shadow-sm hover:bg-blue-600">
                        <PlusIcon className="w-5 h-5 ml-2"/>
                        افزودن
                    </button>
                 )}
            </div>

            {activeTab === 'strategies' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {strategies.map(s => (
                        <StrategyCard 
                            key={s.id}
                            strategy={s}
                            users={users}
                            cardSettings={cardSettings}
                            onSelect={() => setDetailItem({ type: 'Strategy', item: s })}
                            onEdit={() => setEditingItem({ type: 'Strategy', item: s })}
                            onArchive={() => onArchiveStrategy(s.id)}
                            onDelete={() => onDeleteStrategy(s.id)}
                            onUpdate={onUpdateStrategy}
                        />
                    ))}
                </div>
            )}
            {activeTab === 'indices' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {indices.map(i => (
                        <IndexCard 
                            key={i.id}
                            indexItem={i}
                            users={users}
                            cardSettings={cardSettings}
                            onSelect={() => setDetailItem({ type: 'Index', item: i })}
                            onEdit={() => setEditingItem({ type: 'Index', item: i })}
                            onArchive={() => onArchiveIndex(i.id)}
                            onDelete={() => onDeleteIndex(i.id)}
                        />
                    ))}
                </div>
            )}
            
            {activeTab === 'vision' && (
                 <MissionEditor
                    vision={companyVision}
                    onStartWizard={() => setIsIkigaiWizardOpen(true)}
                    setVision={setCompanyVision}
                />
            )}
            
            {activeTab === 'defineValue' && (
                <DefineValueTab
                    customerNeeds={customerNeeds}
                    onAdd={onAddCustomerNeed}
                    onUpdate={onUpdateCustomerNeed}
                    onDelete={onDeleteCustomerNeed}
                />
            )}

            {/* Modals */}
             {detailItem && (
                <StrategyIndexDetailModal
                    item={detailItem.item}
                    type={detailItem.type}
                    users={users}
                    objectives={objectives}
                    onClose={() => setDetailItem(null)}
                />
            )}
            
            <Modal 
                isOpen={!!editingItem} 
                onClose={() => setEditingItem(null)} 
                title={editingItem?.item ? `ویرایش ${editingItem.type === 'Strategy' ? 'استراتژی' : 'شاخص'}` : `افزودن ${editingItem?.type === 'Strategy' ? 'استراتژی' : 'شاخص'}`}
                styleSettings={popupSettings}
            >
                {editingItem && (
                    <StrategyIndexForm 
                        users={users} 
                        onCancel={() => setEditingItem(null)} 
                        onSubmit={handleFormSubmit} 
                        type={editingItem.type}
                        itemToEdit={editingItem.item}
                        styleSettings={popupSettings}
                    />
                )}
            </Modal>
            
            <GuideModal
                isOpen={isGuideOpen}
                onClose={handleCloseGuide}
                title="به بخش مسیر خوش آمدید!"
                Icon={RocketIcon}
            >
                <p>
                    برای شروع، بهتر است ابتدا به تب <strong>ماموریت</strong> بروید و تصویر کلی آینده سازمان خود را مشخص کنید.
                </p>
                <p>
                    سپس، در بخش <strong>استراتژی‌ها</strong>، مسیرها و رویکردهای کلانی که شما را به آن چشم‌انداز می‌رساند، تعریف کنید.
                </p>
                <p>
                    در نهایت، برای اینکه استراتژی‌هایتان قابل اندازه‌گیری باشند، آن‌ها را به <strong>شاخص‌های</strong> کلیدی عملکردتان متصل کنید.
                </p>
            </GuideModal>
            
            <IkigaiWizard
                isOpen={isIkigaiWizardOpen}
                onClose={() => setIsIkigaiWizardOpen(false)}
                onMissionSelect={handleMissionSelect}
            />
        </main>
    );
};


// Sub-component for Add/Edit Strategy/Index form
const iconOptions = Object.keys(ICONS).filter(key => key !== 'Default');

const StrategyIndexForm: React.FC<{
    users: User[];
    onCancel: () => void;
    onSubmit: (data: { id?: string; name: string; descriptionOrCategory: string; icon: string; ownerIds: string[]; category?: StrategyCategory, status?: StrategyStatus, startDate?: string, endDate?: string }) => void;
    type: 'Strategy' | 'Index';
    itemToEdit?: Strategy | Index | null;
    styleSettings: StyleSettings;
}> = ({ users, onCancel, onSubmit, type, itemToEdit, styleSettings}) => {
    const [name, setName] = useState('');
    const [descriptionOrCategory, setDescriptionOrCategory] = useState('');
    const [icon, setIcon] = useState(iconOptions[0]);
    const [ownerIds, setOwnerIds] = useState<string[]>([]);
    
    // Strategy-specific fields
    const [category, setCategory] = useState<StrategyCategory>(STRATEGY_CATEGORIES[0]);
    const [status, setStatus] = useState<StrategyStatus>(STRATEGY_STATUSES[0]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    useEffect(() => {
        if (itemToEdit) {
            setName(itemToEdit.name);
            setIcon(itemToEdit.icon);
            setOwnerIds(itemToEdit.ownerIds);
            if (type === 'Strategy') {
                const s = itemToEdit as Strategy;
                setDescriptionOrCategory(s.description);
                setCategory(s.category);
                setStatus(s.status);
                setStartDate(s.startDate || '');
                setEndDate(s.endDate || '');
            } else {
                setDescriptionOrCategory((itemToEdit as Index).category);
            }
        } else {
            setName('');
            setDescriptionOrCategory('');
            setIcon(iconOptions[0]);
            setOwnerIds([]);
            setCategory(STRATEGY_CATEGORIES[0]);
            setStatus(STRATEGY_STATUSES[0]);
            setStartDate('');
            setEndDate('');
        }
    }, [itemToEdit, type]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ id: itemToEdit?.id, name, descriptionOrCategory, icon, ownerIds, category, status, startDate, endDate });
    };
    
    const handleOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => (option as HTMLOptionElement).value);
        setOwnerIds(selectedOptions);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
            <div>
                <label className="block text-sm font-medium text-brand-text">نام</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full input-style" />
            </div>
             <div>
                <label className="block text-sm font-medium text-brand-text">{type === 'Strategy' ? 'توضیحات' : 'دسته بندی'}</label>
                <input type="text" value={descriptionOrCategory} onChange={e => setDescriptionOrCategory(e.target.value)} required className="mt-1 block w-full input-style" />
            </div>

            {type === 'Strategy' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-brand-text">دسته بندی</label>
                        <select value={category} onChange={e => setCategory(e.target.value as StrategyCategory)} className="mt-1 block w-full input-style">
                            {STRATEGY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-text">وضعیت</label>
                        <select value={status} onChange={e => setStatus(e.target.value as StrategyStatus)} className="mt-1 block w-full input-style">
                            {STRATEGY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex space-x-4 space-x-reverse">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-brand-text">تاریخ شروع</label>
                            <div className="p-2 border border-gray-300 rounded-md mt-1">
                                <DueDateSelector value={startDate} onChange={setStartDate} />
                            </div>
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-brand-text">تاریخ پایان</label>
                            <div className="p-2 border border-gray-300 rounded-md mt-1">
                                <DueDateSelector value={endDate} onChange={setEndDate} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div>
                <label className="block text-sm font-medium text-brand-text">آیکون</label>
                <select value={icon} onChange={e => setIcon(e.target.value)} className="mt-1 block w-full input-style">
                   {iconOptions.map(iconName => <option key={iconName} value={iconName}>{iconName.replace('Icon', '')}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-brand-text">مالک (ها)</label>
                <select multiple value={ownerIds} onChange={handleOwnerChange} className="mt-1 block w-full input-style h-24">
                   {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
            </div>
            <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">{itemToEdit ? 'لغو' : 'انصراف'}</button>
                <button type="submit" className="px-4 py-2 text-white rounded-md" style={{ backgroundColor: styleSettings.primaryColor }}>{itemToEdit ? 'ذخیره' : 'افزودن'}</button>
            </div>
        </form>
    );
};

export default StrategyPage;