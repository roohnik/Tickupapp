// This file can be used for application-wide constants.
// FIX: Import React to provide types for React.FC.
import React from 'react';
import { ObjectiveCategoryId, StrategyCategory, StrategyStatus, ViewMode, Consultant, FeedbackCategory } from './types';
import { ViewColumnsIcon, CalendarDaysIcon, TableCellsIcon, CubeIcon, ClipboardListIcon, ListBulletIcon, GoalIcon, RocketIcon } from './components/Icons';

export const KANBAN_COLOR_MAP: { [key: string]: { bg: string; dot: string; text: string; hover: string; } } = {
  gray: { bg: 'bg-gray-100/50 dark:bg-slate-800/50', dot: 'bg-gray-400', text: 'text-gray-700 dark:text-slate-300', hover: 'hover:bg-gray-200/70 dark:hover:bg-slate-700' },
  red: { bg: 'bg-red-50/60 dark:bg-red-900/20', dot: 'bg-red-500', text: 'text-red-700 dark:text-red-300', hover: 'hover:bg-red-100/70 dark:hover:bg-red-900/30' },
  green: { bg: 'bg-green-50/60 dark:bg-green-900/20', dot: 'bg-green-500', text: 'text-green-700 dark:text-green-300', hover: 'hover:bg-green-100/70 dark:hover:bg-green-900/30' },
  purple: { bg: 'bg-purple-50/60 dark:bg-purple-900/20', dot: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-300', hover: 'hover:bg-purple-100/70 dark:hover:bg-purple-900/30' },
  yellow: { bg: 'bg-yellow-50/60 dark:bg-yellow-900/20', dot: 'bg-yellow-400', text: 'text-yellow-700 dark:text-yellow-300', hover: 'hover:bg-yellow-100/70 dark:hover:bg-yellow-900/30' },
  blue: { bg: 'bg-blue-50/60 dark:bg-blue-900/20', dot: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300', hover: 'hover:bg-blue-100/70 dark:hover:bg-blue-900/30' },
  orange: { bg: 'bg-orange-50/60 dark:bg-orange-900/20', dot: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', hover: 'hover:bg-orange-100/70 dark:hover:bg-orange-900/30' },
};

// FIX: Removed incorrect type assertion which caused type errors downstream. Object.keys returns string[].
export const KANBAN_COLOR_OPTIONS = Object.keys(KANBAN_COLOR_MAP);

export const STICKER_COLOR_MAP: { [key: string]: { bg: string; text: string; } } = {
  gray: { bg: 'bg-stone-200 dark:bg-stone-700', text: 'text-stone-800 dark:text-stone-200' },
  red: { bg: 'bg-red-300 dark:bg-red-800/50', text: 'text-red-900 dark:text-red-200' },
  green: { bg: 'bg-green-300 dark:bg-green-800/50', text: 'text-green-900 dark:text-green-200' },
  purple: { bg: 'bg-purple-300 dark:bg-purple-800/50', text: 'text-purple-900 dark:text-purple-200' },
  yellow: { bg: 'bg-yellow-200 dark:bg-yellow-800/50', text: 'text-yellow-900 dark:text-yellow-200' },
  blue: { bg: 'bg-blue-300 dark:bg-blue-800/50', text: 'text-blue-900 dark:text-blue-200' },
  orange: { bg: 'bg-orange-300 dark:bg-orange-800/50', text: 'text-orange-900 dark:text-orange-200' },
};

export const TAG_COLOR_MAP: { [key: string]: { bg: string; text: string; } } = {
  gray: { bg: 'bg-gray-200/80 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' },
  red: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-200' },
  green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-200' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-800 dark:text-purple-200' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-200' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/50', text: 'text-pink-800 dark:text-pink-200' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-800 dark:text-orange-200' },
};

export const TAG_COLOR_OPTIONS = Object.keys(TAG_COLOR_MAP);

export const TABLE_COLOR_MAP: { [key: string]: { bg: string; } } = {
    gray: { bg: 'bg-gray-100' },
    brown: { bg: 'bg-orange-100' }, // Using orange for brown
    orange: { bg: 'bg-orange-200' },
    yellow: { bg: 'bg-yellow-100' },
    green: { bg: 'bg-green-100' },
    blue: { bg: 'bg-blue-100' },
    purple: { bg: 'bg-purple-100' },
    pink: { bg: 'bg-pink-100' },
    red: { bg: 'bg-red-100' },
};

export const TABLE_BACKGROUND_COLOR_OPTIONS = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];


export const TEXT_COLOR_MAP: { [key: string]: { text: string; } } = {
    gray: { text: 'text-gray-800' },
    brown: { text: 'text-orange-800' },
    orange: { text: 'text-orange-600' },
    yellow: { text: 'text-yellow-800' },
    green: { text: 'text-green-800' },
    blue: { text: 'text-blue-800' },
    purple: { text: 'text-purple-800' },
    pink: { text: 'text-pink-800' },
    red: { text: 'text-red-800' },
};

export const TEXT_COLOR_OPTIONS = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];

export const OBJECTIVE_COLOR_MAP: { [key: string]: { bg: string } } = {
  gray: { bg: 'bg-gray-400' },
  red: { bg: 'bg-red-500' },
  green: { bg: 'bg-green-500' },
  purple: { bg: 'bg-purple-500' },
  yellow: { bg: 'bg-yellow-400' },
  blue: { bg: 'bg-blue-500' },
  pink: { bg: 'bg-pink-500' },
  orange: { bg: 'bg-orange-500' },
};

export const OBJECTIVE_COLOR_OPTIONS = Object.keys(OBJECTIVE_COLOR_MAP);

export const OBJECTIVE_CATEGORIES: { [key in ObjectiveCategoryId]: { id: ObjectiveCategoryId; label: string; description: string; IconName: string; } } = {
  BUSINESS_GROWTH: { id: 'BUSINESS_GROWTH', label: 'رشد و توسعه کسب‌وکار', description: 'افزایش درآمد، سهم بازار، مشتریان جدید', IconName: 'ChartIcon' },
  CUSTOMER_MARKET: { id: 'CUSTOMER_MARKET', label: 'مشتری و بازار', description: 'افزایش رضایت مشتری، تعامل با کاربران', IconName: 'HandshakeIcon' },
  PRODUCT_INNOVATION: { id: 'PRODUCT_INNOVATION', label: 'محصول و نوآوری', description: 'بهبود کیفیت محصول، توسعه ویژگی‌های جدید', IconName: 'LightbulbIcon' },
  PROCESS_EFFICIENCY: { id: 'PROCESS_EFFICIENCY', label: 'فرآیندها و بهره‌وری', description: 'بهبود کارایی داخلی، کاهش هزینه‌ها', IconName: 'SettingsIcon' },
  HR_CULTURE: { id: 'HR_CULTURE', label: 'منابع انسانی و فرهنگ سازمانی', description: 'رشد تیم، آموزش کارکنان، انگیزه', IconName: 'UserGroupIcon' },
  FINANCE_PROFITABILITY: { id: 'FINANCE_PROFITABILITY', label: 'مالی و سودآوری', description: 'مدیریت هزینه‌ها، افزایش سود', IconName: 'BanknotesIcon' },
  SUSTAINABILITY: { id: 'SUSTAINABILITY', label: 'پایداری و مسئولیت اجتماعی', description: 'کاهش اثرات زیست‌محیطی، مسئولیت اجتماعی', IconName: 'LeafIcon' },
  QUALITY_STANDARDS: { id: 'QUALITY_STANDARDS', label: 'کیفیت و استانداردها', description: 'استانداردهای ایزو، بهبود کیفیت، کاهش خطاها', IconName: 'CheckCircleIcon' },
  TECH_DIGITALIZATION: { id: 'TECH_DIGITALIZATION', label: 'فناوری و دیجیتال‌سازی', description: 'پیاده‌سازی نرم‌افزار، امنیت اطلاعات', IconName: 'ComputerDesktopIcon' },
  COMMUNICATION_BRANDING: { id: 'COMMUNICATION_BRANDING', label: 'ارتباطات و برندینگ', description: 'افزایش آگاهی برند، تبلیغات', IconName: 'MegaphoneIcon' },
};

export const OBJECTIVE_CATEGORY_LIST = Object.values(OBJECTIVE_CATEGORIES);

export const STATUS_TEXT_COLOR_MAP: { [key: string]: string } = {
  'برای انجام': 'text-gray-600 dark:text-gray-400',
  'در حال پیشرفت': 'text-orange-600 dark:text-orange-400',
  'انجام شد': 'text-green-600 dark:text-green-400'
};

export const STATUS_BADGE_COLOR_MAP: { [key: string]: { bg: string, text: string } } = {
  'برای انجام': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' },
  'در حال پیشرفت': { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-800 dark:text-orange-200' },
  'انجام شد': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-200' }
};

export const STATUS_TABLE_CELL_COLORS: { [key: string]: { bg: string; text: string } } = {
  'انجام شد': { bg: 'bg-green-500', text: 'text-white' },
  'در حال پیشرفت': { bg: 'bg-orange-400', text: 'text-white' },
  'برای انجام': { bg: 'bg-gray-200', text: 'text-gray-800' },
};

export const STRATEGY_CATEGORIES: StrategyCategory[] = [
    'محور ارزش‌آفرینی برای مشتری', 
    'فروش', 
    'توسعه محصول', 
    'توسعه بازار',
    'محور تعالی عملیاتی و بهره‌وری',
    'محور توانمندسازی تیم و فرهنگ سازمانی',
    'محور آگاهی از برند و اعتبار',
    'محور تعالی فرآیندها',
    'محور داده‌محوری',
    'دیجیتال و هوش مصنوعی',
    'زیرساخت فنی و مقیاس‌پذیری',
    'اقیانوس آبی'
];

export const STRATEGY_STATUSES: StrategyStatus[] = ['در حال برنامه ریزی', 'در جریان', 'متوقف شده است'];

export const STRATEGY_STATUS_COLORS: Record<StrategyStatus, { bg: string; text: string }> = {
    'در حال برنامه ریزی': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'در جریان': { bg: 'bg-green-100', text: 'text-green-800' },
    'متوقف شده است': { bg: 'bg-red-100', text: 'text-red-800' },
};

export const VIEW_MODES: { key: ViewMode, label: string, Icon: React.FC<any> }[] = [
    { key: 'board', label: 'بورد', Icon: ViewColumnsIcon },
    { key: 'calendar', label: 'تقویم', Icon: CalendarDaysIcon },
    { key: 'table', label: 'جدول', Icon: TableCellsIcon },
    { key: 'process', label: 'فرایند', Icon: CubeIcon },
    { key: 'card', label: 'کارت', Icon: ClipboardListIcon },
    { key: 'timeline', label: 'تایم لاین', Icon: ListBulletIcon },
];

export const CONSULTANTS: Consultant[] = [
    {
        id: 'legal',
        name: 'مشاور حقوقی',
        specialty: 'مسائل قانونی و قراردادها',
        color: '#3b82f6', // blue-500
        systemInstruction: 'شما یک مشاور حقوقی متخصص در حقوق تجارت، قراردادها و مالکیت معنوی هستید. مشاوره حقوقی واضح، مختصر و مفیدی ارائه دهید. همیشه یک سلب مسئولیت اضافه کنید که شما یک هوش مصنوعی هستید و این جایگزین مشاوره حقوقی حرفه‌ای نیست.'
    },
    {
        id: 'dev',
        name: 'مربی توسعه فردی',
        specialty: 'رشد شخصی و شغلی',
        color: '#8b5cf6', // purple-500
        systemInstruction: 'شما یک مربی توسعه فردی حمایتگر و فهیم هستید. به کاربران کمک کنید تا اهداف خود را تعیین کنند، بر چالش‌ها غلبه کنند و عادات بهتری بسازند. از لحنی مثبت و دلگرم‌کننده استفاده کنید.'
    },
    {
        id: 'finance',
        name: 'مشاور مالی',
        specialty: 'بودجه‌بندی و سرمایه‌گذاری',
        color: '#22c55e', // green-500
        systemInstruction: 'شما یک مشاور مالی برای کسب‌وکارهای کوچک و افراد هستید. در مورد بودجه‌بندی، برنامه‌ریزی مالی و استراتژی‌های سرمایه‌گذاری مشاوره دهید. یک سلب مسئولیت اضافه کنید که شما یک هوش مصنوعی هستید و یک برنامه‌ریز مالی معتبر نیستید.'
    },
    {
        id: 'marketing',
        name: 'استراتژیست بازاریابی',
        specialty: 'رشد و جذب مشتری',
        color: '#f97316', // orange-500
        systemInstruction: 'شما یک استراتژیست بازاریابی خلاق و داده‌محور هستید. به کاربران کمک کنید تا کمپین‌های بازاریابی را توسعه دهند، مخاطبان هدف خود را درک کنند و حضور برند خود را بهبود بخشند.'
    }
];

export const FEEDBACK_CATEGORY_DETAILS: Record<FeedbackCategory, { label: string, color: string, Icon: React.FC<any> }> = {
    TASKS: { label: 'عملکرد و وظایف', color: '#3b82f6', Icon: ClipboardListIcon }, // Blue
    PROCESSES: { label: 'فرایندها', color: '#22c55e', Icon: CubeIcon }, // Green
    OBJECTIVES: { label: 'اهداف و پیشرفت', color: '#8b5cf6', Icon: GoalIcon }, // Purple
    STRATEGIES: { label: 'استراتژی', color: '#f97316', Icon: RocketIcon }, // Orange
};