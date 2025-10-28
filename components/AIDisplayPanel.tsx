import React from 'react';
import { AIDisplayContent, Task, Project, User, KanbanColumn, Objective, Form, FormSubmission, StyleSettings, ViewMode, Board, Document, ComponentStyles, KeyResult } from '../types';
import FormDisplay from './FormDisplay';
import KanbanPage from './KanbanPage';
import AnjamPage from './AnjamPage';
import ObjectiveDisplay from './ObjectiveDisplay';

interface AIDisplayPanelProps {
    content: AIDisplayContent | null;
    tasks: Task[];
    projects: Project[];
    users: User[];
    columns: KanbanColumn[];
    objectives: Objective[];
    forms: Form[];
    submissions: FormSubmission[];
    documents: Document[];
    onTaskColumnChange: (taskId: string, newColumnId: string) => void;
    onSelectTask: (taskId: string) => void;
    onUpdateTask: (task: Task) => void;
    onDeleteTasks: (taskIds: string[]) => void;
    onAddTask: (defaultColumn?: string, defaultDate?: string) => void;
    onUpdateColumnTitle: (columnId: string, newTitle: string) => void;
    onAddColumn: (title: string) => void;
    onUpdateColumnColor: (columnId: string, color: string) => void;
    onUpdateColumnIcon: (columnId: string, icon: string) => void;
    onQuickAddTask: (content: string, columnId: string, projectId: string) => void;
    onUpdateProject: (project: Project) => void;
    onAddProject: () => void;
    onArchiveProject: (projectId: string) => void;
    isListViewComfortable: boolean;
    currentUser: User;
    onInlineAddTask: (taskData: Omit<Task, 'id' | 'tags' | 'comments' | 'checklist' | 'status'>) => void;
    taskFieldLabels: any; // TaskFieldLabels;
    onUpdateTaskFieldLabel: (field: any, newLabel: string) => void;
    onAddCustomFieldDefinitionToProject: any;
    onUpdateCustomFieldDefinitionInProject: any;
    onDeleteCustomFieldDefinitionFromProject: any;
    onUpdateColumnDetails: any;
    popupSettings: StyleSettings;
    activeCardTemplate: 'none' | 'business' | 'swot';
    onSetCardTemplate: (template: 'none' | 'business' | 'swot') => void;
    boards: Board[];
    activeBoardId: string;
    onActiveBoardChange: (boardId: string) => void;
    onAddBoard: (projectId: string | 'all') => void;
    onEditBoard: (board: Board) => void;
    onUpdateBoard: (board: Board) => void;
    handleFormSubmit: (submissionData: Omit<FormSubmission, 'id' | 'status' | 'serialNumber'>) => void;
    handleSaveDraft: (submissionData: Omit<FormSubmission, 'id' | 'status' | 'serialNumber'>) => void;
    componentStyles: ComponentStyles;
    onOpenForm: (formId: string) => void;
    onEditForm: (formId: string) => void;
    onTogglePinForm: (formId: string) => void;
    onUpdateKeyResultDetails: (objectiveId: string, krId: string, updates: Partial<KeyResult>) => void;
    onSelectKeyResult: (objectiveId: string, krId: string) => void;
    onDeleteKeyResult: (objectiveId: string, keyResultId: string) => void;
    onArchiveKeyResult: (objectiveId: string, keyResultId: string) => void;
}

