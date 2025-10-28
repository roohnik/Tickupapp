import React, { useState, useRef } from 'react';
import { FormField, StyleSettings, User, FormFieldType, FormDisplayStyle } from '../types';
import StarRating from './StarRating';
import { CheckCircleIcon, XCircleIcon, FileUploadIcon, PencilIcon, PlusIcon, TrashIcon, QuestionMarkCircleIcon, CameraIcon, CloseIcon, HandThumbUpIcon, ICONS, CheckIcon } from './Icons';
import { toPersianDate } from '../utils/dateUtils';

interface FormFieldRendererProps {
    field: FormField;
    value: any;
    onChange: (value: any) => void;
    error?: string;
    displayStyle: FormDisplayStyle | 'MODERN_2';
    styleSettings: StyleSettings;
    currentUser: User;
    users: User[];
    noteValue?: string;
    photoValue?: string;
    onNoteChange?: (value: string) => void;
    onPhotoChange?: (dataUrl: string) => void;
    onPhotoRemove?: () => void;
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({ field, value, onChange, error, displayStyle, styleSettings, currentUser, users, noteValue, photoValue, onNoteChange, onPhotoChange, onPhotoRemove }) => {
    
    if (field.type === 'SECTION') {
        const SectionIcon = field.icon ? ICONS[field.icon] : null;
            
        // Simple hash to get a consistent color for an icon
        const colors = ['blue', 'red', 'green', 'purple', 'yellow', 'pink', 'orange'];
        let hash = 0;
        if (field.icon) {
            for (let i = 0; i < field.icon.length; i++) {
                hash = field.icon.charCodeAt(i) + ((hash << 5) - hash);
            }
        }
        const colorName = colors[Math.abs(hash % colors.length)];
        
        const colorClasses: Record<string, { bg: string, text: string }> = {
            blue: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
            red: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
            green: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
            purple: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
            yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400' },
            pink: { bg: 'bg-pink-100 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400' },
            orange: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
        };
        const selectedColor = colorClasses[colorName] || colorClasses.blue;

        return (
            <div className="text-center my-8 py-6">
                {SectionIcon && (
                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${selectedColor.bg}`}>
                        <SectionIcon className={`w-12 h-12 ${selectedColor.text}`} />
                    </div>
                )}
                <h3 className="text-3xl font-bold mt-4 text-brand-text dark:text-slate-100">{field.label}</h3>
                {field.description && (
                    <p className="mt-2 text-base text-brand-subtext dark:text-slate-400 max-w-lg mx-auto">{field.description}</p>
                )}
            </div>
        );
    }

    const [isNoteVisible, setIsNoteVisible] = useState(!!noteValue);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onPhotoChange) {
            const reader = new FileReader();
            reader.onload = () => {
                onPhotoChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    let baseInputClasses = `block w-full rounded-lg border-gray-300 shadow-sm focus:border-[var(--form-primary-color)] focus:ring focus:ring-[var(--form-primary-color)] focus:ring-opacity-50`;
    let labelClasses = "font-semibold text-brand-text flex items-center";
    let inputWrapperMargin = "mt-2";
    let fieldContainerClasses = "";

    switch(displayStyle) {
        case 'VISUAL':
            labelClasses += ' text-lg text-gray-800 pb-2 border-b';
            inputWrapperMargin = 'mt-4';
            break;
        case 'SPACIOUS':
            fieldContainerClasses = "space-y-3";
            labelClasses += ' text-base';
            inputWrapperMargin = 'mt-1';
            baseInputClasses += ' p-3 text-base';
            break;
        case 'MINIMAL_CARD':
            labelClasses += ' text-lg';
            inputWrapperMargin = 'mt-6';
            break;
        case 'SPACIOUS_CARD':
            labelClasses += ' text-xl';
            inputWrapperMargin = 'mt-4';
            baseInputClasses += ' p-3 text-base';
            break;
        case 'MODERN_2':
            labelClasses += ' text-lg';
            inputWrapperMargin = 'mt-4';
            break;
    }


    const renderField = () => {
        switch (field.type) {
            case 'TEXT':
            case 'EMAIL':
            case 'NUMBER':
                return <input type={field.type === 'NUMBER' ? 'number' : field.type === 'EMAIL' ? 'email' : 'text'} placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} className={baseInputClasses} />;
            
            case 'TEXTAREA':
                return <textarea placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} className={baseInputClasses} rows={4} />;
            
            case 'DATE':
                return <input type="date" value={value ? new Date(value).toISOString().substring(0, 10) : ''} onChange={e => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')} className={baseInputClasses} />;

            case 'SELECT':
                return (
                    <select value={value || ''} onChange={e => onChange(e.target.value)} className={baseInputClasses}>
                        <option value="">{field.placeholder || 'انتخاب کنید...'}</option>
                        {field.options?.map(opt => <option key={opt.id} value={opt.label}>{opt.label}</option>)}
                    </select>
                );

            case 'RADIO':
                 const radioLayout = displayStyle === 'VISUAL' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : (displayStyle === 'SPACIOUS_CARD' ? 'space-y-3' : 'space-y-2');
                return (
                    <div className={radioLayout}>
                        {field.options?.map(opt => (
                            <label key={opt.id} className={`flex items-center ${displayStyle === 'VISUAL' ? 'p-3 border-2 rounded-lg cursor-pointer' : ''} ${value === opt.label && displayStyle === 'VISUAL' ? 'border-brand-primary bg-blue-50' : ''} ${displayStyle === 'SPACIOUS_CARD' ? 'p-2' : ''}`}>
                                <input type="radio" name={field.id} value={opt.label} checked={value === opt.label} onChange={e => onChange(e.target.value)} className="h-4 w-4 text-[var(--form-primary-color)] focus:ring-[var(--form-primary-color)]" />
                                <span className="mr-3">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'CHECKBOX':
                return (
                    <div className={displayStyle === 'SPACIOUS_CARD' ? 'space-y-3' : 'space-y-2'}>
                        {field.options?.map(opt => (
                            <label key={opt.id} className={`flex items-center ${displayStyle === 'SPACIOUS_CARD' ? 'p-2' : ''}`}>
                                <input type="checkbox" value={opt.label} checked={Array.isArray(value) && value.includes(opt.label)} onChange={e => {
                                    const currentValues = Array.isArray(value) ? value : [];
                                    if (e.target.checked) {
                                        onChange([...currentValues, opt.label]);
                                    } else {
                                        onChange(currentValues.filter(v => v !== opt.label));
                                    }
                                }} className="h-4 w-4 text-[var(--form-primary-color)] rounded focus:ring-[var(--form-primary-color)]" />
                                <span className="mr-3">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                );
            
            case 'RATING':
                if (displayStyle === 'MINIMAL_CARD' || displayStyle === 'SPACIOUS_CARD') {
                    return (
                        <div className="flex items-center justify-between space-x-1 sm:space-x-2 space-x-reverse">
                            <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">All of the time</span>
                            <div className="flex items-center justify-center space-x-1 sm:space-x-2 space-x-reverse">
                                {[1, 2, 3, 4, 5, 6, 7].map((ratingValue) => (
                                    <button
                                        type="button"
                                        key={ratingValue}
                                        onClick={() => onChange(ratingValue)}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold border transition-all duration-200 
                                            ${value === ratingValue 
                                                ? 'bg-purple-600 text-white border-purple-600' 
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-500 hover:bg-purple-50'
                                            }`}
                                    >
                                        {ratingValue}
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">None of the time</span>
                        </div>
                    );
                }
                return <StarRating rating={value || 0} setRating={onChange} size="h-8 w-8" />;
            
            case 'CONFIRMATION':
                return (
                    <div className="flex items-center space-x-4 space-x-reverse">
                        <button
                            type="button"
                            onClick={() => onChange(true)}
                            className={`flex items-center px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                                value === true
                                    ? 'bg-green-100 border-green-500 text-green-800'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-400'
                            }`}
                        >
                            <CheckCircleIcon className="w-5 h-5 ml-2" />
                            بله
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(false)}
                            className={`flex items-center px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                                value === false
                                    ? 'bg-red-100 border-red-500 text-red-800'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-400'
                            }`}
                        >
                            <XCircleIcon className="w-5 h-5 ml-2" />
                            خیر
                        </button>
                    </div>
                );
            
             case 'APPROVAL':
                return (
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                            type="button"
                            onClick={() => onChange('APPROVED')}
                            className={`flex items-center px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                                value === 'APPROVED'
                                    ? 'bg-green-100 border-green-500 text-green-800'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-400'
                            }`}
                        >
                            <CheckIcon className="w-5 h-5 ml-2" />
                            تایید
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('REJECTED')}
                            className={`flex items-center px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                                value === 'REJECTED'
                                    ? 'bg-red-100 border-red-500 text-red-800'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-400'
                            }`}
                        >
                            <XCircleIcon className="w-5 h-5 ml-2" />
                            رد
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('UNSPECIFIED')}
                            className={`flex items-center px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                                value === 'UNSPECIFIED'
                                    ? 'bg-gray-100 border-gray-400 text-gray-800'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                            }`}
                        >
                            <QuestionMarkCircleIcon className="w-5 h-5 ml-2" />
                            نامشخص
                        </button>
                    </div>
                );

            case 'FILE_UPLOAD':
                 return (
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FileUploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">برای آپلود کلیک کنید</span> یا فایل را بکشید</p>
                            </div>
                            <input type="file" className="hidden" />
                        </label>
                    </div> 
                );
            
            case 'SIGNATURE':
                const signer = users.find(u => u.id === field.signerUserIds?.[0]);
                return (
                    <div className="border p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">امضا توسط: {signer?.name}</p>
                        <button type="button" onClick={() => { if(signer?.id === currentUser.id && signer.signatureUrl) onChange({ ...value, [signer.id]: { signatureUrl: signer.signatureUrl, signedAt: new Date().toISOString() } }) }} className="px-4 py-2 bg-gray-200 rounded-lg flex items-center"><PencilIcon className="w-5 h-5 ml-2" /> امضا کنید</button>
                        {value?.[signer?.id || ''] && <img src={value[signer.id].signatureUrl} className="mt-2 h-16 border rounded"/>}
                    </div>
                );
            
            case 'MATRIX_SINGLE':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center">
                            <thead>
                                <tr>
                                    <th className="p-2 w-1/4"></th>
                                    {field.matrixColumns?.map(col => <th key={col.id} className="p-2 font-normal">{col.label}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {field.matrixRows?.map(row => (
                                    <tr key={row.id} className="border-t">
                                        <td className="p-2 font-semibold text-right">{row.label}</td>
                                        {field.matrixColumns?.map(col => (
                                            <td key={col.id} className="p-2 text-center">
                                                <input type="radio" name={`${field.id}-${row.id}`} value={col.label} checked={value?.[row.id] === col.label} onChange={() => onChange({ ...(value || {}), [row.id]: col.label })} className="w-4 h-4 text-[var(--form-primary-color)] focus:ring-[var(--form-primary-color)]" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            
            case 'DYNAMIC_TABLE':
                const rows = Array.isArray(value) ? value : [];
                const addRow = () => onChange([...rows, {}]);
                const updateRow = (rowIndex: number, fieldId: string, fieldValue: any) => {
                    const newRows = [...rows];
                    newRows[rowIndex] = {...newRows[rowIndex], [fieldId]: fieldValue};
                    onChange(newRows);
                };
                const removeRow = (rowIndex: number) => {
                    const newRows = rows.filter((_, i) => i !== rowIndex);
                    onChange(newRows);
                };

                return (
                    <div>
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    {field.subFields?.map(sf => <th key={sf.id} className="p-2 text-right font-medium border-b">{sf.label}</th>)}
                                    <th className="w-10 border-b"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rIndex) => (
                                    <tr key={rIndex} className="border-t">
                                        {field.subFields?.map(sf => (
                                            <td key={sf.id} className="p-1">
                                                <input type="text" value={row[sf.id] || ''} onChange={(e) => updateRow(rIndex, sf.id, e.target.value)} className="w-full text-sm border-gray-300 rounded p-1"/>
                                            </td>
                                        ))}
                                        <td className="p-1 text-center"><button type="button" onClick={() => removeRow(rIndex)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button type="button" onClick={addRow} className="mt-2 text-sm text-blue-600 flex items-center"><PlusIcon className="w-4 h-4 mr-1"/> افزودن ردیف</button>
                    </div>
                );

            default:
                return <p className="text-red-500">فیلد پشتیبانی نشده: {field.type}</p>;
        }
    };
    
    return (
        <div className={fieldContainerClasses}>
            <div className="flex justify-between items-center">
                <label className={labelClasses}>
                    {field.label}
                    {field.isRequired && <span className="text-red-500 mr-1">*</span>}
                    {field.placeholder && (
                        <span className="group relative ml-2">
                            <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {field.placeholder}
                            </span>
                        </span>
                    )}
                </label>
                {(field.allowNote || field.allowPhoto) && (
                    <div className="flex items-center space-x-2 space-x-reverse">
                        {field.allowPhoto && (
                            <button type="button" onClick={() => photoInputRef.current?.click()} className="p-1 text-gray-400 hover:text-blue-500"><CameraIcon className="w-5 h-5"/></button>
                        )}
                        {field.allowNote && (
                            <button type="button" onClick={() => setIsNoteVisible(!isNoteVisible)} className={`p-1 ${isNoteVisible || noteValue ? 'text-blue-500' : 'text-gray-400'} hover:text-blue-500`}><PencilIcon className="w-5 h-5"/></button>
                        )}
                    </div>
                )}
            </div>
            <div className={inputWrapperMargin}>
                {renderField()}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            
            {field.allowPhoto && (
                <>
                    <input type="file" accept="image/*" capture="environment" ref={photoInputRef} onChange={handlePhotoFileChange} className="hidden" />
                    {photoValue && (
                        <div className="mt-2 relative inline-block">
                            <img src={photoValue} alt="پیوست" className="w-20 h-20 object-cover rounded-md border-2 border-gray-200" />
                            <button
                                type="button"
                                onClick={onPhotoRemove}
                                className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 text-gray-500 hover:text-red-600 shadow-md transition-colors"
                                aria-label="حذف عکس"
                            >
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}
            {field.allowNote && isNoteVisible && (
                <textarea
                    value={noteValue || ''}
                    onChange={e => onNoteChange?.(e.target.value)}
                    onBlur={() => !noteValue && setIsNoteVisible(false)}
                    placeholder="یادداشت..."
                    rows={2}
                    className="mt-2 block w-full text-sm rounded-md border-gray-300 shadow-sm bg-yellow-50/50 focus:ring-brand-primary focus:border-brand-primary"
                    autoFocus
                />
            )}
        </div>
    );
};
export default FormFieldRenderer;