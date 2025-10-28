import React, { useState, useMemo } from 'react';
import { User, Team, SidebarConfig, RecurrenceSettings, HierarchicalViewStyle, ObjectiveSettings, StyleSettings, AppSettings, ComponentStyles, NavItem, SidebarTheme, FormDisplayStyle, Process, Form, FormVariable, Role } from '../types';
import { UserIcon, UserGroupIcon, ViewColumnsIcon, ClockIcon, DocumentTextIcon, FolderIcon, GoalIcon, CheckCircleIcon, Squares2x2Icon, SparklesIcon, CubeIcon, EditIcon, TrashIcon, ICONS, PlusIcon, TrophyIcon } from './Icons';
import { AIPrompts } from '../services/geminiService';
import Modal from '../modals/Modal';
import NewUserModal from '../modals/NewUserModal';
import { KANBAN_COLOR_MAP, KANBAN_COLOR_OPTIONS } from '../constants';
import UpgradePage from './UpgradePage';

// A generic settings card component
const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-brand-text">{title}</h3>
        <p className="text-sm text-brand-subtext mt-1 mb-4">{description}</p>
        <div className="space-y-4">{children}</div>
    </div>
);

const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    labelId: string;
}> = ({ checked, onChange, labelId }) => (
    <label htmlFor={labelId} className="relative inline-flex items-center cursor-pointer">
        <input 
            type="checkbox" 
            checked={checked} 
            onChange={e => onChange(e.target.checked)} 
            id={labelId} 
            className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
    </label>
);

interface AdminPageProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    teams: Team[];
    setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
    processes: Process[];
    setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
    forms: Form[];
    sidebarConfig: SidebarConfig;
    setSidebarConfig: React.Dispatch<React.SetStateAction<SidebarConfig>>;
    recurrenceSettings: RecurrenceSettings;
    setRecurrenceSettings: React.Dispatch<React.SetStateAction<RecurrenceSettings>>;
    onEditProfile: () => void;
    objectiveSettings: ObjectiveSettings;
    setObjectiveSettings: React.Dispatch<React.SetStateAction<ObjectiveSettings>>;
    appSettings: AppSettings;
    setAppSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    aiPrompts: AIPrompts;
    onUpdateAIPrompt: (promptKey: keyof AIPrompts, value: string) => void;
    componentStyles: ComponentStyles;
    setComponentStyles: React.Dispatch<React.SetStateAction<ComponentStyles>>;
    onCreateUser: (userData: Omit<User, 'id' | 'avatarUrl'>) => void;
}

const BACKGROUND_COLOR_OPTIONS = [
    { label: 'سفید', value: 'bg-white' },
    { label: 'خاکستری روشن', value: 'bg-gray-50' },
    { label: 'کرم', value: 'bg-amber-50' },
    { label: 'آبی روشن', value: 'bg-blue-50' },
    { label: 'سبز روشن', value: 'bg-green-50' },
];

const STYLE_TARGETS: { key: keyof ComponentStyles, label: string }[] = [
    { key: 'popups', label: 'فرم‌ها و پاپ‌آپ‌ها' },
    { key: 'strategyCards', label: 'کارت‌های استراتژی و شاخص' }
];

const PRESETS: { [key: string]: { name: string, settings: StyleSettings } } = {
  modern_2: {
    name: 'مدرن ۲',
    settings: {
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: 'base',
        primaryColor: '#F59E0B', // Amber
        backgroundColor: 'bg-amber-50',
    }
  },
  modern: {
    name: 'مدرن',
    settings: {
        fontFamily: 'Lalezar, cursive',
        fontSize: 'base',
        primaryColor: '#8B5CF6', // Purple
        backgroundColor: 'bg-purple-50',
    }
  },
  visual: {
    name: 'بصری',
    settings: {
        fontFamily: 'Tanha, cursive',
        fontSize: 'lg',
        primaryColor: '#10B981', // Green
        backgroundColor: 'bg-green-50',
    }
  },
  default: {
    name: 'پیش‌فرض',
    settings: {
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: 'base',
        primaryColor: '#2563EB', // Blue
        backgroundColor: 'bg-white',
    }
  },
};

