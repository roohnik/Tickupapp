import React, { useState, useMemo } from 'react';
import { Task, Prerequisite, PrerequisiteType, Form, Document, Project, KanbanColumn, FormSubmission, DocumentBlock } from '../types';
import Modal from './Modal';
import { PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ICONS } from '../components/Icons';
import DocumentEditor from '../components/DocumentEditor';
import ReadConfirmation from '../components/ReadConfirmation';


interface PrerequisiteItemProps {
    prereq: Prerequisite;
    task: Task;
    isMet: boolean;
    onRemove: () => void;
    onUpdateTask: (updatedTask: Task) => void;
    onViewDocument: (doc: Document) => void;
    // Data for display and checking
    allTasks: Task[];
    allForms: Form[];
    allDocuments: Document[];
    allProjects: Project[];
    allColumns: KanbanColumn[];
}

const PrerequisiteItem: React.FC<PrerequisiteItemProps> = (props) => {
    const { prereq, task, isMet, onRemove, onUpdateTask, onViewDocument, allTasks, allForms, allDocuments, allProjects, allColumns } = props;

    const renderDescription = () => {
        switch (prereq.type) {
            case 'TASK':
                const tasks = prereq.taskIds.map(id => allTasks.find(t => t.id === id)?.content).filter(Boolean);
                return `تسک/های زیر باید انجام شود: ${tasks.join(', ')}`;
            case 'FORM':
                const forms = prereq.formIds.map(id => allForms.find(f => f.id === id)?.title).filter(Boolean);
                return `فرم/های زیر باید ارسال شود: ${forms.join(', ')}`;
            case 'KANBAN_LIST':
                const project = allProjects.find(p => p.id === prereq.projectId);
                const column = allColumns.find(c => c.id === prereq.columnId);
                return `تمام تسک های لیست '${column?.title || '?'}' در پروژه '${project?.name || '?'}' باید انجام شوند.`;
            case 'DOCUMENT_STUDY':
                const doc = allDocuments.find(d => d.id === prereq.documentId);
                return (
                    <span>
                        دستورالعمل '{doc?.title || '?'}' باید مطالعه شود.
                        {doc && !isMet && <button onClick={() => onViewDocument(doc)} className="text-xs text-blue-600 font-semibold mr-2">(مشاهده و مطالعه)</button>}
                    </span>
                );
        }
    };
    
    const handleHeadingCheck = (docId: string, headingId: string, isChecked: boolean) => {
        const currentCompletion = task.prerequisiteCompletion || {};
        const currentDocCompletions = currentCompletion[docId] || [];
        const newDocCompletions = isChecked 
            ? [...currentDocCompletions, headingId]
            : currentDocCompletions.filter(id => id !== headingId);
        
        onUpdateTask({
            ...task,
            prerequisiteCompletion: {
                ...currentCompletion,
                [docId]: newDocCompletions
            }
        });
    };

    const renderDetails = () => {
        if (prereq.type === 'DOCUMENT_STUDY' && !isMet) {
            const doc = allDocuments.find(d => d.id === prereq.documentId);
            if (!doc) return null;
            const headings = doc.content.filter(b => b.type === 'heading1');
            if (headings.length === 0) return <p className="text-xs text-gray-500 mt-1 pl-8">این دستورالعمل هیچ سرتیتری برای تایید ندارد.</p>;
            
            const completedIds = task.prerequisiteCompletion?.[prereq.documentId] || [];

            return (
                <div className="pl-8 mt-2 space-y-1">
                    {headings.map(headingBlock => (
                        <label key={headingBlock.id} className="flex items-center text-sm p-1 hover:bg-gray-100 rounded-md cursor-pointer">
                            <input
                                type="checkbox"
                                checked={completedIds.includes(headingBlock.id)}
                                onChange={(e) => handleHeadingCheck(prereq.documentId, headingBlock.id, e.target.checked)}
                                className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary ml-2"
                            />
                            <span>{headingBlock.content as string}</span>
                        </label>
                    ))}
                </div>
            )
        }
        return null;
    }

    return (
        <div className="p-2 border-b">
            <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                    {isMet ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex-grow mx-3 text-sm text-gray-700">{renderDescription()}</div>
                <button onClick={onRemove} className="p-1 text-gray-400 hover:text-red-600 rounded-full">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
            {renderDetails()}
        </div>
    );
};


interface PrerequisitesModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    onUpdateTask: (updatedTask: Task) => void;
    allTasks: Task[];
    allForms: Form[];
    allDocuments: Document[];
    allProjects: Project[];
    allColumns: KanbanColumn[];
    allSubmissions: FormSubmission[];
}

