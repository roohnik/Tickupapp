import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import Modal from "./Modal";
import { Project } from "../types";
import { ArrowUturnLeftIcon } from "../components/Icons";

const ArchivedProjectsModal: React.FC = observer(() => {
  const { uiStore, projectStore } = useStore();
  const isOpen = uiStore.isOpen("archivedProjects");

  const archivedProjects = projectStore.projects.filter((p) => p.isArchived);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => uiStore.closeModal("archivedProjects")}
      title="پروژه‌های آرشیو شده"
      size="xl"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-brand-text mb-3">
            پروژه‌های آرشیو شده
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50/50">
            {archivedProjects.length > 0 ? (
              archivedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="flex justify-between items-center p-2 bg-white rounded-md border"
                >
                  <span className="font-medium text-sm text-brand-text">
                    {proj.name}
                  </span>
                  <button
                    onClick={() => projectStore.unarchiveProject(proj.id)}
                    className="flex items-center text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    title="بازگردانی"
                  >
                    <ArrowUturnLeftIcon className="w-4 h-4 ml-1" />
                    بازگردانی
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-brand-subtext py-4">
                هیچ پروژه آرشیو شده‌ای وجود ندارد.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
});

export default ArchivedProjectsModal;