const SidebarThemePreview: React.FC<{
    name: string;
    theme: SidebarTheme;
    isActive: boolean;
    onClick: () => void;
}> = ({ name, theme, isActive, onClick }) => {
    const styles = {
        default: { bg: 'bg-gray-50', item: 'bg-gray-200', text: 'text-gray-800' },
        modern: { bg: 'bg-slate-800', item: 'bg-slate-700', text: 'text-white' },
        visual: { bg: 'bg-white', item: 'bg-blue-100', text: 'text-blue-800' },
        compact: { bg: 'bg-gray-50', item: 'bg-gray-200', text: 'text-gray-800' },
    };
    const s = styles[theme];
    const isCompact = theme === 'compact';

    return (
        <button onClick={onClick} className={`w-full text-right rounded-lg border-2 p-2 transition-colors ${isActive ? 'border-brand-primary' : 'border-gray-300 hover:border-gray-400'}`}>
            <div className={`h-32 flex overflow-hidden rounded ${s.bg}`}>
                <div className={`flex flex-col flex-shrink-0 ${isCompact ? 'w-10' : 'w-full'} p-1 space-y-1`}>
                    <div className="w-6 h-6 rounded bg-gray-500/20 mx-auto"></div>
                    <div className="h-2 rounded-full w-full bg-gray-500/20"></div>
                    <div className={`h-5 rounded-sm ${s.item}`}></div>
                    <div className="h-px w-full bg-gray-500/20"></div>
                    <div className="h-5 rounded-sm bg-gray-500/20"></div>
                    <div className="h-5 rounded-sm bg-gray-500/20"></div>
                </div>
            </div>
            <p className="mt-2 font-semibold text-brand-text text-sm text-center">{name}</p>
        </button>
    );
};

interface FormStylePreviewProps {
    name: string;
    styleKey: FormDisplayStyle;
    isActive: boolean;
    onClick: () => void;
}

const FormStylePreview: React.FC<FormStylePreviewProps> = ({ name, styleKey, isActive, onClick }) => {
    let previewContent;
    switch(styleKey) {
        case 'MINIMAL_CARD':
            previewContent = (
                <div className="space-y-1 p-1">
                    <div className="h-4 bg-gray-200 rounded-sm w-3/4"></div>
                    <div className="p-2 border rounded-md bg-white shadow-sm">
                        <div className="h-2 bg-gray-300 rounded-sm w-1/2 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded-sm"></div>
                    </div>
                    <div className="p-2 border rounded-md bg-white shadow-sm">
                         <div className="h-2 bg-gray-300 rounded-sm w-1/2 mb-1"></div>
                         <div className="h-3 bg-gray-200 rounded-sm"></div>
                    </div>
                </div>
            );
            break;
        case 'SPACIOUS_CARD':
            previewContent = (
                <div className="space-y-2 p-2">
                    <div className="h-4 bg-gray-200 rounded-sm w-3/4"></div>
                    <div className="p-3 border rounded-lg bg-white shadow-sm">
                        <div className="h-2 bg-gray-300 rounded-sm w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded-sm"></div>
                    </div>
                    <div className="p-3 border rounded-lg bg-white shadow-sm">
                        <div className="h-2 bg-gray-300 rounded-sm w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded-sm"></div>
                    </div>
                </div>
            );
            break;
        case 'VISUAL':
            previewContent = (
                <div className="space-y-2 p-1">
                    <div className="h-4 bg-gray-200 rounded-sm w-3/4"></div>
                    <div className="py-2 border-b">
                        <div className="h-3 bg-gray-400 rounded-sm w-1/3 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded"></div>
                    </div>
                     <div className="py-2 border-b">
                        <div className="h-3 bg-gray-400 rounded-sm w-1/3 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded"></div>
                    </div>
                </div>
            );
            break;
        case 'SPACIOUS':
             previewContent = (
                <div className="space-y-4 p-2">
                    <div className="h-4 bg-gray-200 rounded-sm w-3/4"></div>
                    <div>
                        <div className="h-2 bg-gray-300 rounded-sm w-1/2 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded"></div>
                    </div>
                    <div>
                         <div className="h-2 bg-gray-300 rounded-sm w-1/2 mb-2"></div>
                         <div className="h-5 bg-gray-200 rounded"></div>
                    </div>
                </div>
            );
            break;
        case 'DEFAULT':
        default:
            previewContent = (
                <div className="space-y-2 p-1">
                    <div className="h-4 bg-gray-200 rounded-sm w-3/4"></div>
                    <div className="h-2 bg-gray-300 rounded-sm w-1/3 mb-1"></div>
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-300 rounded-sm w-1/3 mb-1 mt-2"></div>
                    <div className="h-5 bg-gray-200 rounded"></div>
                </div>
            );
            break;
    }

    return (
        <button onClick={onClick} className={`w-full text-right rounded-lg border-2 p-2 transition-colors ${isActive ? 'border-brand-primary' : 'border-gray-300 hover:border-gray-400'}`}>
            <div className="h-24 bg-gray-50 rounded overflow-hidden">
                {previewContent}
            </div>
            <p className="mt-2 font-semibold text-brand-text text-sm text-center">{name}</p>
        </button>
    );
};


