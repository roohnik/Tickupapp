import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';
import { FormCategory } from '../types';
import FormCard from './FormCard';
import { KANBAN_COLOR_MAP } from '../constants';
import { PlusIcon } from './Icons';

const FormCategoryColumn: React.FC<{ 
    category: FormCategory; 
}> = observer(({ category }) => {
    const { formStore, userStore, uiStore } = useStore();
    const forms = formStore.forms.filter(f => f.categoryId === category.id);
    const submissions = formStore.submissions;
    const currentUser = userStore.currentUser;
    
    const handleOpenForm = (formId: string) => {
        uiStore.selectedFormId = formId;
        uiStore.openModal('viewForm');
    };
    
    const handleEditForm = (formId: string) => {
        uiStore.selectedFormId = formId;
        uiStore.openModal('editForm');
    };
    
    const handleTogglePinForm = (formId: string) => {
        const form = forms.find(f => f.id === formId);
        if (form) {
            formStore.updateForm({ ...form, isPinned: !form.isPinned });
        }
    };
    
    const handleMoveFormRequest = (formId: string) => {
        uiStore.selectedFormId = formId;
        uiStore.openModal('moveForm');
    };
    
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
                    const hasDraft = currentUser && submissions.some(s => s.formId === form.id && s.submittedById === currentUser.id && s.status === 'DRAFT');
                    return (
                        <FormCard 
                            key={form.id} 
                            form={form} 
                            onOpen={() => handleOpenForm(form.id)}
                            onEdit={handleEditForm}
                            onTogglePin={handleTogglePinForm}
                            currentUser={currentUser!}
                            hasDraft={hasDraft}
                            onMoveRequest={handleMoveFormRequest}
                        />
                    );
                })}
            </div>
        </div>
    );
});

const FormsPage: React.FC = observer(() => {
    const { formStore, uiStore } = useStore();
    const forms = formStore.forms;
    const categories = formStore.categories;
    
    const handleCreateForm = () => {
        uiStore.openModal('createForm');
    };
    
  return (
    <div>
        <div className="flex justify-end items-center mb-6">
            <button
                onClick={handleCreateForm}
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
                />
            ))}
        </div>
    </div>
  );
});

export default FormsPage;