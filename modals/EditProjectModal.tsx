import React, { useState, useEffect, useMemo } from "react";
import {
  Project,
  Objective,
  ViewMode,
  ProjectRisk,
  RiskLevel,
  User,
  KeyResult,
} from "../types";
import {
  KANBAN_COLOR_MAP,
  KANBAN_COLOR_OPTIONS,
  VIEW_MODES,
} from "../constants";
import Modal from "./Modal";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import { PlusIcon, TrashIcon } from "../components/Icons";

// interface EditProjectModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   project: Project;
//   objectives: Objective[];
//   users: User[];
//   onSubmit: (updatedProject: Project) => void;
//   onArchive: (projectId: string) => void;
// }

type Tab = "general" | "alignment" | "charter" | "risks";

const RISK_LEVEL_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: "LOW", label: "کم" },
  { value: "MEDIUM", label: "متوسط" },
  { value: "HIGH", label: "زیاد" },
];

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 ${
      isActive
        ? "border-brand-primary text-brand-primary"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`}
  >
    {label}
  </button>
);

// const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, project, objectives, users, onSubmit, onArchive }) => {
const EditProjectModal: React.FC = observer(() => {
  const { uiStore, projectStore, objectiveStore, userStore } = useStore();
  const isOpen = uiStore.isOpen("editProject");
  const project = projectStore.projectToEdit;
  const objectives = objectiveStore.objectives;
  const users = userStore.users;

  if (!isOpen || !project) return null;
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [projectData, setProjectData] = useState<Partial<Project>>({});

  useEffect(() => {
    if (project) {
      setProjectData({
        name: project.name || "",
        color: project.color || "gray",
        description: project.description || "",
        missionStatement: project.missionStatement || "",
        objectiveId: project.objectiveId || "",
        keyResultId: project.keyResultId || "",
        enabledViews: project.enabledViews || [],
        objectiveAlignmentExplanation:
          project.objectiveAlignmentExplanation || "",
        impactIfNotDone: project.impactIfNotDone || "",
        projectGoals: project.projectGoals || "",
        projectScope: project.projectScope || "",
        memberIds: project.memberIds || [],
        risks: project.risks || [],
      });
      setActiveTab("general");
    }
  }, [project, isOpen]);

  if (!project) return null;

  const handleFieldChange = (field: keyof Project, value: any) => {
    setProjectData((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewToggle = (viewKey: ViewMode) => {
    const currentViews = new Set(projectData.enabledViews || []);
    if (currentViews.has(viewKey)) {
      currentViews.delete(viewKey);
    } else {
      currentViews.add(viewKey);
    }
    handleFieldChange("enabledViews", Array.from(currentViews));
  };

  const handleRiskChange = (
    index: number,
    field: keyof ProjectRisk,
    value: string
  ) => {
    const newRisks = [...(projectData.risks || [])];
    if (newRisks[index]) {
      (newRisks[index] as any)[field] = value;
      handleFieldChange("risks", newRisks);
    }
  };

  const handleAddRisk = () => {
    const newRisk: ProjectRisk = {
      id: `risk-${Date.now()}`,
      description: "",
      likelihood: "LOW",
      severity: "LOW",
    };
    handleFieldChange("risks", [...(projectData.risks || []), newRisk]);
  };

  const handleDeleteRisk = (index: number) => {
    handleFieldChange(
      "risks",
      (projectData.risks || []).filter((_, i) => i !== index)
    );
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     onSubmit({ ...project, ...projectData } as Project);
  //     onClose();
  // };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    projectStore.submitProject({ ...project, ...projectData });
    uiStore.closeModal("editProject");
  };

  // const handleArchive = () => {
  //     onArchive(project.id);
  //     onClose();
  // };
  const handleArchive = () => {
    projectStore.archiveProject(project.id);
    uiStore.closeModal("editProject");
  };

  const selectedObjective = objectives.find(
    (o) => o.id === projectData.objectiveId
  );
  const keyResultsForObjective =
    selectedObjective?.keyResults.filter((kr) => !kr.isArchived) || [];

  return (
    // <Modal isOpen={isOpen} onClose={onClose} title={`ویرایش پروژه: ${project.name}`} size="2xl">
    <Modal
      isOpen={isOpen}
      onClose={() => uiStore.closeModal("editProject")}
      title={`ویرایش پروژه: ${project.name}`}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="text-right">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-4 space-x-reverse overflow-x-auto">
            <TabButton
              label="مشخصات کلی"
              isActive={activeTab === "general"}
              onClick={() => setActiveTab("general")}
            />
            <TabButton
              label="ارتباط با هدف"
              isActive={activeTab === "alignment"}
              onClick={() => setActiveTab("alignment")}
            />
            <TabButton
              label="منشور پروژه"
              isActive={activeTab === "charter"}
              onClick={() => setActiveTab("charter")}
            />
            <TabButton
              label="ریسک‌ها"
              isActive={activeTab === "risks"}
              onClick={() => setActiveTab("risks")}
            />
          </nav>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
          {activeTab === "general" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium">نام پروژه</label>
                <input
                  type="text"
                  value={projectData.name || ""}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  required
                  className="input-style"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">هدف مرتبط</label>
                <select
                  value={projectData.objectiveId || ""}
                  onChange={(e) =>
                    handleFieldChange("objectiveId", e.target.value)
                  }
                  className="input-style"
                >
                  {objectives.map((obj) => (
                    <option key={obj.id} value={obj.id}>
                      {obj.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  نتیجه کلیدی مرتبط
                </label>
                <select
                  value={projectData.keyResultId || ""}
                  onChange={(e) =>
                    handleFieldChange("keyResultId", e.target.value)
                  }
                  className="input-style"
                  disabled={!selectedObjective}
                >
                  <option value="">هیچکدام</option>
                  {keyResultsForObjective.map((kr) => (
                    <option key={kr.id} value={kr.id}>
                      {kr.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">رنگ</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {KANBAN_COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleFieldChange("color", c)}
                      className={`w-8 h-8 rounded-full ${
                        KANBAN_COLOR_MAP[c].bg
                      } border-2 ${
                        projectData.color === c
                          ? "ring-2 ring-offset-1 ring-brand-primary border-white"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">نماهای فعال</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {VIEW_MODES.map((view) => (
                    <label
                      key={view.key}
                      className="flex items-center p-2 border rounded-md hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={
                          !projectData.enabledViews ||
                          projectData.enabledViews.length === 0 ||
                          projectData.enabledViews.includes(view.key)
                        }
                        onChange={() => handleViewToggle(view.key)}
                        className="h-4 w-4 text-brand-primary rounded"
                      />
                      <span className="mr-2 text-sm">{view.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "alignment" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium">
                  این پروژه چطور به هدف{" "}
                  <span className="font-bold text-brand-primary">
                    "{selectedObjective?.title}"
                  </span>{" "}
                  مربوط است؟
                </label>
                <textarea
                  value={projectData.objectiveAlignmentExplanation || ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "objectiveAlignmentExplanation",
                      e.target.value
                    )
                  }
                  rows={4}
                  className="input-style"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  اگر این پروژه انجام نشود، چه تأثیری روی رسیدن به هدف دارد؟
                </label>
                <textarea
                  value={projectData.impactIfNotDone || ""}
                  onChange={(e) =>
                    handleFieldChange("impactIfNotDone", e.target.value)
                  }
                  rows={4}
                  className="input-style"
                />
              </div>
            </div>
          )}
          {activeTab === "charter" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium">
                  ماموریت پروژه
                </label>
                <textarea
                  value={projectData.missionStatement || ""}
                  onChange={(e) =>
                    handleFieldChange("missionStatement", e.target.value)
                  }
                  rows={3}
                  className="input-style"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">اهداف پروژه</label>
                <textarea
                  value={projectData.projectGoals || ""}
                  onChange={(e) =>
                    handleFieldChange("projectGoals", e.target.value)
                  }
                  rows={4}
                  className="input-style"
                  placeholder="اهداف SMART این پروژه را لیست کنید..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  محدوده پروژه
                </label>
                <textarea
                  value={projectData.projectScope || ""}
                  onChange={(e) =>
                    handleFieldChange("projectScope", e.target.value)
                  }
                  rows={4}
                  className="input-style"
                  placeholder="چه چیزهایی در محدوده این پروژه هست و چه چیزهایی نیست؟"
                />
              </div>
            </div>
          )}
          {activeTab === "risks" && (
            <div className="space-y-3 animate-fade-in">
              {(projectData.risks || []).map((risk, index) => (
                <div
                  key={risk.id}
                  className="p-3 border rounded-lg bg-gray-50/70 flex items-start gap-2"
                >
                  <div className="flex-grow space-y-2">
                    <input
                      type="text"
                      value={risk.description}
                      onChange={(e) =>
                        handleRiskChange(index, "description", e.target.value)
                      }
                      placeholder="شرح ریسک"
                      className="input-style"
                    />
                    <div className="flex gap-2">
                      <select
                        value={risk.likelihood}
                        onChange={(e) =>
                          handleRiskChange(index, "likelihood", e.target.value)
                        }
                        className="input-style w-1/2"
                      >
                        {RISK_LEVEL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            احتمال: {opt.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={risk.severity}
                        onChange={(e) =>
                          handleRiskChange(index, "severity", e.target.value)
                        }
                        className="input-style w-1/2"
                      >
                        {RISK_LEVEL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            شدت: {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteRisk(index)}
                    className="p-2 text-gray-400 hover:text-red-500 mt-1"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddRisk}
                className="flex items-center text-sm font-semibold text-brand-primary"
              >
                <PlusIcon className="w-4 h-4 ml-1" /> افزودن ریسک
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <button
            type="button"
            onClick={handleArchive}
            className="px-4 py-2 text-sm font-semibold text-red-600 rounded-md hover:bg-red-50"
          >
            آرشیو کردن پروژه
          </button>
          <div className="flex space-x-2 space-x-reverse">
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
              ذخیره
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
});

export default EditProjectModal;
