import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { ToastContainer } from "react-toastify";
import {
  User,
  Objective,
  Team,
  KeyResult,
  KRType,
  Project,
  Task,
  Strategy,
  Index,
  CompanyVision,
  CheckIn,
  KanbanColumn,
  RecurrenceSettings,
  Form,
  FormCategory,
  FormSubmission,
  Document,
  DocumentStatus,
  ActivePage,
  LearningAssignment,
  MicroLearning,
  YouTubeVideo,
  Book,
  LearningAssignmentStatus,
  MonitoringData,
  KRCategory,
  ObjectiveCategoryId,
  ObjectiveSettings,
  HierarchicalViewStyle,
  NavItem,
  SidebarConfig,
  AppSettings,
  TaskFieldLabels,
  CustomFieldDefinition,
  CustomFieldType,
  StyleSettings,
  ComponentStyles,
  FeedbackTag,
  LearningResourceType,
  Comment,
  ViewMode,
  Consultant,
  FormDisplayStyle,
  Board,
  Process,
  Workspace,
  GeneralFeedback,
  FeedbackCategory,
  CustomerNeed,
  CustomerNeedCategory,
  Notification,
  AIDisplayContent,
  AIDisplayContentType,
} from "./types";
import {
  AIPrompts,
  DEFAULT_AI_PROMPTS,
  SuggestedMission,
} from "./services/geminiService";
import { CONSULTANTS } from "./constants";
import { observer } from "mobx-react-lite";
import { useSocketListeners } from "./hooks/useSocketListeners";
import { useStore } from "./stores/StoreContext";
import { 
  emitClientJoin,
  emitLoginAttempt,
  emitUserCreate,
  emitUserUpdate,
  createTask,
  updateTask,
  deleteTask,
  toggleDailyTarget,
  createForm,
  updateForm,
  toggleFormPin,
  moveFormToBoard,
  submitFormSubmission,
  saveDraftSubmission,
  createObjectiveWithKRs,
  addObjectiveComment,
  emitObjectiveDelete,
  emitObjectiveDeleteKr,
  emitObjectiveUpdate,
  emitObjectiveUpdateKr,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  createOrUpdateIndex,
  deleteIndex,
  updateCompanyVision,
  createColumn,
  updateColumn,
  updateProject,
  addProjectCustomField,
  updateProjectCustomField,
  setUsers,
  setTeams,
  setProcesses,
  setDocuments,
  updateLearningAssignment,
  deleteFeedbackTag
} from "./emitter";
import { safeEmit } from "./utils/socketActions";

import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import LoginPage from "./components/LoginPage";
import DashboardPage from "./components/DashboardPage";
import ReportsPage from "./components/ReportsPage";
import AdminPage from "./components/AdminPage";
import InsightsPage from "./components/InsightsPage";
import StrategyPage from "./components/StrategyPage";
import KanbanPage from "./components/KanbanPage";
import AnjamPage from "./components/AnjamPage";
import FormsPage from "./components/FormsPage";
import DocumentsPage from "./components/DocumentsPage";
import LearningPage from "./components/LearningPage";
import FeedbackPage from "./components/FeedbackPage";
import TeamPage from "./components/TeamPage";
import PersonalDevelopmentPage from "./components/PersonalDevelopmentPage";
import CustomersPage from "./components/CustomersPage";
import BottomNavBar from "./components/BottomNavBar";
import CreateMenu from "./components/CreateMenu";
import MoreActionsMenu from "./components/MoreActionsMenu";
import CustomizeNavModal from "./modals/CustomizeNavModal";

import AddTaskModal from "./modals/AddTaskModal";
import EditProfileModal from "./modals/EditProfileModal";
import TaskSidePanel from "./components/TaskSidePanel";
import { FormBuilderModal } from "./modals/FormBuilderModal";
import FormDisplay from "./components/FormDisplay";
import ObjectiveSidePanel from "./components/ObjectiveSidePanel";
import Modal from "./modals/Modal";
import ObjectiveCreationWizard from "./components/ObjectiveCreationWizard";
import SmartObjectiveWizard from "./components/SmartObjectiveWizard";
import EditObjectiveModal from "./components/EditObjectiveModal";
import AddProjectModal from "./modals/AddProjectModal";
import AddBoardModal from "./modals/AddBoardModal";
import ConfirmationModal from "./modals/ConfirmationModal";
import ArchivedItemsModal from "./modals/ArchivedItemsModal";
import CreateMicroLearningModal from "./modals/CreateMicroLearningModal";
import MicroLearningViewerModal from "./modals/MicroLearningViewerModal";
import NewKeyResultForm from "./components/NewKeyResultForm";
import KeyResultSidePanel from "./components/KeyResultSidePanel";
import ConsultingPage from "./components/ConsultingPage";
import UpgradePage from "./components/UpgradePage";
import AIChatButton from "./components/AIChatButton";
import AIChatPanel from "./components/AIChatPanel";
import ConsultantPopover from "./components/ConsultantPopover";
import FeedbackSidePanel from "./components/FeedbackSidePanel";
import DocumentEditor from "./components/DocumentEditor";
import FullScreenModal from "./modals/FullScreenModal";
import MoveFormToBoardModal from "./modals/MoveFormToBoardModal";

import {
  ChartIcon,
  DocumentTextIcon,
  FolderIcon,
  GoalIcon,
  InfoIcon,
  KanbanIcon,
  RocketIcon,
  SettingsIcon,
  UserIcon,
  ArrowUturnLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserGroupIcon,
  TrophyIcon,
  HandshakeIcon,
  ThreeDotsIcon,
  BanknotesIcon,
  CubeIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  MegaphoneIcon,
  LightbulbIcon,
  BookOpenIcon,
  ClipboardListIcon,
  ChatBubbleSimpleIcon,
  SparklesIcon,
} from "./components/Icons";
import SalesPage from "./components/SalesPage";
import CrmPage from "./components/CrmPage";
import ProductionPage from "./components/ProductionPage";
import QualityPage from "./components/QualityPage";
import InventoryPage from "./components/InventoryPage";
import PurchasingPage from "./components/PurchasingPage";
import MarketingPage from "./components/MarketingPage";
import RecruitmentPage from "./components/RecruitmentPage";
import ExpensesPage from "./components/ExpensesPage";
import ContractsPage from "./components/ContractsPage";
import SelfKnowledgePage from "./components/SelfKnowledgePage";
import OrganizationalKnowledgePage from "./components/OrganizationalKnowledgePage";
import IkigaiWizard from "./components/IkigaiWizard";
import ArchivedProjectsModal from "./modals/ArchivedProjectsModal";
import SearchModal from "./modals/SearchModal";
import NewWorkspaceModal from "./modals/NewWorkspaceModal";
import { emitWithAck } from "./utils/emitWithAck";
import { showToast } from "./utils/toast";
import { safeEmit } from "./utils/socketActions";

const ArchivedStrategyIndexModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  strategies: Strategy[];
  indices: Index[];
  onUnarchiveStrategy: (id: string) => void;
  onUnarchiveIndex: (id: string) => void;
}> = ({
  isOpen,
  onClose,
  strategies,
  indices,
  onUnarchiveStrategy,
  onUnarchiveIndex,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="استراتژی‌ها و شاخص‌های آرشیو شده"
      size="xl"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-brand-text mb-3">
            استراتژی‌های آرشیو شده
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50/50">
            {strategies.length > 0 ? (
              strategies.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-white rounded-md border"
                >
                  <span className="font-medium text-sm text-brand-text">
                    {item.name}
                  </span>
                  <button
                    onClick={() => onUnarchiveStrategy(item.id)}
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
                هیچ استراتژی آرشیو شده‌ای وجود ندارد.
              </p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-brand-text mb-3">
            شاخص‌های آرشیو شده
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50/50">
            {indices.length > 0 ? (
              indices.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-white rounded-md border"
                >
                  <span className="font-medium text-sm text-brand-text">
                    {item.name}
                  </span>
                  <button
                    onClick={() => onUnarchiveIndex(item.id)}
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
                هیچ شاخص آرشیو شده‌ای وجود ندارد.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

type Theme = "light" | "dark";
type DailyPerformance = {
  [date: string]: { rating?: number; feedback?: string; feeling?: string };
};

const usePersistentState = <T,>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setInternalState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const setState: React.Dispatch<React.SetStateAction<T>> = (newValue) => {
    try {
      const valueToStore =
        newValue instanceof Function ? newValue(state) : newValue;
      setInternalState(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [state, setState];
};
//Wrapping the component in observer() so it reacts to MobX store changes.
const App: React.FC = observer(() => {
  const store = useStore();

  const [formToDisplay, setFormToDisplay] = useState<Form | null>(null); //!!!!!!!!!!!

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false); //!!!!!!!!!!!!
  const [isAddBoardModalOpen, setIsAddBoardModalOpen] = useState(false); //!!!!!!!!!!!!!!
  const [boardToEdit, setBoardToEdit] = useState<Board | null>(null); //!!!!!!!!!!!!!!!!
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false); //!!!!!!!!!
  const [isMoveFormModalOpen, setIsMoveFormModalOpen] = useState(false); //!!!!!!!!!!!
  // UI states (ephemeral)
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false); //!!!!!
  const createButtonRef = React.useRef<HTMLButtonElement>(null); //!!!!!!!!!
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false); //!!!!!
  const moreButtonRef = React.useRef<HTMLButtonElement>(null); //!!!!!!!!!!
  const [isCustomizeNavOpen, setIsCustomizeNavOpen] = useState(false); //!!!!!!!!!!
  const [isConsultantPopoverOpen, setIsConsultantPopoverOpen] = useState(false); //!!!!!!!!!!
  const consultantButtonRef = React.useRef<HTMLButtonElement>(null); //!!!!!!!!!!!!!!!!

  // ✅ activate real-time listeners once
  useSocketListeners();
  // on mount: if you want to join user room for direct notifications

  useEffect(() => {
    // if store.currentUser exists, tell server who we are so it can emit to our room
    if (store.currentUser?.id) {
      emitClientJoin(store.currentUser.id);
    }

    // =================================================================
    // SOCKET.IO LOGIC
    // =================================================================
    //Optional: request initial lists if server requires (many servers send "initial-data" automatically)
    //safe to call; server should reply or ignore
    emitWithAck("projects:list").catch(() => {});
    emitWithAck("boards:list").catch(() => {});
    emitWithAck("columns:list").catch(() => {});
    emitWithAck("forms:list").catch(() => {});
    emitWithAck("formCategories:list").catch(() => {});
    emitWithAck("objectives:list").catch(() => {});
    emitWithAck("strategies:list").catch(() => {});
    emitWithAck("workspaces:list").catch(() => {});
    emitWithAck("feedbackTags:list").catch(() => {});
    if (store.currentUser?.id) {
      emitWithAck("notifications:list", { userId: store.currentUser.id }).catch(
        () => {}
      );
    }
    // socket.emit("projects:list");
    // socket.emit("boards:list");
    // socket.emit("columns:list");
    // socket.emit("forms:list");
    // socket.emit("formCategories:list");
    // socket.emit("objectives:list");
    // socket.emit("strategies:list");
    // socket.emit("workspaces:list");
    // socket.emit("feedbackTags:list");
    // socket.emit("notifications:list", { userId: currentUser?.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentUser?.id]);

  // useEffect(() => {
  //   const dataSetters: {
  //     [key: string]: React.Dispatch<React.SetStateAction<any>>;
  //   } = {
  //     users: setUsers,
  //     teams: setTeams,
  //     objectives: setObjectives,
  //     projects: setProjects,
  //     tasks: setTasks,
  //     columns: setColumns,
  //     boards: setBoards,
  //     strategies: setStrategies,
  //     indices: setIndices,
  //     companyVision: setCompanyVision,
  //     forms: setForms,
  //     formCategories: setFormCategories,
  //     submissions: setSubmissions,
  //     documents: setDocuments,
  //     documentStatuses: setDocumentStatuses,
  //     learningAssignments: setLearningAssignments,
  //     microLearnings: setMicroLearnings,
  //     youtubeVideos: setYouTubeVideos,
  //     books: setBooks,
  //     feedbackTags: setFeedbackTags,
  //     challengeTags: setChallengeTags,
  //     processes: setProcesses,
  //     workspaces: setWorkspaces,
  //     generalFeedbacks: setGeneralFeedbacks,
  //     customerNeeds: setCustomerNeeds,
  //     notifications: setNotifications,
  //   };

  //   //means that when your backend emits socket.emit("initial-data", fullData), the front-end immediately
  //   // ..sets all of those states (projects, tasks,users, etc) at once
  //   socket.on("initial-data", (data) => {
  //     console.log("Received initial data");
  //     for (const key in data) {
  //       if (dataSetters[key]) {
  //         dataSetters[key](data[key] || (key === "companyVision" ? {} : []));
  //       }
  //     }
  //     setIsDataLoaded(true);
  //   });

  //   socket.on("login:success", (user: User) => {
  //     setCurrentUser(user);
  //     setIsLoggingIn(false);
  //     setLoginError("");
  //   });

  //   socket.on("login:fail", (message: string) => {
  //     setLoginError(message);
  //     setIsLoggingIn(false);
  //   });

  //   //dynamically attaches 3 event listeners per model type
  //   //generic listener system for almost all your entities
  //   for (const model in dataSetters) {
  //     socket.on(`${model}:created`, (item: any) => {
  //       dataSetters[model]((prev: any) =>
  //         Array.isArray(prev) ? [...prev, item] : item
  //       );
  //     });
  //     socket.on(`${model}:updated`, (item: any) => {
  //       dataSetters[model]((prev: any) =>
  //         Array.isArray(prev)
  //           ? prev.map((i: any) => (i.id === item.id ? item : i))
  //           : item
  //       );
  //     });
  //     socket.on(`${model}:deleted`, (id: string | string[]) => {
  //       const idsToDelete = Array.isArray(id) ? id : [id];
  //       dataSetters[model]((prev: any[]) =>
  //         prev.filter((item) => !idsToDelete.includes(item.id))
  //       );
  //     });
  //   }

  //   socket.on("users:updated", (updatedUser: User) => {
  //     setUsers((prev) =>
  //       prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
  //     );
  //     if (currentUser?.id === updatedUser.id) {
  //       setCurrentUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  //     }
  //   });

  //   return () => {
  //     socket.off("initial-data");
  //     socket.off("login:success");
  //     socket.off("login:fail");
  //     socket.off("users:updated");
  //     for (const model in dataSetters) {
  //       socket.off(`${model}:created`);
  //       socket.off(`${model}:updated`);
  //       socket.off(`${model}:deleted`);
  //     }
  //   };
  // }, [currentUser?.id]);

  // =================================================================
  // MEMOIZED VALUES
  // =================================================================
  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );
  const dailyTargetKRs = useMemo(
    () =>
      objectives.flatMap((obj) =>
        obj.keyResults.filter((kr) => kr.dailyTarget)
      ),
    [objectives]
  );
  const todaysDailyTargetTaskKrIds = useMemo(() => {
    const todayString = new Date().toDateString();
    return new Set(
      tasks
        .filter(
          (t) =>
            t.dailyTargetKrId &&
            t.dueDate &&
            new Date(t.dueDate).toDateString() === todayString
        )
        .map((t) => t.dailyTargetKrId!)
    );
  }, [tasks]);
  const dailyTargetInfo = useMemo(() => {
    const todaysKRs = dailyTargetKRs.filter((kr) =>
      todaysDailyTargetTaskKrIds.has(kr.id)
    );
    if (todaysKRs.length === 0)
      return {
        progress: null,
        krs: [],
        totalCurrent: 0,
        totalTarget: 0,
        targetType: null,
      };
    const targetType = todaysKRs[0].dailyTarget!.type;
    const totalCurrent = todaysKRs.reduce(
      (sum, kr) => sum + (kr.dailyTarget?.current || 0),
      0
    );
    const totalTarget = todaysKRs.reduce(
      (sum, kr) => sum + (kr.dailyTarget?.target || 0),
      0
    );
    const progress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    const krsWithObjectiveId = todaysKRs.map((kr) => ({
      ...kr,
      objectiveId: objectives.find((o) =>
        o.keyResults.some((k) => k.id === kr.id)
      )!.id,
    }));
    return {
      progress,
      krs: krsWithObjectiveId,
      totalCurrent,
      totalTarget,
      targetType,
    };
  }, [dailyTargetKRs, todaysDailyTargetTaskKrIds, objectives]);
  const todaysTotalTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate).toDateString() === new Date().toDateString()
      ).length,
    [tasks]
  );
  const todaysCompletedTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status === "انجام شد" &&
          t.dueDate &&
          new Date(t.dueDate).toDateString() === new Date().toDateString()
      ).length,
    [tasks]
  );
  const selectedKR = useMemo(() => {
    if (!selectedKRInfo) return null;
    const objective = objectives.find(
      (o) => o.id === selectedKRInfo.objectiveId
    );
    return (
      objective?.keyResults.find((kr) => kr.id === selectedKRInfo.krId) || null
    );
  }, [selectedKRInfo, objectives]);

  // =================================================================
  // EFFECTS
  // =================================================================
  useEffect(() => {
    if (!activeBoardId && boards.length > 0) {
      const pinned = boards.find((b) => b.isPinned);
      setActiveBoardId(pinned?.id || boards[0].id);
    }
  }, [boards, activeBoardId, setActiveBoardId]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const availableProjects = projects.filter((p) => !p.isArchived);
    const activeBoard = boards.find((b) => b.id === activeBoardId);
    if (
      activeBoard &&
      activeBoard.projectId !== "all" &&
      !availableProjects.some((p) => p.id === activeBoard.projectId)
    ) {
      const firstValidBoard = boards.find(
        (b) =>
          b.projectId === "all" ||
          availableProjects.some((p) => p.id === b.projectId)
      );
      if (firstValidBoard) setActiveBoardId(firstValidBoard.id);
    }
  }, [projects, boards, activeBoardId, setActiveBoardId]);

  // =================================================================
  // HANDLERS (Emit events to server)
  // =================================================================
  const handleLogin = (username: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError("");
    emitLoginAttempt(username, password);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsDataLoaded(false);
    // Optionally: socket.disconnect(); and reconnect on login
  };

  const handleSetActivePage = (page: ActivePage) => {
    if (page === "aiChat") {
      setAiChatState("fullscreen");
      return;
    }
    setActivePage(page);
  };

  const handleUpdateUser = (
    userId: string,
    name: string,
    username: string,
    password?: string,
    signatureUrl?: string | null
  ) =>
    emitUserUpdate({
      id: userId,
      name,
      username,
      password,
      signatureUrl
    });
  const handleCreateUser = (userData: Omit<User, "id" | "avatarUrl">) =>
    emitUserCreate(userData);
  const handleAddTask = (
    taskData: Omit<Task, "id" | "tags" | "comments" | "checklist">
  ) => createTask(taskData);
  const handleQuickAddTask = (
    content: string,
    columnId: string,
    projectId: string
  ) => {
    if (!currentUser) return;
    createTask({
      content,
      columnId,
      projectId,
      assigneeId: currentUser.id,
      status: "برای انجام",
    });
  };
  const handleUpdateTask = (updatedTask: Task) =>
    updateTask(updatedTask.id, updatedTask);
  const handleTaskColumnChange = (taskId: string, newColumnId: string) =>
    updateTask(taskId, { columnId: newColumnId });
  const handleDeleteTasks = (taskIds: string[]) =>
    deleteTask(taskIds);
  const handleOpenAddTaskModal = (
    defaultColumn?: string,
    defaultDate?: string
  ) => {
    setDefaultTaskColumn(defaultColumn);
    setDefaultTaskDate(defaultDate);
    setIsAddTaskModalOpen(true);
  };
  const handleSaveForm = (
    form: Omit<Form, "id" | "creatorId"> & { id?: string }
  ) => {
    const payload = { ...form, creatorId: currentUser!.id };
    if (form.id) {
      updateForm(payload);
    } else {
      createForm(payload);
    }
    setIsFormBuilderOpen(false);
  };
  const handleEditForm = (formId: string) => {
    const form = forms.find((f) => f.id === formId);
    if (form) {
      setFormToEdit(form);
      setIsFormBuilderOpen(true);
    }
  };
  const handleTogglePinForm = (formId: string) =>
    toggleFormPin(formId);
  const handleMoveFormRequest = (formId: string) => {
    setFormToMoveId(formId);
    setIsMoveFormModalOpen(true);
  };
  const handleMoveFormToBoard = (boardId: string) => {
    if (formToMoveId)
      moveFormToBoard(formToMoveId, boardId);
    setFormToMoveId(null);
    setActivePage("kanban");
    setActiveBoardId(boardId);
  };
  const handleFormColumnChange = (formId: string, newColumnId: string) =>
    updateForm({ id: formId, columnId: newColumnId });
  const handleFormSubmit = (
    submissionData: Omit<FormSubmission, "id" | "status" | "serialNumber">
  ) => submitFormSubmission(submissionData);
  const handleSaveDraft = (
    submissionData: Omit<FormSubmission, "id" | "status" | "serialNumber">
  ) => saveDraftSubmission(submissionData);
  const handleSaveObjective = (
    objectiveData: Omit<Objective, "id" | "keyResults">,
    keyResultsData: Omit<KeyResult, "id">[]
  ) => {
    createObjectiveWithKRs({
      objectiveData,
      keyResultsData,
    });
    setIsObjectiveWizardOpen(false);
    setIsSmartWizardOpen(false);
  };
  const handleAddObjectiveFromChat = (
    objectiveData: Omit<Objective, "id" | "keyResults">,
    keyResultsData: Omit<KeyResult, "id">[]
  ): Objective => {
    const tempId = `obj-temp-${Date.now()}`;
    createObjectiveWithKRs({
      objectiveData,
      keyResultsData,
    });
    return { ...objectiveData, id: tempId, keyResults: [] }; // Return placeholder
  };
  const handleKeyResultCheckin = (
    objectiveId: string,
    krId: string,
    value: number,
    rating: number,
    report: { tasksDone: string; tasksNext: string; challenges: string },
    challengeDifficulty: number,
    challengeTagIds: string[]
  ) =>
    emitObjectiveCheckIn(
      krId,
      value,
      rating,
      JSON.stringify(report),
      String(challengeDifficulty),
      challengeTagIds
    );
  const handleKeyResultAddComment = (
    objectiveId: string,
    krId: string,
    text: string
  ) =>
    addObjectiveComment(objectiveId, {
      krId,
      text,
      authorId: currentUser!.id,
    });
  const handleDeleteObjective = (objectiveId: string) =>
    setConfirmation({
      isOpen: true,
      title: "حذف هدف",
      message: "آیا از حذف این هدف اطمینان دارید؟",
      onConfirm: () => emitObjectiveDelete(objectiveId),
    });
  const handleDeleteKeyResult = (objectiveId: string, keyResultId: string) =>
    setConfirmation({
      isOpen: true,
      title: "حذف نتیجه کلیدی",
      message: "آیا از حذف این نتیجه کلیدی اطمینان دارید؟",
      onConfirm: () =>
        emitObjectiveDeleteKr(keyResultId),
    });
  const handleUpdateObjectiveDetails = (
    objectiveId: string,
    title: string,
    description: string,
    strategyId: string | undefined,
    indexIds: string[],
    category: ObjectiveCategoryId,
    parentId: string | undefined,
    color: string
  ) =>
    emitObjectiveUpdate({
      id: objectiveId,
      title,
      description,
      strategyId,
      indexIds,
      category,
      parentId,
      color,
    });
  const handleUpdateKeyResultDetails = (
    objectiveId: string,
    krId: string,
    updates: Partial<KeyResult>
  ) => emitObjectiveUpdateKr(krId, updates);
  const handleArchiveObjective = (objectiveId: string) =>
    emitObjectiveUpdate({ id: objectiveId, isArchived: true });
  const handleUnarchiveObjective = (objectiveId: string) =>
    emitObjectiveUpdate({ id: objectiveId, isArchived: false });
  const handleArchiveKeyResult = (objectiveId: string, keyResultId: string) =>
    emitObjectiveUpdateKr(keyResultId, { isArchived: true });
  const handleUnarchiveKeyResult = (objectiveId: string, keyResultId: string) =>
    emitObjectiveUpdateKr(keyResultId, { isArchived: false });
  const handleSaveStrategy = (
    data: Omit<Strategy, "id" | "isArchived">,
    id?: string
  ) => {
    if (id) {
      return updateStrategy({ ...data, id } as Strategy);
    } else {
      return createStrategy(data);
    }
  };
  const handleArchiveStrategy = (id: string) =>
    updateStrategy({ id, isArchived: true } as Strategy);
  const handleUnarchiveStrategy = (id: string) =>
    updateStrategy({ id, isArchived: false } as Strategy);
  const handleSaveIndex = (
    data: Omit<Index, "id" | "isArchived">,
    id?: string
  ) => createOrUpdateIndex({ ...data, id });
  const handleArchiveIndex = (id: string) =>
    createOrUpdateIndex({ id, isArchived: true });
  const handleUnarchiveIndex = (id: string) =>
    createOrUpdateIndex({ id, isArchived: false });
  const handleToggleDailyTargetTaskInAnjam = (krId: string) =>
    toggleDailyTarget(krId, new Date().toISOString());
  const handleAddGeneralFeedback = (
    data: Omit<GeneralFeedback, "id" | "giverId" | "createdAt">
  ) =>
  safeEmit("generalFeedbacks:create", {
      ...data,
      giverId: currentUser!.id,
    }, "generalFeedbacks created");
  // FIX: In `handleSaveFeedbackTag`, `tags` was a typo and has been corrected to `feedbackTags` to reference the correct state variable.
  const handleSaveFeedbackTag = (tag: FeedbackTag) =>
    safeEmit(
      feedbackTags.some((t) => t.id === tag.id)
        ? "feedbackTags:update"
        : "feedbackTags:create",
      tag, "feedbackTags created or updated"
    );
  const handleDeleteFeedbackTag = (tagId: string) =>
    socket.emit("feedbackTags:delete", tagId);
  const handleArchiveProject = (projectId: string) =>
    socket.emit("projects:update", { id: projectId, isArchived: true });
  const handleUnarchiveProject = (projectId: string) =>
    socket.emit("projects:update", { id: projectId, isArchived: false });
  const handleSelectConsultant = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setActivePage("consulting");
  };
  const handleOpenConsultantsMenu = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    consultantButtonRef.current = event.currentTarget;
    setIsConsultantPopoverOpen(true);
  };
  const handleSaveBoard = async (boardData: Omit<Board, "id"> & { id?: string }) => {
    await safeEmit(
      boardData.id ? "boards:update" : "boards:create",
      boardData,
      boardData.id ? "Board updated" : "Board created"
    );
    // socket.emit(boardData.id ? "boards:update" : "boards:create", boardData);
    setIsAddBoardModalOpen(false);
    setBoardToEdit(null);
  };
  //updateddddddddddddddddddddddddddddddddddddddddddddddddd
  const handleUpdateBoard = async (updatedBoard: Board) => {
    await safeEmit("boards:create", updatedBoard, "Board created");
    // await emitWithAck("boards:update", updatedBoard, (res: any) => {
    //   // rollback on failure
    //   if (!res.ok) showToast(res.error || "Board update failed", "error");
    // })
    // socket.emit("boards:update", updatedBoard);
  };
  const handleTogglePinBoard = async (boardId: string) => {
    const board = store.boards.find((b: any) => b.id === boardId);
    if (!board) return;
    await safeEmit("boards:update", { id: boardId, isPinned: !board.isPinned });
  };
  const handleCreateWorkspace = async (
    workspaceData: Omit<Workspace, "id">
  ) => {
    await safeEmit("workspaces:create", workspaceData, "workspaces created");
    // socket.emit("workspaces:create", workspaceData);
    setIsNewWorkspaceModalOpen(false);
  };

  const handleAddCustomerNeed = async (
    description: string,
    category: CustomerNeedCategory
  ) =>
    await safeEmit(
      "customerNeeds:create",
      { description, category },
      "customerNeeds created"
    );
  // ) => socket.emit("customerNeeds:create", { description, category });
  const handleUpdateCustomerNeed = async (updatedNeed: CustomerNeed) =>
    await safeEmit(
      "customerNeeds:update",
      updatedNeed,
      "customerNeeds updated"
    );
  // socket.emit("customerNeeds:update", updatedNeed);
  const handleDeleteCustomerNeed = async (needId: string) =>
    await safeEmit("customerNeeds:delete", needId, "customerNeeds deleted");
  // socket.emit("customerNeeds:delete", needId);
  const handleMarkNotificationRead = async (notificationId: string | "all") =>
    await safeEmit(
      "notifications:mark-read",
      { notificationId, userId: currentUser!.id },
      "notifications mark-read"
    );
  // socket.emit("notifications:mark-read", {
  //   notificationId,
  //   userId: currentUser!.id,
  // });
  const handleNotificationClick = (notification: Notification) => {
    handleMarkNotificationRead(notification.id);
    if (notification.type === "task") {
      setActivePage("kanban");
      setSelectedTaskId(notification.itemId);
    } else if (notification.type === "objective") {
      setActivePage("dashboard");
      const objective = objectives.find((o) => o.id === notification.itemId);
      if (objective) setSelectedObjective(objective);
    } else if (
      notification.type === "mention" &&
      notification.itemId.startsWith("doc-")
    ) {
      setActivePage("documents");
    } else if (notification.type === "feedback") {
      setActivePage("feedback");
    }
  };
  const handleMissionSelect = async (mission: SuggestedMission) => {
    const newVision: CompanyVision = {
      ...companyVision,
      missionTitle: mission.missionTitle,
      passion: mission.reasoning.passion,
      skill: mission.reasoning.skill,
      market: mission.reasoning.market,
      business: mission.reasoning.business,
    };
    await safeEmit("companyVision:update", newVision, "companyVision updated");
    // socket.emit("companyVision:update", newVision);
    setTimeout(() => {
      setIsIkigaiWizardOpen(false);
      setActivePage("strategy");
    }, 400);
  };
  const handleOpenDocument = async (docId: string) =>
    setDocumentToDisplay(documents.find((d) => d.id === docId) || null);
  const onDeleteCustomFieldDefinitionFromProject = (
    projId: string,
    defId: string
  ) =>
    await safeEmit(
      "projects:delete-custom-field",
      { projId, defId },
      "projects delete-custom-field"
    );
  // ) => socket.emit("projects:delete-custom-field", { projId, defId });

  // =================================================================
  // PAGE RENDERING
  // =================================================================
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        error={loginError}
        isLoading={isLoggingIn}
      />
    );
  }

  if (!isDataLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        در حال بارگذاری داده‌ها...
      </div>
    );
  }

  const filteredNavItems = sidebarConfig.navItems.filter((item) =>
    item.type === "divider"
      ? item.visible
      : item.visible && item.roles.includes(currentUser.role)
  );
  const visibleMoreItems = filteredNavItems.filter(
    (item): item is Extract<NavItem, { type: "item" }> =>
      item.type === "item" && item.location === "more"
  );

  const pageTitles: { [key in ActivePage]: string } = {
    dashboard: "اهداف",
    reports: "بازخورد",
    insights: "بینش",
    strategy: "ماموریت",
    kanban: "برنامه",
    forms: "فرم‌ها",
    settings: "تنظیمات",
    anjam: "کارهای امروز",
    documents: "مستندات",
    learning: "یادگیری",
    feedback: "بازخورد",
    team: "تیم من",
    consulting: "مشاوره",
    personalDevelopment: "توسعه فردی",
    customers: "مشتریان",
    sales: "فروش",
    crm: "CRM",
    production: "تولید",
    quality: "کیفیت",
    inventory: "انبار",
    purchasing: "خرید",
    marketing: "بازاریابی",
    recruitment: "استخدام",
    expenses: "هزینه ها",
    contracts: "قراردادها",
    selfKnowledge: "خودشناسی",
    organizationalKnowledge: "دانش سازمانی",
    upgrade: "ارتقا پلن",
    aiChat: "تیک آپ AI",
    projects: "پروژه ها",
  };

  const renderActivePage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <>
            <ToastContainer position="bottom-left" autoClose={3000} />
            <DashboardPage
              objectives={store.objectives}
              users={store.users}
              tasks={store.tasks}
              onSelectObjective={setSelectedObjective}
              onAddNewObjective={() => setIsObjectiveWizardOpen(true)}
              onAddKeyResult={(objId) =>
                setSelectedObjective(
                  objectives.find((o) => o.id === objId) || null
                )
              }
              onSelectKeyResult={(objectiveId, krId) =>
                setSelectedKRInfo({ objectiveId, krId })
              }
              onEditObjective={setObjectiveToEdit}
              onDeleteObjective={handleDeleteObjective}
              onDeleteKeyResult={handleDeleteKeyResult}
              onUpdateKeyResultDetails={handleUpdateKeyResultDetails}
              objectiveSettings={objectiveSettings}
              onArchiveObjective={handleArchiveObjective}
              onArchiveKeyResult={handleArchiveKeyResult}
              onToggleDailyTargetTaskInAnjam={
                handleToggleDailyTargetTaskInAnjam
              }
              onStartSmartWizard={() => setIsSmartWizardOpen(true)}
            />
          </>
        );
      case "reports":
        return (
          <>
            <ToastContainer position="bottom-left" autoClose={3000} />

            <ReportsPage
              objectives={store.objectives}
              users={store.users}
              teams={store.teams}
              currentUser={currentUser}
              tasks={store.tasks}
              submissions={store.submissions}
              forms={store.forms}
              processes={processes}
              strategies={store.strategies}
              companyVision={store.companyVision}
              projects={store.projects}
              feedbackTags={store.feedbackTags}
              onAddGeneralFeedback={handleAddGeneralFeedback}
              componentStyles={componentStyles}
              generalFeedbacks={store.generalFeedbacks}
              onSelectFeedback={setSelectedFeedback}
              dailyPerformance={dailyPerformance}
            />
          </>
        );
      case "insights":
        return <InsightsPage objectives={objectives} />;
      case "strategy":
        return (
          <>
            <ToastContainer position="bottom-left" autoClose={3000} />

            <StrategyPage
              strategies={store.strategies}
              indices={store.indices}
              objectives={store.objectives}
              users={store.users}
              companyVision={store.companyVision}
              onAddStrategy={(data) => handleSaveStrategy(data)}
              onUpdateStrategy={(data) => handleSaveStrategy(data, data.id)}
              onDeleteStrategy={(id) => socket.emit("strategies:delete", id)}
              onArchiveStrategy={handleArchiveStrategy}
              onAddIndex={(data) => handleSaveIndex(data)}
              onUpdateIndex={(data) => handleSaveIndex(data, data.id)}
              onDeleteIndex={(id) => socket.emit("indices:delete", id)}
              onArchiveIndex={handleArchiveIndex}
              setCompanyVision={(vision) =>
                socket.emit("companyVision:update", vision)
              }
              cardSettings={componentStyles.strategyCards}
              popupSettings={componentStyles.popups}
              customerNeeds={store.customerNeeds}
              onAddCustomerNeed={handleAddCustomerNeed}
              onUpdateCustomerNeed={handleUpdateCustomerNeed}
              onDeleteCustomerNeed={handleDeleteCustomerNeed}
            />
          </>
        );
        {
          /* // <Header unreadCount={store.notifications.filter((n) => !n.is_read).length} /> */
        }
      case "kanban":
        return (
          <>
            <ToastContainer position="bottom-left" autoClose={3000} />

            <KanbanPage
              tasks={store.tasks}
              projects={store.projects}
              users={store.users}
              columns={store.columns}
              objectives={store.objectives}
              onTaskColumnChange={handleTaskColumnChange}
              onSelectTask={setSelectedTaskId}
              onUpdateTask={handleUpdateTask}
              onDeleteTasks={handleDeleteTasks}
              onAddTask={handleOpenAddTaskModal}
              onUpdateColumnTitle={(colId, title) =>
                socket.emit("columns:update", { id: colId, title })
              }
              onAddColumn={(title) =>
                socket.emit("columns:create", { title, color: "gray" })
              }
              onUpdateColumnColor={(colId, color) =>
                socket.emit("columns:update", { id: colId, color })
              }
              onUpdateColumnIcon={(colId, icon) =>
                socket.emit("columns:update", { id: colId, icon })
              }
              onQuickAddTask={handleQuickAddTask}
              onUpdateProject={(proj) => socket.emit("projects:update", proj)}
              onAddProject={() => setIsAddProjectModalOpen(true)}
              onArchiveProject={handleArchiveProject}
              isListViewComfortable={isListViewComfortable}
              currentUser={currentUser}
              onInlineAddTask={(taskData) => handleAddTask(taskData)}
              taskFieldLabels={taskFieldLabels}
              onUpdateTaskFieldLabel={(field, newLabel) =>
                setTaskFieldLabels((prev) => ({ ...prev, [field]: newLabel }))
              }
              onAddCustomFieldDefinitionToProject={(projId, type) => {
                const newDef: CustomFieldDefinition = {
                  id: `cf-${Date.now()}`,
                  label: `فیلد ${type.toLowerCase()}`,
                  type,
                };
                socket.emit("projects:add-custom-field", {
                  projId,
                  definition: newDef,
                });
                return newDef; // Note: This might be optimistic
              }}
              onUpdateCustomFieldDefinitionInProject={(
                projId,
                defId,
                updates
              ) =>
                socket.emit("projects:update-custom-field", {
                  projId,
                  defId,
                  updates,
                })
              }
              onDeleteCustomFieldDefinitionFromProject={
                onDeleteCustomFieldDefinitionFromProject
              }
              onUpdateColumnDetails={(colId, updates) =>
                socket.emit("columns:update", { id: colId, ...updates })
              }
              popupSettings={componentStyles.popups}
              activeCardTemplate={activeCardTemplate}
              onSetCardTemplate={setActiveCardTemplate}
              boards={store.boards}
              activeBoardId={activeBoardId}
              onActiveBoardChange={setActiveBoardId}
              onAddBoard={(projectId) => {
                setDefaultProjectIdForNewBoard(projectId);
                setBoardToEdit(null);
                setIsAddBoardModalOpen(true);
              }}
              onEditBoard={setBoardToEdit}
              onUpdateBoard={handleUpdateBoard}
              kanbanProjectFilter={kanbanProjectFilter}
              onKanbanProjectFilterChange={setKanbanProjectFilter}
              documents={store.documents}
              forms={store.forms}
              submissions={store.submissions}
              onOpenDocument={handleOpenDocument}
              onOpenForm={(id) =>
                setFormToDisplay(forms.find((f) => f.id === id) || null)
              }
              onMoveFormRequest={handleMoveFormRequest}
              onEditForm={handleEditForm}
              onTogglePinForm={handleTogglePinForm}
              onFormColumnChange={handleFormColumnChange}
            />
          </>
        );
      case "forms":
        return (
          <>
            <ToastContainer position="bottom-left" autoClose={3000} />

            <FormsPage
              forms={store.forms}
              categories={store.formCategories}
              submissions={store.submissions}
              onCreateForm={() => {
                setFormToEdit(null);
                setIsFormBuilderOpen(true);
              }}
              onOpenForm={(id) =>
                setFormToDisplay(forms.find((f) => f.id === id) || null)
              }
              onEditForm={handleEditForm}
              onTogglePinForm={handleTogglePinForm}
              currentUser={currentUser}
              onMoveFormRequest={handleMoveFormRequest}
            />
          </>
        );
      case "settings":
        return (
          <>
            <ToastContainer position="bottom-left" autoClose={3000} />

            <AdminPage
              users={store.users}
              setUsers={(updater) => socket.emit("users:set", updater(users))}
              teams={store.teams}
              setTeams={(updater) => socket.emit("teams:set", updater(teams))}
              processes={store.processes}
              setProcesses={(updater) =>
                socket.emit("processes:set", updater(store.processes))
              }
              forms={store.forms}
              sidebarConfig={sidebarConfig}
              setSidebarConfig={setSidebarConfig}
              recurrenceSettings={recurrenceSettings}
              setRecurrenceSettings={setRecurrenceSettings}
              onEditProfile={() => setIsEditProfileModalOpen(true)}
              objectiveSettings={objectiveSettings}
              setObjectiveSettings={setObjectiveSettings}
              appSettings={appSettings}
              setAppSettings={setAppSettings}
              aiPrompts={aiPrompts}
              onUpdateAIPrompt={(key, value) =>
                setAIPrompts((prev) => ({ ...prev, [key]: value }))
              }
              componentStyles={componentStyles}
              setComponentStyles={setComponentStyles}
              onCreateUser={handleCreateUser}
            />
          </>
        );
      case "anjam":
        return (
          <>
            <ToastContainer position="bottom-left" autoClose={3000} />

            <AnjamPage
              tasks={store.tasks}
              projects={store.projects}
              users={store.users}
              forms={[...forms].sort(
                (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
              )}
              currentUser={currentUser}
              onSelectTask={setSelectedTaskId}
              onUpdateTask={handleUpdateTask}
              onUpdateProject={(p) => socket.emit("projects:update", p)}
              onQuickAddTask={(content, projectId) =>
                handleQuickAddTask(content, "todo", projectId)
              }
              onOpenForm={(id) =>
                setFormToDisplay(forms.find((f) => f.id === id) || null)
              }
              onEditForm={handleEditForm}
              onTogglePinForm={handleTogglePinForm}
              objectives={store.objectives}
              onUpdateKeyResultDetails={handleUpdateKeyResultDetails}
              submissions={store.submissions}
            />
          </>
        );
      case "documents":
        return (
          <>
            <ToastContainer position="bottom-left" autoClose={3000} />

            <DocumentsPage
              documents={store.documents}
              setDocuments={(updater) =>
                socket.emit("documents:set", updater(store.documents))
              }
              users={store.users}
              tasks={store.tasks}
              forms={store.forms}
              documentStatuses={documentStatuses}
              onSelectTask={setSelectedTaskId}
              onOpenForm={(id) =>
                setFormToDisplay(forms.find((f) => f.id === id) || null)
              }
              activeDocumentId={activeDocumentId}
              setActiveDocumentId={setActiveDocumentId}
            />
          </>
        );
      case "learning":
        return (
          <>
            <ToastContainer position="bottom-left" autoClose={3000} />

            <LearningPage
              assignments={store.learningAssignments}
              resources={{ microLearnings, youtubeVideos, books }}
              users={store.users}
              currentUser={currentUser}
              objectives={store.objectives}
              onUpdateStatus={(id, status) =>
                socket.emit("learningAssignments:update", { id, status })
              }
              onCreateMicroLearning={() => setIsCreateMicroLearningOpen(true)}
              onViewMicroLearning={setMicroLearningToView}
            />
          </>
        );
      case "feedback":
        return (
          <>
            <ToastContainer position="bottom-left" autoClose={3000} />

            <FeedbackPage
              objectives={store.objectives}
              users={store.users}
              feedbackTags={store.feedbackTags}
              onSaveFeedbackTag={handleSaveFeedbackTag}
              onDeleteFeedbackTag={handleDeleteFeedbackTag}
              learningAssignments={store.learningAssignments}
              resources={{ microLearnings, youtubeVideos, books }}
              onUpdateLearningAssignmentStatus={(id, status) =>
                socket.emit("learningAssignments:update", { id, status })
              }
            />
          </>
        );
      case "team":
        return (
          <>
            <ToastContainer position="bottom-left" autoClose={3000} />

            <TeamPage
              users={store.users}
              teams={store.teams}
              objectives={store.objectives}
              tasks={store.tasks}
              submissions={store.submissions}
              forms={store.forms}
              feedbackTags={feedbackTags}
              onSaveTeam={
                (teamData) =>
                  safeEmit(
                    teamData.id ? "teams:update" : "teams:create",
                    teamData,
                    teamData.id ? "teams:update" : "teams:create"
                  )

                // socket.emit(
                //   teamData.id ? "teams:update" : "teams:create",
                //   teamData
                // )
              }
              // onDeleteTeam={(teamId) => socket.emit("teams:delete", teamId)}
              onDeleteTeam={(teamId: any) =>
                safeEmit("teams:delete", teamId, "teams deleted")
              }
            />
          </>
        );
      case "consulting":
        return (
          <>
            selectedConsultant && (
            <ConsultingPage
              consultant={selectedConsultant}
              onBack={() => {
                setActivePage("dashboard");
                setSelectedConsultant(null);
              }}
            />
            )
          </>
        );
      case "personalDevelopment":
        return <PersonalDevelopmentPage />;
      case "customers":
        return <CustomersPage />;
      case "sales":
        return <SalesPage />;
      case "crm":
        return <CrmPage />;
      case "production":
        return <ProductionPage />;
      case "quality":
        return <QualityPage />;
      case "inventory":
        return <InventoryPage />;
      case "purchasing":
        return <PurchasingPage />;
      case "marketing":
        return <MarketingPage />;
      case "recruitment":
        return <RecruitmentPage />;
      case "expenses":
        return <ExpensesPage />;
      case "contracts":
        return <ContractsPage />;
      case "selfKnowledge":
        return <SelfKnowledgePage />;
      case "organizationalKnowledge":
        return <OrganizationalKnowledgePage />;
      case "upgrade":
        return <UpgradePage />;
      case "projects":
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <h1 className="text-2xl font-semibold">
              صفحه پروژه‌ها - به زودی...
            </h1>
          </div>
        );
      default:
        return <div>صفحه یافت نشد.</div>;
    }
  };

  return (
    <div
      className="flex h-screen bg-brand-secondary dark:bg-slate-900"
      dir="rtl"
    >
      <Sidebar
        currentUser={currentUser}
        activePage={activePage}
        setActivePage={handleSetActivePage}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onAddTaskClick={(e) => {
          e.stopPropagation();
          (
            createButtonRef as React.MutableRefObject<HTMLButtonElement>
          ).current = e.currentTarget;
          setIsCreateMenuOpen((p) => !p);
        }}
        sidebarConfig={{ ...sidebarConfig, navItems: filteredNavItems }}
        onLogout={handleLogout}
        onEditProfile={() => setIsEditProfileModalOpen(true)}
        onOpenMoreMenu={(e) => {
          e.stopPropagation();
          (moreButtonRef as React.MutableRefObject<HTMLButtonElement>).current =
            e.currentTarget;
          setIsMoreMenuOpen((p) => !p);
        }}
        todaysTotalTasks={todaysTotalTasks}
        todaysCompletedTasks={todaysCompletedTasks}
        dailyRating={dailyPerformance[todayStr]?.rating}
        dailyFeeling={dailyPerformance[todayStr]?.feeling}
        dailyFeedbackSubmitted={!!dailyPerformance[todayStr]?.feedback}
        onRatingSubmit={(rating) =>
          setDailyPerformance((prev) => ({
            ...prev,
            [todayStr]: { ...prev[todayStr], rating },
          }))
        }
        onFeelingSubmit={(feeling) =>
          setDailyPerformance((prev) => ({
            ...prev,
            [todayStr]: { ...prev[todayStr], feeling },
          }))
        }
        onFeedbackSubmit={(feedback) =>
          setDailyPerformance((prev) => ({
            ...prev,
            [todayStr]: { ...prev[todayStr], feedback },
          }))
        }
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSwitchWorkspace={setActiveWorkspaceId}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenNewWorkspace={() => setIsNewWorkspaceModalOpen(true)}
        boards={boards}
        activeBoardId={activeBoardId}
        onBoardSelect={(boardId) => {
          setActiveBoardId(boardId);
          setActivePage("kanban");
        }}
      />

      <div className="flex-1 flex flex-row overflow-hidden">
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? "md:mr-20" : "md:mr-64"
          }`}
        >
          <Header
            currentUser={currentUser}
            objectives={objectives}
            users={users}
            pageTitle={pageTitles[activePage] || "داشبورد"}
            activePage={activePage}
            setActivePage={handleSetActivePage}
            isListViewComfortable={isListViewComfortable}
            onToggleListViewComfortable={() =>
              setIsListViewComfortable((p) => !p)
            }
            onOpenArchivedModal={() => setIsArchivedModalOpen(true)}
            onOpenArchivedStrategyModal={() =>
              setIsArchivedStrategyModalOpen(true)
            }
            onOpenArchivedProjectsModal={() =>
              setIsArchivedProjectsModalOpen(true)
            }
            dailyTargetInfo={dailyTargetInfo}
            onUpdateKeyResultDetails={handleUpdateKeyResultDetails}
            aiPrompts={aiPrompts}
            onSetCardTemplate={setActiveCardTemplate}
            notifications={notifications.filter(
              (n) => n.userId === currentUser.id
            )}
            onMarkNotificationRead={handleMarkNotificationRead}
            onNotificationClick={handleNotificationClick}
          />
          <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-800">
            <div className="p-4 md:p-6 mb-16 md:mb-0 h-full">
              {renderActivePage()}
            </div>
          </main>
        </div>

        {(aiChatState === "sidebar" || aiChatState === "fullscreen") && (
          <div
            className={`border-r border-gray-200 dark:border-slate-700 flex flex-col animate-slide-in-left transition-all duration-300 ${
              aiChatState === "sidebar" ? "w-[45%] max-w-lg" : "w-full"
            }`}
          >
            <AIChatPanel
              viewMode={aiChatState}
              onClose={() => setAiChatState("closed")}
              onToggleFullscreen={() =>
                setAiChatState((prev) =>
                  prev === "sidebar" ? "fullscreen" : "sidebar"
                )
              }
              tasks={tasks}
              projects={projects}
              objectives={objectives}
              users={users}
              columns={columns}
              handleAddTask={handleAddTask}
              onSelectTask={setSelectedTaskId}
              onSelectObjective={setSelectedObjective}
              strategies={strategies}
              companyVision={companyVision}
              aiPrompts={aiPrompts}
              onAddObjective={handleAddObjectiveFromChat}
            />
          </div>
        )}
      </div>

      <BottomNavBar
        activePage={activePage}
        setActivePage={setActivePage}
        onAddTaskClick={(e) => {
          e.stopPropagation();
          (
            createButtonRef as React.MutableRefObject<HTMLButtonElement>
          ).current = e.currentTarget;
          setIsCreateMenuOpen((p) => !p);
        }}
        onMoreClick={(e) => {
          e.stopPropagation();
          (moreButtonRef as React.MutableRefObject<HTMLButtonElement>).current =
            e.currentTarget;
          setIsMoreMenuOpen((p) => !p);
        }}
        isMoreMenuActive={isMoreMenuOpen}
      />

      <AIChatButton
        isVisible={aiChatState === "closed"}
        onClick={() => setAiChatState("sidebar")}
      />

      {/* Global Modals & Side Panels */}
      {isEditProfileModalOpen && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          user={currentUser}
          onSubmit={handleUpdateUser}
        />
      )}
      {isAddTaskModalOpen && (
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          projects={projects}
          users={users}
          teams={teams}
          columns={columns}
          onSubmit={handleAddTask}
          defaultColumn={defaultTaskColumn}
          defaultDate={defaultTaskDate}
          currentUser={currentUser}
        />
      )}
      {selectedTask && (
        <TaskSidePanel
          task={selectedTask}
          users={users}
          projects={projects}
          teams={teams}
          columns={columns}
          currentUser={currentUser}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={handleUpdateTask}
          taskFieldLabels={taskFieldLabels}
          onUpdateTaskFieldLabel={(field, newLabel) =>
            setTaskFieldLabels((prev) => ({ ...prev, [field]: newLabel }))
          }
          onAddCustomFieldDefinitionToProject={(projId, type) => {
            const newDef: CustomFieldDefinition = {
              id: `cf-${Date.now()}`,
              label: `فیلد ${type.toLowerCase()}`,
              type,
            };

            // socket.emit("projects:add-custom-field", {
            //   projId,
            //   definition: newDef,
            // });
            safeEmit(
              "projects:add-custom-field",
              {
                projId,
                definition: newDef,
              },
              "projects add-custom-field"
            );
            return newDef;
          }}
          onUpdateCustomFieldDefinitionInProject={(projId, defId, updates) =>
            // socket.emit("projects:update-custom-field", {
            //   projId,
            //   defId,
            //   updates,
            // })
            safeEmit(
              "projects:update-custom-field",
              {
                projId,
                defId,
                updates,
              },
              "projects update-custom-field"
            )
          }
          onDeleteCustomFieldDefinitionFromProject={
            onDeleteCustomFieldDefinitionFromProject
          }
          displayAs={activePage === "kanban" ? "modal" : "panel"}
          tasks={tasks}
          forms={forms}
          submissions={submissions}
          documents={documents}
          onOpenDocument={handleOpenDocument}
          onOpenForm={(id) =>
            setFormToDisplay(forms.find((f) => f.id === id) || null)
          }
        />
      )}
      {isFormBuilderOpen && (
        <FormBuilderModal
          isOpen={isFormBuilderOpen}
          onClose={() => setIsFormBuilderOpen(false)}
          onSubmit={handleSaveForm}
          categories={formCategories}
          formToEdit={formToEdit}
          styleSettings={componentStyles.popups}
          aiPrompts={aiPrompts}
          users={users}
          currentUser={currentUser}
        />
      )}
      {formToDisplay && (
        <FormDisplay
          form={formToDisplay}
          submissions={submissions}
          draftSubmission={submissions.find(
            (s) =>
              s.formId === formToDisplay?.id &&
              s.submittedById === currentUser!.id &&
              s.status === "DRAFT"
          )}
          users={users}
          currentUser={currentUser!}
          onClose={() => setFormToDisplay(null)}
          onSubmit={handleFormSubmit}
          onSaveDraft={handleSaveDraft}
          styleSettings={componentStyles.popups}
        />
      )}
      {documentToDisplay && (
        <FullScreenModal
          isOpen={!!documentToDisplay}
          onClose={() => setDocumentToDisplay(null)}
        >
          <DocumentEditor
            document={documentToDisplay}
            // onUpdate={(doc) => socket.emit("documents:update", doc)}
            onUpdate={(doc: any) =>
              safeEmit("documents:update", doc, "documents updated")
            }
            users={users}
            tasks={tasks}
            forms={forms}
            documentStatuses={documentStatuses}
            onSelectTask={setSelectedTaskId}
            onOpenForm={(id) =>
              setFormToDisplay(forms.find((f) => f.id === id) || null)
            }
            isMobileView={true}
            onBack={() => setDocumentToDisplay(null)}
            forceReadOnly={true}
          />
        </FullScreenModal>
      )}
      {selectedObjective && (
        <ObjectiveSidePanel
          objective={selectedObjective}
          users={users}
          strategies={strategies}
          indices={indices}
          objectives={objectives}
          onClose={() => setSelectedObjective(null)}
          onAddKeyResult={(id) => {}}
          onDeleteKeyResult={handleDeleteKeyResult}
          onUpdateKeyResultDetails={handleUpdateKeyResultDetails}
          onEditKeyResult={() => {}}
          onArchiveKeyResult={handleArchiveKeyResult}
          onSelectKeyResult={(objectiveId, krId) =>
            setSelectedKRInfo({ objectiveId, krId })
          }
        />
      )}
      {isObjectiveWizardOpen && (
        <ObjectiveCreationWizard
          isOpen={isObjectiveWizardOpen}
          onClose={() => setIsObjectiveWizardOpen(false)}
          onSubmit={handleSaveObjective}
          users={users}
          strategies={strategies}
          indices={indices}
          objectives={objectives}
          defaultOwnerId={currentUser.id}
          styleSettings={componentStyles.popups}
          aiPrompts={aiPrompts}
          tasks={tasks}
          forms={forms}
        />
      )}
      {isSmartWizardOpen && (
        <SmartObjectiveWizard
          isOpen={isSmartWizardOpen}
          onClose={() => setIsSmartWizardOpen(false)}
          onSubmit={handleSaveObjective}
          users={users}
          strategies={strategies}
          defaultOwnerId={currentUser.id}
          styleSettings={componentStyles.popups}
          aiPrompts={aiPrompts}
          companyVision={companyVision}
        />
      )}
      {selectedKR && (
        <KeyResultSidePanel
          isOpen={!!selectedKRInfo}
          onClose={() => setSelectedKRInfo(null)}
          kr={selectedKR}
          objectiveId={selectedKRInfo!.objectiveId}
          onCheckin={handleKeyResultCheckin}
          onAddComment={handleKeyResultAddComment}
          challengeTags={challengeTags}
          objectives={objectives}
          projects={projects}
          tasks={tasks}
          users={users}
          currentUser={currentUser}
          onSelectTask={setSelectedTaskId}
        />
      )}
      {objectiveToEdit && (
        <EditObjectiveModal
          isOpen={!!objectiveToEdit}
          onClose={() => setObjectiveToEdit(null)}
          objective={objectiveToEdit}
          strategies={strategies}
          indices={indices}
          objectives={objectives}
          onSubmit={handleUpdateObjectiveDetails}
        />
      )}
      {isAddProjectModalOpen && (
        <AddProjectModal
          isOpen={isAddProjectModalOpen}
          onClose={() => setIsAddProjectModalOpen(false)}
          objectives={objectives}
          // onSubmit={(data) => socket.emit("projects:create", data)}
          onSubmit={(data: any) =>
            safeEmit("projects:create", data, "projects created")
          }
        />
      )}
      <AddBoardModal
        isOpen={isAddBoardModalOpen || !!boardToEdit}
        onClose={() => {
          setIsAddBoardModalOpen(false);
          setBoardToEdit(null);
        }}
        projects={projects}
        onSubmit={handleSaveBoard}
        boardToEdit={boardToEdit}
        defaultProjectId={defaultProjectIdForNewBoard}
      />
      {confirmation.isOpen && (
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
          onConfirm={() => {
            confirmation.onConfirm();
            setConfirmation({ ...confirmation, isOpen: false });
          }}
          title={confirmation.title}
          message={confirmation.message}
        />
      )}
      {isArchivedModalOpen && (
        <ArchivedItemsModal
          isOpen={isArchivedModalOpen}
          onClose={() => setIsArchivedModalOpen(false)}
          objectives={objectives}
          onUnarchiveObjective={handleUnarchiveObjective}
          onUnarchiveKeyResult={handleUnarchiveKeyResult}
        />
      )}
      {isArchivedStrategyModalOpen && (
        <ArchivedStrategyIndexModal
          isOpen={isArchivedStrategyModalOpen}
          onClose={() => setIsArchivedStrategyModalOpen(false)}
          strategies={strategies.filter((s) => s.isArchived)}
          indices={indices.filter((i) => i.isArchived)}
          onUnarchiveStrategy={handleUnarchiveStrategy}
          onUnarchiveIndex={handleUnarchiveIndex}
        />
      )}
      {isArchivedProjectsModalOpen && (
        <ArchivedProjectsModal
          isOpen={isArchivedProjectsModalOpen}
          onClose={() => setIsArchivedProjectsModalOpen(false)}
          projects={projects}
          onUnarchiveProject={handleUnarchiveProject}
        />
      )}
      {isCreateMicroLearningOpen && (
        <CreateMicroLearningModal
          isOpen={isCreateMicroLearningOpen}
          onClose={() => setIsCreateMicroLearningOpen(false)}
          // onSubmit={(data) => socket.emit("microLearnings:create", data)}
          onSubmit={(data) =>
            safeEmit("microLearnings:create", data, "microLearnings created")
          }
          aiPrompts={aiPrompts}
        />
      )}
      {microLearningToView && (
        <MicroLearningViewerModal
          isOpen={!!microLearningToView}
          onClose={() => setMicroLearningToView(null)}
          learning={microLearningToView}
        />
      )}
      {selectedFeedback && (
        <FeedbackSidePanel
          isOpen={!!selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          feedback={selectedFeedback}
          giver={users.find((u) => u.id === selectedFeedback.giverId)}
          receiver={users.find((u) => u.id === selectedFeedback.receiverId)}
          tasks={tasks}
          forms={forms}
          onSelectTask={setSelectedTaskId}
          onOpenForm={(id) =>
            setFormToDisplay(forms.find((f) => f.id === id) || null)
          }
        />
      )}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        tasks={tasks}
        objectives={objectives}
        projects={projects}
        documents={documents}
        onNavigate={handleSearchNavigate}
      />
      <NewWorkspaceModal
        isOpen={isNewWorkspaceModalOpen}
        onClose={() => setIsNewWorkspaceModalOpen(false)}
        onSave={handleCreateWorkspace}
      />
      <IkigaiWizard
        isOpen={isIkigaiWizardOpen}
        onClose={() => setIsIkigaiWizardOpen(false)}
        onMissionSelect={handleMissionSelect}
      />
      <CreateMenu
        anchorEl={createButtonRef.current}
        isOpen={isCreateMenuOpen}
        onClose={() => setIsCreateMenuOpen(false)}
        onAddTask={() => {
          handleOpenAddTaskModal();
          setIsCreateMenuOpen(false);
        }}
        onSelectForm={(id) => {
          setFormToDisplay(forms.find((f) => f.id === id) || null);
          setIsCreateMenuOpen(false);
        }}
        pinnedForms={forms.filter((f) => f.isPinned)}
      />
      <MoreActionsMenu
        anchorEl={moreButtonRef.current}
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        items={visibleMoreItems}
        onNavigate={(page) => {
          handleSetActivePage(page);
          setIsMoreMenuOpen(false);
        }}
        onCustomizeClick={() => {
          setIsCustomizeNavOpen(true);
          setIsMoreMenuOpen(false);
        }}
        onThemeToggle={() =>
          setTheme((prev) => (prev === "light" ? "dark" : "light"))
        }
        colorTheme={theme}
        onOpenConsultants={handleOpenConsultantsMenu}
      />
      <ConsultantPopover
        isOpen={isConsultantPopoverOpen}
        onClose={() => setIsConsultantPopoverOpen(false)}
        anchorEl={consultantButtonRef.current}
        consultants={CONSULTANTS}
        onSelect={(consultant) => {
          handleSelectConsultant(consultant);
          setIsConsultantPopoverOpen(false);
        }}
      />
      <CustomizeNavModal
        isOpen={isCustomizeNavOpen}
        onClose={() => setIsCustomizeNavOpen(false)}
        navItems={sidebarConfig.navItems}
        onSave={(newNavItems) =>
          setSidebarConfig((prev) => ({ ...prev, navItems: newNavItems }))
        }
      />
      {isMoveFormModalOpen && (
        <MoveFormToBoardModal
          isOpen={isMoveFormModalOpen}
          onClose={() => setIsMoveFormModalOpen(false)}
          projects={projects}
          boards={boards}
          onMove={handleMoveFormToBoard}
        />
      )}
    </div>
  );
});

export default App;
