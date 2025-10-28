import React, { useState, useEffect, useRef } from "react";
import {
  Project,
  User,
  Task,
  KanbanColumn,
  Recurrence,
  TaskWorkflowState,
  WORKFLOW_STATES,
} from "../types";
import Modal from "./Modal";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import { CalendarIcon, RepeatIcon } from "../components/Icons";
import DueDateSelector from "../components/DueDateSelector";

// interface EditTaskModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   task: Task;
//   projects: Project[];
//   users: User[];
//   columns: KanbanColumn[];
//   onSubmit: (taskData: Task) => void;
// }

// const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, projects, users, columns, onSubmit }) => {
const EditTaskModal: React.FC = observer(() => {
  const { uiStore, taskStore, projectStore, userStore, boardStore } =
    useStore();
  const isOpen = uiStore.isOpen("editTask");
  const task = taskStore.taskToEdit;
  const projects = projectStore.projects;
  const users = userStore.users;
  const columns = boardStore.columns;

  if (!isOpen || !task) return null;

  const [content, setContent] = useState(task.content);
  const [description, setDescription] = useState(task.description || "");
  const [projectId, setProjectId] = useState(task.projectId);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId);
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [recurrence, setRecurrence] = useState<Recurrence | undefined>(
    task.recurrence
  );

  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(task.content);
    setDescription(task.description || "");
    setProjectId(task.projectId);
    setAssigneeId(task.assigneeId);
    setStatus(task.status);
    setDueDate(task.dueDate || "");
    setRecurrence(task.recurrence);
  }, [task]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [content]);

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!content.trim() || !projectId || !assigneeId) {
  //     alert('لطفاً عنوان، پروژه و مسئول تسک را مشخص کنید.');
  //     return;
  //   }
  //   const column = columns.find(c => c.title === status);
  //   onSubmit({
  //     ...task,
  //     content: content.trim(),
  //     description: description.trim() || undefined,
  //     projectId,
  //     assigneeId,
  //     status,
  //     columnId: column ? column.id : task.columnId,
  //     dueDate: dueDate || undefined,
  //     recurrence,
  //   });
  //   onClose();
  // };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    taskStore.submitTask({
      ...task,
      content,
      description,
      projectId,
      assigneeId,
      status,
      columnId,
      dueDate,
      recurrence,
    });
    uiStore.closeModal("editTask");
  };

  return (
    // <Modal isOpen={isOpen} onClose={onClose} title="ویرایش تسک" size="xl">
    <Modal
      isOpen={isOpen}
      onClose={() => uiStore.closeModal("editTask")}
      title="ویرایش تسک"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="p-4 border bg-gray-50/70 rounded-lg">
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xl font-semibold border-none focus:ring-0 resize-none p-0 bg-transparent placeholder-gray-500"
            rows={1}
            required
          />
          <div className="flex items-center space-x-4 space-x-reverse mt-2 text-sm">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="border-none bg-transparent focus:ring-0 p-0 text-gray-600 font-medium"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="text-gray-300">|</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskWorkflowState)}
              required
              className="border-none bg-transparent focus:ring-0 p-0 text-gray-600 font-medium"
            >
              {WORKFLOW_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <span className="w-24 text-sm text-brand-subtext">مسئول</span>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              required
              className="flex-grow text-sm border-none bg-transparent focus:ring-0 p-1 rounded-md hover:bg-gray-100 font-medium"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <span className="w-24 text-sm text-brand-subtext">سررسید</span>
            <div className="flex-grow p-1 rounded-md hover:bg-gray-100">
              <DueDateSelector value={dueDate} onChange={setDueDate} />
            </div>
          </div>

          <div className="flex items-center">
            <span className="w-24 text-sm text-brand-subtext">تکرار</span>
            <select
              value={recurrence?.frequency || ""}
              onChange={(e) =>
                setRecurrence(
                  e.target.value
                    ? { frequency: e.target.value as any }
                    : undefined
                )
              }
              className="flex-grow text-sm border-none bg-transparent focus:ring-0 p-1 rounded-md hover:bg-gray-100 font-medium"
            >
              <option value="">بدون تکرار</option>
              <option value="daily">روزانه</option>
              <option value="weekly">هفتگی</option>
              <option value="monthly">ماهانه</option>
            </select>
          </div>
        </div>

        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm border-gray-200 rounded-lg focus:ring-brand-primary focus:border-brand-primary mt-2"
            placeholder="توضیحات بیشتر (اختیاری)..."
            rows={4}
          />
        </div>

        <div className="flex justify-end items-center pt-4 border-t">
          <div className="flex space-x-2 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm"
            >
              لغو
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm"
            >
              ذخیره تغییرات
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
});

export default EditTaskModal;