const AdminPage: React.FC<AdminPageProps> = (props) => {
    const {
        users, setUsers, teams, setTeams, sidebarConfig, setSidebarConfig,
        recurrenceSettings, setRecurrenceSettings, onEditProfile,
        objectiveSettings, setObjectiveSettings,
        appSettings, setAppSettings,
        aiPrompts, onUpdateAIPrompt,
        componentStyles, setComponentStyles,
        processes, setProcesses, forms,
        onCreateUser
    } = props;

    const [activeTab, setActiveTab] = useState('general');
    const [selectedStyleTarget, setSelectedStyleTarget] = useState<keyof ComponentStyles>('popups');
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
    
    const handleStyleChange = (style: keyof StyleSettings, value: string) => {
        setComponentStyles(prev => ({
            ...prev,
            [selectedStyleTarget]: {
                ...prev[selectedStyleTarget],
                [style]: value,
            }
        }));
    };

    const handlePresetApply = (presetSettings: StyleSettings) => {
        setComponentStyles(prev => ({
            ...prev,
            [selectedStyleTarget]: presetSettings,
        }));
    };

    const TABS = [
        { id: 'general', label: 'عمومی', icon: ViewColumnsIcon },
        { id: 'appearance', label: 'شخصی‌سازی ظاهر', icon: Squares2x2Icon },
        { id: 'modules', label: 'ماژول ها', icon: CubeIcon },
        { id: 'processes', label: 'فرایندها', icon: CubeIcon },
        { id: 'time', label: 'تنظیمات زمانی', icon: ClockIcon },
        { id: 'users', label: 'کاربران و تیم‌ها', icon: UserGroupIcon },
        { id: 'objectives', label: 'تنظیمات هدف', icon: GoalIcon },
        { id: 'ai', label: 'تنظیمات پرامپت', icon: SparklesIcon },
        { id: 'upgrade', label: 'ارتقا پلن', icon: TrophyIcon },
    ];

    const handleToggleModule = (id: string) => {
        setSidebarConfig(prev => ({
            ...prev,
            navItems: prev.navItems.map(item =>
                item.id === id && item.type === 'item' ? { ...item, visible: !item.visible } : item
            )
        }));
    };
    
    const handleCreateUserAndCloseModal = (userData: Omit<User, 'id' | 'avatarUrl'>) => {
        onCreateUser(userData);
        setIsNewUserModalOpen(false);
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-brand-text mb-6">تنظیمات</h1>

            <div className="flex border-b mb-6 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 flex items-center space-x-2 space-x-reverse px-4 py-2 text-sm font-medium border-b-2 ${activeTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <tab.icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-8">
                {activeTab === 'general' && (
                    <SettingsCard title="تنظیمات عمومی" description="تنظیمات کلی ظاهر و رفتار برنامه">
                        <div>
                            <label className="block text-sm font-medium text-brand-text">استایل دکمه انجام</label>
                            <select
                                value={sidebarConfig.anjamButtonStyle}
                                onChange={e => setSidebarConfig(p => ({ ...p, anjamButtonStyle: e.target.value as any }))}
                                className="mt-1 block w-full max-w-xs input-style"
                            >
                                <option value="default">پیش‌فرض</option>
                                <option value="prominent">برجسته</option>
                            </select>
                        </div>
                    </SettingsCard>
                )}

                {activeTab === 'appearance' && (
                    <SettingsCard title="شخصی‌سازی ظاهر" description="ظاهر اجزای مختلف برنامه را انتخاب و شخصی‌سازی کنید.">
                        <div className="border-t pt-4">
                            <h4 className="text-md font-semibold mb-3">قالب منوی کناری</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <SidebarThemePreview
                                    name="پیش‌فرض"
                                    theme="default"
                                    isActive={sidebarConfig.theme === 'default'}
                                    onClick={() => setSidebarConfig(p => ({ ...p, theme: 'default' }))}
                                />
                                <SidebarThemePreview
                                    name="مدرن و مینیمال"
                                    theme="modern"
                                    isActive={sidebarConfig.theme === 'modern'}
                                    onClick={() => setSidebarConfig(p => ({ ...p, theme: 'modern' }))}
                                />
                                <SidebarThemePreview
                                    name="بصری و خوانا"
                                    theme="visual"
                                    isActive={sidebarConfig.theme === 'visual'}
                                    onClick={() => setSidebarConfig(p => ({ ...p, theme: 'visual' }))}
                                />
                                <SidebarThemePreview
                                    name="دسترسی سریع"
                                    theme="compact"
                                    isActive={sidebarConfig.theme === 'compact'}
                                    onClick={() => setSidebarConfig(p => ({ ...p, theme: 'compact' }))}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <label className="block text-sm font-medium text-brand-text">جزء مورد نظر برای شخصی‌سازی</label>
                            <select
                                value={selectedStyleTarget}
                                onChange={e => setSelectedStyleTarget(e.target.value as keyof ComponentStyles)}
                                className="mt-1 block w-full max-w-xs input-style"
                            >
                                {STYLE_TARGETS.map(target => (
                                    <option key={target.key} value={target.key}>{target.label}</option>
                                ))}
                            </select>
                        </div>

                        {selectedStyleTarget === 'popups' && (
                            <div className="border-t pt-4">
                                <h4 className="text-md font-semibold mb-3">استایل نمایش فرم‌ها</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    <FormStylePreview
                                        name="پیش‌فرض"
                                        styleKey="DEFAULT"
                                        isActive={!componentStyles[selectedStyleTarget].formDisplayStyle || componentStyles[selectedStyleTarget].formDisplayStyle === 'DEFAULT'}
                                        onClick={() => handleStyleChange('formDisplayStyle', 'DEFAULT')}
                                    />
                                    <FormStylePreview
                                        name="کارتی"
                                        styleKey="MINIMAL_CARD"
                                        isActive={componentStyles[selectedStyleTarget].formDisplayStyle === 'MINIMAL_CARD'}
                                        onClick={() => handleStyleChange('formDisplayStyle', 'MINIMAL_CARD')}
                                    />
                                    <FormStylePreview
                                        name="کارتی خلوت"
                                        styleKey="SPACIOUS_CARD"
                                        isActive={componentStyles[selectedStyleTarget].formDisplayStyle === 'SPACIOUS_CARD'}
                                        onClick={() => handleStyleChange('formDisplayStyle', 'SPACIOUS_CARD')}
                                    />
                                    <FormStylePreview
                                        name="بصری"
                                        styleKey="VISUAL"
                                        isActive={componentStyles[selectedStyleTarget].formDisplayStyle === 'VISUAL'}
                                        onClick={() => handleStyleChange('formDisplayStyle', 'VISUAL')}
                                    />
                                    <FormStylePreview
                                        name="خلوت"
                                        styleKey="SPACIOUS"
                                        isActive={componentStyles[selectedStyleTarget].formDisplayStyle === 'SPACIOUS'}
                                        onClick={() => handleStyleChange('formDisplayStyle', 'SPACIOUS')}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-4">
                            <h4 className="text-md font-semibold mb-3">اعمال استایل پیش‌فرض</h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.values(PRESETS).map(preset => (
                                    <button
                                        key={preset.name}
                                        onClick={() => handlePresetApply(preset.settings)}
                                        className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium text-sm transition-colors"
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                         <div className="border-t pt-4">
                            <h4 className="text-md font-semibold mb-2">شخصی‌سازی دستی استایل <span className="text-brand-primary">{STYLE_TARGETS.find(t => t.key === selectedStyleTarget)?.label}</span></h4>
                             <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">رنگ اصلی</label>
                                    <input type="color" value={componentStyles[selectedStyleTarget].primaryColor} onChange={e => handleStyleChange('primaryColor', e.target.value)} className="mt-1 w-full max-w-xs" />
                                </div>
                                 <div>
                                    <label className="text-sm font-medium">اندازه فونت</label>
                                    <select value={componentStyles[selectedStyleTarget].fontSize} onChange={e => handleStyleChange('fontSize', e.target.value as StyleSettings['fontSize'])} className="mt-1 block w-full max-w-xs input-style">
                                        <option value="sm">کوچک</option>
                                        <option value="base">متوسط</option>
                                        <option value="lg">بزرگ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">رنگ پس‌زمینه</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {BACKGROUND_COLOR_OPTIONS.map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleStyleChange('backgroundColor', option.value)}
                                                className={`w-16 h-8 rounded-md border flex items-center justify-center text-xs ${option.value} ${componentStyles[selectedStyleTarget].backgroundColor === option.value ? 'ring-2 ring-offset-1 ring-brand-primary' : 'border-gray-300'}`}
                                                title={option.label}
                                            >
                                                {componentStyles[selectedStyleTarget].backgroundColor === option.value && <CheckCircleIcon className="w-4 h-4 text-brand-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SettingsCard>
                )}

                 {activeTab === 'modules' && (
                    <SettingsCard title="مدیریت ماژول‌ها" description="ماژول‌های مورد نیاز خود را در منوی کناری فعال یا غیرفعال کنید.">
                        <div className="space-y-2">
                            {sidebarConfig.navItems
                                .filter((item): item is Extract<NavItem, { type: 'item' }> => item.type === 'item' && item.id !== 'settings')
                                .map(navItem => (
                                    <div key={navItem.id} className="flex items-center justify-between p-3 bg-gray-50/70 rounded-lg">
                                        <div className="flex items-center">
                                            <navItem.Icon className="w-5 h-5 text-gray-500 ml-3" />
                                            <span className="font-semibold text-brand-text">{navItem.label}</span>
                                        </div>
                                        <ToggleSwitch
                                            checked={navItem.visible}
                                            onChange={() => handleToggleModule(navItem.id)}
                                            labelId={`toggle-${navItem.id}`}
                                        />
                                    </div>
                                ))}
                        </div>
                    </SettingsCard>
                )}

                {activeTab === 'processes' && (
                     <ProcessManagement
                        processes={processes}
                        setProcesses={setProcesses}
                        forms={forms}
                    />
                )}

                {activeTab === 'time' && (
                    <SettingsCard title="تنظیمات منطقه زمانی" description="منطقه زمانی پیش‌فرض برای نمایش تاریخ‌ها و زمان‌ها را انتخاب کنید.">
                        <div>
                            <label htmlFor="timezone-select" className="block text-sm font-medium text-brand-text">منطقه زمانی</label>
                            <select
                                id="timezone-select"
                                value={appSettings.timezone}
                                onChange={e => setAppSettings(p => ({ ...p, timezone: e.target.value }))}
                                className="mt-1 block w-full max-w-xs input-style"
                            >
                                <option value="UTC">UTC</option>
                                <option value="Asia/Tehran">تهران (GMT+3:30)</option>
                                <option value="Europe/London">لندن (GMT+1)</option>
                                <option value="America/New_York">نیویورک (GMT-4)</option>
                            </select>
                        </div>
                    </SettingsCard>
                )}

                {activeTab === 'users' && (
                    <SettingsCard title="کاربران و تیم‌ها" description="مدیریت کاربران و تیم‌های سازمان">
                        <div className="flex justify-end">
                            <button onClick={() => setIsNewUserModalOpen(true)} className="flex items-center text-sm px-3 py-1.5 bg-brand-primary text-white rounded-lg font-semibold shadow-sm hover:bg-blue-600">
                                <PlusIcon className="w-4 h-4 ml-2"/>
                                افزودن کاربر جدید
                            </button>
                        </div>
                        <div className="space-y-2">
                            {users.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <div className="flex items-center">
                                        <img src={user.avatarUrl} className="w-8 h-8 rounded-full ml-3" alt={user.name} />
                                        <div>
                                            <p className="font-semibold text-sm">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.username} - {user.role}</p>
                                        </div>
                                    </div>
                                    <button className="text-sm font-medium text-brand-primary hover:underline">ویرایش</button>
                                </div>
                            ))}
                        </div>
                    </SettingsCard>
                )}

                {activeTab === 'objectives' && (
                  <SettingsCard title="تنظیمات هدف" description="نحوه نمایش سلسله مراتب اهداف را انتخاب کنید.">
                      <div>
                          <label className="block text-sm font-medium text-brand-text mb-2">نمای سلسله مراتبی</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <label className={`block p-4 border-2 rounded-lg cursor-pointer ${objectiveSettings.hierarchicalViewStyle === 'MIND_MAP' ? 'border-brand-primary bg-blue-50' : 'border-gray-300'}`}>
                                  <input 
                                      type="radio" 
                                      name="viewStyle" 
                                      value="MIND_MAP" 
                                      checked={objectiveSettings.hierarchicalViewStyle === 'MIND_MAP'} 
                                      onChange={(e) => setObjectiveSettings(p => ({ ...p, hierarchicalViewStyle: e.target.value as HierarchicalViewStyle }))}
                                      className="sr-only"
                                  />
                                  <div className="flex items-center">
                                      <div className="flex-shrink-0 w-20 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                                          <svg width="80" height="60" viewBox="0 0 80 60">
                                              <rect x="5" y="25" width="20" height="10" rx="2" fill="#2563EB"/>
                                              <line x1="25" y1="30" x2="35" y2="30" stroke="#94A3B8" strokeWidth="1.5"/>
                                              <line x1="35" y1="30" x2="35" y2="10" stroke="#94A3B8" strokeWidth="1.5"/>
                                              <line x1="35" y1="30" x2="35" y2="50" stroke="#94A3B8" strokeWidth="1.5"/>
                                              <rect x="45" y="5" width="30" height="10" rx="2" fill="#A5B4FC"/>
                                              <rect x="45" y="25" width="30" height="10" rx="2" fill="#A5B4FC"/>
                                              <rect x="45" y="45" width="30" height="10" rx="2" fill="#A5B4FC"/>
                                              <line x1="35" y1="10" x2="45" y2="10" stroke="#94A3B8" strokeWidth="1.5"/>
                                              <line x1="35" y1="30" x2="45" y2="30" stroke="#94A3B8" strokeWidth="1.5"/>
                                              <line x1="35" y1="50" x2="45" y2="50" stroke="#94A3B8" strokeWidth="1.5"/>
                                          </svg>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-brand-text">نقشه ذهنی</p>
                                          <p className="text-xs text-brand-subtext">نمایش درختی استاندارد و خوانا.</p>
                                      </div>
                                  </div>
                              </label>
                              <label className={`block p-4 border-2 rounded-lg cursor-pointer ${objectiveSettings.hierarchicalViewStyle === 'CIRCULAR' ? 'border-brand-primary bg-blue-50' : 'border-gray-300'}`}>
                                  <input 
                                      type="radio" 
                                      name="viewStyle" 
                                      value="CIRCULAR" 
                                      checked={objectiveSettings.hierarchicalViewStyle === 'CIRCULAR'} 
                                      onChange={(e) => setObjectiveSettings(p => ({ ...p, hierarchicalViewStyle: e.target.value as HierarchicalViewStyle }))}
                                      className="sr-only"
                                  />
                                   <div className="flex items-center">
                                      <div className="flex-shrink-0 w-20 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                                           <svg width="80" height="60" viewBox="0 0 80 60">
                                              <circle cx="40" cy="30" r="10" fill="#2563EB" stroke="#fff" strokeWidth="1"/>
                                              <circle cx="15" cy="30" r="6" fill="#A5B4FC" stroke="#fff" strokeWidth="1"/>
                                              <line x1="40" y1="30" x2="15" y2="30" stroke="#94A3B8" strokeWidth="1"/>
                                              <circle cx="65" cy="30" r="6" fill="#A5B4FC" stroke="#fff" strokeWidth="1"/>
                                              <line x1="40" y1="30" x2="65" y2="30" stroke="#94A3B8" strokeWidth="1"/>
                                              <circle cx="40" cy="10" r="6" fill="#A5B4FC" stroke="#fff" strokeWidth="1"/>
                                              <line x1="40" y1="30" x2="40" y2="10" stroke="#94A3B8" strokeWidth="1"/>
                                              <circle cx="40" cy="50" r="6" fill="#A5B4FC" stroke="#fff" strokeWidth="1"/>
                                              <line x1="40" y1="30" x2="40" y2="50" stroke="#94A3B8" strokeWidth="1"/>
                                          </svg>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-brand-text">دایره‌ای</p>
                                          <p className="text-xs text-brand-subtext">نمایش شعاعی و مدرن.</p>
                                      </div>
                                  </div>
                              </label>
                              <label className={`block p-4 border-2 rounded-lg cursor-pointer ${objectiveSettings.hierarchicalViewStyle === 'ORG_CHART' ? 'border-brand-primary bg-blue-50' : 'border-gray-300'}`}>
                                  <input 
                                      type="radio" 
                                      name="viewStyle" 
                                      value="ORG_CHART" 
                                      checked={objectiveSettings.hierarchicalViewStyle === 'ORG_CHART'} 
                                      onChange={(e) => setObjectiveSettings(p => ({ ...p, hierarchicalViewStyle: e.target.value as HierarchicalViewStyle }))}
                                      className="sr-only"
                                  />
                                   <div className="flex items-center">
                                      <div className="flex-shrink-0 w-20 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                                           <svg width="60" height="50" viewBox="0 0 60 50">
                                                <line x1="30" y1="8" x2="30" y2="18" stroke="#cbd5e1" strokeWidth="1.5"/>
                                                <rect x="20" y="3" width="20" height="10" rx="2" fill="#2563EB" stroke="#fff" strokeWidth="1" />
                                                
                                                <line x1="15" y1="18" x2="45" y2="18" stroke="#cbd5e1" strokeWidth="1.5"/>
                                                
                                                <line x1="15" y1="18" x2="15" y2="28" stroke="#cbd5e1" strokeWidth="1.5"/>
                                                <rect x="5" y="28" width="20" height="10" rx="2" fill="#A5B4FC" stroke="#fff" strokeWidth="1" />
                                                
                                                <line x1="45" y1="18" x2="45" y2="28" stroke="#cbd5e1" strokeWidth="1.5"/>
                                                <rect x="35" y="28" width="20" height="10" rx="2" fill="#A5B4FC" stroke="#fff" strokeWidth="1" />
                                          </svg>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-brand-text">نمودار سازمانی</p>
                                          <p className="text-xs text-brand-subtext">نمایش کلاسیک بالا به پایین.</p>
                                      </div>
                                  </div>
                              </label>
                               <label className={`block p-4 border-2 rounded-lg cursor-pointer ${objectiveSettings.hierarchicalViewStyle === 'ADVANCED_ORG_CHART' ? 'border-brand-primary bg-blue-50' : 'border-gray-300'}`}>
                                  <input 
                                      type="radio" 
                                      name="viewStyle" 
                                      value="ADVANCED_ORG_CHART" 
                                      checked={objectiveSettings.hierarchicalViewStyle === 'ADVANCED_ORG_CHART'} 
                                      onChange={(e) => setObjectiveSettings(p => ({ ...p, hierarchicalViewStyle: e.target.value as HierarchicalViewStyle }))}
                                      className="sr-only"
                                  />
                                   <div className="flex items-center">
                                      <div className="flex-shrink-0 w-20 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                                            <svg width="70" height="55" viewBox="0 0 70 55">
                                                <rect x="15" y="2" width="40" height="18" rx="3" fill="#fff" stroke="#94A3B8" strokeWidth="1"/>
                                                <rect x="18" y="5" width="6" height="6" rx="3" fill="#2563EB"/>
                                                <rect x="26" y="7" width="26" height="2" fill="#d1d5db"/>
                                                <line x1="35" y1="20" x2="35" y2="28" stroke="#cbd5e1" strokeWidth="1.5"/>
                                                <line x1="15" y1="28" x2="55" y2="28" stroke="#cbd5e1" strokeWidth="1.5"/>
                                                <line x1="15" y1="28" x2="15" y2="36" stroke="#cbd5e1" strokeWidth="1.5"/>
                                                <rect x="2" y="36" width="26" height="15" rx="3" fill="#fff" stroke="#94A3B8" strokeWidth="1"/>
                                                <line x1="55" y1="28" x2="55" y2="36" stroke="#cbd5e1" strokeWidth="1.5"/>
                                                <rect x="42" y="36" width="26" height="15" rx="3" fill="#fff" stroke="#94A3B8" strokeWidth="1"/>
                                            </svg>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-brand-text">حالت کارتی 2</p>
                                          <p className="text-xs text-brand-subtext">نمایش کارتی با جزئیات کامل.</p>
                                      </div>
                                  </div>
                              </label>
                          </div>
                      </div>
                  </SettingsCard>
                )}
                {activeTab === 'ai' && (
                    <SettingsCard title="تنظیمات پرامپت هوش مصنوعی" description="پرامپت‌های مورد استفاده برای ویژگی‌های مختلف هوش مصنوعی را ویرایش کنید. از پلیس‌هولدرها مانند {{variable}} برای تزریق داده پویا استفاده کنید.">
                        <div>
                            <label className="block text-sm font-medium text-brand-text">پرامپت پیشنهاد نتایج کلیدی</label>
                            <textarea
                                value={aiPrompts.suggestKeyResults}
                                onChange={e => onUpdateAIPrompt('suggestKeyResults', e.target.value)}
                                rows={6}
                                className="mt-1 block w-full input-style font-mono text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text">پرامپت تحلیل کلی OKR</label>
                            <textarea
                                value={aiPrompts.analyzeOKRData}
                                onChange={e => onUpdateAIPrompt('analyzeOKRData', e.target.value)}
                                rows={10}
                                className="mt-1 block w-full input-style font-mono text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text">پرامپت تحلیل عملکرد فردی</label>
                            <textarea
                                value={aiPrompts.analyzeIndividualPerformance}
                                onChange={e => onUpdateAIPrompt('analyzeIndividualPerformance', e.target.value)}
                                rows={10}
                                className="mt-1 block w-full input-style font-mono text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text">پرامپت تولید محتوای آموزشی</label>
                            <textarea
                                value={aiPrompts.generateMicroLearning}
                                onChange={e => onUpdateAIPrompt('generateMicroLearning', e.target.value)}
                                rows={6}
                                className="mt-1 block w-full input-style font-mono text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text">پرامپت تولید کوئیز</label>
                            <textarea
                                value={aiPrompts.generateQuizForText}
                                onChange={e => onUpdateAIPrompt('generateQuizForText', e.target.value)}
                                rows={6}
                                className="mt-1 block w-full input-style font-mono text-xs"
                            />
                        </div>
                    </SettingsCard>
                )}
                {activeTab === 'upgrade' && (
                    <UpgradePage />
                )}
            </div>
            <NewUserModal
                isOpen={isNewUserModalOpen}
                onClose={() => setIsNewUserModalOpen(false)}
                onSave={handleCreateUserAndCloseModal}
                teams={teams}
            />
        </div>
    );
}

const AVAILABLE_PROCESS_ICONS = ['CubeIcon', 'UserGroupIcon', 'RocketIcon', 'MegaphoneIcon', 'BanknotesIcon', 'CheckCircleIcon', 'SparklesIcon', 'DocumentTextIcon'];

const ProcessManagement: React.FC<{ processes: Process[], setProcesses: React.Dispatch<React.SetStateAction<Process[]>>, forms: Form[] }> = ({ processes, setProcesses, forms }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processToEdit, setProcessToEdit] = useState<Process | null>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('');
    const [icon, setIcon] = useState(AVAILABLE_PROCESS_ICONS[0]);
    const [color, setColor] = useState(KANBAN_COLOR_OPTIONS[0]);
    const [variableIds, setVariableIds] = useState<string[]>([]);
    
    const allVariables = useMemo(() => {
        return forms.flatMap(form =>
            form.variables?.map(v => ({ ...v, formTitle: form.title })) || []
        );
    }, [forms]);

    const openModalToEdit = (process: Process) => {
        setProcessToEdit(process);
        setName(process.name);
        setDescription(process.description);
        setUnit(process.unit);
        setIcon(process.icon);
        setColor(process.color);
        setVariableIds(process.variableIds);
        setIsModalOpen(true);
    };

    const openModalToCreate = () => {
        setProcessToEdit(null);
        setName('');
        setDescription('');
        setUnit('');
        setIcon(AVAILABLE_PROCESS_ICONS[0]);
        setColor(KANBAN_COLOR_OPTIONS[0]);
        setVariableIds([]);
        setIsModalOpen(true);
    };
    
    const handleSave = () => {
        if (!name.trim()) return alert('نام فرایند الزامی است.');

        const processData = { name, description, unit, icon, color, variableIds };
        if (processToEdit) {
            setProcesses(prev => prev.map(p => p.id === processToEdit.id ? { ...p, ...processData } : p));
        } else {
            setProcesses(prev => [...prev, { id: `proc-${Date.now()}`, ...processData }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('آیا از حذف این فرایند اطمینان دارید؟')) {
            setProcesses(prev => prev.filter(p => p.id !== id));
        }
    };
    
    const toggleVariable = (id: string) => {
        setVariableIds(prev => prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]);
    };

    return (
        <SettingsCard title="مدیریت فرایندها" description="فرایندهای سازمانی را تعریف کرده و متغیرهای فرم‌ها را به آن‌ها متصل کنید.">
            <div className="flex justify-end">
                <button onClick={openModalToCreate} className="flex items-center text-sm px-3 py-1.5 bg-brand-primary text-white rounded-lg font-semibold shadow-sm hover:bg-blue-600">
                    <PlusIcon className="w-4 h-4 ml-2"/>
                    افزودن فرایند جدید
                </button>
            </div>
            <div className="space-y-2">
                {processes.map(process => {
                    const colorScheme = KANBAN_COLOR_MAP[process.color] || KANBAN_COLOR_MAP.gray;
                    const Icon = ICONS[process.icon];
                    return (
                        <div key={process.id} className={`flex items-center justify-between p-3 rounded-lg group ${colorScheme.bg}`}>
                            <div className="flex items-center">
                                <Icon className={`w-6 h-6 ml-3 ${colorScheme.text}`} />
                                <div>
                                    <p className={`font-semibold text-sm ${colorScheme.text}`}>{process.name}</p>
                                    <p className="text-xs text-gray-500">{process.unit} - {process.variableIds.length} متغیر</p>
                                </div>
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModalToEdit(process)} className="p-1 rounded-full text-gray-500 hover:text-blue-500 hover:bg-white/50"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(process.id)} className="p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-white/50"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={processToEdit ? 'ویرایش فرایند' : 'ایجاد فرایند جدید'}>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">نام فرایند</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-style mt-1" />
                    </div>
                     <div>
                        <label className="text-sm font-medium">توضیحات</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input-style mt-1" />
                    </div>
                     <div>
                        <label className="text-sm font-medium">واحد</label>
                        <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className="input-style mt-1" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">آیکون</label>
                         <div className="mt-2 grid grid-cols-8 gap-2">
                            {AVAILABLE_PROCESS_ICONS.map(iconName => {
                                const IconComponent = ICONS[iconName];
                                return (<button type="button" key={iconName} onClick={() => setIcon(iconName)} className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 ${icon === iconName ? 'border-brand-primary' : 'border-gray-200'}`}><IconComponent className="w-6 h-6 text-gray-700" /></button>);
                            })}
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium">رنگ</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {KANBAN_COLOR_OPTIONS.map(c => <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${KANBAN_COLOR_MAP[c].bg} border-2 ${color === c ? 'ring-2 ring-offset-1 ring-brand-primary border-white' : 'border-transparent'}`} />)}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">متغیرها</label>
                        <div className="mt-2 p-2 border rounded-lg max-h-40 overflow-y-auto space-y-1 bg-gray-50/50">
                            {allVariables.map(variable => (
                                <label key={variable.id} className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                                    <input type="checkbox" checked={variableIds.includes(variable.id)} onChange={() => toggleVariable(variable.id)} className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary ml-3"/>
                                    <span>{variable.name} <span className="text-xs text-gray-500">({variable.formTitle})</span></span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                        <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold">ذخیره</button>
                    </div>
                </div>
            </Modal>
        </SettingsCard>
    );
};

export default AdminPage;
