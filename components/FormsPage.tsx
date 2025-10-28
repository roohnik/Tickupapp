import React from 'react';
import { Form, FormCategory, User, FormSubmission, Project, Board } from '../types';
import FormCard from './FormCard';
import { KANBAN_COLOR_MAP } from '../constants';
import { PlusIcon } from './Icons';

interface FormsPageProps {
  forms: Form[];
  categories: FormCategory[];
  submissions: FormSubmission[];
  onCreateForm: () => void;
  onOpenForm: (formId: string) => void;
  onEditForm: (formId: string) => void;
  onTogglePinForm: (formId: string) => void;
  currentUser: User;
  onMoveFormRequest: (formId: string) => void;
}

const FormCategoryColumn: React.FC<{ 
    category: FormCategory; 
    forms: Form[];
    submissions: FormSubmission[];
    onOpenForm: (formId: string) => void;
    onEditForm: (formId: string) => void;
    onTogglePinForm: (formId: string) => void;
    currentUser: User;
    onMoveFormRequest: (formId: string) => void;
}> = ({ category, forms, submissions, onOpenForm, onEditForm, onTogglePinForm, currentUser, onMoveFormRequest }) => {
    const colorScheme = KANBAN_COLOR_MAP[category.color || 'gray'] || KANBAN_COLOR_MAP.gray;
    return (
        <div className={`rounded-lg p-2 pt-1 flex flex-col flex-shrink-0 w-[calc(100vw-3rem)] sm:w-80 lg:w-96 ${colorScheme.bg}`}>
            <div className="flex items-center justify-between font-semibold mb-3 px-2 py-1">
                <div className="flex items-center min-w-0">
                    <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${colorScheme.dot}`}></span>
                    <h3 className={`text-sm font-semibold truncate ${colorScheme.text}`}>{category.title}</h3>
                    <span className="text-sm text-gray-400 font-normal mr-2">({forms.length})</span>
                </div>
            </div>
            <div className="space-y-2 h-full overflow-y-auto p-1 rounded-md">
                {forms.map(form => {
                    const hasDraft = submissions.some(s => s.formId === form.id && s.submittedById === currentUser.id && s.status === 'DRAFT');
                    return (
                        <FormCard 
                            key={form.id} 
                            form={form} 
                            onOpen={() => onOpenForm(form.id)}
                            onEdit={onEditForm}
                            onTogglePin={onTogglePinForm}
                            currentUser={currentUser}
                            hasDraft={hasDraft}
                            onMoveRequest={onMoveFormRequest}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const FormsPage: React.FC<FormsPageProps> = ({ forms, categories, submissions, onCreateForm, onOpenForm, onEditForm, onTogglePinForm, currentUser, onMoveFormRequest }) => {
  return (
    <div>
        <div className="flex justify-end items-center mb-6">
            <button
                onClick={onCreateForm}
                className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold shadow-sm hover:bg-blue-600 transition-colors"
            >
                <PlusIcon className="w-5 h-5 ml-2" />
                ایجاد فرم جدید
            </button>
        </div>
        <div className="flex space-x-4 space-x-reverse overflow-x-auto pb-4">
            {categories.map(cat => (
                <FormCategoryColumn
                    key={cat.id}
                    category={cat}
                    forms={forms.filter(f => f.categoryId === cat.id)}
                    submissions={submissions}
                    onOpenForm={onOpenForm}
                    onEditForm={onEditForm}
                    onTogglePinForm={onTogglePinForm}
                    currentUser={currentUser}
                    onMoveFormRequest={onMoveFormRequest}
                />
            ))}
        </div>
    </div>
  );
};

export default FormsPage;