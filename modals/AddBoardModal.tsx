import React, { useState, useEffect } from "react";
import { Project, ViewMode, Board } from "../types";
import {
  VIEW_MODES,
  KANBAN_COLOR_MAP,
  KANBAN_COLOR_OPTIONS,
} from "../constants";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import Modal from "./Modal";

// interface AddBoardModalProps {
//   // isOpen: boolean;
//   onClose: () => void;
//   projects: Project[];
//   onSubmit: (newBoardData: Omit<Board, 'id'> & { id?: string }) => void;
//   // boardToEdit?: Board | null;
//   // defaultProjectId?: string | 'all';
// }

// const AddBoardModal: React.FC<AddBoardModalProps> = observer(({ isOpen, onClose, projects, onSubmit, boardToEdit, defaultProjectId }) => {
const AddBoardModal: React.FC = observer(() => {
  const { uiStore, boardStore, projectStore } = useStore();
  const isOpen = uiStore.isOpen("addBoard");
  const boardToEdit = boardStore.boardToEdit;
  const defaultProjectId = boardStore.defaultProjectId;

  const [name, setName] = useState("");
  const [defaultViewMode, setDefaultViewMode] = useState<ViewMode>("board");
  const [projectId, setProjectId] = useState<string | "all">("all");
  const [enabledViews, setEnabledViews] = useState<Set<ViewMode>>(new Set());
  const [color, setColor] = useState("gray");

  const isEditing = !!boardToEdit;

  useEffect(() => {
    if (isOpen) {
      if (boardToEdit) {
        setName(boardToEdit.name);
        setDefaultViewMode(boardToEdit.defaultViewMode);
        setProjectId(boardToEdit.projectId);
        setEnabledViews(new Set(boardToEdit.enabledViews || []));
        setColor(boardToEdit.color || "gray");
      } else {
        setName("");
        setDefaultViewMode("board");
        setProjectId(defaultProjectId || "all");
        setEnabledViews(new Set());
        setColor("gray");
      }
    }
  }, [isOpen, boardToEdit, defaultProjectId]);

  const handleViewToggle = (viewKey: ViewMode) => {
    setEnabledViews((prev) => {
      const isAllSelected = prev.size === 0;
      const newSet = isAllSelected
        ? new Set(VIEW_MODES.map((v) => v.key))
        : new Set(prev);

      if (newSet.has(viewKey)) {
        newSet.delete(viewKey);
      } else {
        newSet.add(viewKey);
      }

      if (newSet.size === VIEW_MODES.length) {
        return new Set<ViewMode>(); // Revert to "all" (empty set)
      }

      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("نام برد الزامی است.");
      return;
    }
    try {
      await boardStore.submitBoard({
        ...(boardToEdit && { id: boardToEdit.id }),
        name: name.trim(),
        defaultViewMode,
        projectId,
        enabledViews:
          enabledViews.size === 0 ? undefined : Array.from(enabledViews),
        color,
      });
      uiStore.closeModal("addBoard");
    } catch (error) {
      console.error("خطا در ایجاد/ویرایش برد:", error);
      alert("خطایی در ایجاد/ویرایش برد رخ داد. لطفاً دوباره تلاش کنید.");
    }
  };
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => uiStore.closeModal("addBoard")}
      title={boardToEdit ? "ویرایش برد" : "ایجاد برد جدید"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div>
          <label
            htmlFor="board-name"
            className="block text-sm font-medium text-brand-text"
          >
            نام برد
          </label>
          <input
            id="board-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-style"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text">
            رنگ
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {KANBAN_COLOR_OPTIONS.map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                onClick={() => setColor(colorOption)}
                className={`w-8 h-8 rounded-full ${
                  KANBAN_COLOR_MAP[colorOption].dot
                } border-4 ${
                  color === colorOption
                    ? "ring-2 ring-offset-1 ring-brand-primary border-white"
                    : "border-transparent"
                }`}
                aria-label={colorOption}
              />
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="board-view"
            className="block text-sm font-medium text-brand-text"
          >
            نمای پیش‌فرض
          </label>
          <select
            id="board-view"
            value={defaultViewMode}
            onChange={(e) => setDefaultViewMode(e.target.value as ViewMode)}
            className="input-style"
          >
            {VIEW_MODES.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="board-project"
            className="block text-sm font-medium text-brand-text"
          >
            پروژه مرتبط
          </label>
          <select
            id="board-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="input-style"
          >
            <option value="all">همه پروژه‌ها</option>
            {projectStore.projects
              .filter((p) => !p.isArchived)
              .map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name}
                </option>
              ))}
          </select>
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-brand-text">
            نماهای فعال
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {VIEW_MODES.map((view) => (
              <label
                key={view.key}
                className="flex items-center p-2 border rounded-md hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={
                    enabledViews.size === 0 || enabledViews.has(view.key)
                  }
                  onChange={() => handleViewToggle(view.key)}
                  className="h-4 w-4 text-brand-primary rounded focus:ring-brand-primary"
                />
                <span className="mr-2 text-sm">{view.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            اگر هیچ نمایی انتخاب نشود، همه نماها فعال خواهند بود.
          </p>
        </div>

        <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={() => uiStore.closeModal("addBoard")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            لغو
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-700"
          >
            {isEditing ? "ذخیره تغییرات" : "ایجاد برد"}
          </button>
        </div>
      </form>
    </Modal>
  );
});

export default AddBoardModal;
