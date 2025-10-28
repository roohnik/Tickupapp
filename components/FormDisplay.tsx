import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Form, FormSubmission, FormFieldValue, User, StyleSettings, FormField, FormFieldType, CalculationSettings, NumberCalculationRule, ValueScore, OptionScore, FormDisplayStyle } from '../types';
import FormFieldRenderer from './FormFieldRenderer';
import { CloseIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, CheckCircleIcon, ChevronDownIcon, ICONS, ArrowLeftIcon, ArrowRightIcon, ClipboardDocumentCheckIcon, ChartIcon, PencilIcon, CameraIcon } from './Icons';
import { toPersianDate } from '../utils/dateUtils';
import BarChart from './charts/BarChart';
import DonutChart from './charts/DonutChart';
import ProgressBar from './ProgressBar';
import { calculateScoreForSubmission } from '../utils/formUtils';

interface FormDisplayProps {
    form: Form | null;
    submissions: FormSubmission[];
    users: User[];
    currentUser: User;
    onClose: () => void;
    onSubmit: (submissionData: Omit<FormSubmission, 'id' | 'status' | 'serialNumber'>) => void;
    onSaveDraft: (submissionData: Omit<FormSubmission, 'id' | 'status' | 'serialNumber'>) => void;
    draftSubmission?: FormSubmission;
    styleSettings: StyleSettings;
}

const FONT_SIZE_CLASSES: Record<StyleSettings['fontSize'], string> = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
}

const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


// =================================================================
// Dashboard Sub-components
// =================================================================

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-brand-text mb-4">{title}</h3>
        <div className="h-64">{children}</div>
    </div>
);

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
     <div className="bg-white p-4 rounded-lg border shadow-sm text-center">
        <p className="text-3xl font-bold text-brand-text">{value}</p>
        <p className="text-sm font-medium text-brand-subtext mt-1">{label}</p>
    </div>
);

