import React, { useState } from "react";
import { Project, Objective } from "../types";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import { KANBAN_COLOR_MAP, KANBAN_COLOR_OPTIONS } from "../constants";
import Modal from "./Modal";

// interface AddProjectModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   objectives: Objective[];
//   onSubmit: (newProjectData: Omit<Project, 'id'>) => void;
// }

// const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, objectives, onSubmit }) => {
const AddProjectModal: React.FC = observer(() => {
  const { uiStore, projectStore, objectiveStore } = useStore();
  const isOpen = uiStore.isOpen("addProject");
  const objectives = objectiveStore.objectives;

  const [name, setName] = useState("");
  const [color, setColor] = useState("gray");
  const [description, setDescription] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [objectiveId, setObjectiveId] = useState(objectives[0]?.id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !objectiveId) {
      alert("نام پروژه و هدف مرتبط الزامی است.");
      return;
    }
    projectStore.submitProject({
      name: name.trim(),
      color,
      description: description.trim(),
      missionStatement: missionStatement.trim(),
      objectiveId,
    });
    uiStore.closeModal("addProject");
    // onSubmit({
    //   name: name.trim(),
    //   color,
    //   description: description.trim(),
    //   missionStatement: missionStatement.trim(),
    //   objectiveId,
    // });
  };
  if (!isOpen) return null;

  return (
    // <Modal isOpen={isOpen} onClose={onClose} title="ایجاد پروژه جدید">
    <Modal
      isOpen={isOpen}
      onClose={() => uiStore.closeModal("addProject")}
      title="ایجاد پروژه جدید"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div>
          <label
            htmlFor="proj-name"
            className="block text-sm font-medium text-brand-text"
          >
            نام پروژه
          </label>
          <input
            id="proj-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
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
                  KANBAN_COLOR_MAP[colorOption].bg
                } border-2 ${
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
            htmlFor="proj-desc"
            className="block text-sm font-medium text-brand-text"
          >
            توضیحات پروژه
          </label>
          <textarea
            id="proj-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label
            htmlFor="proj-mission"
            className="block text-sm font-medium text-brand-text"
          >
            بیانیه پروژه
          </label>
          <textarea
            id="proj-mission"
            value={missionStatement}
            onChange={(e) => setMissionStatement(e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label
            htmlFor="proj-objective"
            className="block text-sm font-medium text-brand-text"
          >
            هدف مرتبط
          </label>
          <select
            id="proj-objective"
            value={objectiveId}
            onChange={(e) => setObjectiveId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-lg"
          >
            {objectives.length > 0 ? (
              objectives.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.title}
                </option>
              ))
            ) : (
              <option disabled>هدفی یافت نشد</option>
            )}
          </select>
        </div>

        <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            لغو
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-700"
          >
            ایجاد پروژه
          </button>
        </div>
      </form>
    </Modal>
  );
});

export default AddProjectModal;