const PrerequisitesModal: React.FC<PrerequisitesModalProps> = (props) => {
    const { isOpen, onClose, task, onUpdateTask, allTasks, allForms, allDocuments, allProjects, allColumns, allSubmissions } = props;

    const [isAdding, setIsAdding] = useState(false);
    const [newPrereqType, setNewPrereqType] = useState<PrerequisiteType>('TASK');
    const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
    
    // State for new prerequisite values
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const [selectedFormIds, setSelectedFormIds] = useState<string[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState(allProjects[0]?.id || '');
    const [selectedColumnId, setSelectedColumnId] = useState('');
    const [selectedDocumentId, setSelectedDocumentId] = useState('');

    const resetAddForm = () => {
        setIsAdding(false);
        setNewPrereqType('TASK');
        setSelectedTaskIds([]);
        setSelectedFormIds([]);
        setSelectedProjectId(allProjects[0]?.id || '');
        setSelectedColumnId('');
        setSelectedDocumentId('');
    };
    
    const handleAddPrerequisite = () => {
        let newPrereq: Prerequisite | null = null;
        switch (newPrereqType) {
            case 'TASK':
                if (selectedTaskIds.length > 0) newPrereq = { type: 'TASK', taskIds: selectedTaskIds };
                break;
            case 'FORM':
                if (selectedFormIds.length > 0) newPrereq = { type: 'FORM', formIds: selectedFormIds };
                break;
            case 'KANBAN_LIST':
                if (selectedProjectId && selectedColumnId) newPrereq = { type: 'KANBAN_LIST', projectId: selectedProjectId, columnId: selectedColumnId };
                break;
            case 'DOCUMENT_STUDY':
                if (selectedDocumentId) newPrereq = { type: 'DOCUMENT_STUDY', documentId: selectedDocumentId };
                break;
        }

        if (newPrereq) {
            const updatedPrerequisites = [...(task.prerequisites || []), newPrereq];
            onUpdateTask({ ...task, prerequisites: updatedPrerequisites });
            resetAddForm();
        }
    };

    const handleRemovePrerequisite = (index: number) => {
        const updatedPrerequisites = (task.prerequisites || []).filter((_, i) => i !== index);
        onUpdateTask({ ...task, prerequisites: updatedPrerequisites });
    };

    const unmetPrerequisites = useMemo(() => {
        if (!task.prerequisites) return new Set();
        
        const unmetSet = new Set<number>();
        
        task.prerequisites.forEach((prereq, index) => {
            let isMet = true;
            switch (prereq.type) {
                case 'TASK':
                    isMet = prereq.taskIds.every(id => allTasks.find(t => t.id === id)?.status === 'انجام شد');
                    break;
                case 'FORM':
                    isMet = prereq.formIds.every(formId => allSubmissions.some(sub => sub.formId === formId && sub.submittedById === task.assigneeId));
                    break;
                case 'KANBAN_LIST':
                    const tasksInList = allTasks.filter(t => t.projectId === prereq.projectId && t.columnId === prereq.columnId);
                    isMet = tasksInList.length > 0 && tasksInList.every(t => t.status === 'انجام شد');
                    break;
                case 'DOCUMENT_STUDY':
                    const doc = allDocuments.find(d => d.id === prereq.documentId);
                    if (doc) {
                        const headingIds = doc.content.filter(b => b.type === 'heading1').map(b => b.id);
                        if (headingIds.length > 0) {
                            const completedIds = task.prerequisiteCompletion?.[prereq.documentId] || [];
                            isMet = completedIds.length >= headingIds.length;
                        }
                    }
                    break;
            }
            if (!isMet) {
                unmetSet.add(index);
            }
        });
        return unmetSet;
    }, [task, allTasks, allSubmissions, allDocuments]);


    return (
        <>
            <Modal isOpen={isOpen && !viewingDoc} onClose={onClose} title={`پیش نیازهای تسک: ${task.content}`} size="2xl">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-brand-text mb-2">لیست پیش‌نیازها</h3>
                        <div className="border rounded-lg max-h-64 overflow-y-auto">
                            {(task.prerequisites || []).length > 0 ? (
                                (task.prerequisites || []).map((prereq, index) => (
                                    <PrerequisiteItem
                                        key={index}
                                        prereq={prereq}
                                        task={task}
                                        isMet={!unmetPrerequisites.has(index)}
                                        onRemove={() => handleRemovePrerequisite(index)}
                                        onUpdateTask={onUpdateTask}
                                        onViewDocument={setViewingDoc}
                                        allTasks={allTasks}
                                        allForms={allForms}
                                        allDocuments={allDocuments}
                                        allProjects={allProjects}
                                        allColumns={allColumns}
                                    />
                                ))
                            ) : (
                                <p className="p-4 text-center text-sm text-gray-500">هیچ پیش‌نیازی تعریف نشده است.</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="border-t pt-4">
                        {isAdding ? (
                            <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                                <h3 className="font-semibold text-brand-text">افزودن پیش‌نیاز جدید</h3>
                                <select value={newPrereqType} onChange={e => setNewPrereqType(e.target.value as PrerequisiteType)} className="input-style">
                                    <option value="TASK">تسک</option>
                                    <option value="FORM">فرم</option>
                                    <option value="KANBAN_LIST">لیست کانبان</option>
                                    <option value="DOCUMENT_STUDY">مطالعه دستورالعمل</option>
                                </select>

                                {newPrereqType === 'TASK' && <select multiple value={selectedTaskIds} onChange={e => setSelectedTaskIds(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="input-style h-24">{allTasks.filter(t => t.id !== task.id).map(t => <option key={t.id} value={t.id}>{t.content}</option>)}</select>}
                                {newPrereqType === 'FORM' && <select multiple value={selectedFormIds} onChange={e => setSelectedFormIds(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="input-style h-24">{allForms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}</select>}
                                {newPrereqType === 'DOCUMENT_STUDY' && (
                                    <select value={selectedDocumentId} onChange={e => setSelectedDocumentId(e.target.value)} className="input-style" required>
                                        <option value="" disabled>یک دستورالعمل را انتخاب کنید...</option>
                                        {allDocuments.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                                    </select>
                                )}
                                {newPrereqType === 'KANBAN_LIST' && (
                                    <div className="flex space-x-2 space-x-reverse">
                                        <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="input-style flex-1">
                                            {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <select value={selectedColumnId} onChange={e => setSelectedColumnId(e.target.value)} className="input-style flex-1">
                                            {allColumns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="flex space-x-2 space-x-reverse">
                                    <button onClick={handleAddPrerequisite} className="px-3 py-1 bg-brand-primary text-white rounded-md text-sm">افزودن</button>
                                    <button onClick={resetAddForm} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm">لغو</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setIsAdding(true)} className="flex items-center text-sm font-semibold text-brand-primary">
                                <PlusIcon className="w-4 h-4 ml-1" /> افزودن پیش‌نیاز
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
            {viewingDoc && (
                <div className="fixed inset-0 bg-white z-50 animate-fade-in">
                    <DocumentEditor
                        document={viewingDoc}
                        onUpdate={() => {}} // Not needed in read-only
                        users={[]}
                        tasks={[]}
                        forms={[]}
                        documentStatuses={[]}
                        onSelectTask={() => {}}
                        onOpenForm={() => {}}
                        isMobileView={true}
                        onBack={() => setViewingDoc(null)}
                        forceReadOnly={true}
                        taskContext={task}
                        onUpdateTaskContext={onUpdateTask}
                    />
                </div>
            )}
        </>
    );
};

export default PrerequisitesModal;