const FormDashboard: React.FC<{ form: Form, submissions: FormSubmission[] }> = ({ form, submissions }) => {
    const chartColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ef4444', '#ec4899', '#6366f1', '#f59e0b'];
    const getColor = (index: number) => chartColors[index % chartColors.length];

    const dashboardData = useMemo(() => {
        const fieldAggregations: { [fieldId: string]: any } = {};
        let scoresData: { allScores: number[]; average: number; min: number; max: number; distribution: { label: string; value: number }[] } | null = null;
        let variableScoresData: { [variableId: string]: { name: string; icon: string; averageScore: number, maxScore: number } } = {};

        if (form.enableCalculations) {
            const allScores = submissions.map(s => calculateScoreForSubmission(s, form));
            const sum = allScores.reduce((a, b) => a + b, 0);
            const average = allScores.length > 0 ? sum / allScores.length : 0;
            const min = allScores.length > 0 ? Math.min(...allScores) : 0;
            const max = allScores.length > 0 ? Math.max(...allScores) : 0;
            
            const distribution: { label: string; value: number }[] = [];
            if (allScores.length > 0 && max > min) {
                const bucketCount = 5;
                const range = max - min;
                const bucketSize = range / bucketCount || 1;
                for (let i = 0; i < bucketCount; i++) {
                    const bucketMin = min + i * bucketSize;
                    const bucketMax = bucketMin + bucketSize;
                    const count = allScores.filter(score => score >= bucketMin && (i === bucketCount - 1 ? score <= bucketMax : score < bucketMax)).length;
                    distribution.push({ label: `${Math.round(bucketMin)}-${Math.round(bucketMax)}`, value: count });
                }
            } else if (allScores.length > 0) {
                 distribution.push({ label: `${min}`, value: allScores.length });
            }

            scoresData = { allScores, average, min, max, distribution };
            
            if (form.variables && form.variables.length > 0) {
                form.variables.forEach(variable => {
                    const variableFieldIds = variable.fieldIds;
                    const variableScores = submissions.map(s => calculateScoreForSubmission(s, form, variableFieldIds));
                    const variableMaxScore = variable.fieldIds.reduce((sum, fieldId) => {
                        const field = form.fields.find(f => f.id === fieldId);
                        if(!field || !field.calculationConfig) return sum;
                        const config = field.calculationConfig;
                        let fieldMax = 0;
                        if (config.optionScores) fieldMax = Math.max(0, ...config.optionScores.map(s => s.score || 0));
                        else if (config.valueScores) fieldMax = Math.max(0, ...config.valueScores.map(s => s.score || 0));
                        else if (config.ratingScores) fieldMax = Math.max(0, ...Object.values(config.ratingScores).map(s => Number(s) || 0));
                        else if (config.numberRules) fieldMax = Math.max(config.numberRules.defaultScore || 0, ...config.numberRules.rules.map(r => r.score || 0));
                        return sum + fieldMax;
                    }, 0);

                    const totalVarScore = variableScores.reduce((a, b) => a + b, 0);
                    variableScoresData[variable.id] = {
                        name: variable.name,
                        icon: variable.icon,
                        averageScore: variableScores.length > 0 ? totalVarScore / variableScores.length : 0,
                        maxScore: variableMaxScore
                    };
                });
            }
        }

        form.fields.forEach(field => {
            const allValues = submissions.map(s => s.values.find(v => v.fieldId === field.id)?.value).filter(v => v !== null && v !== undefined);
            
            switch (field.type) {
                case 'SELECT':
                case 'RADIO':
                case 'CONFIRMATION':
                case 'APPROVAL':
                case 'RATING': {
                    const counts: { [key: string]: number } = {};
                    allValues.forEach(val => {
                        const key = String(val);
                        counts[key] = (counts[key] || 0) + 1;
                    });
                    const chartData = Object.entries(counts).map(([label, value]) => ({ label, value }));
                    if(chartData.length > 0) fieldAggregations[field.id] = { type: field.type, label: field.label, data: chartData };
                    break;
                }
                case 'CHECKBOX': {
                    const counts: { [key: string]: number } = {};
                    const flatValues = allValues.flat();
                    flatValues.forEach(val => {
                        counts[String(val)] = (counts[String(val)] || 0) + 1;
                    });
                    const chartData = Object.entries(counts).map(([label, value]) => ({ label, value }));
                    if (chartData.length > 0) fieldAggregations[field.id] = { type: field.type, label: field.label, data: chartData };
                    break;
                }
                case 'NUMBER': {
                    const numericValues = allValues.map(Number).filter(n => !isNaN(n));
                    if (numericValues.length > 0) {
                        const sum = numericValues.reduce((a, b) => a + b, 0);
                        fieldAggregations[field.id] = {
                            type: 'STATS',
                            label: field.label,
                            data: [
                                { label: 'میانگین', value: (sum / numericValues.length).toFixed(1) },
                                { label: 'مجموع', value: sum.toLocaleString('fa-IR') },
                                { label: 'کمترین', value: Math.min(...numericValues).toLocaleString('fa-IR') },
                                { label: 'بیشترین', value: Math.max(...numericValues).toLocaleString('fa-IR') },
                            ]
                        };
                    }
                    break;
                }
            }
        });

        return { fieldAggregations, scores: scoresData, variableScores: variableScoresData };
    }, [form, submissions]);

    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50/70">
                <ChartIcon className="w-16 h-16 text-gray-300" />
                <h3 className="mt-4 text-xl font-semibold text-gray-600">داشبورد خالی است</h3>
                <p className="mt-1 text-gray-500">برای مشاهده تحلیل داده‌ها، ابتدا باید حداقل یک پاسخ ثبت شود.</p>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 bg-gray-50/70">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="تعداد پاسخ‌ها" value={submissions.length} />
                {dashboardData.scores && <StatCard label="میانگین امتیاز کل" value={dashboardData.scores.average.toFixed(1)} />}
            </div>
            
            {form.variables && form.variables.length > 0 && (
                 <div className="mb-6">
                    <h3 className="text-xl font-bold text-brand-text mb-4">امتیاز متغییرها</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(dashboardData.variableScores).map((varScore: { name: string; icon: string; averageScore: number; maxScore: number }, index) => {
                            const VarIcon = ICONS[varScore.icon];
                            const progress = varScore.maxScore > 0 ? (varScore.averageScore / varScore.maxScore) * 100 : 0;
                            return (
                                <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center">
                                            <VarIcon className="w-6 h-6 text-brand-primary ml-2" />
                                            <h4 className="font-semibold">{varScore.name}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-xl">{varScore.averageScore.toFixed(1)}</p>
                                            <p className="text-xs text-gray-500">از {varScore.maxScore}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <ProgressBar progress={progress} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dashboardData.scores && dashboardData.scores.distribution.length > 0 && (
                    <ChartCard title="توزیع امتیازات کل">
                        <BarChart data={dashboardData.scores.distribution.map((item, i) => ({ ...item, color: getColor(i) }))} />
                    </ChartCard>
                )}
                {Object.values(dashboardData.fieldAggregations).map((agg: any, index) => {
                    switch (agg.type) {
                        case 'SELECT':
                        case 'RADIO':
                        case 'CHECKBOX':
                        case 'RATING':
                            return (
                                <ChartCard key={index} title={agg.label}>
                                    <BarChart data={agg.data.map((item: any, i: number) => ({ ...item, color: getColor(i) }))} />
                                </ChartCard>
                            );
                        case 'CONFIRMATION':
                        case 'APPROVAL':
                             return (
                                <ChartCard key={index} title={agg.label}>
                                    <DonutChart data={agg.data.map((item: any, i: number) => ({ ...item, color: getColor(i) }))} totalValue={agg.data.reduce((sum: number, item: any) => sum + item.value, 0)} />
                                </ChartCard>
                            );
                        case 'STATS':
                             return (
                                <div key={index} className="bg-white p-4 rounded-lg border shadow-sm lg:col-span-2">
                                    <h3 className="font-semibold text-brand-text mb-4">{agg.label}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {agg.data.map((stat: any) => <StatCard key={stat.label} label={stat.label} value={stat.value} />)}
                                    </div>
                                </div>
                             );
                        default:
                            return null;
                    }
                })}
            </div>
        </div>
    );
};

const SummaryCard: React.FC<{
  stats: { positive: number; negative: number };
  blockNumber: number;
}> = ({ stats, blockNumber }) => (
  <div className="my-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg animate-fade-in">
    <div className="flex items-center">
      <CheckCircleIcon className="w-8 h-8 text-blue-500 mr-3 flex-shrink-0" />
      <div>
        <h4 className="font-bold text-blue-800">گزارش {blockNumber * 20} سوال اخیر</h4>
        <p className="text-sm text-blue-700 mt-1">
          شما به {stats.positive} سوال پاسخ مثبت و به {stats.negative} سوال پاسخ منفی دادید. به کار خود ادامه دهید!
        </p>
      </div>
    </div>
  </div>
);


const FormDisplay: React.FC<FormDisplayProps> = ({ form, submissions, users, currentUser, onClose, onSubmit, onSaveDraft, draftSubmission, styleSettings }) => {
    const [activeTab, setActiveTab] = useState<'form' | 'submissions' | 'dashboard'>('form');
    const [formValues, setFormValues] = useState<{ [fieldId: string]: Partial<Omit<FormFieldValue, 'fieldId' | 'label'>> }>({});
    const [formErrors, setFormErrors] = useState<{ [fieldId: string]: string }>({});
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'success'>('idle');
    const modalContentRef = useRef<HTMLDivElement>(null);
    const [isSpecVisible, setIsSpecVisible] = useState(false);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

    const { totalFields, filledFields } = useMemo(() => {
        if (!form) return { totalFields: 0, filledFields: 0 };

        const interactiveFields = form.fields.filter(f => f.type !== 'SECTION');
        
        const filledCount = interactiveFields.filter(field => {
            const entry = formValues[field.id];
            if (!entry) return false;

            const value = entry.value;

            if (value === undefined || value === null || value === '') return false;
            if (Array.isArray(value) && value.length === 0) return false;
            if (field.type === 'MATRIX_SINGLE' && typeof value === 'object' && Object.keys(value).length === 0) return false;
            
            return true;
        }).length;

        return { totalFields: interactiveFields.length, filledFields: filledCount };
    }, [form, formValues]);

    const completionProgress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

    const sections = useMemo(() => {
        if (!form) return [];
        
        const sectionsResult: { title: string, icon?: string, fields: FormField[] }[] = [];
        let currentSection: { title: string, icon?: string, fields: FormField[] } = {
            title: form.title, // Use form title as default for the first section
            fields: []
        };
    
        for (const field of form.fields) {
            if (field.type === 'SECTION') {
                if (currentSection.fields.length > 0) {
                    sectionsResult.push(currentSection);
                }
                currentSection = { title: field.label, icon: field.icon, fields: [] };
            } else {
                currentSection.fields.push(field);
            }
        }
        sectionsResult.push(currentSection);
    
        return sectionsResult.filter(s => s.fields.length > 0);
    }, [form]);

    const countableFieldsInfo = useMemo(() => {
        if (!form) return { total: 0, indices: [] };
        const countableFields = form.fields
            .map((field, index) => ({ field, index }))
            .filter(({ field }) => field.type === 'APPROVAL' || field.type === 'CONFIRMATION');
        return {
            total: countableFields.length,
            indices: countableFields.map(f => f.index)
        };
    }, [form]);


    const hasSectionsInForm = form?.fields.some(f => f.type === 'SECTION');
    const isModern2Style = styleSettings.primaryColor === '#F59E0B';
    
    let displayStyle = styleSettings.formDisplayStyle || 'DEFAULT';
    if (hasSectionsInForm) {
        if (displayStyle !== 'SPACIOUS_CARD' && displayStyle !== 'MINIMAL_CARD') {
            displayStyle = 'MINIMAL_CARD';
        }
    }
    const isCardStyle = displayStyle === 'MINIMAL_CARD' || displayStyle === 'SPACIOUS_CARD';
    

    useEffect(() => {
        if (form) {
            setFormErrors({});
            setActiveTab('form');
            setSubmissionState('idle');
            setIsSpecVisible(false);
            setCurrentSectionIndex(0);

            if (draftSubmission) {
                const initialValues = draftSubmission.values.reduce((acc, curr) => {
                    acc[curr.fieldId] = { value: curr.value, note: curr.note, photo: curr.photo };
                    return acc;
                }, {} as { [fieldId: string]: Partial<Omit<FormFieldValue, 'fieldId' | 'label'>> });
                setFormValues(initialValues);
            } else {
                setFormValues({});
            }
        }
    }, [form, draftSubmission]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!isFullScreen && modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFullScreen, onClose]);

    if (!form) return null;

    const handleMainValueChange = (fieldId: string, value: any) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: { ...(prev[fieldId] || {}), value },
        }));
        if (formErrors[fieldId]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const handleNoteChange = (fieldId: string, note: string) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: { ...(prev[fieldId] || {}), note },
        }));
    };

    const handlePhotoChange = (fieldId: string, photo: string) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: { ...(prev[fieldId] || {}), photo },
        }));
    };
    
    const handlePhotoRemove = (fieldId: string) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: { ...(prev[fieldId] || {}), photo: undefined },
        }));
    };

    const validateForm = (fieldsToValidate: FormField[]) => {
        const errors: { [fieldId: string]: string } = {};
        fieldsToValidate.forEach(field => {
            if (field.isRequired) {
                const value = formValues[field.id]?.value;
                if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                    errors[field.id] = 'این فیلد الزامی است.';
                }
            }
        });
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const validateCurrentSection = () => {
        if (form.displayMode !== 'MULTI_STEP' || sections.length <= 1) return true;
        const currentFields = sections[currentSectionIndex].fields;
        return validateForm(currentFields);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm(form.fields) || submissionState !== 'idle') {
            return;
        }

        setSubmissionState('submitting');
        
        setTimeout(() => {
            const values: FormFieldValue[] = form.fields.map(field => {
                const fieldData = formValues[field.id] || {};
                return {
                    fieldId: field.id,
                    label: field.label,
                    value: fieldData.value === undefined ? null : fieldData.value,
                    note: fieldData.note,
                    photo: fieldData.photo,
                };
            });

            onSubmit({
                formId: form.id,
                submittedAt: new Date().toISOString(),
                submittedById: currentUser.id,
                values,
            });
            
            setSubmissionState('success');

            setTimeout(() => {
                onClose();
            }, 1500);

        }, 1000);
    };
    
    const handleSaveDraft = () => {
        const values: FormFieldValue[] = form.fields.map(field => {
            const fieldData = formValues[field.id] || {};
            return {
                fieldId: field.id,
                label: field.label,
                value: fieldData.value === undefined ? null : fieldData.value,
                note: fieldData.note,
                photo: fieldData.photo,
            };
        });

        onSaveDraft({
            formId: form.id,
            submittedAt: new Date().toISOString(),
            submittedById: currentUser.id,
            values,
        });
        onClose();
    };

    const handleNext = () => {
        if (validateCurrentSection()) {
            if (currentSectionIndex < sections.length - 1) {
                setCurrentSectionIndex(i => i + 1);
            }
        }
    };

    const handlePrev = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(i => i + 1);
        }
    };
    
    const toggleFullScreen = () => {
        setIsFullScreen(prev => !prev);
    };
    
    const renderSubmissionValue = (value: FormFieldValue['value'], field?: FormField) => {
        const fieldType = field?.type;
        if (fieldType === 'DATE' && typeof value === 'string' && value) {
            return toPersianDate(value);
        }
         if (fieldType === 'DYNAMIC_TABLE' && Array.isArray(value)) {
            return (
                <table className="w-full text-xs border-collapse mt-1">
                    <thead className="bg-gray-100">
                        <tr>
                            {field?.subFields?.map(sf => <th key={sf.id} className="p-1 border text-right font-medium">{sf.label}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {value.map((row, index) => (
                            <tr key={index} className="border-t">
                                {field?.subFields?.map(sf => (
                                    <td key={sf.id} className="p-1 border">{String(row[sf.id] ?? '')}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        if (typeof value === 'boolean') {
            return value ? <span className="text-green-600 font-semibold">بله</span> : <span className="text-red-600 font-semibold">خیر</span>;
        }
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        if (typeof value === 'object' && value !== null) { // For Matrix
            return (
                <ul className="list-disc list-inside text-xs">
                    {Object.entries(value).map(([rowId, colValue]) => {
                         const rowLabel = form.fields.flatMap(f => f.matrixRows || []).find(r => r.id === rowId)?.label || rowId;
                         return <li key={rowId}><strong>{rowLabel}:</strong> {colValue}</li>
                    })}
                </ul>
            );
        }
        if (value === null || value === undefined) {
            return <span className="text-gray-400">---</span>;
        }
        return String(value);
    };

    const mainPadding = isModern2Style ? 'p-4 sm:p-8 md:p-12' : 'p-4 sm:p-6';
    
    const fieldsContainerClasses = displayStyle === 'SPACIOUS_CARD' ? 'space-y-6' : isCardStyle ? 'space-y-4' : `divide-y divide-gray-200 ${!isCardStyle ? 'bg-white rounded-xl shadow-sm border' : ''}`;

    const renderFieldsWithSummary = (fieldsToRender: FormField[]) => {
        return fieldsToRender.flatMap((field, relativeIndex) => {
            const absoluteIndex = form!.fields.findIndex(f => f.id === field.id);
            let cardWrapperClasses = '';
            if (displayStyle === 'MINIMAL_CARD') {
                cardWrapperClasses = 'p-4 border rounded-lg bg-white dark:bg-slate-800 shadow-sm';
            } else if (displayStyle === 'SPACIOUS_CARD') {
                cardWrapperClasses = 'p-6 border rounded-xl bg-white dark:bg-slate-800 shadow-sm';
            } else {
                cardWrapperClasses = 'py-6';
            }

            const nodes: React.ReactNode[] = [
                <div
                    key={field.id}
                    className={`${cardWrapperClasses} animate-slide-in-up`}
                    style={{ animationDelay: `${relativeIndex * 50}ms` }}
                >
                    <FormFieldRenderer
                        field={field}
                        value={formValues[field.id]?.value}
                        onChange={(value) => handleMainValueChange(field.id, value)}
                        noteValue={formValues[field.id]?.note}
                        onNoteChange={(note) => handleNoteChange(field.id, note)}
                        photoValue={formValues[field.id]?.photo}
                        onPhotoChange={(photo) => handlePhotoChange(field.id, photo)}
                        onPhotoRemove={() => handlePhotoRemove(field.id)}
                        error={formErrors[field.id]}
                        displayStyle={displayStyle as FormDisplayStyle}
                        styleSettings={styleSettings}
                        currentUser={currentUser}
                        users={users}
                    />
                </div>
            ];
    
            const isCountable = field.type === 'APPROVAL' || field.type === 'CONFIRMATION';
            if (isCountable && countableFieldsInfo.total > 20) {
                const countableIndex = countableFieldsInfo.indices.indexOf(absoluteIndex);
                if (countableIndex !== -1 && (countableIndex + 1) % 20 === 0) {
                    const blockNumber = (countableIndex + 1) / 20;
                    const blockStartIndexInIndices = (blockNumber - 1) * 20;
                    const blockEndIndexInIndices = countableIndex;
    
                    const fieldIndicesInBlock = countableFieldsInfo.indices.slice(blockStartIndexInIndices, blockEndIndexInIndices + 1);
                    const fieldsInBlock = fieldIndicesInBlock.map(i => form!.fields[i]);
    
                    const allAnsweredInBlock = fieldsInBlock.every(f =>
                        formValues[f.id]?.value !== undefined && formValues[f.id]?.value !== null && formValues[f.id]?.value !== ''
                    );
    
                    if (allAnsweredInBlock) {
                        const stats = { positive: 0, negative: 0 };
                        fieldsInBlock.forEach(f => {
                            const value = formValues[f.id]?.value;
                            if (f.type === 'CONFIRMATION') {
                                if (value === true) stats.positive++;
                                else if (value === false) stats.negative++;
                            } else if (f.type === 'APPROVAL') {
                                if (value === 'APPROVED') stats.positive++;
                                else if (value === 'REJECTED') stats.negative++;
                            }
                        });
                        
                        nodes.push(
                            <SummaryCard
                                key={`summary-${blockNumber}`}
                                stats={stats}
                                blockNumber={blockNumber}
                            />
                        );
                    }
                }
            }
            return nodes;
        });
    };


    const specs = [
        { label: 'کد فرم', value: form.formCode },
        { label: 'نسخه', value: form.version },
        { label: 'واحد', value: form.unit },
        { label: 'تاریخ تایید', value: toPersianDate(form.approvalDate) },
        { label: 'شماره سریال', value: (form.nextSerialNumber || 0).toString().padStart(3, '0') }
    ].filter(item => item.value);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 animate-fade-in" dir="rtl">
            <div 
                ref={modalContentRef} 
                className={`relative flex flex-col shadow-2xl transition-all duration-300 ease-in-out
                    ${isFullScreen ? 'w-full h-full rounded-none' : 'max-w-4xl w-full max-h-[90vh] rounded-lg overflow-hidden'}
                    ${styleSettings.backgroundColor || 'bg-white'}
                `}
                 style={{
                    fontFamily: styleSettings.fontFamily,
                    '--form-primary-color': styleSettings.primaryColor,
                } as React.CSSProperties}
            >
                <header className="flex-shrink-0 border-b border-gray-200 bg-white">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-4 space-x-reverse min-w-0">
                                <h1 className="text-xl font-bold text-brand-text truncate">{form.title}</h1>
                                <div className="hidden sm:flex items-center space-x-1 space-x-reverse p-1 bg-gray-100 rounded-lg">
                                    <button onClick={() => setActiveTab('form')} className={`px-3 py-1 text-sm rounded-md ${activeTab === 'form' ? 'bg-white shadow-sm' : ''}`}>فرم</button>
                                    <button onClick={() => setActiveTab('submissions')} className={`px-3 py-1 text-sm rounded-md ${activeTab === 'submissions' ? 'bg-white shadow-sm' : ''}`}>سابقه‌ها</button>
                                    <button onClick={() => setActiveTab('dashboard')} disabled={submissions.length === 0} className={`px-3 py-1 text-sm rounded-md disabled:text-gray-400 disabled:cursor-not-allowed ${activeTab === 'dashboard' ? 'bg-white shadow-sm' : ''}`}>داشبورد</button>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <button onClick={toggleFullScreen} className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-full">
                                    {isFullScreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                                </button>
                                <button onClick={onClose} className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-full">
                                    <CloseIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                
                 {activeTab === 'form' && (
                    <div className="w-full h-1 bg-gray-200 dark:bg-slate-700 flex-shrink-0">
                        <div 
                            className="h-1 transition-all duration-300 ease-out" 
                            style={{ 
                                width: `${completionProgress}%`,
                                backgroundColor: styleSettings.primaryColor || '#2563EB'
                            }}
                        />
                    </div>
                )}

                <main className={`flex-1 overflow-y-auto ${isCardStyle ? 'bg-gray-100 dark:bg-slate-900' : ''}`}>
                     {activeTab === 'form' ? (
                        <form onSubmit={handleSubmit} className="h-full">
                            {form.displayMode === 'MULTI_STEP' && sections.length > 1 ? (
                                <div className={`max-w-3xl mx-auto ${mainPadding}`}>
                                    <div className="flex items-center justify-center mb-8">
                                        <span className="text-sm font-semibold text-gray-500">
                                            بخش {currentSectionIndex + 1} از {sections.length}
                                        </span>
                                    </div>
                                    {(() => {
                                        const currentSection = sections[currentSectionIndex];
                                        const SectionIcon = currentSection.icon ? ICONS[currentSection.icon] : null;
                                        return (
                                            <div>
                                                <div className="text-center mb-8">
                                                    {SectionIcon && <SectionIcon className="w-10 h-10 text-brand-primary mx-auto mb-3" />}
                                                    <h2 className="text-2xl font-bold">{currentSection.title}</h2>
                                                </div>
                                                <div className="space-y-6">
                                                    {renderFieldsWithSummary(currentSection.fields)}
                                                </div>
                                                <div className="flex justify-between pt-8 mt-8 border-t">
                                                    <button type="button" onClick={handlePrev} disabled={currentSectionIndex === 0} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"><ArrowRightIcon className="w-5 h-5 ml-2" /> قبلی</button>
                                                    {currentSectionIndex < sections.length - 1 ? (
                                                        <button type="button" onClick={handleNext} className="px-6 py-3 text-white rounded-lg font-semibold text-sm flex items-center" style={{ backgroundColor: styleSettings.primaryColor }}>بعدی <ArrowLeftIcon className="w-5 h-5 mr-2" /></button>
                                                    ) : (
                                                        <button type="submit" disabled={submissionState !== 'idle'} className={`flex items-center justify-center text-white rounded-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:scale-100 px-6 py-3 min-w-[120px] ${submissionState === 'success' ? 'bg-green-500' : ''}`} style={submissionState !== 'success' ? { backgroundColor: styleSettings.primaryColor } : {}}>
                                                            {submissionState === 'idle' && 'ارسال'}
                                                            {submissionState === 'submitting' && <Spinner />}
                                                            {submissionState === 'success' && <CheckCircleIcon className="w-7 h-7" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className={`max-w-3xl mx-auto ${mainPadding}`}>
                                     <div className={fieldsContainerClasses}>
                                        {renderFieldsWithSummary(form.fields)}
                                    </div>
                                    <div className="flex justify-end pt-6">
                                        <button type="submit" disabled={submissionState !== 'idle'} className={`flex items-center justify-center text-white rounded-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:scale-100 min-w-[120px] px-6 py-3 ${submissionState === 'success' ? 'bg-green-500' : ''}`} style={submissionState !== 'success' ? { backgroundColor: styleSettings.primaryColor } : {}}>
                                            {submissionState === 'idle' && 'ارسال'}
                                            {submissionState === 'submitting' && <Spinner />}
                                            {submissionState === 'success' && <CheckCircleIcon className="w-7 h-7" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    ) : activeTab === 'dashboard' ? (
                        <FormDashboard form={form} submissions={submissions} />
                    ) : (
                        <div className={`max-w-3xl mx-auto ${mainPadding}`}>
                            <div className="space-y-6">
                                {submissions.length > 0 ? submissions.map(sub => {
                                    const submitter = users.find(u => u.id === sub.submittedById);
                                    return (
                                        <div key={sub.id} className="p-4 border rounded-lg bg-white/50">
                                            <div className="flex justify-between items-center pb-2 mb-2 border-b">
                                                <div className="flex items-center">
                                                    <img src={submitter?.avatarUrl} alt={submitter?.name} className="w-8 h-8 rounded-full ml-3" />
                                                    <p className="font-semibold text-brand-text">{submitter?.name || 'ناشناس'}</p>
                                                </div>
                                                <div className="flex items-center space-x-4 space-x-reverse">
                                                    {sub.serialNumber && <p className="text-xs font-mono text-gray-500">#{sub.serialNumber}</p>}
                                                    <p className="text-xs text-gray-500">{toPersianDate(sub.submittedAt)}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3 pt-2">
                                                {sub.values.map(v => {
                                                    const field = form.fields.find(f => f.id === v.fieldId);
                                                    return (
                                                        <div key={v.fieldId} className="text-sm py-2 border-b last:border-b-0">
                                                            <span className="font-semibold text-gray-700 col-span-1">{v.label}:</span>
                                                            <div className="text-gray-800 col-span-2 pt-1 pr-2">{renderSubmissionValue(v.value, field)}</div>
                                                            {(v.note || v.photo) && (
                                                                <div className="mt-2 pl-4 space-y-2">
                                                                    {v.note && (
                                                                        <div className="flex items-start">
                                                                            <PencilIcon className="w-4 h-4 text-gray-500 mt-1 ml-2 flex-shrink-0" />
                                                                            <p className="text-xs bg-gray-100 p-2 rounded-md text-gray-700 whitespace-pre-wrap">{v.note}</p>
                                                                        </div>
                                                                    )}
                                                                    {v.photo && (
                                                                        <div className="flex items-start">
                                                                            <CameraIcon className="w-4 h-4 text-gray-500 mt-1 ml-2 flex-shrink-0" />
                                                                            <a href={v.photo} target="_blank" rel="noopener noreferrer">
                                                                                <img src={v.photo} alt={`پیوست برای ${v.label}`} className="max-w-xs max-h-48 rounded-md border" />
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-center text-brand-subtext py-10">هنوز هیچ سابقه‌ای برای این فرم ثبت نشده است.</p>
                                )}
                            </div>
                        </div>
                    )}
                </main>
                
                {activeTab === 'form' && (
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="absolute bottom-4 right-4 p-2 bg-gray-100/70 text-gray-500 rounded-full shadow-sm hover:bg-gray-200 hover:text-gray-700 transition-all z-10 backdrop-blur-sm"
                        title="ذخیره پیش‌نویس"
                    >
                        <ClipboardDocumentCheckIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FormDisplay;
