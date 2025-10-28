// Centralized socket listener dispatcher:
//Listens to socket events & updates stores
//SocketManager syncs state from backend to frontend.
import { socket } from "../services/socketService";
import { HeatmapCell } from "./HeatmapStore";

import { AuditStore } from "./AuditStore";
import { BoardStore } from "./BoardStore";
import { CalendarStore } from "./CalendarStore";
import { CustomerStore } from "./CustomerStore";
import { DocumentStore } from "./DocumentStore";
import { FeedbackStore } from "./FeedbackStore";
import { FormStore } from "./FormStore";
import { HeatmapStore } from "./HeatmapStore";
import { LearningStore } from "./LearningStore";
import { ObjectiveStore } from "./ObjectiveStore";
import { ProcessStore } from "./ProcessStore";
import { ProjectStore } from "./ProjectStore";
import { RoleStore } from "./RoleStore";
import { SettingsStore } from "./SettingsStore";
import { SidebarStore } from "./SidebarStore";
import { StrategyStore } from "./StrategyStore";
import { TaskStore } from "./TaskStore";
import { TeamStore } from "./TeamStore";
import { ThemeDesignerStore } from "./ThemeDesignerStore";
import { UIStore } from "./UIStore";
import { UserStore } from "./UserStore";
import { WorkspaceStore } from "./WorkspaceStore";
import { KRCategoryStore } from "./KRCategoryStore";
import { KeyResultStore } from "./KeyResultStore";
import { KRCheckinStore } from "./KRCheckinStore";
import { NotificationStore } from "./NotificationStore";
import { PermissionStore } from "./PermissionStore";
import { IndexStore } from "./IndexStore";
// ...import other stores

export class SocketManager {
  constructor(
    private uiStore: UIStore,
    private projectStore: ProjectStore,
    private documentStore: DocumentStore,
    private taskStore: TaskStore,

    private calendarStore: CalendarStore,
    private objectiveStore: ObjectiveStore,
    private boardStore: BoardStore,
    private settingsStore: SettingsStore,

    private sidebarStore: SidebarStore,
    private userStore: UserStore,
    private permissionStore: PermissionStore,
    private teamStore: TeamStore,

    private feedbackStore: FeedbackStore,
    private strategyStore: StrategyStore,
    private indexStore: IndexStore,

    private processStore: ProcessStore,
    private krCategoryStore: KRCategoryStore,

    private keyResultStore: KeyResultStore,
    private krCheckinStore: KRCheckinStore,
    private workspaceStore: WorkspaceStore,
    private learningStore: LearningStore,

    private customerStore: CustomerStore,
    private formStore: FormStore,
    private auditStore: AuditStore,
    private heatmapStore: HeatmapStore,

    private notificationStore: NotificationStore,
    private themeDesignerStore: ThemeDesignerStore,
    private roleStore: RoleStore // ...other stores
  ) {}

