// Your unified MobX root store:
import { reaction, autorun } from "mobx";
import { AuditStore } from "./AuditStore";
import { CalendarStore } from "./CalendarStore";
import { UIStore } from "./UIStore";
import { ProjectStore } from "./ProjectStore";
import { TaskStore } from "./TaskStore";
import { ObjectiveStore } from "./ObjectiveStore";
import { BoardStore } from "./BoardStore";
import { SettingsStore } from "./SettingsStore";
import { SocketManager } from "./SocketManager";
import { SidebarStore } from "./SidebarStore";
import { UserStore } from "./UserStore";
import { TeamStore } from "./TeamStore";
import { FeedbackStore } from "./FeedbackStore";
import { StrategyStore } from "./StrategyStore";
import { ProcessStore } from "./ProcessStore";
import { WorkspaceStore } from "./WorkspaceStore";
import { LearningStore } from "./LearningStore";
import { PermissionStore } from "./PermissionStore";
import { CustomerStore } from "./CustomerStore";
import { HeatmapStore } from "./HeatmapStore";
import { ThemeDesignerStore } from "./ThemeDesignerStore";
import { RoleStore } from "./RoleStore";
import { NotificationStore } from "./NotificationStore";
import { FormStore } from "./FormStore";
import { DocumentStore } from "./DocumentStore";
import { KRCategoryStore } from "./KRCategoryStore";
import { KeyResultStore } from "./KeyResultStore";
import { KRCheckinStore } from "./KRCheckinStore";
import { IndexStore } from "./IndexStore";

export class AppStore {
  // Grouped Stores
  uiStore = new UIStore();
  settingsStore = new SettingsStore();
  themeDesignerStore = new ThemeDesignerStore();
  notificationStore = new NotificationStore();

  // Project and Task Management
  projectStore = new ProjectStore();
  documentStore = new DocumentStore();
  taskStore = new TaskStore();
  objectiveStore = new ObjectiveStore();
  boardStore = new BoardStore();

  // User and Team Management
  userStore = new UserStore();
  permissionStore = new PermissionStore();
  teamStore = new TeamStore();
  roleStore = new RoleStore();
  sidebarStore = new SidebarStore(this.roleStore);

  // Feedback and Strategy
  feedbackStore = new FeedbackStore();
  strategyStore = new StrategyStore();
  indexStore = new IndexStore();

  // Process and Workspace
  processStore = new ProcessStore();
  workspaceStore = new WorkspaceStore();

  // Learning and Customer Management
  learningStore = new LearningStore();
  customerStore = new CustomerStore();

  // Other Stores
  auditStore = new AuditStore();
  calendarStore = new CalendarStore();
  heatmapStore = new HeatmapStore();
  formStore = new FormStore();

  krCategoryStore = new KRCategoryStore();
  keyResultStore = new KeyResultStore();
  krCheckinStore = new KRCheckinStore();
  // ...other stores

  // Socket Manager
  socketManager: SocketManager;
  constructor() {
    this.socketManager = new SocketManager(
      this.uiStore,
      this.projectStore,
      this.documentStore,
      this.taskStore,

      this.calendarStore,
      this.objectiveStore,
      this.boardStore,
      this.settingsStore,

      this.sidebarStore,
      this.userStore,
      this.permissionStore,
      this.teamStore,

      this.feedbackStore,
      this.strategyStore,
      this.indexStore,

      this.processStore,
      this.krCategoryStore,

      this.keyResultStore,
      this.krCheckinStore,
      this.workspaceStore,
      this.learningStore,

      this.customerStore,
      this.formStore,
      this.auditStore,
      this.heatmapStore,

      this.notificationStore,
      this.themeDesignerStore,
      this.roleStore
      // ...other stores
    );

    // 🧩 Setup reactions between related stores
    this.setupReactions();

    this.initialize();
    // constructor() {
    //   this.socketManager.attachListeners();
    // }
  }
  //Right now, the socket listeners attach immediately in the constructor:
  //This means if the socket connects before authentication,it might receive events before the UserStore knows who the user is.
  //Attach listeners only after login succeeds — move it inside your login handler.
  private initialize() {
    this.socketManager.attachListeners();
  }
  private setupReactions() {
    // 🔁 Keep permissionStore synced with userStore automatically
    reaction(
      () => this.userStore.currentUser,
      (user) => {
        this.permissionStore.setCurrentUser(user);
      }
    );
    // 🔁 Keep SettingsStore updated when active workspace changes
    //refresh workspace-related data automatically (like boards, projects, or objectives)
    reaction(
      () => this.workspaceStore.activeWorkspace?.id,
      (workspaceId) => {
        if (workspaceId) {
          this.projectStore.fetchProjects(workspaceId);
          this.boardStore.fetchBoards(workspaceId);
          this.settingsStore.activeWorkspaceId = workspaceId;
        }
      }
    );

    reaction(
      () => this.roleStore.currentRole,
      () => {
        this.sidebarStore.updateVisibilityByRole((entity) =>
          this.roleStore.can(entity, "view")
        );
      }
    );
    // 🔁 Auto-apply saved theme from user preferences (if available)
    autorun(() => {
      const user = this.userStore.currentUser;
      if (
        user?.preferences?.theme &&
        user.preferences.theme !== this.settingsStore.theme
      ) {
        this.settingsStore.setTheme(user.preferences.theme);
      }
    });
    //This way, if a user’s name or color changes, all tasks auto-update reactively. ⚡️
    //If your frontend stores also track UserStore and BoardStore, you can easily enrich tasks using MobX reactions.
    autorun(() => {
      const users = this.userStore.users;
      this.taskStore.tasks.forEach((task) => {
        if (task.assigneeId) {
          task.assignee = users.find((u) => u.id === task.assigneeId);
        }
      });
    });
  }
}

export const appStore = new AppStore();
export type AppStoreType = AppStore;
