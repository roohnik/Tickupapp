//Refactor to use `uiStore` for modal triggers and `projectStore` for context.

import React, { useRef, useEffect } from "react";
import { Form } from "../types";
import { PlusIcon, ChecklistIcon } from "./Icons";

interface CreateMenuProps {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
  onAddTask: () => void;
  onSelectForm: (formId: string) => void;
  pinnedForms: Form[];
}

const CreateMenu: React.FC<CreateMenuProps> = ({
  anchorEl,
  isOpen,
  onClose,
  onAddTask,
  onSelectForm,
  pinnedForms,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !anchorEl?.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

  if (!isOpen || !anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();
  const isBottomNav = anchorEl.dataset.menuPosition === "top";

  const style: React.CSSProperties = {
    position: "fixed",
    width: "256px",
    zIndex: 50,
  };

  if (isBottomNav) {
    style.bottom = `${window.innerHeight - rect.top + 8}px`;
    style.left = `${rect.left + rect.width / 2 - 128}px`;
  } else {
    // Sidebar
    const sidebar = anchorEl.closest("aside");
    if (sidebar) {
      const sidebarRect = sidebar.getBoundingClientRect();
      const menuWidth = 256;
      // Position it to the left of the sidebar (correct for RTL)
      style.left = `${sidebarRect.left - menuWidth - 8}px`;

      const isBottomHalf = rect.top > window.innerHeight / 2;
      if (isBottomHalf) {
        style.bottom = `${window.innerHeight - rect.bottom}px`;
      } else {
        style.top = `${rect.top}px`;
      }
    } else {
      // Fallback
      style.top = rect.bottom + 8;
      style.left = rect.left;
    }
  }

  return (
    <div
      ref={menuRef}
      style={style}
      className="bg-white rounded-lg shadow-xl border z-50 animate-fade-in py-2"
    >
      <ul>
        <li>
          <button
            onClick={onAddTask}
            className="w-full flex items-center px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-100"
          >
            <PlusIcon className="w-5 h-5 ml-3 text-brand-primary" />
            <span>ایجاد تسک جدید</span>
          </button>
        </li>
        {pinnedForms.length > 0 && <li className="my-1 border-t"></li>}
        {pinnedForms.map((form) => (
          <li key={form.id}>
            <button
              onClick={() => onSelectForm(form.id)}
              className="w-full flex items-center px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-100"
            >
              <ChecklistIcon className="w-5 h-5 ml-3 text-gray-500" />
              <span className="truncate">{form.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreateMenu;