const AIDisplayPanel: React.FC<AIDisplayPanelProps> = (props) => {
    const { content } = props;

    const renderContent = () => {
        if (!content || !content.type) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-white animate-fade-in">
                    {/* Empty state is just a blank white screen as requested */}
                </div>
            );
        }

        switch (content.type) {
            case 'form': {
                const formToDisplay = props.forms.find(f => f.id === content.id);
                if (!formToDisplay) return <div className="p-8">Form with ID '{content.id}' not found.</div>;
                return (
                    <div className="p-4 md:p-6 h-full">
                        <FormDisplay
                            form={formToDisplay}
                            submissions={props.submissions.filter(s => s.formId === formToDisplay!.id)}
                            draftSubmission={props.submissions.find(s => s.formId === formToDisplay!.id && s.submittedById === props.currentUser.id && s.status === 'DRAFT')}
                            users={props.users}
                            currentUser={props.currentUser}
                            onClose={() => { /* This is handled by App.tsx changing the AI state */ }}
                            onSubmit={props.handleFormSubmit}
                            onSaveDraft={props.handleSaveDraft}
                            styleSettings={props.componentStyles.popups}
                        />
                    </div>
                );
            }
            case 'kanban': {
                return (
                    <div className="p-4 md:p-6 h-full">
                        <KanbanPage
                            tasks={props.tasks}
                            projects={props.projects}
                            users={props.users}
                            columns={props.columns}
                            objectives={props.objectives}
                            onTaskColumnChange={props.onTaskColumnChange}
                            onSelectTask={props.onSelectTask}
                            onUpdateTask={props.onUpdateTask}
                            onDeleteTasks={props.onDeleteTasks}
                            onAddTask={props.onAddTask}
                            onUpdateColumnTitle={props.onUpdateColumnTitle}
                            onAddColumn={props.onAddColumn}
                            onUpdateColumnColor={props.onUpdateColumnColor}
                            onUpdateColumnIcon={props.onUpdateColumnIcon}
                            onQuickAddTask={props.onQuickAddTask}
                            onUpdateProject={props.onUpdateProject}
                            onAddProject={props.onAddProject}
                            onArchiveProject={props.onArchiveProject}
                            isListViewComfortable={props.isListViewComfortable}
                            currentUser={props.currentUser}
                            onInlineAddTask={props.onInlineAddTask}
                            taskFieldLabels={props.taskFieldLabels}
                            onUpdateTaskFieldLabel={props.onUpdateTaskFieldLabel}
                            onAddCustomFieldDefinitionToProject={props.onAddCustomFieldDefinitionToProject}
                            onUpdateCustomFieldDefinitionInProject={props.onUpdateCustomFieldDefinitionInProject}
                            onDeleteCustomFieldDefinitionFromProject={props.onDeleteCustomFieldDefinitionFromProject}
                            onUpdateColumnDetails={props.onUpdateColumnDetails}
                            popupSettings={props.popupSettings}
                            activeCardTemplate={props.activeCardTemplate}
                            onSetCardTemplate={props.onSetCardTemplate}
                            boards={props.boards}
                            activeBoardId={props.activeBoardId}
                            onActiveBoardChange={props.onActiveBoardChange}
                            onAddBoard={props.onAddBoard}
                            onEditBoard={props.onEditBoard}
                            onUpdateBoard={props.onUpdateBoard}
                            kanbanProjectFilter={content.id || 'all'}
                            onKanbanProjectFilterChange={() => {}} // Disallow changing filter inside the panel
                            documents={props.documents}
                            forms={props.forms}
                            submissions={props.submissions}
                        />
                    </div>
                );
            }
            case 'anjam':
                return (
                    <div className="p-4 md:p-6 h-full">
                        <AnjamPage
                            tasks={props.tasks}
                            projects={props.projects}
                            users={props.users}
                            forms={[...props.forms].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))}
                            currentUser={props.currentUser}
                            onSelectTask={props.onSelectTask}
                            onUpdateTask={props.onUpdateTask}
                            onUpdateProject={props.onUpdateProject}
                            onQuickAddTask={(content, projectId) => props.onQuickAddTask(content, 'todo', projectId)}
                            onOpenForm={props.onOpenForm}
                            onEditForm={props.onEditForm}
                            onTogglePinForm={props.onTogglePinForm}
                            objectives={props.objectives}
                            onUpdateKeyResultDetails={props.onUpdateKeyResultDetails}
                            submissions={props.submissions}
                        />
                    </div>
                );
            case 'objective': {
                const objective = props.objectives.find(o => o.id === content.id);
                if (!objective) return <div className="p-8">Objective with ID '{content.id}' not found.</div>;
                return (
                    <div className="p-4 md:p-6 h-full">
                        <ObjectiveDisplay 
                            objective={objective} 
                            users={props.users}
                            onSelectKeyResult={props.onSelectKeyResult}
                            onUpdateKeyResultDetails={props.onUpdateKeyResultDetails}
                            onDeleteKeyResult={props.onDeleteKeyResult}
                            onArchiveKeyResult={props.onArchiveKeyResult}
                        />
                    </div>
                );
            }
            default:
                return (
                    <div className="w-full h-full flex items-center justify-center bg-white">
                        <p className="text-gray-500">Content type "{content.type}" not yet supported in AI Display Panel.</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full bg-white animate-fade-in">
            {renderContent()}
        </div>
    );
};
export default AIDisplayPanel;