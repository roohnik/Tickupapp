import React, { useState, useRef, useEffect } from 'react';
import { Form, FormField, FormFieldType, FormCategory, Recurrence, FormFieldOption, StyleSettings, User, CalculationSettings, NumberCalculationCondition, NumberCalculationRule, ValueScore, OptionScore, FormVariable } from '../types';
import { CloseIcon, PlusIcon, TrashIcon, TextIcon, ParagraphIcon, NumberIcon, EmailIcon, CalendarIcon, ChevronDownIcon, ListBulletIcon, RadioButtonIcon, CheckboxIcon, StarIcon, CheckCircleIcon, FileUploadIcon, XCircleIcon, RepeatIcon, FolderIcon, TableCellsIcon, ArrowRightIcon, DocumentTextIcon, ICONS, ViewColumnsIcon, ExclamationTriangleIcon, DocumentArrowUpIcon, SparklesIcon, PencilIcon, ClipboardListIcon, HandThumbUpIcon, ClipboardCopyIcon, CalculatorIcon, TagIcon } from './Icons';
import TaskPropertyRow from './TaskPropertyRow';
import DueDateSelector from './DueDateSelector';
import FormFieldRenderer from './FormFieldRenderer';
import { generateFormFields, GeneratedFormField, AIPrompts } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
    };
    reader.onerror = error => reject(error);
});

type BuilderTab = 'design' | 'fromText' | 'aiCreate' | 'preview' | 'calculations' | 'variables';
type MobileView = 'canvas' | 'palette' | 'settings';


interface FormBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (form: Omit<Form, 'id' | 'creatorId'> & { id?: string }) => void;
    categories: FormCategory[];
    formToEdit?: Form | null;
    styleSettings: StyleSettings;
    aiPrompts: AIPrompts;
    users: User[];
    // FIX: Add currentUser to props to resolve 'Cannot find name' error.
    currentUser: User;
}

const FIELD_PALETTE_ITEMS: {
    category: string;
    fields: { type: FormFieldType; label: string; Icon: React.FC<any> }[]
}[] = [
    {
        category: 'ساختار فرم',
        fields: [
            { type: 'SECTION', label: 'بخش', Icon: ViewColumnsIcon },
            { type: 'DYNAMIC_TABLE', label: 'جدول پویا', Icon: ClipboardListIcon },
        ]
    },
    {
        category: 'ورودی‌های متنی',
        fields: [
            { type: 'TEXT', label: 'متن کوتاه', Icon: TextIcon },
            { type: 'TEXTAREA', label: 'متن بلند', Icon: ParagraphIcon },
            { type: 'NUMBER', label: 'عدد', Icon: NumberIcon },
            { type: 'EMAIL', label: 'ایمیل', Icon: EmailIcon },
        ]
    },
    {
        category: 'انتخابی',
        fields: [
            { type: 'SELECT', label: 'لیست کشویی', Icon: ChevronDownIcon },
            { type: 'RADIO', label: 'گزینه تکی', Icon: RadioButtonIcon },
            { type: 'CHECKBOX', label: 'گزینه چندتایی', Icon: CheckboxIcon },
            { type: 'MATRIX_SINGLE', label: 'ماتریس', Icon: TableCellsIcon },
        ]
    },
    {
        category: 'پیشرفته',
        fields: [
            { type: 'DATE', label: 'تاریخ', Icon: CalendarIcon },
            { type: 'RATING', label: 'امتیاز ستاره‌ای', Icon: StarIcon },
            { type: 'CONFIRMATION', label: 'بله/خیر', Icon: CheckCircleIcon },
            { type: 'APPROVAL', label: 'تایید/رد', Icon: HandThumbUpIcon },
            { type: 'FILE_UPLOAD', label: 'آپلود فایل', Icon: FileUploadIcon },
            { type: 'SIGNATURE', label: 'امضا', Icon: PencilIcon },
        ]
    }
];

const calculableFieldTypes: FormFieldType[] = ['SELECT', 'RADIO', 'RATING', 'CONFIRMATION', 'APPROVAL', 'NUMBER'];
const availableVariableIcons = ['StarIcon', 'HeartIcon', 'TrophyIcon', 'LightbulbIcon', 'CheckCircleIcon', 'SparklesIcon', 'ChartIcon', 'UserGroupIcon'];

interface CalculationsPanelProps {
    fields: FormField[];
    setFields: React.Dispatch<React.SetStateAction<FormField[]>>;
    enableCalculations: boolean;
    setEnableCalculations: (enabled: boolean) => void;
    maxScore: number;
    setMaxScore: React.Dispatch<React.SetStateAction<number>>;
}