  attachListeners() {
    const emitAuditLog = (entityType: string, action: string, payload: any) => {
      const userId = this.userStore.currentUser?.id || "system";
      const timestamp = Date.now();

      const log = {
        entityId: payload.id,
        entityType,
        action,
        userId,
        timestamp,
      };

      socket.emit("audit:log", log); // send to server for persistence
      this.auditStore.addLog(log); // keep local copy immediately
    };
    /* Every time you call logActivity(), you’ll both:
        - emit "audit:log" to server
        - add it to local audit + heatmap.
    */
    const logActivity = (
      entityType: string,
      action: HeatmapCell["action"],
      payload: any
    ) => {
      emitAuditLog(entityType, action, payload);

      this.heatmapStore.logActivity({
        entityId: payload.id,
        entityType,
        action,
        userId: this.userStore.currentUser?.id || "system",
        timestamp: Date.now(),
      });
    };

    // 📦 FORMS — CRUD + Board/Pin/Approval
    socket.on("forms:set", (forms) => {
      this.formStore.setForms(forms);
      logActivity("forms", "synced", { count: forms?.length });
    });
    socket.on("forms:created", (form) => {
      this.formStore.addForm(form);
      logActivity("form", "created", form);
    });
    socket.on("forms:updated", (form) => {
      this.formStore.updateForm(form);
      logActivity("form", "updated", form);
    });
    socket.on("forms:pinned", (form) => {
      this.formStore.updateForm(form);
      logActivity("form", "pinned", form);
    });
    socket.on("forms:moved", (form) => {
      this.formStore.updateForm(form);
      logActivity("form", "moved", form);
    });
    socket.on("forms:approved", (form) => {
      this.formStore.updateForm(form);
      logActivity("form", "approved", form);
    });
    socket.on("forms:versioned", (form) => {
      this.formStore.updateForm(form);
      logActivity("form", "version_incremented", form);
    });
    socket.on("forms:deleted", ({ id }) => {
      this.formStore.deleteForm(id);
      logActivity("form", "deleted", { id });
    });
    socket.on("forms:destroyed", ({ id }) => {
      this.formStore.deleteForm(id);
      logActivity("form", "destroyed", { id });
    });
    socket.on("forms:restored", (form) => {
      this.formStore.addForm(form);
      logActivity("form", "restored", form);
    });
    // 🔄 Initial sync
    socket.emit("forms:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.forms)) {
        this.formStore.setForms(res.forms);
      }
    });

    // ------------------------------
    // 🔔 Notifications
    // ------------------------------
    socket.on("notifications:set", (notifications) => {
      this.notificationStore.setNotifications(notifications);
      logActivity("notification", "synced", { count: notifications?.length });
    });

    socket.on("notifications:created", (notification) => {
      this.notificationStore.addNotification(notification);
      logActivity("notification", "created", notification);
    });

    socket.on("notifications:read", (id) => {
      this.notificationStore.markAsRead(id);
      logActivity("notification", "read", { id });
    });

    socket.on("notifications:deleted", ({ id }) => {
      // optional: if you support deletion
      this.notificationStore.notifications =
        this.notificationStore.notifications.filter((n) => n.id !== id);
      logActivity("notification", "deleted", { id });
    });

    // 🗂️ FORM CATEGORIES
    socket.on("categories:list", (categories) => {
      this.formStore.setCategories(categories);
      logActivity("category", "synced", { count: categories?.length });
    });
    socket.on("categories:created", (cat) => {
      this.formStore.categories.push(cat);
      logActivity("category", "created", cat);
    });
    socket.on("categories:updated", (cat) => {
      this.formStore.categories = this.formStore.categories.map((c) =>
        c.id === cat.id ? cat : c
      );
      logActivity("category", "updated", cat);
    });
    socket.on("categories:deleted", ({ id }) => {
      this.formStore.categories = this.formStore.categories.filter(
        (c) => c.id !== id
      );
      logActivity("category", "deleted", { id });
    });
    socket.on("categories:restored", (cat) => {
      this.formStore.categories.push(cat);
      logActivity("category", "restored", cat);
    });
    socket.emit("categories:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.categories)) {
        this.formStore.setCategories(res.categories);
      }
    });

    // 📝 FORM SUBMISSIONS
    socket.on("submissions:list", (subs) => {
      this.formStore.setSubmissions(subs);
      logActivity("submission", "synced", { count: subs?.length });
    });
    socket.on("submissions:submitted", (sub) => {
      this.formStore.submissions.push(sub);
      logActivity("submission", "submitted", sub);
    });
    socket.on("submissions:drafted", (draft) => {
      const exists = this.formStore.submissions.some((s) => s.id === draft.id);
      if (exists) {
        this.formStore.submissions = this.formStore.submissions.map((s) =>
          s.id === draft.id ? draft : s
        );
      } else {
        this.formStore.submissions.push(draft);
      }
      logActivity("submission", "draft_saved", draft);
    });
    socket.on("submissions:status-updated", (sub) => {
      this.formStore.submissions = this.formStore.submissions.map((s) =>
        s.id === sub.id ? sub : s
      );
      logActivity("submission", "status_updated", sub);
    });
    socket.on("submissions:deleted", ({ id }) => {
      this.formStore.submissions = this.formStore.submissions.filter(
        (s) => s.id !== id
      );
      logActivity("submission", "deleted", { id });
    });
    socket.on("submissions:destroyed", ({ id }) => {
      this.formStore.submissions = this.formStore.submissions.filter(
        (s) => s.id !== id
      );
      logActivity("submission", "destroyed", { id });
    });
    socket.on("submissions:restored", (sub) => {
      this.formStore.submissions.push(sub);
      logActivity("submission", "restored", sub);
    });
    // 🔄 Initial sync
    socket.emit("submissions:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.submissions)) {
        this.formStore.setSubmissions(res.submissions);
      }
    });

    // socket.on("projects:created", this.projectStore.addProject);
    // Projects
    socket.on("projects:created", (p) => {
      this.projectStore.addProject(p);
      logActivity("project", "created", p);
    });
    socket.on("projects:updated", (p) => {
      this.projectStore.updateProject(p);
      logActivity("project", "updated", p);
    });
    socket.on("projects:deleted", (p) => {
      this.projectStore.deleteProject(p.id);
      logActivity("project", "deleted", p);
    });
    socket.on("projects:restored", (p) => {
      this.projectStore.restoreProject(p);
      logActivity("project", "restored", p);
    });
    socket.on("projects:restored", (p) => {
      this.projectStore.addProject(p);
      logActivity("project", "restored", p);
    });
    socket.on("projects:custom-field-added", ({ projId, definition }) => {
      this.projectStore.addCustomField(projId, definition);
      logActivity("project", "custom-field-added", { id: projId });
    });
    socket.on("projects:custom-field-updated", ({ projId, defId, updates }) => {
      this.projectStore.updateCustomField(projId, defId, updates);
      logActivity("project", "custom-field-updated", { id: projId, defId });
    });
    socket.on("projects:custom-field-deleted", ({ projId, defId }) => {
      this.projectStore.deleteCustomField(projId, defId);
      logActivity("project", "custom-field-deleted", { id: projId, defId });
      logActivity("project", "custom-field-updated", { id: projId });
    });
    socket.on("projects:custom-field-deleted", ({ projId, defId }) => {
      this.projectStore.deleteCustomField(projId, defId);
      logActivity("project", "custom-field-deleted", { id: projId });
    });

    // 🗎 Document events
    socket.on("documents:set", (docs) => {
      this.documentStore.setDocuments(docs);
      logActivity("document", "updated", { id: "bulk", count: docs?.length });
    });
    socket.on("documents:updated", (doc) => {
      this.documentStore.updateDocument(doc);
      logActivity("document", "updated", doc);
    });
    socket.on("documents:created", (doc) => {
      this.documentStore.addDocument(doc);
      logActivity("document", "created", doc);
    });
    socket.on("documents:deleted", ({ id }) => {
      this.documentStore.deleteDocument(id);
      logActivity("document", "deleted", { id });
    });
    // Document Statuses
    socket.on("documentStatuses:created", (s) => {
      this.documentStore.statuses.push(s);
      logActivity("documentStatus", "created", s);
    });
    socket.on("documentStatuses:updated", (s) => {
      this.documentStore.statuses = this.documentStore.statuses.map((st) =>
        st.id === s.id ? s : st
      );
      logActivity("documentStatus", "updated", s);
    });
    socket.on("documentStatuses:deleted", ({ id }) => {
      this.documentStore.statuses = this.documentStore.statuses.filter(
        (st) => st.id !== id
      );
      logActivity("documentStatus", "deleted", { id });
    });
    socket.on("documentStatuses:set", (list) => {
      this.documentStore.setStatuses(list);
      logActivity("documentStatus", "updated", { count: list?.length });
    });
    //You’re already calling attachListeners() once when your socket connection is ready (e.g., after login or app load).
    // So this immediately pulls the latest statuses from the server and puts them into DocumentStore.
    socket.emit("documentStatuses:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.statuses)) {
        this.documentStore.setStatuses(res.statuses);
      } else {
        console.warn("Failed to load document statuses:", res?.error);
      }
    });

    //Audit logs
    //This will pull down all existing audit entries once per connection.
    socket.emit("audit:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.logs)) {
        this.auditStore.setLogs(res.logs);
      } else {
        console.warn("Failed to load audit logs:", res?.error);
      }
    });

    //it will append new logs as the server broadcasts them.
    socket.on("audit:created", (log) => {
      this.auditStore.addLog(log);
    });

    // Tasks
    socket.on("tasks:created", (t) => {
      this.taskStore.addTask(t);
      logActivity("task", "created", t);
    });
    socket.on("tasks:updated", (t) => {
      this.taskStore.updateTask(t);
      logActivity("task", "updated", t);
    });
    socket.on("tasks:deleted", (ids: string[] | string) => {
      this.taskStore.deleteTask(ids);
      logActivity("task", "deleted", ids);
    });
    // socket.on("tasks:deleted", (t) => {
    //   this.taskStore.deleteTask(t.id);
    //   logActivity("task", "deleted", t);
    // });

    // ------------------------------
    // 🔹 Objectives
    // ------------------------------
    socket.on("objectives:created", (objective) => {
      this.objectiveStore.addObjective(objective);
      logActivity("objective", "created", objective);
    });

    socket.on("objectives:updated", (objective) => {
      this.objectiveStore.updateObjective(objective);
      logActivity("objective", "updated", objective);
    });

    socket.on("objectives:deleted", ({ id }) => {
      this.objectiveStore.deleteObjective(id);
      logActivity("objective", "deleted", { id });
    });

    socket.on("objectives:list", (objectives) => {
      this.objectiveStore.setObjectives(objectives);
      logActivity("objective", "synced", { count: objectives?.length });
    });
    socket.on("objectives:kr-created", (kr) => {
      this.objectiveStore.addKeyResult(kr); // You may need to implement this in ObjectiveStore
      logActivity("keyResult", "created", kr);
    });

    socket.on("objectives:kr-updated", (kr) => {
      this.objectiveStore.updateKeyResult(kr); // Implement in ObjectiveStore
      logActivity("keyResult", "updated", kr);
    });

    socket.on("objectives:kr-deleted", ({ id }) => {
      this.objectiveStore.deleteKeyResult(id); // Implement in ObjectiveStore
      logActivity("keyResult", "deleted", { id });
    });

    socket.on("objectives:checked-in", (kr) => {
      this.objectiveStore.updateKeyResult(kr); // Implement in ObjectiveStore
      logActivity("keyResult", "checked-in", kr);
    });

    // Boards
    socket.on("boards:created", (b) => {
      this.boardStore.addBoard(b);
      logActivity("board", "created", b);
    });
    socket.on("boards:updated", (b) => {
      this.boardStore.updateBoard(b);
      logActivity("board", "updated", b);
    });
    socket.on("boards:deleted", (b) => {
      this.boardStore.deleteBoard(b.id);
      logActivity("board", "deleted", b);
    });
    socket.on("boards:pinned", (b) => {
      this.boardStore.togglePinned(b);
      logActivity("board", "pinned", b);
    });
    socket.on("boards:reordered", (list) => {
      this.boardStore.setBoards(list);
      logActivity("board", "reordered", { id: "bulk" });
    });

    // --- USER EVENTS ---
    socket.on("users:created", (user) => {
      this.userStore.addUser(user);
      logActivity("user", "created", user);
    });

    socket.on("users:updated", (user) => {
      this.userStore.updateUser(user);
      logActivity("user", "updated", user);
    });

    socket.on("users:deleted", ({ id }) => {
      this.userStore.removeUser(id);
      logActivity("user", "deleted", { id });
    });

    // When current user logs in successfully
    //// 👤 USERS — Auth + CRUD
    socket.on("login:success", (user) => {
      this.userStore.setCurrentUser(user);
      this.permissionStore.setCurrentUser(user);
      logActivity("user", "login:success", user);
    });

    // Optional: logout event
    socket.on("auth:logout", () => {
      this.userStore.logout();
      this.permissionStore.setCurrentUser(null);
      logActivity("user", "logout", {});
    });

    // When refresh token succeeds, update tokens in local storage
    socket.on("auth:refresh", (data) => {
      if (data?.token) {
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        logActivity("auth", "refreshed", data);
      }
    });

    // Teams
    // socket.on("teams:updated", (t) => {
    //   this.teamStore.updateTeam(t);
    //   logActivity("team", "updated", t);
    // });
    // -----------------------------
    // 🔹 Teams
    // -----------------------------
    socket.on("teams:created", (team) => {
      this.teamStore.addTeam(team);
      logActivity("team", "created", team);
    });

    socket.on("teams:updated", (team) => {
      this.teamStore.updateTeam(team);
      logActivity("team", "updated", team);
    });

    socket.on("teams:deleted", (teamId) => {
      this.teamStore.deleteTeam(teamId);
      logActivity("team", "deleted", teamId);
    });

    socket.on("teams:set", (teams) => {
      this.teamStore.setTeams(teams);
      logActivity("team", "set", teams);
    });

    // Feedback
    socket.on("feedback:created", (f) => {
      this.feedbackStore.addFeedback(f);
      logActivity("feedback", "created", f);
    });
    socket.on("feedback:updated", (f) => {
      this.feedbackStore.updateFeedback(f);
      logActivity("feedback", "updated", f);
    });

    socket.on("feedback:deleted", (id) => {
      this.feedbackStore.deleteFeedback(id);
      logActivity("feedback", "deleted", { id });
    });

    //That will preload all feedbacks into the UI on startup.
    socket.emit("feedback:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.feedbacks)) {
        this.feedbackStore.setFeedbacks(res.feedbacks);
      }
    });
    socket.on("generalFeedbacks:created", (f) => {
      this.feedbackStore.addGeneralFeedback(f);
      logActivity("generalFeedbacks", "created", f);
    });
    socket.emit("generalFeedbacks:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.feedbacks)) {
        this.feedbackStore.setGeneralFeedbacks(res.feedbacks);
      }
    });
    // 🏷️ Feedback Tag events
    socket.on("feedbackTags:set", (tags) => {
      this.feedbackStore.setFeedbackTags(tags);
      // logActivity("feedbackTag", "synced", { count: tags?.length });
      logActivity("feedbackTag", "updated", { count: tags?.length });
    });
    socket.on("feedbackTags:created", (tag) => {
      this.feedbackStore.addFeedbackTag(tag);
      logActivity("feedbackTag", "created", tag);
    });
    socket.on("feedbackTags:updated", (tag) => {
      this.feedbackStore.updateFeedbackTag(tag);
      logActivity("feedbackTag", "updated", tag);
    });

    socket.on("feedbackTags:deleted", (id) => {
      this.feedbackStore.deleteFeedbackTag(id);
      logActivity("feedbackTag", "deleted", id);
    });
    socket.emit("feedbackTags:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.tags)) {
        this.feedbackStore.setFeedbackTags(res.tags);
      }
    });

    // Strategies
    // -----------------------------
    // 🎯 Strategies (and KPIs)
    // -----------------------------
    socket.on("strategies:created", (strategy) => {
      this.strategyStore.addStrategy(strategy);
      logActivity("strategy", "created", strategy);
    });

    socket.on("strategies:updated", (strategy) => {
      this.strategyStore.updateStrategy(strategy);
      logActivity("strategy", "updated", strategy);
    });

    socket.on("strategies:deleted", ({ id }) => {
      this.strategyStore.deleteStrategy(id);
      logActivity("strategy", "deleted", { id });
    });
    socket.on("strategies:destroyed", ({ id }) => {
      this.strategyStore.destroyStrategy(id);
      logActivity("strategy", "destroyed", { id });
    });
    socket.on("strategies:restored", (strategy) => {
      this.strategyStore.restoreStrategy(strategy);
      logActivity("strategy", "restored", strategy);
    });
    socket.on("strategies:status-changed", (strategy) => {
      this.strategyStore.updateStrategy(strategy);
      logActivity("strategy", "status-changed", strategy);
    });
    socket.on("strategies:owners-updated", (strategy) => {
      this.strategyStore.updateStrategy(strategy);
      logActivity("strategy", "owners-updated", strategy);
    });

    socket.on("strategies:swot-updated", (strategy) => {
      this.strategyStore.updateStrategy(strategy);
      logActivity("strategy", "swot-updated", strategy);
    });

    socket.on("strategies:archived", ({ id }) => {
      this.strategyStore.archiveStrategy(id);
      logActivity("strategy", "archived", { id });
    });

    socket.on("strategies:unarchived", ({ id }) => {
      this.strategyStore.unarchiveStrategy(id);
      logActivity("strategy", "unarchived", { id });
    });

    // -----------------------------
    // 📊 Index (KPI / Metric) Events
    // -----------------------------
    socket.on("indices:created", (index) => {
      this.indexStore.addIndex(index);
      logActivity("index", "created", index);
    });

    socket.on("indices:updated", (index) => {
      this.indexStore.updateIndex(index);
      //If you want StrategyDetail views to stay live-updated, you can extend your event listeners like this:
      this.strategyStore.updateStrategy(index.strategyId);
      //(only if you implement updateStrategyIfNeeded for live dashboards)
      logActivity("index", "updated", index);
    });

    socket.on("indices:deleted", ({ id }) => {
      this.indexStore.deleteIndex(id);
      logActivity("index", "deleted", { id });
    });

    socket.on("indices:archived", ({ id }) => {
      this.indexStore.archiveIndex(id);
      logActivity("index", "archived", { id });
    });

    socket.on("indices:unarchived", ({ id }) => {
      this.indexStore.unarchiveIndex(id);
      logActivity("index", "unarchived", { id });
    });

    // Processes
    socket.on("processes:updated", (p) => {
      this.processStore.updateProcess(p);
      logActivity("process", "updated", p);
    });
    socket.on("processes:created", (p) => {
      this.processStore.addProcess(p);
      logActivity("process", "created", p);
    });

    socket.on("processes:updated", (p) => {
      this.processStore.updateProcess(p);
      logActivity("process", "updated", p);
    });

    socket.on("processes:deleted", ({ id }) => {
      this.processStore.deleteProcess(id);
      logActivity("process", "deleted", id);
    });

    // Workspaces
    // socket.on("workspaces:updated", (w) => {
    //   this.workspaceStore.updateWorkspace(w);
    //   logActivity("workspace", "updated", w);
    // });
    // 🧩 Workspaces
    socket.on("workspaces:created", (workspace) => {
      this.workspaceStore.addWorkspace(workspace);
      logActivity("workspace", "created", workspace);
    });

    socket.on("workspaces:updated", (workspace) => {
      this.workspaceStore.updateWorkspace(workspace);
      logActivity("workspace", "updated", workspace);
    });

    socket.on("workspaces:deleted", ({ id }) => {
      this.workspaceStore.deleteWorkspace(id);
      logActivity("workspace", "deleted", { id });
    });

    socket.on("workspaces:restored", (workspace) => {
      this.workspaceStore.addWorkspace(workspace);
      logActivity("workspace", "restored", workspace);
    });

    // Learning
    /* -------------------------------------------------------
       🎓 LEARNING MODULE EVENTS
    ------------------------------------------------------- */

    // 🔹 MicroLearning
    socket.on("microlearning:created", (item) => {
      this.learningStore.addMicroLearning(item);
      logActivity("microlearning", "created", item);
    });

    socket.on("microlearning:updated", (item) => {
      this.learningStore.updateMicroLearning(item);
      logActivity("microlearning", "updated", item);
    });

    socket.on("microlearning:deleted", (id) => {
      this.learningStore.deleteMicroLearning(id);
      logActivity("microlearning", "deleted", { id });
    });

    // 🔹 YouTube Videos
    socket.on("youtubeVideo:created", (item) => {
      this.learningStore.addYouTubeVideo(item);
      logActivity("youtubeVideo", "created", item);
    });

    socket.on("youtubeVideo:updated", (item) => {
      this.learningStore.updateYouTubeVideo(item);
      logActivity("youtubeVideo", "updated", item);
    });

    socket.on("youtubeVideo:deleted", (id) => {
      this.learningStore.deleteYouTubeVideo(id);
      logActivity("youtubeVideo", "deleted", { id });
    });

    // 🔹 Podcasts
    socket.on("podcast:created", (item) => {
      this.learningStore.addPodcast(item);
      logActivity("podcast", "created", item);
    });

    socket.on("podcast:updated", (item) => {
      this.learningStore.updatePodcast(item);
      logActivity("podcast", "updated", item);
    });

    socket.on("podcast:deleted", (id) => {
      this.learningStore.deletePodcast(id);
      logActivity("podcast", "deleted", { id });
    });

    // 🔹 Courses
    socket.on("course:created", (item) => {
      this.learningStore.addCourse(item);
      logActivity("course", "created", item);
    });

    socket.on("course:updated", (item) => {
      this.learningStore.updateCourse(item);
      logActivity("course", "updated", item);
    });

    socket.on("course:deleted", (id) => {
      this.learningStore.deleteCourse(id);
      logActivity("course", "deleted", { id });
    });

    // 🔹 Learning Assignments
    socket.on("learningAssignment:created", (item) => {
      this.learningStore.addAssignment(item);
      logActivity("learningAssignment", "created", item);
    });

    socket.on("learningAssignment:updated", (item) => {
      this.learningStore.updateAssignment(item);
      logActivity("learningAssignment", "updated", item);
    });

    socket.on("learningAssignment:deleted", (id) => {
      this.learningStore.deleteAssignment(id);
      logActivity("learningAssignment", "deleted", { id });
    });

    // 🧩 Customers
    socket.on("customerNeeds:created", (need) => {
      this.customerStore.addNeed(need);
      logActivity("customerNeed", "created", need);
    });

    socket.on("customerNeeds:updated", (need) => {
      this.customerStore.updateNeed(need);
      logActivity("customerNeed", "updated", need);
    });

    socket.on("customerNeeds:deleted", (id) => {
      this.customerStore.deleteNeed(id);
      logActivity("customerNeed", "deleted", { id });
    });
    socket.on("customerNeedCategories:created", (c) => {
      this.customerStore.addCategory(c);
      logActivity("customerNeedCategory", "created", c);
    });

    socket.on("customerNeedCategories:updated", (c) => {
      this.customerStore.updateCategory(c);
      logActivity("customerNeedCategory", "updated", c);
    });

    socket.on("customerNeedCategories:deleted", (id) => {
      this.customerStore.deleteCategory(id);
      logActivity("customerNeedCategory", "deleted", { id });
    });

    // Settings
    //for  extend SettingsStore with server sync if you want cross-device consistency.
    socket.on("settings:updated", (payload) => {
      const { key, value } = payload;

      switch (key) {
        case "theme":
          this.settingsStore.setTheme(value);
          this.uiStore.applyTheme?.(value); // optional helper if UIStore has theme logic
          break;

        case "activePage":
          this.settingsStore.setActivePage(value);
          break;

        case "sidebarCollapsed":
          this.settingsStore.setSidebarCollapsed(value);
          break;

        case "activeWorkspaceId":
          this.settingsStore.activeWorkspaceId = value;
          this.workspaceStore.setActiveWorkspace?.(value);
          break;
        case "userPreferences":
          this.userStore.setPreferences?.(value); // optional: if user has preferences
          break;

        default:
          console.warn("Unknown settings key:", key);
      }
      // if (payload.key === "theme") this.settingsStore.setTheme(payload.value);
      // if (payload.key === "activePage")
      // this.settingsStore.setActivePage(payload.value);
      // if (payload.key === "sidebarCollapsed")
      // this.settingsStore.setSidebarCollapsed(payload.value);
      logActivity("settings", "updated", payload);
    });
    socket.on("settings:loaded", (prefs) => {
      if (prefs.theme) this.settingsStore.setTheme(prefs.theme);
      if (prefs.sidebarCollapsed !== undefined)
        this.settingsStore.setSidebarCollapsed(prefs.sidebarCollapsed);
      if (prefs.activeWorkspaceId)
        this.settingsStore.activeWorkspaceId = prefs.activeWorkspaceId;

      console.log("✅ User settings loaded from server:", prefs);
      logActivity("settings", "loaded", prefs);
    });

    // Calendar
    socket.on("calendar:created", (event) => {
      this.calendarStore.addEvent(event);
      logActivity("calendar", "created", event);
    });
    socket.on("calendar:updated", (event) => {
      this.calendarStore.updateEvent(event);
      logActivity("calendar", "updated", event);
    });
    socket.on("calendar:deleted", ({ id }) => {
      this.calendarStore.events = this.calendarStore.events.filter(
        (e) => e.id !== id
      );
      logActivity("calendar", "deleted", { id });
    });
    // On connect, request all existing events
    socket.emit("calendar:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.events)) {
        this.calendarStore.setEvents(res.events);
      } else {
        console.warn("Failed to load calendar events:", res?.error);
      }
    });

    // 🧠 KeyResults
    socket.on("keyResults:set", (list) => {
      this.keyResultStore.setKeyResults(list);
      logActivity("keyResult", "set", list);
    });
    socket.on("keyResults:created", (kr) => {
      this.keyResultStore.addKeyResult(kr);
      logActivity("keyResult", "created", kr);
    });
    socket.on("keyResults:updated", (kr) => {
      this.keyResultStore.updateKeyResult(kr);
      logActivity("keyResult", "updated", kr);
    });
    socket.on("keyResults:deleted", ({ id }) => {
      this.keyResultStore.deleteKeyResult(id);
      logActivity("keyResult", "deleted", id);
    });
    socket.emit("keyResults:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.keyResults)) {
        this.keyResultStore.setKeyResults(res.keyResults);
      }
    });

    // 📅 KRCheckins
    socket.on("krCheckins:set", (list) => {
      this.krCheckinStore.setCheckins(list);
      logActivity("krCheckin", "set", { count: list.length });
    });
    socket.on("krCheckins:created", (c) => {
      this.krCheckinStore.addCheckin(c);
      logActivity("krCheckin", "created", c);
    });
    socket.on("krCheckins:updated", (c) => {
      this.krCheckinStore.updateCheckin(c);
      logActivity("krCheckin", "updated", c);
    });
    socket.on("krCheckins:deleted", ({ id }) => {
      this.krCheckinStore.deleteCheckin(id);
      logActivity("krCheckin", "deleted", id);
    });
    // Request initial list
    socket.emit("krCheckins:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.checkins)) {
        this.krCheckinStore.setCheckins(res.checkins);
      }
    });

    // 🏷️ KR Categories
    socket.on("krCategories:set", (list) => {
      this.krCategoryStore.setCategories(list);
      logActivity("krCategory", "set", list);
    });
    socket.on("krCategories:updated", (list) => {
      this.krCategoryStore.updateCategory(list);
      logActivity("krCategory", "updated", list);
    });
    socket.on("krCategories:created", (list) => {
      this.krCategoryStore.addCategory(list);
      logActivity("krCategory", "created", list);
    });
    socket.on("krCategories:deleted", (list) => {
      this.krCategoryStore.deleteCategory(list);
      logActivity("krCategory", "deleted", list);
    });
    socket.emit("krCategories:list", {}, (res) => {
      if (res?.ok && Array.isArray(res.categories)) {
        this.krCategoryStore.setCategories(res.categories);
      }
    });
  }
}
