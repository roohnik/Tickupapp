import React, { useState, useRef, useEffect } from "react";
import { Project, User, Task, Recurrence, KanbanColumn, Team } from "../types";
import Modal from "./Modal";
import {
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  RepeatIcon,
  UserIcon,
  FolderIcon,
  TagIcon,
  UserGroupIcon,
} from "../components/Icons";
import DueDateSelector from "../components/DueDateSelector";
import TaskPropertyRow from "../components/TaskPropertyRow";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";

// interface AddTaskModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   projects: Project[];
//   users: User[];
//   teams: Team[];
//   columns: KanbanColumn[];
//   onSubmit: (taskData: Omit<Task, 'id' | 'tags' | 'comments' | 'checklist' | 'status'>) => void;
//   defaultColumn?: string;
//   defaultDate?: string;
//   currentUser: User;
// }

// const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, projects, users, teams, columns, onSubmit, defaultColumn, defaultDate, currentUser }) => {

const AddTaskModal: React.FC = observer(() => {
  const {
    uiStore,
    taskStore,
    projectStore,
    userStore,
    teamStore,
    boardStore,
    settingsStore,
  } = useStore();
  const isOpen = uiStore.isOpen("addTask");
  const projects = projectStore.projects;
  const users = userStore.users;
  const teams = teamStore.teams;
  const columns = boardStore.columns;
  const currentUser = userStore.currentUser!;
  const defaultColumn = settingsStore.defaultTaskColumn;
  const defaultDate = settingsStore.defaultTaskDate;

  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [assigneeTeamId, setAssigneeTeamId] = useState<string | undefined>(
    undefined
  );
  const [columnId, setColumnId] = useState(
    defaultColumn || columns[0]?.id || ""
  );
  const [numericValue, setNumericValue] = useState<string>("");

  // State for optional, progressively-disclosed fields
  const [showDueDate, setShowDueDate] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [recurrence, setRecurrence] = useState<Recurrence | undefined>(
    undefined
  );

  const contentRef = useRef<HTMLTextAreaElement>(null);

  // const resetForm = () => {
  //   setContent("");
  //   setDescription("");
  //   setProjectId(projects[0]?.id || "");
  //   setAssigneeId(currentUser.id);
  //   setAssigneeTeamId(undefined);
  //   setColumnId(defaultColumn || columns[0]?.id || "");
  //   setDueDate(defaultDate || "");
  //   setShowDueDate(!!defaultDate);
  //   setRecurrence(undefined);
  //   setShowRecurrence(false);
  //   setNumericValue("");
  // };

  // useEffect(() => {
  //   if (isOpen) {
  //     resetForm();
  //     setTimeout(() => contentRef.current?.focus(), 100);
  //   }
  // }, [isOpen, defaultColumn, defaultDate]);
  useEffect(() => {
    if (isOpen) {
      setContent("");
      setDescription("");
      setProjectId(projects[0]?.id || "");
      setAssigneeId(currentUser.id);
      setAssigneeTeamId(undefined);
      setColumnId(defaultColumn || columns[0]?.id || "");
      setDueDate(defaultDate || "");
      setShowDueDate(!!defaultDate);
      setRecurrence(undefined);
      setShowRecurrence(false);
      setNumericValue("");
      setTimeout(() => contentRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !projectId || !assigneeId) {
      alert("لطفاً عنوان، پروژه و مسئول تسک را مشخص کنید.");
      return;
    }
    // onSubmit({
    //   content: content.trim(),
    //   description: description.trim() || undefined,
    //   projectId,
    //   assigneeId,
    //   assigneeTeamId,
    //   columnId,
    //   dueDate: dueDate || undefined,
    //   recurrence,
    //   numericValue: numericValue ? parseFloat(numericValue) : undefined,
    // });
    // onClose();
    taskStore.submitTask({
      content: content.trim(),
      description: description.trim() || undefined,
      projectId,
      assigneeId,
      assigneeTeamId,
      columnId,
      dueDate: dueDate || undefined,
      recurrence,
      numericValue: numericValue ? parseFloat(numericValue) : undefined,
    });

    uiStore.closeModal("addTask");
  };
  if (!isOpen) return null;

  const commonSelectClasses =
    "w-full text-sm border-none bg-transparent focus:ring-0 p-1 rounded-md hover:bg-gray-100 font-medium";

  return (
    // <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
    <Modal
      isOpen={isOpen}
      onClose={() => uiStore.closeModal("addTask")}
      title="ایجاد تسک جدید"
      size="xl"
    >
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200/80">
        <h2 className="text-xl font-semibold text-brand-text">
          ایجاد تسک جدید
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
        <div>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-2xl font-bold border-none focus:ring-0 resize-none p-1 -m-1 bg-transparent placeholder-gray-400"
            placeholder="یک عنوان برای تسک بنویسید..."
            rows={1}
            required
          />
        </div>

        <div className="space-y-1">
          <TaskPropertyRow
            icon={<FolderIcon className="w-4 h-4" />}
            label="پروژه"
          >
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className={commonSelectClasses}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </TaskPropertyRow>
          <TaskPropertyRow icon={<TagIcon className="w-4 h-4" />} label="وضعیت">
            <select
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              required
              className={commonSelectClasses}
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </TaskPropertyRow>
          <TaskPropertyRow
            icon={<UserIcon className="w-4 h-4" />}
            label="مسئول"
          >
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              required
              className={commonSelectClasses}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </TaskPropertyRow>
          <TaskPropertyRow
            icon={<UserGroupIcon className="w-4 h-4" />}
            label="تیم"
          >
            <select
              value={assigneeTeamId}
              onChange={(e) => setAssigneeTeamId(e.target.value || undefined)}
              className={commonSelectClasses}
            >
              <option value="">هیچکدام</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </TaskPropertyRow>

          {showDueDate && (
            <TaskPropertyRow
              icon={<CalendarIcon className="w-4 h-4" />}
              label="سررسید"
            >
              <DueDateSelector value={dueDate} onChange={setDueDate} />
            </TaskPropertyRow>
          )}

          {showRecurrence && (
            <TaskPropertyRow
              icon={<RepeatIcon className="w-4 h-4" />}
              label="تکرار"
            >
              <select
                value={recurrence?.frequency || ""}
                onChange={(e) =>
                  setRecurrence(
                    e.target.value
                      ? { frequency: e.target.value as any }
                      : undefined
                  )
                }
                className={commonSelectClasses}
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
            </TaskPropertyRow>
          )}
        </div>

        <div className="pt-2">
          <label
            htmlFor="task-description"
            className="text-sm font-medium text-brand-text mb-2 block"
          >
            توضیحات
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm border-gray-200 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
            placeholder="جزئیات بیشتر (اختیاری)..."
            rows={4}
          />
        </div>

        <div className="pt-2">
          <label
            htmlFor="task-numeric-value"
            className="text-sm font-medium text-brand-text mb-2 block"
          >
            مقدار عددی
          </label>
          <input
            id="task-numeric-value"
            type="number"
            value={numericValue}
            onChange={(e) => setNumericValue(e.target.value)}
            className="w-full text-sm border-gray-200 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
            placeholder="مقدار عددی (اختیاری)..."
          />
        </div>

        <div className="flex justify-between items-center pt-5 border-t border-gray-200/80">
          <div className="flex items-center space-x-1 space-x-reverse">
            <button
              type="button"
              onClick={() => setShowDueDate((p) => !p)}
              title="افزودن تاریخ سررسید"
              className={`p-2 rounded-full hover:bg-gray-200 ${
                showDueDate ? "bg-blue-100 text-brand-primary" : "text-gray-500"
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowRecurrence((p) => !p)}
              title="افزودن تکرار"
              className={`p-2 rounded-full hover:bg-gray-200 ${
                showRecurrence
                  ? "bg-blue-100 text-brand-primary"
                  : "text-gray-500"
              }`}
            >
              <RepeatIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm"
            >
              لغو
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-blue-600 transition-all hover:shadow-md font-semibold text-sm"
            >
              ایجاد تسک
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
});

export default AddTaskModal;