const CalculationsPanel: React.FC<CalculationsPanelProps> = ({ fields, setFields, enableCalculations, setEnableCalculations, maxScore, setMaxScore }) => {
    const calculableFields = fields.filter(f => calculableFieldTypes.includes(f.type));

    const updateFieldCalculation = (fieldId: string, config: CalculationSettings | undefined) => {
        setFields(prevFields =>
            prevFields.map(f =>
                f.id === fieldId ? { ...f, calculationConfig: config } : f
            )
        );
    };

    useEffect(() => {
        const calculateMaxScore = (): number => {
            if (!enableCalculations) return 0;

            let totalMax = 0;
            calculableFields.forEach(field => {
                const config = field.calculationConfig;
                if (!config) return;

                let fieldMax = 0;
                if (config.optionScores) {
                    fieldMax = Math.max(0, ...config.optionScores.map(s => s.score || 0));
                } else if (config.valueScores) {
                    fieldMax = Math.max(0, ...config.valueScores.map(s => s.score || 0));
                } else if (config.ratingScores) {
                    // FIX: Explicitly cast 'unknown' value from Object.values to 'number' to resolve TypeScript error in max score calculation.
                    fieldMax = Math.max(0, ...Object.values(config.ratingScores).map(s => Number(s) || 0));
                } else if (config.numberRules) {
                    fieldMax = Math.max(config.numberRules.defaultScore || 0, ...config.numberRules.rules.map(r => r.score || 0));
                }
                totalMax += fieldMax;
            });
            return totalMax;
        };
        setMaxScore(calculateMaxScore());
    }, [fields, enableCalculations, setMaxScore, calculableFields]);

    const renderValueScoreInput = (field: FormField, value: boolean | string, label: string) => {
        const score = field.calculationConfig?.valueScores?.find(s => s.value === value)?.score ?? '';
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newScore = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
            const currentScores: ValueScore[] = field.calculationConfig?.valueScores || [];
            const existing = currentScores.find(s => s.value === value);
            let updatedScores;
            if (existing) {
                updatedScores = currentScores.map(s => s.value === value ? { ...s, score: newScore ?? 0 } : s);
            } else {
                updatedScores = [...currentScores, { value, score: newScore ?? 0 }];
            }
            updateFieldCalculation(field.id, { ...field.calculationConfig, valueScores: updatedScores });
        };
        return (
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <input type="number" value={score} onChange={handleChange} className="w-20 p-1 border-gray-300 rounded text-sm" placeholder="امتیاز" />
            </div>
        );
    };
    
    const handleNumberRuleChange = (fieldId: string, ruleId: string, updates: Partial<NumberCalculationRule>) => {
        const config = fields.find(f => f.id === fieldId)?.calculationConfig;
        if (!config?.numberRules) return;
        const newRules = config.numberRules.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
        updateFieldCalculation(fieldId, { ...config, numberRules: { ...config.numberRules, rules: newRules } });
    };

    const addNumberRule = (fieldId: string) => {
        const config = fields.find(f => f.id === fieldId)?.calculationConfig;
        const newRule: NumberCalculationRule = { id: `rule-${Date.now()}`, condition: 'EQUALS', value1: 0, score: 0 };
        const newRules = [...(config?.numberRules?.rules || []), newRule];
        const newNumberRules = { defaultScore: config?.numberRules?.defaultScore || 0, rules: newRules };
        updateFieldCalculation(fieldId, { ...config, numberRules: newNumberRules });
    };

    const removeNumberRule = (fieldId: string, ruleId: string) => {
        const config = fields.find(f => f.id === fieldId)?.calculationConfig;
        if (!config?.numberRules) return;
        const newRules = config.numberRules.rules.filter(r => r.id !== ruleId);
        updateFieldCalculation(fieldId, { ...config, numberRules: { ...config.numberRules, rules: newRules } });
    };


    return (
        <div className="p-4 sm:p-8">
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                    <h3 className="font-bold text-blue-800">فعال‌سازی امتیازدهی</h3>
                    <p className="text-sm text-blue-600">برای فیلدهای فرم امتیاز تعریف کنید تا در نهایت امتیاز کل محاسبه شود.</p>
                </div>
                <input type="checkbox" checked={enableCalculations} onChange={e => setEnableCalculations(e.target.checked)} className="w-6 h-6 rounded text-brand-primary focus:ring-brand-primary" />
            </div>

            {enableCalculations && (
                <div className="mt-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-4 p-3 bg-gray-100 rounded-md">
                        <h3 className="font-semibold text-lg">تنظیمات امتیازدهی</h3>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{maxScore}</div>
                            <div className="text-xs text-gray-500">حداکثر امتیاز</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {calculableFields.length > 0 ? calculableFields.map(field => (
                            <div key={field.id} className="p-4 border rounded-lg bg-white">
                                <h4 className="font-semibold mb-3">{field.label}</h4>
                                {['SELECT', 'RADIO'].includes(field.type) && (
                                    <div className="space-y-2">
                                        {field.options?.map(option => {
                                            const score = field.calculationConfig?.optionScores?.find(s => s.optionId === option.id)?.score ?? '';
                                            return (
                                                <div key={option.id} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">{option.label}</span>
                                                    <input
                                                        type="number"
                                                        value={score}
                                                        onChange={e => {
                                                            const newScore = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                                            const currentScores: OptionScore[] = field.calculationConfig?.optionScores || [];
                                                            const existing = currentScores.find(s => s.optionId === option.id);
                                                            let updatedScores;
                                                            if (existing) {
                                                                updatedScores = currentScores.map(s => s.optionId === option.id ? { ...s, score: newScore ?? 0 } : s);
                                                            } else {
                                                                updatedScores = [...currentScores, { optionId: option.id, score: newScore ?? 0 }];
                                                            }
                                                            updateFieldCalculation(field.id, { ...field.calculationConfig, optionScores: updatedScores });
                                                        }}
                                                        className="w-20 p-1 border-gray-300 rounded text-sm"
                                                        placeholder="امتیاز"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {field.type === 'CONFIRMATION' && (
                                    <div className="space-y-2">
                                        {renderValueScoreInput(field, true, 'بله')}
                                        {renderValueScoreInput(field, false, 'خیر')}
                                    </div>
                                )}
                                {field.type === 'APPROVAL' && (
                                    <div className="space-y-2">
                                        {renderValueScoreInput(field, 'APPROVED', 'تایید')}
                                        {renderValueScoreInput(field, 'REJECTED', 'رد')}
                                        {renderValueScoreInput(field, 'UNSPECIFIED', 'نامشخص')}
                                    </div>
                                )}
                                {field.type === 'RATING' && (
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4, 5].map(star => {
                                            const score = field.calculationConfig?.ratingScores?.[star] ?? '';
                                            return (
                                                <div key={star} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 flex items-center">{star} <StarIcon className="w-4 h-4 mr-1 text-yellow-400" filled /></span>
                                                    <input
                                                        type="number"
                                                        value={score}
                                                        onChange={e => {
                                                            const newScore = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                                            const currentScores = field.calculationConfig?.ratingScores || {};
                                                            const updatedScores = { ...currentScores, [star]: newScore ?? 0 };
                                                            updateFieldCalculation(field.id, { ...field.calculationConfig, ratingScores: updatedScores });
                                                        }}
                                                        className="w-20 p-1 border-gray-300 rounded text-sm"
                                                        placeholder="امتیاز"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {field.type === 'NUMBER' && (() => {
                                    const rules = field.calculationConfig?.numberRules?.rules || [];
                                    const defaultScore = field.calculationConfig?.numberRules?.defaultScore ?? 0;
                                    const conditions: { value: NumberCalculationCondition; label: string }[] = [
                                        { value: 'EQUALS', label: 'برابر با' },
                                        { value: 'NOT_EQUALS', label: 'مخالف با' },
                                        { value: 'GREATER_THAN', label: 'بزرگتر از' },
                                        { value: 'LESS_THAN', label: 'کوچکتر از' },
                                        { value: 'BETWEEN', label: 'بین' },
                                    ];
                                    return (
                                        <div className="space-y-3">
                                            <p className="text-xs text-gray-500">اگر عدد ورودی با یکی از شرایط زیر مطابقت داشت، امتیاز مربوطه را دریافت می‌کند.</p>
                                            {rules.map(rule => (
                                                <div key={rule.id} className="flex items-center flex-wrap gap-2 p-2 bg-gray-100/70 rounded-md">
                                                    <span>اگر</span>
                                                    <select value={rule.condition} onChange={e => handleNumberRuleChange(field.id, rule.id, { condition: e.target.value as NumberCalculationCondition })} className="p-1 border-gray-300 rounded text-xs">
                                                        {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                                    </select>
                                                    <input type="number" value={rule.value1} onChange={e => handleNumberRuleChange(field.id, rule.id, { value1: parseInt(e.target.value) || 0 })} className="w-16 p-1 border-gray-300 rounded text-xs" />
                                                    {rule.condition === 'BETWEEN' && <><span className="text-xs">و</span><input type="number" value={rule.value2 || ''} onChange={e => handleNumberRuleChange(field.id, rule.id, { value2: parseInt(e.target.value) || 0 })} className="w-16 p-1 border-gray-300 rounded text-xs" /></>}
                                                    <span className="text-xs">باشد، امتیاز</span>
                                                    <input type="number" value={rule.score} onChange={e => handleNumberRuleChange(field.id, rule.id, { score: parseInt(e.target.value) || 0 })} className="w-16 p-1 border-gray-300 rounded text-xs" />
                                                    <span className="text-xs">بگیرد.</span>
                                                    <button onClick={() => removeNumberRule(field.id, rule.id)} className="p-1 text-gray-400 hover:text-red-500 mr-auto"><TrashIcon className="w-4 h-4"/></button>
                                                </div>
                                            ))}
                                            <button onClick={() => addNumberRule(field.id)} className="text-sm text-blue-600 font-semibold flex items-center"><PlusIcon className="w-4 h-4 ml-1"/> افزودن شرط</button>
                                            <div className="border-t pt-3 mt-3 flex items-center justify-between">
                                                <label className="text-sm">امتیاز پیش‌فرض (اگر هیچ شرطی برقرار نبود)</label>
                                                <input type="number" value={defaultScore} onChange={e => {
                                                    const config = field.calculationConfig;
                                                    const newNumberRules = { rules: config?.numberRules?.rules || [], defaultScore: parseInt(e.target.value) || 0 };
                                                    updateFieldCalculation(field.id, { ...config, numberRules: newNumberRules });
                                                }} className="w-20 p-1 border-gray-300 rounded text-sm" />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )) : <p className="text-center text-gray-500 py-8">هیچ فیلد قابل امتیازبندی در فرم شما وجود ندارد.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

interface VariablesPanelProps {
    fields: FormField[];
    variables: FormVariable[];
    setVariables: React.Dispatch<React.SetStateAction<FormVariable[]>>;
}

const VariablesPanel: React.FC<VariablesPanelProps> = ({ fields, variables, setVariables }) => {
    const [selectedVariableId, setSelectedVariableId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState<Partial<FormVariable>>({});
    const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);

    const fieldDropdownRef = useRef<HTMLDivElement>(null);

    const calculableFields = fields.filter(f => calculableFieldTypes.includes(f.type));
    const selectedVariable = variables.find(v => v.id === selectedVariableId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fieldDropdownRef.current && !fieldDropdownRef.current.contains(event.target as Node)) {
                setIsFieldDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const startNewVariable = () => {
        setEditState({
            id: `var-${Date.now()}`,
            name: '',
            icon: availableVariableIcons[0],
            purpose: '',
            label: '',
            fieldIds: [],
        });
        setIsEditing(true);
        setSelectedVariableId(null);
    };

    const startEditing = (variable: FormVariable) => {
        setEditState(variable);
        setIsEditing(true);
        setSelectedVariableId(variable.id);
    };

    const handleSave = () => {
        if (!editState.name?.trim()) return;

        const isUpdating = variables.some(v => v.id === editState.id);
        if (isUpdating) {
            setVariables(vars => vars.map(v => v.id === editState.id ? editState as FormVariable : v));
        } else {
            setVariables(vars => [...vars, editState as FormVariable]);
        }
        setIsEditing(false);
        setEditState({});
        setSelectedVariableId(editState.id!);
    };

    const handleDelete = (id: string) => {
        setVariables(vars => vars.filter(v => v.id !== id));
        if (selectedVariableId === id) {
            setSelectedVariableId(null);
            setIsEditing(false);
            setEditState({});
        }
    };
    
    const toggleFieldInVariable = (fieldId: string) => {
        setEditState(prev => {
            const currentIds = prev.fieldIds || [];
            const newIds = currentIds.includes(fieldId) ? currentIds.filter(id => id !== fieldId) : [...currentIds, fieldId];
            return { ...prev, fieldIds: newIds };
        });
    };

    const renderEditPanel = () => (
        <div className="p-4 space-y-4">
            <h3 className="font-semibold">{editState.id?.startsWith('var-') ? 'متغییر جدید' : 'ویرایش متغییر'}</h3>
            <div>
                <label className="text-xs font-medium">نام متغییر</label>
                <input type="text" value={editState.name || ''} onChange={e => setEditState(p => ({ ...p, name: e.target.value }))} className="input-style mt-1" />
            </div>
            <div>
                <label className="text-xs font-medium">هدف از این متغییر</label>
                <input type="text" value={editState.purpose || ''} onChange={e => setEditState(p => ({ ...p, purpose: e.target.value }))} className="input-style mt-1" />
            </div>
             <div>
                <label className="text-xs font-medium">برچسب (توضیح تکمیلی)</label>
                <input type="text" value={editState.label || ''} onChange={e => setEditState(p => ({ ...p, label: e.target.value }))} className="input-style mt-1" />
            </div>
             <div>
                <label className="text-xs font-medium">آیکون</label>
                <div className="mt-2 grid grid-cols-8 gap-2">
                    {availableVariableIcons.map(iconName => {
                        const Icon = ICONS[iconName];
                        return <button key={iconName} onClick={() => setEditState(p => ({...p, icon: iconName}))} className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 ${editState.icon === iconName ? 'border-brand-primary' : 'border-gray-200'}`}><Icon className="w-5 h-5 text-gray-700" /></button>
                    })}
                </div>
            </div>
             <div>
                <label className="text-xs font-medium">سوالات مرتبط</label>
                <div className="relative mt-1" ref={fieldDropdownRef}>
                    <button type="button" onClick={() => setIsFieldDropdownOpen(p => !p)} className="input-style w-full text-right flex justify-between items-center">
                        <span className="truncate">{editState.fieldIds?.length || 0} سوال انتخاب شده</span>
                        <ChevronDownIcon className="w-4 h-4" />
                    </button>
                    {isFieldDropdownOpen && (
                        <div className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                            {calculableFields.map(field => (
                                <label key={field.id} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                                    <input type="checkbox" checked={editState.fieldIds?.includes(field.id)} onChange={() => toggleFieldInVariable(field.id)} className="ml-2 rounded" />
                                    <span className="text-sm">{field.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse pt-2">
                <button onClick={handleSave} className="px-4 py-1.5 bg-brand-primary text-white text-sm rounded-md">ذخیره</button>
                <button onClick={() => { setIsEditing(false); setEditState({}); }} className="px-4 py-1.5 bg-gray-200 text-sm rounded-md">لغو</button>
            </div>
        </div>
    );
    
    return (
         <div className="grid md:grid-cols-2 h-full">
            <div className="bg-white p-4 overflow-y-auto">
                {isEditing ? renderEditPanel() : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <TagIcon className="w-12 h-12 text-gray-300 mb-4"/>
                        <h3 className="font-semibold text-lg">متغییرها</h3>
                        <p className="text-sm text-gray-500 max-w-xs">متغییرها به شما کمک می‌کنند تا سوالات مرتبط را دسته‌بندی کرده و امتیاز آن‌ها را به صورت جداگانه در داشبورد مشاهده کنید.</p>
                        <button onClick={startNewVariable} className="mt-4 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg text-sm flex items-center"><PlusIcon className="w-4 h-4 ml-1" /> ایجاد متغییر جدید</button>
                    </div>
                )}
            </div>
            <div className="border-l bg-gray-50/70 p-4 overflow-y-auto space-y-2">
                <h3 className="font-semibold text-sm px-2 mb-2">لیست متغییرها</h3>
                {variables.map(variable => {
                    const Icon = ICONS[variable.icon];
                    return (
                        <div key={variable.id} className={`p-3 rounded-lg border-2 ${selectedVariableId === variable.id ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                    <Icon className="w-5 h-5 text-gray-600 mr-3" />
                                    <div>
                                        <p className="font-semibold">{variable.name}</p>
                                        <p className="text-xs text-gray-500">{variable.label}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <button onClick={() => startEditing(variable)} className="p-1 text-gray-400 hover:text-blue-500"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(variable.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t text-xs">
                                <p className="font-semibold mb-1">سوالات مرتبط:</p>
                                <ul className="list-disc list-inside pr-2 space-y-1 text-gray-600">
                                    {variable.fieldIds.map(fid => {
                                        const field = fields.find(f => f.id === fid);
                                        return field ? <li key={fid}>{field.label}</li> : null;
                                    })}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const createNewFieldObject = (type: FormFieldType): FormField => {
    const newField: FormField = {
        id: `field-${Date.now()}`,
        type,
        label: type === 'SECTION' ? 'بخش جدید' : type === 'DYNAMIC_TABLE' ? 'جدول جدید' : `فیلد ${type.toLowerCase()}`,
        isRequired: false,
        ...( (type === 'SELECT' || type === 'RADIO' || type === 'CHECKBOX') && { options: [{id: 'opt1', label: 'گزینه ۱'}] } ),
        ...( type === 'MATRIX_SINGLE' && { matrixRows: [{id: 'row1', label: 'ردیف ۱'}], matrixColumns: [{id: 'col1', label: 'ستون ۱'}] } ),
        ...( type === 'DYNAMIC_TABLE' && { 
            subFields: [
                { id: `sub-${Date.now()}-1`, type: 'TEXT', label: 'ستون ۱', isRequired: false },
                { id: `sub-${Date.now()}-2`, type: 'NUMBER', label: 'ستون ۲', isRequired: false },
            ] 
        } )
    };
    return newField;
};


const FormBuilderModal: React.FC<FormBuilderModalProps> = ({ isOpen, onClose, onSubmit, categories, formToEdit, styleSettings, aiPrompts, users, currentUser }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [mobileView, setMobileView] = useState<MobileView>('canvas');
    const [tab, setTab] = useState<BuilderTab>('design');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
    const [fields, setFields] = useState<FormField[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [dueDate, setDueDate] = useState('');
    const [recurrence, setRecurrence] = useState<Recurrence | undefined>(undefined);
    const [displayMode, setDisplayMode] = useState<'SINGLE_PAGE' | 'MULTI_STEP'>('SINGLE_PAGE');
    
    // State for "Create from Text" tab
    const [textInput, setTextInput] = useState('');
    const [selectedFieldTypeForText, setSelectedFieldTypeForText] = useState<FormFieldType>('TEXT');
    const [textPattern, setTextPattern] = useState<'single' | 'multi' | 'slash' | 'qa'>('single');

    // State for "Smart Create" tab
    const [aiPrompt, setAiPrompt] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Specifications State
    const [isSpecVisible, setIsSpecVisible] = useState(false);
    const [formCode, setFormCode] = useState('');
    const [approvalDate, setApprovalDate] = useState('');
    const [version, setVersion] = useState('');
    const [unit, setUnit] = useState('');
    const [approvalCode, setApprovalCode] = useState('');
    const [documentRequestNumber, setDocumentRequestNumber] = useState('');
    
    // NEW Calculation state
    const [enableCalculations, setEnableCalculations] = useState(false);
    const [maxScore, setMaxScore] = useState(0);

    // NEW Variable state
    const [variables, setVariables] = useState<FormVariable[]>([]);


    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    
    const isEditing = !!formToEdit;
    
    const generatedLink = formCode ? `${window.location.origin}/${formCode}` : '';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategoryId(categories[0]?.id || '');
        setFields([]);
        setDueDate('');
        setRecurrence(undefined);
        setSelectedFieldId(null);
        setMobileView('canvas');
        setTextInput('');
        setSelectedFieldTypeForText('TEXT');
        setFormCode('');
        setApprovalDate('');
        setVersion('');
        setUnit('');
        setApprovalCode('');
        setDocumentRequestNumber('');
        setIsSpecVisible(false);
        setDisplayMode('SINGLE_PAGE');
        setAiPrompt('');
        setUploadedFile(null);
        setEnableCalculations(false);
        setMaxScore(0);
        setVariables([]);
        setTextPattern('single');
    };

    useEffect(() => {
        if (isOpen) {
            if (formToEdit) {
                setTitle(formToEdit.title);
                setDescription(formToEdit.description);
                setCategoryId(formToEdit.categoryId);
                setFields(formToEdit.fields);
                setDueDate(formToEdit.dueDate || '');
                setRecurrence(formToEdit.recurrence);
                setFormCode(formToEdit.formCode || '');
                setApprovalDate(formToEdit.approvalDate || '');
                setVersion(formToEdit.version || '');
                setUnit(formToEdit.unit || '');
                setApprovalCode(formToEdit.approvalCode || '');
                setDocumentRequestNumber(formToEdit.documentRequestNumber || '');
                setDisplayMode(formToEdit.displayMode || 'SINGLE_PAGE');
                setEnableCalculations(formToEdit.enableCalculations || false);
                setMaxScore(formToEdit.maxScore || 0);
                setVariables(formToEdit.variables || []);
                setTab('design');
                setSelectedFieldId(null);
                 setMobileView('canvas');
            } else {
                resetForm();
            }
        }
    }, [isOpen, formToEdit, categories]);
    
    const addField = (type: FormFieldType) => {
        const newField = createNewFieldObject(type);
        setFields(prev => [...prev, newField]);
        if (type === 'SECTION') {
            setDisplayMode('MULTI_STEP');
        }
        if(isMobile) {
            setMobileView('canvas');
        }
    };

    const duplicateField = (id: string) => {
        const fieldIndex = fields.findIndex(f => f.id === id);
        if (fieldIndex === -1) return;
    
        const originalField = fields[fieldIndex];
        // Deep copy and generate new IDs
        const newField = JSON.parse(JSON.stringify(originalField));
        
        newField.id = `field-${Date.now()}`;
        if (newField.options) {
            newField.options = newField.options.map((opt: FormFieldOption) => ({ ...opt, id: `opt-${Date.now()}-${Math.random()}` }));
        }
        if (newField.matrixRows) {
            newField.matrixRows = newField.matrixRows.map((opt: FormFieldOption) => ({ ...opt, id: `row-${Date.now()}-${Math.random()}` }));
        }
        if (newField.matrixColumns) {
            newField.matrixColumns = newField.matrixColumns.map((opt: FormFieldOption) => ({ ...opt, id: `col-${Date.now()}-${Math.random()}` }));
        }
        if (newField.subFields) {
            newField.subFields = newField.subFields.map((sf: FormField) => ({
                ...sf,
                id: `sub-${Date.now()}-${Math.random()}`
            }));
        }
    
        const newFields = [...fields];
        newFields.splice(fieldIndex + 1, 0, newField);
        setFields(newFields);
    };


    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: FormFieldType) => {
        e.dataTransfer.setData('text/plain', type);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        
        // If it's an internal move, do nothing here and let onDragEnd (handleSort) handle it.
        if (e.dataTransfer.types.includes('internal-move')) {
            return;
        }
        
        const type = e.dataTransfer.getData('text/plain') as FormFieldType;
        if (type && FIELD_PALETTE_ITEMS.some(cat => cat.fields.some(f => f.type === type))) {
            const newField = createNewFieldObject(type);
            
            // Find which field we dropped on
            const droppedOnElement = (e.target as HTMLElement).closest('[data-field-id]');
            let dropIndex = fields.length;
    
            if (droppedOnElement) {
                const fieldId = droppedOnElement.getAttribute('data-field-id');
                const index = fields.findIndex(f => f.id === fieldId);
                if (index !== -1) {
                    const rect = droppedOnElement.getBoundingClientRect();
                    const midpoint = rect.top + rect.height / 2;
                    if (e.clientY < midpoint) {
                        dropIndex = index;
                    } else {
                        dropIndex = index + 1;
                    }
                }
            }
    
            const newFields = [...fields];
            newFields.splice(dropIndex, 0, newField);
            
            setFields(newFields);
        }
    };
    
    const handleFieldUpdate = (id: string, updates: Partial<FormField>) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleMatrixOptionUpdate = (fieldId: string, type: 'matrixRows' | 'matrixColumns', optionId: string, newLabel: string) => {
        setFields(prev => prev.map(f => {
            if (f.id === fieldId && f[type]) {
                return { ...f, [type]: (f[type] as FormFieldOption[]).map(o => o.id === optionId ? { ...o, label: newLabel } : o) };
            }
            return f;
        }));
    };
    
    const addMatrixOption = (fieldId: string, type: 'matrixRows' | 'matrixColumns') => {
        setFields(prev => prev.map(f => {
            if (f.id === fieldId) {
                const currentOptions = f[type] || [];
                const prefix = type === 'matrixRows' ? 'ردیف' : 'ستون';
                return { ...f, [type]: [...currentOptions, {id: `${type}-${Date.now()}`, label: `${prefix} ${currentOptions.length + 1}`}]};
            }
            return f;
        }));
    };
    
    const removeMatrixOption = (fieldId: string, type: 'matrixRows' | 'matrixColumns', optionId: string) => {
        setFields(prev => prev.map(f => {
            if (f.id === fieldId && f[type]) {
                return { ...f, [type]: (f[type] as FormFieldOption[]).filter(o => o.id !== optionId) };
            }
            return f;
        }));
    };


    const handleOptionUpdate = (fieldId: string, optionId: string, newLabel: string) => {
        setFields(prev => prev.map(f => {
            if (f.id === fieldId && f.options) {
                return { ...f, options: f.options.map(o => o.id === optionId ? { ...o, label: newLabel } : o) };
            }
            return f;
        }));
    };
    
    const addOption = (fieldId: string) => {
        setFields(prev => prev.map(f => {
             if (f.id === fieldId && f.options) {
                 return { ...f, options: [...f.options, {id: `opt-${Date.now()}`, label: `گزینه ${f.options.length + 1}`}]};
             }
             return f;
        }));
    };

    const removeOption = (fieldId: string, optionId: string) => {
        setFields(prev => prev.map(f => {
            if (f.id === fieldId && f.options) {
                return { ...f, options: f.options.filter(o => o.id !== optionId) };
            }
            return f;
        }));
    };

    const removeField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    const handleSort = () => {
        const draggedIndex = dragItem.current;
        const dropIndex = dragOverItem.current;

        // Always reset refs after drag ends
        dragItem.current = null;
        dragOverItem.current = null;

        if (draggedIndex === null || dropIndex === null || draggedIndex === dropIndex) {
            return;
        }
        
        const newFields = [...fields];
        const [draggedItem] = newFields.splice(draggedIndex, 1);
        newFields.splice(dropIndex, 0, draggedItem);
        setFields(newFields);
    };

    const handleSubmit = () => {
        if (!title.trim() || !categoryId) {
            alert('لطفا عنوان فرم و دسته بندی را مشخص کنید.');
            return;
        }
        onSubmit({ 
            ...(isEditing && { id: formToEdit.id }),
            title, 
            description, 
            categoryId, 
            fields,
            dueDate: dueDate || undefined,
            recurrence,
            formCode: formCode || undefined,
            approvalDate: approvalDate || undefined,
            version: version || undefined,
            unit: unit || undefined,
            approvalCode: approvalCode || undefined,
            documentRequestNumber: documentRequestNumber || undefined,
            nextSerialNumber: isEditing ? formToEdit.nextSerialNumber || 0 : 0,
            displayMode,
            enableCalculations,
            maxScore,
            variables
        });
    };

    const handleCreateFromText = () => {
        if (!textInput.trim()) {
            alert('لطفا حداقل یک سوال وارد کنید.');
            return;
        }

        const createField = (label: string, type: FormFieldType, placeholder?: string): FormField => {
            const field: FormField = {
                id: `field-text-${Date.now()}-${Math.random()}`,
                label,
                placeholder,
                type,
                isRequired: false,
            };
            if (['SELECT', 'RADIO', 'CHECKBOX'].includes(type)) {
                field.options = [{ id: `opt-${Date.now()}`, label: 'گزینه ۱' }];
            }
            if (type === 'MATRIX_SINGLE') {
                field.matrixRows = [{id: `row-${Date.now()}`, label: 'ردیف ۱'}];
                field.matrixColumns = [{id: `col-${Date.now()}`, label: 'ستون ۱'}];
            }
            return field;
        };
    
        let newFields: FormField[] = [];
        const lines = textInput.split('\n');
    
        if (textPattern === 'single') {
            newFields = lines
                .filter(line => line.trim() !== '')
                .map(line => createField(line.trim(), selectedFieldTypeForText));
        } else if (textPattern === 'multi') {
            for (let i = 0; i < lines.length; i += 2) {
                const label = lines[i]?.trim();
                if (label) {
                    const placeholder = (lines[i + 1] || '').trim();
                    newFields.push(createField(label, selectedFieldTypeForText, placeholder));
                }
            }
        } else if (textPattern === 'slash') {
            const slashIndex = lines.findIndex(line => line.trim() === '/');
            if (slashIndex === -1) {
                newFields = lines
                    .filter(line => line.trim() !== '')
                    .map(line => createField(line.trim(), selectedFieldTypeForText));
            } else {
                const titles = lines.slice(0, slashIndex).map(l => l.trim()).filter(l => l !== '');
                const placeholders = lines.slice(slashIndex + 1).map(l => l.trim()).filter(l => l !== '');
                titles.forEach((title, index) => {
                    const placeholder = placeholders[index] || undefined;
                    newFields.push(createField(title, selectedFieldTypeForText, placeholder));
                });
            }
        } else if (textPattern === 'qa') {
            const typeMap: { [key: string]: FormFieldType } = {
                '1': 'CONFIRMATION', '2': 'APPROVAL', '3': 'RATING',
                '4': 'NUMBER', '5': 'SELECT', '6': 'TEXT',
                '7': 'TEXTAREA', '8': 'RADIO', '9': 'FILE_UPLOAD',
                '10': 'SIGNATURE', '11': 'DATE', '12': 'MATRIX_SINGLE',
            };
            
            const slashIndices: number[] = [];
            lines.forEach((line, index) => {
                if (line.trim() === '/') {
                    slashIndices.push(index);
                }
            });

            if (slashIndices.length < 2) {
                alert('الگوی سوال و پاسخ نیاز به حداقل دو جداکننده / دارد: یکی پس از عنوان‌ها و دیگری پس از راهنماها.');
                return;
            }

            const titles = lines.slice(0, slashIndices[0]).map(l => l.trim()).filter(l => l);
            const placeholders = lines.slice(slashIndices[0] + 1, slashIndices[1]).map(l => l.trim()).filter(l => l);
            const types = lines.slice(slashIndices[1] + 1).map(l => l.trim()).filter(l => l);
            
            titles.forEach((title, index) => {
                const placeholder = placeholders[index] || undefined;
                const typeCode = types[index];
                const fieldType = typeCode && typeMap[typeCode] ? typeMap[typeCode] : 'TEXT';
                newFields.push(createField(title, fieldType, placeholder));
            });
        }
    
        setFields(prev => [...prev, ...newFields]);
        setTextInput('');
        setTab('design');
    };


    const handleGenerateFromAI = async () => {
        if (!uploadedFile && !aiPrompt.trim()) {
            alert('لطفاً یک فایل بارگذاری کنید یا توضیحات فرم را بنویسید.');
            return;
        }
    
        setIsGenerating(true);
        try {
            let fileData: { mimeType: string; data: string } | undefined = undefined;
            if (uploadedFile) {
                const base64 = await fileToBase64(uploadedFile);
                fileData = { mimeType: uploadedFile.type, data: base64 };
            }
            
            const generated = await generateFormFields(
                aiPrompt, 
                aiPrompts.generateFormFromPrompt,
                fileData
            );
    
            const newFields: FormField[] = generated.map((genField, index) => ({
                id: `field-ai-${Date.now()}-${index}`,
                label: genField.label,
                type: genField.type,
                isRequired: genField.isRequired || false,
                placeholder: genField.placeholder,
                icon: genField.icon,
                options: genField.options?.map((opt, i) => ({ id: `opt-${Date.now()}-${index}-${i}`, label: opt })),
                matrixRows: genField.matrixRows?.map((opt, i) => ({ id: `row-${Date.now()}-${index}-${i}`, label: opt })),
                matrixColumns: genField.matrixColumns?.map((opt, i) => ({ id: `col-${Date.now()}-${index}-${i}`, label: opt })),
            }));
    
            setFields(prev => [...prev, ...newFields]);
            setTab('design');
            setAiPrompt('');
            setUploadedFile(null);
    
        } catch (error) {
            console.error(error);
            alert('خطا در ایجاد فرم با هوش مصنوعی. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const hasSections = fields.some(f => f.type === 'SECTION');

    const selectedField = fields.find(f => f.id === selectedFieldId);
    const hasCalculableFields = fields.some(f => calculableFieldTypes.includes(f.type));

    const handleSubFieldUpdate = (fieldId: string, subFieldId: string, updates: Partial<FormField>) => {
        setFields(prevFields => prevFields.map(f => {
            if (f.id === fieldId) {
                const newSubFields = f.subFields?.map(sf => 
                    sf.id === subFieldId ? { ...sf, ...updates } : sf
                );
                return { ...f, subFields: newSubFields };
            }
            return f;
        }));
    };

    const addSubField = (fieldId: string) => {
        const newSubField: FormField = {
            id: `sub-${Date.now()}`,
            label: `ستون جدید`,
            type: 'TEXT',
            isRequired: false
        };
        setFields(prevFields => prevFields.map(f => {
            if (f.id === fieldId) {
                return { ...f, subFields: [...(f.subFields || []), newSubField] };
            }
            return f;
        }));
    };
    
    const removeSubField = (fieldId: string, subFieldId: string) => {
        setFields(prevFields => prevFields.map(f => {
            if (f.id === fieldId) {
                return { ...f, subFields: f.subFields?.filter(sf => sf.id !== subFieldId) };
            }
            return f;
        }));
    };


    if (!isOpen) return null;

    const canvasContent = (
         <div className="max-w-3xl mx-auto p-4 sm:p-8">
            <div className="mb-6 border rounded-lg">
                <button type="button" onClick={() => setIsSpecVisible(!isSpecVisible)} className="w-full flex justify-between items-center p-3 bg-gray-100/60 rounded-t-lg">
                    <h3 className="font-semibold text-brand-text flex items-center">
                        <DocumentTextIcon className="w-5 h-5 ml-2 text-gray-500"/>
                        مشخصات فرم
                    </h3>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isSpecVisible ? '' : '-rotate-90'}`} />
                </button>
                {isSpecVisible && (
                    <div className="p-4 space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-brand-subtext">کد فرم (برای لینک یکتا)</label>
                                <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} className="w-full text-sm border-gray-200 rounded-md p-2 mt-1" />
                                {generatedLink && (
                                    <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded-md break-all">
                                        <span className="font-semibold">لینک فرم: </span>
                                        <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{generatedLink}</a>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-medium text-brand-subtext">کد تایید فرم</label>
                                <input type="text" value={approvalCode} onChange={e => setApprovalCode(e.target.value)} className="w-full text-sm border-gray-200 rounded-md p-2 mt-1" />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-medium text-brand-subtext">واحد</label>
                                <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className="w-full text-sm border-gray-200 rounded-md p-2 mt-1" />
                            </div>
                             <div>
                                <label className="text-xs font-medium text-brand-subtext">نسخه ویرایش</label>
                                <input type="text" value={version} onChange={e => setVersion(e.target.value)} className="w-full text-sm border-gray-200 rounded-md p-2 mt-1" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-brand-subtext">تاریخ تایید</label>
                                <div className="p-2 border border-gray-200 rounded-md mt-1 bg-white">
                                    <DueDateSelector value={approvalDate} onChange={setApprovalDate} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-brand-subtext">دسته بندی</label>
                                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full text-sm border-gray-200 rounded-md p-2 mt-1 bg-white">
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.title}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-medium text-brand-subtext">تاریخ سررسید</label>
                                <div className="p-2 border border-gray-200 rounded-md mt-1 bg-white">
                                    <DueDateSelector value={dueDate} onChange={setDueDate} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-brand-subtext">تکرار</label>
                                <select 
                                    value={recurrence?.frequency || ''} 
                                    onChange={e => setRecurrence(e.target.value ? {frequency: e.target.value as any} : undefined)} 
                                    className="w-full text-sm border-gray-200 rounded-md p-2 mt-1 bg-white"
                                >
                                    <option value="">بدون تکرار</option>
                                    <option value="hourly">هر ساعت</option>
                                    <option value="every-2-hours">هر دو ساعت</option>
                                    <option value="every-3-hours">هر سه ساعت</option>
                                    <option value="every-6-hours">هر شش ساعت</option>
                                    <option value="daily">روزانه</option>
                                    <option value="weekly">هر هفته</option>
                                    <option value="bi-weekly">هر دو هفته</option>
                                    <option value="monthly">ماهانه</option>
                                    <option value="quarterly">هر سه ماه</option>
                                    <option value="semi-annually">هر شش ماه</option>
                                    <option value="annually">سالانه</option>
                                </select>
                            </div>
                        </div>
                         <div>
                            <label className="text-xs font-medium text-brand-subtext">شماره درخواست مدرک</label>
                            <input type="text" value={documentRequestNumber} onChange={e => setDocumentRequestNumber(e.target.value)} className="w-full text-sm border-gray-200 rounded-md p-2 mt-1" />
                        </div>
                         {hasSections && (
                            <div>
                                <label className="text-xs font-medium text-brand-subtext">حالت نمایش فرم</label>
                                <select 
                                    value={displayMode} 
                                    onChange={e => setDisplayMode(e.target.value as any)} 
                                    className="w-full text-sm border-gray-200 rounded-md p-2 mt-1 bg-white"
                                >
                                    <option value="SINGLE_PAGE">نمایش معمولی (یک صفحه‌ای)</option>
                                    <option value="MULTI_STEP">نمایش بخش به بخش</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>
             <div className="mb-8">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان فرم" className="text-2xl md:text-3xl font-bold w-full border-none focus:ring-0 p-1 -m-1" />
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="توضیحات فرم (اختیاری)" className="text-sm text-brand-subtext w-full border-none focus:ring-0 resize-none p-1 -m-1 mt-2" rows={1}></textarea>
            </div>

            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} className="space-y-4 min-h-[200px] border-2 border-dashed rounded-lg p-4">
                {fields.map((field, index) => {
                    if (field.type === 'SECTION') {
                        const SectionIcon = ICONS[field.icon || 'ViewColumnsIcon'] || ViewColumnsIcon;
                        return (
                            <div 
                                key={field.id} 
                                data-field-id={field.id}
                                onClick={() => { setSelectedFieldId(field.id); if (isMobile) setMobileView('settings'); }}
                                draggable={!isMobile}
                                onDragStart={(e) => { dragItem.current = index; e.dataTransfer.setData('internal-move', String(index)); }}
                                onDragEnter={() => dragOverItem.current = index}
                                onDragEnd={handleSort}
                                onDragOver={e => e.preventDefault()}
                                className={`py-2 my-4 border-t-2 border-b-2 rounded-lg cursor-pointer transition-colors ${selectedFieldId === field.id && !isMobile ? 'border-brand-primary bg-blue-50/50' : 'border-gray-200 bg-gray-50/50'}`}
                            >
                                <div className="flex justify-between items-center px-2">
                                    <div className="flex items-center text-lg font-bold text-brand-text">
                                        <SectionIcon className="w-6 h-6 ml-3 text-gray-600"/>
                                        {field.label}
                                    </div>
                                    <div className="flex items-center">
                                        <button type="button" onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }} className="p-1 text-gray-400 hover:text-blue-500"><ClipboardCopyIcon className="w-4 h-4"/></button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                     if (field.type === 'DYNAMIC_TABLE') {
                        return (
                            <div 
                                key={field.id} 
                                data-field-id={field.id}
                                onClick={() => { setSelectedFieldId(field.id); if (isMobile) setMobileView('settings'); }}
                                draggable={!isMobile}
                                onDragStart={(e) => { dragItem.current = index; e.dataTransfer.setData('internal-move', String(index)); }}
                                onDragEnter={() => dragOverItem.current = index}
                                onDragEnd={handleSort}
                                onDragOver={e => e.preventDefault()}
                                className={`p-4 rounded-lg cursor-pointer border-2 transition-colors ${selectedFieldId === field.id && !isMobile ? 'border-brand-primary bg-blue-50/50' : 'border-transparent bg-gray-100/70 hover:border-gray-300'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <label className="font-semibold text-brand-text">{field.label} {field.isRequired && <span className="text-red-500">*</span>}</label>
                                    </div>
                                     <div className="flex items-center">
                                        <button type="button" onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }} className="p-1 text-gray-400 hover:text-blue-500"><ClipboardCopyIcon className="w-4 h-4"/></button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <div className="mt-2 p-2 border border-dashed rounded-md bg-white/50">
                                    <p className="text-xs text-gray-500 mb-1">ستون‌ها:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {field.subFields?.map(sf => (
                                            <span key={sf.id} className="text-xs bg-gray-200 px-2 py-1 rounded">{sf.label} ({sf.type})</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div 
                            key={field.id} 
                            data-field-id={field.id}
                            onClick={() => { setSelectedFieldId(field.id); if (isMobile) setMobileView('settings'); }}
                            draggable={!isMobile}
                            onDragStart={(e) => { dragItem.current = index; e.dataTransfer.setData('internal-move', String(index)); }}
                            onDragEnter={() => dragOverItem.current = index}
                            onDragEnd={handleSort}
                            onDragOver={e => e.preventDefault()}
                            className={`p-4 rounded-lg cursor-pointer border-2 transition-colors ${selectedFieldId === field.id && !isMobile ? 'border-brand-primary bg-blue-50/50' : 'border-transparent bg-gray-100/70 hover:border-gray-300'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <label className="font-semibold text-brand-text">{field.label} {field.isRequired && <span className="text-red-500">*</span>}</label>
                                    <p className="text-xs text-brand-subtext">{field.placeholder}</p>
                                </div>
                                <div className="flex items-center">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }} className="p-1 text-gray-400 hover:text-blue-500"><ClipboardCopyIcon className="w-4 h-4"/></button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {fields.length === 0 && <p className="text-center text-brand-subtext">برای شروع، یک فیلد را از پنل کناری به اینجا بکشید یا از تب "ایجاد از روی متن" استفاده کنید.</p>}
            </div>
        </div>
    );

    const paletteContent = (
        <div className="p-4">
            <h3 className="font-semibold mb-3">فیلدها</h3>
            {FIELD_PALETTE_ITEMS.map(cat => (
                <div key={cat.category} className="mb-4">
                    <h4 className="text-xs font-bold text-gray-500 mb-2">{cat.category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {cat.fields.map(field => (
                            <div 
                                key={field.type} 
                                draggable={!isMobile} 
                                onDragStart={(e) => handleDragStart(e, field.type)}
                                onClick={isMobile ? () => addField(field.type) : undefined}
                                className="p-2 bg-white border rounded-lg flex flex-col items-center cursor-grab hover:bg-gray-100 hover:border-brand-primary"
                            >
                                <field.Icon className="w-6 h-6 mb-1 text-brand-primary" />
                                <span className="text-xs text-center">{field.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
    
    const sectionIcons = ['UserIcon', 'DocumentTextIcon', 'CalendarIcon', 'BanknotesIcon', 'ExclamationTriangleIcon', 'ChecklistIcon', 'ClipboardListIcon', 'FolderIcon', 'HeartIcon', 'LightbulbIcon', 'StarIcon', 'RocketIcon'];
    
    const settingsContent = selectedField && (
        selectedField.type === 'SECTION' ? (
             <div className="p-4 space-y-4">
                <h3 className="font-semibold">تنظیمات بخش</h3>
                 <div>
                     <label className="text-xs font-medium">عنوان بخش</label>
                     <input type="text" value={selectedField.label} onChange={e => handleFieldUpdate(selectedField.id, { label: e.target.value })} className="mt-1 w-full text-sm border-gray-300 rounded-md" />
                 </div>
                 <div>
                    <label className="text-xs font-medium">توضیحات (اختیاری)</label>
                    <textarea value={selectedField.description || ''} onChange={e => handleFieldUpdate(selectedField.id, { description: e.target.value })} rows={3} className="mt-1 w-full text-sm border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label className="text-xs font-medium">آیکون</label>
                    <div className="mt-2 grid grid-cols-6 gap-2">
                        {sectionIcons.map(iconName => {
                            const IconComponent = ICONS[iconName];
                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => handleFieldUpdate(selectedField.id, { icon: iconName })}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-colors ${selectedField.icon === iconName ? 'border-brand-primary bg-blue-50' : 'border-gray-200 hover:bg-gray-100'}`}
                                >
                                    <IconComponent className="w-6 h-6 text-gray-600" />
                                </button>
                            );
                        })}
                    </div>
                </div>
                 {!isMobile && (
                    <button type="button" onClick={() => setSelectedFieldId(null)} className="w-full mt-4 py-1.5 text-sm bg-gray-200 rounded-md hover:bg-gray-300">بازگشت به فیلدها</button>
                 )}
            </div>
        ) : (
             <div className="p-4 space-y-4">
                 <h3 className="font-semibold">تنظیمات فیلد</h3>
                 <div>
                     <label className="text-xs font-medium">عنوان فیلد</label>
                     <input type="text" value={selectedField.label} onChange={e => handleFieldUpdate(selectedField.id, { label: e.target.value })} className="mt-1 w-full text-sm border-gray-300 rounded-md" />
                 </div>
                  <div>
                     <label className="text-xs font-medium">متن راهنما (Placeholder)</label>
                     <input type="text" value={selectedField.placeholder || ''} onChange={e => handleFieldUpdate(selectedField.id, { placeholder: e.target.value })} className="mt-1 w-full text-sm border-gray-300 rounded-md" />
                 </div>
                 <div className="flex items-center">
                    <input type="checkbox" checked={selectedField.isRequired} onChange={e => handleFieldUpdate(selectedField.id, { isRequired: e.target.checked })} className="ml-2 rounded text-brand-primary" />
                    <label className="text-sm">الزامی</label>
                 </div>

                <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold mb-2 text-gray-600">گزینه های اضافی</h4>
                    <div className="space-y-2">
                        <label className="flex items-center justify-between cursor-pointer p-1">
                            <span className="text-sm">امکان پیوست عکس</span>
                            <input 
                                type="checkbox" 
                                checked={!!selectedField.allowPhoto} 
                                onChange={e => handleFieldUpdate(selectedField.id, { allowPhoto: e.target.checked })} 
                                className="ml-2 h-4 w-4 rounded text-brand-primary" 
                            />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-1">
                            <span className="text-sm">امکان ثبت یادداشت</span>
                            <input 
                                type="checkbox" 
                                checked={!!selectedField.allowNote} 
                                onChange={e => handleFieldUpdate(selectedField.id, { allowNote: e.target.checked })} 
                                className="ml-2 h-4 w-4 rounded text-brand-primary" 
                            />
                        </label>
                    </div>
                </div>

                 {(selectedField.type === 'SELECT' || selectedField.type === 'RADIO' || selectedField.type === 'CHECKBOX') && (
                     <div className="border-t pt-4">
                         <h4 className="text-sm font-semibold mb-2">گزینه‌ها</h4>
                         <div className="space-y-2">
                             {selectedField.options?.map(opt => (
                                 <div key={opt.id} className="flex items-center">
                                     <input type="text" value={opt.label} onChange={e => handleOptionUpdate(selectedField.id, opt.id, e.target.value)} className="flex-grow text-sm border-gray-300 rounded-md" />
                                     <button type="button" onClick={() => removeOption(selectedField.id, opt.id)} className="p-1 text-gray-400 hover:text-red-500 mr-1"><TrashIcon className="w-4 h-4"/></button>
                                 </div>
                             ))}
                         </div>
                         <button type="button" onClick={() => addOption(selectedField.id)} className="mt-2 text-sm text-brand-primary flex items-center"><PlusIcon className="w-4 h-4 ml-1"/> افزودن گزینه</button>
                     </div>
                 )}

                {selectedField.type === 'MATRIX_SINGLE' && (
                    <div className="border-t pt-4 space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold mb-2">ردیف‌ها</h4>
                            <div className="space-y-2">
                                {selectedField.matrixRows?.map(row => (
                                    <div key={row.id} className="flex items-center">
                                        <input type="text" value={row.label} onChange={e => handleMatrixOptionUpdate(selectedField.id, 'matrixRows', row.id, e.target.value)} className="flex-grow text-sm border-gray-300 rounded-md" />
                                        <button type="button" onClick={() => removeMatrixOption(selectedField.id, 'matrixRows', row.id)} className="p-1 text-gray-400 hover:text-red-500 mr-1"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => addMatrixOption(selectedField.id, 'matrixRows')} className="mt-2 text-sm text-brand-primary flex items-center"><PlusIcon className="w-4 h-4 ml-1"/> افزودن ردیف</button>
                        </div>
                         <div>
                            <h4 className="text-sm font-semibold mb-2">ستون‌ها</h4>
                            <div className="space-y-2">
                                {selectedField.matrixColumns?.map(col => (
                                    <div key={col.id} className="flex items-center">
                                        <input type="text" value={col.label} onChange={e => handleMatrixOptionUpdate(selectedField.id, 'matrixColumns', col.id, e.target.value)} className="flex-grow text-sm border-gray-300 rounded-md" />
                                        <button type="button" onClick={() => removeMatrixOption(selectedField.id, 'matrixColumns', col.id)} className="p-1 text-gray-400 hover:text-red-500 mr-1"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => addMatrixOption(selectedField.id, 'matrixColumns')} className="mt-2 text-sm text-brand-primary flex items-center"><PlusIcon className="w-4 h-4 ml-1"/> افزودن ستون</button>
                        </div>
                    </div>
                )}
                 {selectedField.type === 'DYNAMIC_TABLE' && (
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold mb-2">مدیریت ستون‌ها</h4>
                        <div className="space-y-2">
                            {selectedField.subFields?.map((sf) => (
                                <div key={sf.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <input 
                                        type="text" 
                                        value={sf.label} 
                                        onChange={e => handleSubFieldUpdate(selectedField.id, sf.id, { label: e.target.value })}
                                        className="flex-grow text-sm border-gray-300 rounded-md p-1"
                                    />
                                    <select 
                                        value={sf.type} 
                                        onChange={e => handleSubFieldUpdate(selectedField.id, sf.id, { type: e.target.value as FormFieldType })}
                                        className="text-sm border-gray-300 rounded-md p-1"
                                    >
                                        <option value="TEXT">متن</option>
                                        <option value="NUMBER">عدد</option>
                                        <option value="DATE">تاریخ</option>
                                        <option value="CHECKBOX">چک‌باکس</option>
                                    </select>
                                    <button type="button" onClick={() => removeSubField(selectedField.id, sf.id)} className="p-1 text-gray-400 hover:text-red-500">
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={() => addSubField(selectedField.id)} className="mt-2 text-sm text-brand-primary flex items-center"><PlusIcon className="w-4 h-4 ml-1"/> افزودن ستون</button>
                    </div>
                )}
                {(selectedField.type === 'SIGNATURE') && (
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold mb-2">امضا کنندگان</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium">امضا کننده اول (الزامی)</label>
                                <select
                                    value={selectedField.signerUserIds?.[0] || ''}
                                    onChange={e => {
                                        const newSigners = [...(selectedField.signerUserIds || [])];
                                        newSigners[0] = e.target.value;
                                        handleFieldUpdate(selectedField.id, { signerUserIds: newSigners.filter(Boolean) });
                                    }}
                                    className="mt-1 w-full text-sm border-gray-300 rounded-md"
                                >
                                    <option value="">انتخاب کاربر...</option>
                                    {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium">امضا کننده دوم (اختیاری)</label>
                                <select
                                    value={selectedField.signerUserIds?.[1] || ''}
                                    onChange={e => {
                                        const newSigners = [...(selectedField.signerUserIds || [])];
                                        newSigners[1] = e.target.value;
                                        if (!newSigners[0] && newSigners[1]) {
                                            alert("لطفا ابتدا امضا کننده اول را انتخاب کنید.");
                                            return;
                                        }
                                        handleFieldUpdate(selectedField.id, { signerUserIds: newSigners.filter(Boolean) });
                                    }}
                                    className="mt-1 w-full text-sm border-gray-300 rounded-md"
                                    disabled={!selectedField.signerUserIds?.[0]}
                                >
                                    <option value="">انتخاب کاربر...</option>
                                    {users.map(user => (
                                        <option
                                            key={user.id}
                                            value={user.id}
                                            disabled={selectedField.signerUserIds?.[0] === user.id}
                                        >
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                {!isMobile && (
                     <button type="button" onClick={() => setSelectedFieldId(null)} className="w-full mt-4 py-1.5 text-sm bg-gray-200 rounded-md hover:bg-gray-300">بازگشت به فیلدها</button>
                )}
             </div>
        )
    );

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-0 md:p-4">
            <div className="bg-brand-secondary rounded-none md:rounded-lg w-full h-full max-w-6xl max-h-full md:max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 flex justify-between items-center p-3 border-b bg-white rounded-t-lg">
                    <div className="flex items-center space-x-2 space-x-reverse">
                       <div className="flex items-center space-x-1 space-x-reverse p-1 bg-gray-200/60 rounded-lg">
                           <button type="button" onClick={() => setTab('design')} className={`px-3 py-1 text-sm rounded-md ${tab === 'design' ? 'bg-white shadow-sm' : ''}`}>طراحی</button>
                           <button type="button" onClick={() => setTab('variables')} className={`flex items-center px-3 py-1 text-sm rounded-md ${tab === 'variables' ? 'bg-white shadow-sm' : ''}`}>
                               <TagIcon className="w-4 h-4 ml-1" />
                               متغییرها
                            </button>
                           {hasCalculableFields && (
                                <button type="button" onClick={() => setTab('calculations')} className={`flex items-center px-3 py-1 text-sm rounded-md ${tab === 'calculations' ? 'bg-white shadow-sm' : ''}`}>
                                    <CalculatorIcon className="w-4 h-4 ml-1" />
                                    محاسبات
                                </button>
                           )}
                           <button type="button" onClick={() => setTab('fromText')} className={`px-3 py-1 text-sm rounded-md ${tab === 'fromText' ? 'bg-white shadow-sm' : ''}`}>ایجاد از روی متن</button>
                           <button type="button" onClick={() => setTab('aiCreate')} className={`px-3 py-1 text-sm rounded-md ${tab === 'aiCreate' ? 'bg-white shadow-sm' : ''}`}>ایجاد هوشمند</button>
                           <button type="button" onClick={() => setTab('preview')} className={`px-3 py-1 text-sm rounded-md ${tab === 'preview' ? 'bg-white shadow-sm' : ''}`}>پیش‌نمایش</button>
                       </div>
                    </div>
                    <div className="flex items-center space-x-4 space-x-reverse">
                         <button type="button" onClick={handleSubmit} className="px-4 py-1.5 bg-brand-primary text-white text-sm font-semibold rounded-lg">
                            {isEditing ? 'ذخیره تغییرات' : 'ذخیره فرم'}
                         </button>
                        <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full"><CloseIcon className="w-5 h-5"/></button>
                    </div>
                </div>
                
                {/* Body */}
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
                    {/* Canvas / Preview */}
                    <div className={`flex-grow bg-white overflow-y-auto ${isMobile && mobileView !== 'canvas' ? 'hidden' : 'block'}`}>
                        {tab === 'design' && canvasContent}
                        {tab === 'variables' && <VariablesPanel fields={fields} variables={variables} setVariables={setVariables} />}
                        {tab === 'calculations' && <CalculationsPanel fields={fields} setFields={setFields} enableCalculations={enableCalculations} setEnableCalculations={setEnableCalculations} maxScore={maxScore} setMaxScore={setMaxScore} />}
                        {tab === 'preview' && (
                             <div className="max-w-3xl mx-auto p-4 sm:p-8">
                                <h2 className="text-3xl font-bold mb-2">{title || 'عنوان فرم'}</h2>
                                <p className="text-brand-subtext mb-8">{description || 'توضیحات فرم'}</p>
                                <fieldset disabled className="space-y-6">
                                    {fields.map(field => (
                                        <FormFieldRenderer
                                            key={field.id}
                                            field={field}
                                            value={undefined}
                                            onChange={() => {}}
                                            displayStyle={hasSections ? 'MINIMAL_CARD' : styleSettings.formDisplayStyle || 'DEFAULT'}
                                            styleSettings={styleSettings}
                                            currentUser={currentUser}
                                            users={users}
                                        />
                                    ))}
                                    {fields.length === 0 && <p className="text-center text-gray-500">فیلدی برای پیش‌نمایش وجود ندارد.</p>}
                                </fieldset>
                            </div>
                        )}
                        {tab === 'aiCreate' && (
                            <div className="p-4 sm:p-8 space-y-6 max-w-3xl mx-auto animate-fade-in">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-brand-text">ایجاد فرم با هوش مصنوعی</h2>
                                    <p className="text-brand-subtext mt-2">یک فایل بارگذاری کنید یا فرم مورد نظر خود را توصیف کنید تا هوش مصنوعی آن را برای شما بسازد.</p>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => setUploadedFile(e.target.files ? e.target.files[0] : null)}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center">
                                        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-full h-full">
                                            <DocumentArrowUpIcon className="w-10 h-10 text-gray-400 mb-2"/>
                                            <span className="font-semibold text-brand-primary">انتخاب فایل</span>
                                            <span className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX</span>
                                        </button>
                                        {uploadedFile && <p className="text-sm mt-2 text-green-600">فایل انتخاب شد: {uploadedFile.name}</p>}
                                    </div>
                                    <div className="p-4 border-2 border-dashed rounded-lg flex flex-col">
                                        <textarea
                                            value={aiPrompt}
                                            onChange={e => setAiPrompt(e.target.value)}
                                            rows={4}
                                            className="w-full text-sm border-none focus:ring-0 resize-none p-1 bg-transparent placeholder-gray-500"
                                            placeholder="یا فرم خود را اینجا توصیف کنید... &#10;مثال: یک فرم مرخصی با فیلدهای نام، نوع مرخصی، تاریخ شروع و پایان و توضیحات."
                                        />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <button
                                        onClick={handleGenerateFromAI}
                                        disabled={isGenerating}
                                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition-transform hover:scale-105 disabled:bg-gray-400 flex items-center justify-center mx-auto min-w-[200px]"
                                    >
                                        {isGenerating ? 'در حال ساخت...' : <><SparklesIcon className="w-5 h-5 ml-2"/> ساخت فرم</>}
                                    </button>
                                </div>
                            </div>
                        )}
                        {tab === 'fromText' && (
                            <div className="p-4 sm:p-8 space-y-4 max-w-3xl mx-auto animate-fade-in">
                                <h2 className="text-2xl font-bold">ایجاد فیلدها از روی متن</h2>
                                <p className="text-sm text-brand-subtext">سوالات خود را در کادر زیر وارد کنید. بر اساس تنظیمات، هر سطر یا هر چند سطر به یک فیلد تبدیل می‌شود.</p>
                                <textarea
                                    value={textInput}
                                    onChange={e => setTextInput(e.target.value)}
                                    rows={8}
                                    className="input-style w-full"
                                    placeholder={`مثال:&#10;نام و نام خانوادگی&#10;کد ملی&#10;دلیل درخواست مرخصی`}
                                />
                                <div className="pt-2 space-y-3">
                                    <label className="text-sm font-medium">الگوی ایجاد:</label>
                                    <div className="p-2 rounded-md border has-[:checked]:border-brand-primary has-[:checked]:bg-blue-50/50"><label className="flex items-center cursor-pointer"><input type="radio" name="textPattern" value="single" checked={textPattern === 'single'} onChange={() => setTextPattern('single')} className="ml-2 h-4 w-4 text-brand-primary focus:ring-brand-primary" /><span className="font-semibold">هر سطر یک فیلد</span></label></div>
                                    <div className="p-2 rounded-md border has-[:checked]:border-brand-primary has-[:checked]:bg-blue-50/50"><label className="flex items-center cursor-pointer"><input type="radio" name="textPattern" value="multi" checked={textPattern === 'multi'} onChange={() => setTextPattern('multi')} className="ml-2 h-4 w-4 text-brand-primary focus:ring-brand-primary" /><span className="font-semibold">الگوی دو خطی</span></label>{textPattern === 'multi' && (<p className="text-xs text-gray-500 mt-1 pl-6">هر ۲ سطر یک فیلد را تشکیل می‌دهد: سطر اول <strong>عنوان فیلد</strong> و سطر دوم <strong>متن راهنما (Placeholder)</strong> خواهد بود.</p>)}</div>
                                    <div className="p-2 rounded-md border has-[:checked]:border-brand-primary has-[:checked]:bg-blue-50/50"><label className="flex items-center cursor-pointer"><input type="radio" name="textPattern" value="slash" checked={textPattern === 'slash'} onChange={() => setTextPattern('slash')} className="ml-2 h-4 w-4 text-brand-primary focus:ring-brand-primary" /><span className="font-semibold">الگوی اسلش</span></label>{textPattern === 'slash' && (<p className="text-xs text-gray-500 mt-1 pl-6">هر سطر قبل از اسلش یک <strong>عنوان فیلد</strong> است. سطرهای بعد از اسلش به ترتیب <strong>متن‌های راهنما</strong> برای فیلدهای بالا هستند.</p>)}</div>
                                    <div className="p-2 rounded-md border has-[:checked]:border-brand-primary has-[:checked]:bg-blue-50/50"><label className="flex items-center cursor-pointer"><input type="radio" name="textPattern" value="qa" checked={textPattern === 'qa'} onChange={() => setTextPattern('qa')} className="ml-2 h-4 w-4 text-brand-primary focus:ring-brand-primary" /><span className="font-semibold">الگوی سوال و پاسخ</span></label>{textPattern === 'qa' && (<div className="text-xs text-gray-500 mt-1 pl-6 space-y-2"><p>متن خود را به سه بخش تقسیم کنید که با یک / در یک خط جدا از هم جدا شده‌اند. بخش اول <strong>عنوان‌ها</strong>، بخش دوم <strong>راهنماها</strong>، و بخش سوم <strong>کد نوع فیلد</strong> است.</p><details><summary className="cursor-pointer font-medium">مشاهده راهنمای کدها</summary><ul className="list-disc list-inside mt-1 columns-2"><li>1: بله/خیر</li><li>2: تایید/رد</li><li>3: امتیاز ستاره‌ای</li><li>4: عدد</li><li>5: لیست کشویی</li><li>6: متن کوتاه</li><li>7: متن بلند</li><li>8: گزینه تکی</li><li>9: آپلود فایل</li><li>10: امضا</li><li>11: تاریخ</li><li>12: ماتریس</li></ul></details></div>)}</div>
                                </div>
                                <div className={`flex items-center space-x-4 space-x-reverse pt-2 ${textPattern === 'qa' ? 'opacity-50' : ''}`}>
                                    <label className={`text-sm font-medium ${textPattern === 'qa' ? 'text-gray-400' : ''}`}>نوع فیلدها:</label>
                                    <select
                                        value={selectedFieldTypeForText}
                                        onChange={e => setSelectedFieldTypeForText(e.target.value as FormFieldType)}
                                        className="input-style"
                                        disabled={textPattern === 'qa'}
                                    >
                                        {FIELD_PALETTE_ITEMS.flatMap(cat => cat.fields).map(f => (
                                            <option key={f.type} value={f.type}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button onClick={handleCreateFromText} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg">افزودن به فرم</button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Right Panel (Palette / Settings) */}
                    <div className={`flex-shrink-0 w-full md:w-80 border-r bg-gray-100/70 overflow-y-auto ${isMobile && (mobileView === 'canvas') ? 'hidden' : 'block'}`}>
                         {isMobile && (
                            <div className="p-2 border-b flex items-center justify-between bg-white">
                                <button type="button" onClick={() => setMobileView('canvas')}><ArrowRightIcon className="w-5 h-5"/></button>
                                <div className="flex items-center space-x-1 space-x-reverse bg-gray-200 p-1 rounded-lg">
                                    <button type="button" onClick={() => setMobileView('palette')} className={`px-3 py-1 text-sm rounded-md ${mobileView === 'palette' ? 'bg-white shadow' : ''}`}>فیلدها</button>
                                    <button type="button" onClick={() => setMobileView('settings')} disabled={!selectedFieldId} className={`px-3 py-1 text-sm rounded-md ${mobileView === 'settings' ? 'bg-white shadow' : ''} disabled:text-gray-400`}>تنظیمات</button>
                                </div>
                                <div></div>
                            </div>
                        )}
                        <div className={`${isMobile && mobileView !== 'palette' ? 'hidden' : 'block'}`}>
                            {selectedFieldId && !isMobile ? settingsContent : paletteContent}
                        </div>
                         <div className={`${isMobile && mobileView === 'settings' ? 'block' : 'hidden'}`}>
                            {settingsContent}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormBuilderModal;