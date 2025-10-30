// Send actions to the backend
//Emitters handle backend communication.
//used by UI components to send updates to backend.
import { User, Process, Strategy, Task, Team, Workspace  } from "./types";
import { safeEmit } from "./utils/socketActions";



/** 🔹 List all workspaces */
export const fetchWorkspaces = async () => {
  return await safeEmit(
    "workspaces:list",
    {},
    "Fetched workspaces successfully",
    "workspace",
    "view"
  );
};

/** 🔹 Get one workspace by ID (includes boards + projects) */
export const getWorkspace = async (id: string) => {
  return await safeEmit(
    "workspaces:get",
    { id },
    "Fetched workspace successfully",
    "workspace",
    "view"
  );
};

/** 🔹 Create a new workspace */
// export const createWorkspace = async (payload: {
//   name: string;
//   description?: string;
//   color?: string;
//   icon?: string;
//   settings?: Record<string, any>;
// }) => {

//Partial<Workspace> makes all fields optional
export const createWorkspace = async (payload: Partial<Workspace>) => {
  return await safeEmit(
    "workspaces:create",
    payload,
    "Workspace created successfully",
    "workspace",
    "create"
  );
};

/** 🔹 Update an existing workspace */
export const updateWorkspace = async (payload: Partial<Workspace> & { id: string }) => {
  return await safeEmit(
    "workspaces:update",
    payload,
    "Workspace updated successfully",
    "workspace",
    "update"
  );
};

/** 🔹 Delete a workspace (soft delete) */
export const deleteWorkspace = async (id: string) => {
  return await safeEmit(
    "workspaces:delete",
    { id },
    "Workspace deleted successfully",
    "workspace",
    "delete"
  );
};

/** 🔹 Restore a deleted workspace */
export const restoreWorkspace = async (id: string) => {
  return await safeEmit(
    "workspaces:restore",
    { id },
    "Workspace restored successfully",
    "workspace",
    "restore"
  );
};

/** 🔸 List all teams (with lead + members) */
export const fetchTeams = async () => {
  return await safeEmit(
    "listTeams",
    {},
    "Fetched teams successfully",
    "team",
    "view"
  );
};

/** 🔸 Create a new team */
export const createTeam = async (payload: {
  id?: string;
  name: string;
  leadId?: string;
  icon?: string;
  category?: string;
  memberIds?: string[];
}) => {
  return await safeEmit(
    "teams:create",
    payload,
    "Team created successfully",
    "team",
    "create"
  );
};

/** 🔸 Update an existing team */
export const updateTeam = async (payload: {
  teamId: string;
  fields: Partial<Team>;
}) => {
  return await safeEmit(
    "teams:update",
    payload,
    "Team updated successfully",
    "team",
    "edit"
  );
};

/** 🔸 Delete a team */
export const deleteTeam = async (teamId: string) => {
  return await safeEmit(
    "teams:delete",
    teamId,
    "Team deleted successfully",
    "team",
    "delete"
  );
};

/** 🔸 Set team list manually (e.g., when syncing from cache or import) */
export const setTeams = async (teams: Team[]) => {
  return await safeEmit(
    "teams:set",
    teams,
    "Teams synced",
    "team",
    "sync"
  );
};

/* -------------------------------------------------------
   🔹 TASKS
------------------------------------------------------- */
// export const createTask = async (task: any) => {
//   return await safeEmit("tasks:create", task, "Task created", "task", "create");
// };
// export const updateTask = async (task: any) => {
//   return await safeEmit("tasks:update", task, "Task updated", "task", "edit");
// };
// Fetch all tasks
export const fetchTasks = async () => {
  return await safeEmit(
    "tasks:list",
    {},
    "Fetched tasks",
    "task",
    "view"
  );
};

// Create a task
export const createTask = async (payload: Partial<Task>) => {
  return await safeEmit(
    "tasks:create",
    payload,
    "Task created!",
    "task",
    "edit"
  );
};

// Update a task
export const updateTask = async (taskId: string, fields: Partial<Task>) => {
  return await safeEmit(
    "tasks:update",
    { taskId, fields },
    "Task updated!",
    "task",
    "edit"
  );
};

// Delete one or multiple tasks
export const deleteTask = async (taskIds: string[] | string) => {
  return await safeEmit(
    "tasks:delete",
    Array.isArray(taskIds) ? taskIds : [taskIds],
    "Task deleted!",
    "task",
    "delete"
  );
};

// Toggle a task’s daily target (if you’re using this)
export const toggleDailyTarget = async (krId: string, date: string) => {
  return await safeEmit(
    "tasks:toggle-daily-target",
    { krId, date },
    "Toggled daily target",
    "task",
    "edit"
  );
};
// -----------------------------
  // 🔹 Socket (Backend Sync)
  // -----------------------------
  // -----------------------------
// 🔹 STRATEGIES
// -----------------------------

// 🔹 Fetch all strategies
export const fetchStrategies = async (filters?: {
  status?: string;
  category?: string;
}) => {
  return await safeEmit(
    "strategies:list",
    filters || {},
    "Fetched strategies",
    "strategy",
    "view"
  );
};

export const createStrategy = async (payload: Partial<Strategy>) => {
  return await safeEmit(
    "strategies:create",
    payload,
    "Strategy created!",
    "strategy",
    "edit"
  );
};

export const updateStrategy = async (payload: Strategy) => {
  return await safeEmit(
    "strategies:update",
    payload,
    "Strategy updated!",
    "strategy",
    "edit"
  );
};

export const deleteStrategy = async (id: string) => {
  return await safeEmit(
    "strategies:delete",
    { id },
    "Strategy deleted!",
    "strategy",
    "delete"
  );
};

// 🔹 Hard delete
export const destroyStrategy = async (id: string) => {
  return await safeEmit(
    "strategies:destroy",
    { id },
    "Strategy permanently deleted!",
    "strategy",
    "delete"
  );
};


// 🔹 Restore soft-deleted strategy
export const restoreStrategy = async (id: string) => {
  return await safeEmit(
    "strategies:restore",
    { id },
    "Strategy restored!",
    "strategy",
    "edit"
  );
};

// 🔹 Change status
export const changeStrategyStatus = async (id: string, status: string) => {
  return await safeEmit(
    "strategies:change-status",
    { id, status },
    "Status updated!",
    "strategy",
    "edit"
  );
};

// 🔹 Update owners
export const updateStrategyOwners = async (id: string, ownerIds: string[]) => {
  return await safeEmit(
    "strategies:update-owners",
    { id, owner_ids: ownerIds },
    "Owners updated!",
    "strategy",
    "edit"
  );
};

// 🔹 Update SWOT
export const updateStrategySwot = async (id: string, swot: any) => {
  return await safeEmit(
    "strategies:update-swot",
    { id, swot },
    "SWOT updated!",
    "strategy",
    "edit"
  );
};

export const updateSetting = async (
  key: string,
  value: any,
  successMsg = "Setting updated!") => {
  return await safeEmit("settings:update", { key, value }, successMsg, "settings", "edit");
}
//example call: await updateSetting("theme", "dark");

// 🔹 List all processes
export const fetchProcesses = async (params?: any) => {
  return await safeEmit("processes:list", params, "Fetched processes", "process", "view");
};

// 🔹 Create a new process
export const createProcess = async (data: Partial<Process>) => {
  return await safeEmit("processes:create", data, "Created process", "process", "create");
};

// 🔹 Update an existing process
export const updateProcess = async (data: Partial<Process> & { id: string }) => {
  return await safeEmit("processes:update", data, "Updated process", "process", "edit");
};

// 🔹 Delete a process
export const deleteProcess = async (id: string) => {
  return await safeEmit("processes:delete", id, "Deleted process", "process", "delete");
};
/* -------------------------------------------------------
   🔹 LEARNING ASSIGNMENTS
------------------------------------------------------- */
export const fetchLearningAssignments = async () => {
  return await safeEmit("learningAssignments:list", {}, "Fetched learning assignments", "learningAssignment", "view");
};

export const createLearningAssignment = async (assignment: any) => {
  return await safeEmit("learningAssignments:create", assignment, "Learning assignment created", "learningAssignment", "create");
};

export const updateLearningAssignment = async (payload: any) => {
  return await safeEmit("learningAssignments:update", payload, "Learning assignment updated", "learningAssignment", "edit");
};

export const deleteLearningAssignment = async (id: string) => {
  return await safeEmit("learningAssignments:delete", { id }, "Learning assignment deleted", "learningAssignment", "delete");
};

/* -------------------------------------------------------
   🔹 BOOKS
------------------------------------------------------- */
export const fetchBooks = async () => {
  return await safeEmit("books:list", {}, "Fetched books", "book", "view");
};

export const createBook = async (book: any) => {
  return await safeEmit("books:create", book, "Book created", "book", "create");
};

export const updateBook = async (book: any) => {
  return await safeEmit("books:update", book, "Book updated", "book", "edit");
};

export const deleteBook = async (id: string) => {
  return await safeEmit("books:delete", { id }, "Book deleted", "book", "delete");
};

/* -------------------------------------------------------
   🔹 MICRO LEARNINGS
------------------------------------------------------- */
export const fetchMicroLearnings = async () => {
  return await safeEmit("microLearnings:list", {}, "Fetched micro learnings", "microLearning", "view");
};

export const createMicroLearning = async (data: any) => {
  return await safeEmit("microLearnings:create", data, "Micro learning created", "microLearning", "create");
};

export const updateMicroLearning = async (data: any) => {
  return await safeEmit("microLearnings:update", data, "Micro learning updated", "microLearning", "edit");
};

export const deleteMicroLearning = async (id: string) => {
  return await safeEmit("microLearnings:delete", { id }, "Micro learning deleted", "microLearning", "delete");
};

/* -------------------------------------------------------
   🔹 YOUTUBE VIDEOS
------------------------------------------------------- */
export const fetchYouTubeVideos = async () => {
  return await safeEmit("youtubeVideos:list", {}, "Fetched YouTube videos", "youtubeVideo", "view");
};

export const createYouTubeVideo = async (video: any) => {
  return await safeEmit("youtubeVideos:create", video, "YouTube video created", "youtubeVideo", "create");
};

export const updateYouTubeVideo = async (video: any) => {
  return await safeEmit("youtubeVideos:update", video, "YouTube video updated", "youtubeVideo", "edit");
};

export const deleteYouTubeVideo = async (id: string) => {
  return await safeEmit("youtubeVideos:delete", { id }, "YouTube video deleted", "youtubeVideo", "delete");
};

/* -------------------------------------------------------
   🔹 PODCASTS
------------------------------------------------------- */
export const fetchPodcasts = async () => {
  return await safeEmit("podcasts:list", {}, "Fetched podcasts", "podcast", "view");
};

export const createPodcast = async (podcast: any) => {
  return await safeEmit("podcasts:create", podcast, "Podcast created", "podcast", "create");
};

export const updatePodcast = async (podcast: any) => {
  return await safeEmit("podcasts:update", podcast, "Podcast updated", "podcast", "edit");
};

export const deletePodcast = async (id: string) => {
  return await safeEmit("podcasts:delete", { id }, "Podcast deleted", "podcast", "delete");
};

/* -------------------------------------------------------
   🔹 COURSES
------------------------------------------------------- */
export const fetchCourses = async () => {
  return await safeEmit("courses:list", {}, "Fetched courses", "course", "view");
};

export const createCourse = async (course: any) => {
  return await safeEmit("courses:create", course, "Course created", "course", "create");
};

export const updateCourse = async (course: any) => {
  return await safeEmit("courses:update", course, "Course updated", "course", "edit");
};

export const deleteCourse = async (id: string) => {
  return await safeEmit("courses:delete", { id }, "Course deleted", "course", "delete");
};

/* -------------------------------------------------------
   🔹 KEY RESULTS
------------------------------------------------------- */
export const fetchKeyResults = async () => {
  return await safeEmit("keyResults:list", {}, "Fetched key results", "keyResult", "view");
};

export const createKeyResult = async (keyResult: any) => {
  return await safeEmit("keyResults:create", keyResult, "Key result created", "keyResult", "create");
};

export const updateKeyResult = async (keyResult: any) => {
  return await safeEmit("keyResults:update", keyResult, "Key result updated",  "keyResult", "edit");
};

export const deleteKeyResult = async (id: string) => {
  return await safeEmit("keyResults:delete", { id }, "Key result deleted", "keyResult", "delete");
};

/* -------------------------------------------------------
   🔹 KR CHECKINS
------------------------------------------------------- */
export const fetchKRCheckins = async () => {
  return await safeEmit("krCheckins:list", {}, "Fetched key result checkins", "krCheckin", "view");
};

export const createKRCheckin = async (checkin: any) => {
  return await safeEmit("krCheckins:create", checkin, "Checkin created", "krCheckin", "create");
};

export const updateKRCheckin = async (checkin: any) => {
  return await safeEmit("krCheckins:update", checkin, "Checkin updated", "krCheckin", "edit");
};

export const deleteKRCheckin = async (id: string) => {
  return await safeEmit("krCheckins:delete", { id }, "Checkin deleted", "krCheckin", "delete");
};

/* -------------------------------------------------------
   🔹 KR CATEGORIES
------------------------------------------------------- */
export const fetchKRCategories = async () => {
  return await safeEmit("krCategories:list", {}, "Fetched key result categories", "krCategory", "view");
};

export const createKRCategory = async (category: any) => {
  return await safeEmit("krCategories:create", category, "Category created", "krCategory", "create");
};

export const updateKRCategory = async (category: any) => {
  return await safeEmit("krCategories:update", category, "Category updated", "krCategory", "edit");
};

export const deleteKRCategory = async (id: string) => {
  return await safeEmit("krCategories:delete", { id }, "Category deleted", "krCategory", "delete");
};

// Aliases for store compatibility
export const emitKRCategoryList = fetchKRCategories;
export const emitKRCategoryCreate = createKRCategory;
export const emitKRCategoryUpdate = updateKRCategory;
export const emitKRCategoryDelete = deleteKRCategory;

export const emitKRCheckinList = fetchKRCheckins;
export const emitKRCheckinCreate = createKRCheckin;
export const emitKRCheckinUpdate = updateKRCheckin;
export const emitKRCheckinDelete = deleteKRCheckin;

export const emitKeyResultList = fetchKeyResults;
export const emitKeyResultCreate = createKeyResult;
export const emitKeyResultUpdate = updateKeyResult;
export const emitKeyResultDelete = deleteKeyResult;


/* -------------------------------------------------------
   🔹 PROJECTS
------------------------------------------------------- */
export const createProject = async (project: any) => {
  return await safeEmit("projects:create", project, "Project created", "project", "create");
};

export const updateProject = async (project: any) => {
  return await safeEmit("projects:update", project, "Project updated", "project", "edit");
};

/* -------------------------------------------------------
   🔹 FEEDBACKS
------------------------------------------------------- */
export const createFeedback = async (feedback: any) => {
  return await safeEmit("feedback:create", feedback, "Feedback created", "feedback", "create");
};

export const fetchGeneralFeedbacks = async () => {
  return await safeEmit("feedback:list", {}, "Fetched general feedbacks", "feedback", "view");
};

export const createGeneralFeedback = async (data: any) => {
  return await safeEmit("generalFeedbacks:create", data, "Feedback created", "feedback", "create");
};

export const updateGeneralFeedback = async (data: any) => {
  return await safeEmit("feedback:update", data, "Feedback updated", "feedback", "edit");
};

export const deleteGeneralFeedback = async (id: string) => {
  return await safeEmit("feedback:delete", { id }, "Feedback deleted", "feedback", "delete");
};

// Aliases for FeedbackStore compatibility
export const emitGeneralFeedbackList = fetchGeneralFeedbacks;
export const emitGeneralFeedbackCreate = createGeneralFeedback;
export const emitGeneralFeedbackUpdate = updateGeneralFeedback;
export const emitGeneralFeedbackDelete = deleteGeneralFeedback;

/* -------------------------------------------------------
   🔹 FORMS
------------------------------------------------------- */
export const createForm = async (form: any) => {
  return await safeEmit("forms:create", form, "Form created", "form", "create");
};

export const updateForm = async (form: any) => {
  return await safeEmit("forms:update", form, "Form updated", "form", "edit");
};

/* -------------------------------------------------------
   🔹 CALENDAR
------------------------------------------------------- */
export const createCalendarEvent = async (event: any) => {
  return await safeEmit("calendar:createEvent", event, "Calendar event created", "calendarEvent", "create");
};

export const emitUserRegister = async (data: {
  username: string;
  password: string;
  name?: string;
  role?: "admin" | "lead" | "member";
}) => {
  return await safeEmit("register", data, "Registration successful", "auth", "register");
};

export const emitUserLogin = async (data: { username: string; password: string }) => {
  return await safeEmit("login", data, "Login successful", "auth", "login");
};

export const emitUserLogout = async (refreshToken?: string) => {
  return await safeEmit("auth:logout", { refreshToken }, "Logout successful", "auth", "logout");
};

export const emitRefreshToken = async (refreshToken: string) => {
  return await safeEmit("auth:refresh", { refreshToken }, "Auth Refreshed", "auth", "refresh");
};

export const emitUserCreate = async (payload: Partial<User>) => {
  return await safeEmit("users:create", payload, "User created", "user", "create");
};

export const emitUserUpdate = async (payload: Partial<User>) => {
  return await safeEmit("users:update", payload, "User updated", "user", "edit");
};

export const emitUserDelete = async (id: string) => {
  return await safeEmit("users:delete", id, "User deleted", "user", "delete");
};
/* -------------------------------------------------------
   🔹 NOTIFICATIONS
------------------------------------------------------- */
export const sendNotification = async (notif: any) => {
  return await safeEmit("notifications:send", notif, "Notification sent", "notification", "create");
};
// ------------------------------
// 🔔 Notifications
// ------------------------------

// Fetch all notifications for a user
export const emitNotificationList = async (userId: string) => {
  return await safeEmit("notifications:list", { userId }, "Fetched notifications", "notification", "view");
};

// Create a new notification
export const emitNotificationCreate = async (data: {
  user_id: string;
  type: "task" | "objective" | "mention" | "feedback" | "system";
  item_id?: string;
  message: string;
}) => {
  return await safeEmit("notifications:create", data, "Notification created", "notification", "create");
};

// Mark as read
export const emitNotificationMarkRead = async (id: string) => {
  return await safeEmit("notifications:markRead", { id }, "Notification marked read", "notification", "edit");
};

// Delete (optional)
export const emitNotificationDelete = async (id: string) => {
  return await safeEmit("notifications:delete", { id }, "Notification deleted", "notification", "delete");
};

/* ------------------------------
   🔹 Objectives
------------------------------ */
// List objectives
export const emitObjectiveList = async () => {
  return await safeEmit("objectives:list", {}, "Fetched objectives", "objective", "view");
};

// Create objective
export const emitObjectiveCreate = async (objective: any) => {
  return await safeEmit("objectives:create", objective, "Objective created", "objective", "create");
};

// Update objective
export const emitObjectiveUpdate = async (objective: any) => {
  return await safeEmit("objectives:update", objective, "Objective updated", "objective", "edit");
};

// Delete objective
export const emitObjectiveDelete = async (id: string) => {
  return await safeEmit("objectives:delete", { id }, "Objective deleted", "objective", "delete");
};

// Restore soft-deleted objective
export const emitObjectiveRestore = async (id: string) => {
  return await safeEmit("objectives:restore", { id }, "Objective restored", "objective", "restore");
};

// Create Key Result
export const emitObjectiveCreateKr = async (objectiveId: string, krData: any) => {
  return await safeEmit("objectives:create-kr", { objectiveId, krData }, "Key Result created", "objective", "create");
};

// Update Key Result
export const emitObjectiveUpdateKr = async (krId: string, updates: any) => {
  return await safeEmit("objectives:update-kr", { krId, updates }, "Key Result updated", "objective", "edit");
};

// Delete Key Result
export const emitObjectiveDeleteKr = async (keyResultId: string) => {
  return await safeEmit("objectives:delete-kr", { keyResultId }, "Key Result deleted", "objective", "delete");
};

// Check-in Key Result
export const emitObjectiveCheckIn = async (krId: string, value: number, rating?: number, report?: string, challengeDifficulty?: string, challengeTagIds?: string[]) => {
  return await safeEmit("objectives:check-in", 
  { krId, value, rating, report, challengeDifficulty, challengeTagIds }, 
  "Key Result updated", "objective", "edit");
};

/* -------------------------------------------------------
   🔹 BOARDS
------------------------------------------------------- */
/** List all boards */
export const fetchBoards = async () => {
  return await safeEmit("boards:list", {}, "Fetched boards", "board", "view");
};

/** Create a new board */
export const createBoard = async (board: any) => {
  return await safeEmit("boards:create", board, "Board created", "board", "create");
};

/** Update an existing board */
export const updateBoard = async (board: any) => {
  return await safeEmit("boards:update", board, "Board updated", "board", "edit");
};

/** Delete a board */
export const deleteBoard = async (id: string) => {
  return await safeEmit("boards:delete", { id }, "Board deleted", "board", "delete");
};

/* -------------------------------------------------------
   🔹 COLUMNS
------------------------------------------------------- */
/** List all columns */
export const fetchColumns = async () => {
  return await safeEmit("columns:list", {}, "Fetched columns", "column", "view");
};

/** Create a new column */
export const createColumn = async (column: any) => {
  return await safeEmit("columns:create", column, "Column created", "column", "create");
};

/** Update an existing column */
export const updateColumn = async (column: any) => {
  return await safeEmit("columns:update", column, "Column updated", "column", "edit");
};

/* -------------------------------------------------------
   🔹 DOCUMENTS
------------------------------------------------------- */
/** List all documents */
export const fetchDocuments = async () => {
  return await safeEmit("documents:list", {}, "Fetched documents", "document", "view");
};

/** Set documents (bulk sync) */
export const setDocuments = async (documents: any[]) => {
  return await safeEmit("documents:set", documents, "Documents synced", "document", "sync");
};

/** Create a new document */
export const createDocument = async (document: any) => {
  return await safeEmit("documents:create", document, "Document created", "document", "create");
};

/** Update an existing document */
export const updateDocument = async (document: any) => {
  return await safeEmit("documents:update", document, "Document updated", "document", "edit");
};

/** Delete a document */
export const deleteDocument = async (id: string) => {
  return await safeEmit("documents:delete", { id }, "Document deleted", "document", "delete");
};

/* -------------------------------------------------------
   🔹 DOCUMENT STATUSES
------------------------------------------------------- */
/** List all document statuses */
export const fetchDocumentStatuses = async () => {
  return await safeEmit("documentStatuses:list", {}, "Fetched document statuses", "documentStatus", "view");
};

/* -------------------------------------------------------
   🔹 CLIENT CONNECTION
------------------------------------------------------- */
/** Join client to server */
export const joinClient = async (userId: string) => {
  return await safeEmit("client:join", { userId }, "Joined successfully", "client", "join");
};

/* -------------------------------------------------------
   🔹 COMPANY VISION
------------------------------------------------------- */
/** Update company vision */
export const updateCompanyVision = async (vision: string) => {
  return await safeEmit("companyVision:update", { vision }, "Company vision updated", "companyVision", "edit");
};

/* -------------------------------------------------------
   🔹 CUSTOMER NEEDS
------------------------------------------------------- */
/** Create a customer need */
export const createCustomerNeed = async (need: any) => {
  return await safeEmit("customerNeeds:create", need, "Customer need created", "customerNeed", "create");
};

/** Update a customer need */
export const updateCustomerNeed = async (need: any) => {
  return await safeEmit("customerNeeds:update", need, "Customer need updated", "customerNeed", "edit");
};

/** Delete a customer need */
export const deleteCustomerNeed = async (id: string) => {
  return await safeEmit("customerNeeds:delete", { id }, "Customer need deleted", "customerNeed", "delete");
};

/* -------------------------------------------------------
   🔹 FEEDBACK TAGS
------------------------------------------------------- */
/** List all feedback tags */
export const fetchFeedbackTags = async () => {
  return await safeEmit("feedbackTags:list", {}, "Fetched feedback tags", "feedbackTag", "view");
};

/** Delete a feedback tag */
export const deleteFeedbackTag = async (id: string) => {
  return await safeEmit("feedbackTags:delete", { id }, "Feedback tag deleted", "feedbackTag", "delete");
};

/* -------------------------------------------------------
   🔹 FORMS - ADDITIONAL ACTIONS
------------------------------------------------------- */
/** Move form to a board */
export const moveFormToBoard = async (formId: string, boardId: string) => {
  return await safeEmit("forms:move-to-board", { formId, boardId }, "Form moved to board", "form", "edit");
};

/** Toggle form pin status */
export const toggleFormPin = async (id: string) => {
  return await safeEmit("forms:toggle-pin", { id }, "Form pin toggled", "form", "edit");
};

/** Delete a form */
export const deleteForm = async (id: string) => {
  return await safeEmit("forms:delete", { id }, "Form deleted", "form", "delete");
};

/* -------------------------------------------------------
   🔹 INDICES (KPIs)
------------------------------------------------------- */
/** Create an index/KPI */
export const createIndex = async (index: any) => {
  return await safeEmit("indices:create", index, "Index created", "index", "create");
};

/** Update an index/KPI */
export const updateIndex = async (index: any) => {
  return await safeEmit("indices:update", index, "Index updated", "index", "edit");
};

/** Delete an index/KPI */
export const deleteIndex = async (id: string) => {
  return await safeEmit("indices:delete", { id }, "Index deleted", "index", "delete");
};

/* -------------------------------------------------------
   🔹 OBJECTIVES - ADDITIONAL ACTIONS
------------------------------------------------------- */
/** Add a comment to an objective */
export const addObjectiveComment = async (objectiveId: string, comment: any) => {
  return await safeEmit("objectives:add-comment", { objectiveId, comment }, "Comment added", "objective", "edit");
};

/** Create an objective with key results */
export const createObjectiveWithKrs = async (objective: any, keyResults: any[]) => {
  return await safeEmit("objectives:create-with-krs", { objective, keyResults }, "Objective created with KRs", "objective", "create");
};

/* -------------------------------------------------------
   🔹 PROJECTS - CUSTOM FIELDS
------------------------------------------------------- */
/** Delete a project */
export const deleteProject = async (id: string) => {
  return await safeEmit("projects:delete", { id }, "Project deleted", "project", "delete");
};

/** Add a custom field to a project */
export const addProjectCustomField = async (projId: string, definition: any) => {
  return await safeEmit("projects:add-custom-field", { projId, definition }, "Custom field added", "project", "edit");
};

/** Update a custom field in a project */
export const updateProjectCustomField = async (projId: string, defId: string, updates: any) => {
  return await safeEmit("projects:update-custom-field", { projId, defId, updates }, "Custom field updated", "project", "edit");
};

/** Delete a custom field from a project */
export const deleteProjectCustomField = async (projId: string, defId: string) => {
  return await safeEmit("projects:delete-custom-field", { projId, defId }, "Custom field deleted", "project", "edit");
};

/* -------------------------------------------------------
   🔹 SUBMISSIONS
------------------------------------------------------- */
/** List all submissions */
export const fetchSubmissions = async () => {
  return await safeEmit("submissions:list", {}, "Fetched submissions", "submission", "view");
};

/** Submit a form submission */
export const submitSubmission = async (submission: any) => {
  return await safeEmit("submissions:submit", submission, "Submission submitted", "submission", "create");
};

/** Save a submission draft */
export const saveSubmissionDraft = async (draft: any) => {
  return await safeEmit("submissions:save-draft", draft, "Draft saved", "submission", "edit");
};

/* -------------------------------------------------------
   🔹 CATEGORIES (FORM CATEGORIES)
------------------------------------------------------- */
/** List all categories */
export const fetchCategories = async () => {
  return await safeEmit("categories:list", {}, "Fetched categories", "category", "view");
};

/* -------------------------------------------------------
   🔹 AUDIT
------------------------------------------------------- */
/** List all audit logs */
export const fetchAuditLogs = async () => {
  return await safeEmit("audit:list", {}, "Fetched audit logs", "audit", "view");
};

/** Log an audit entry */
export const logAudit = async (log: any) => {
  return await safeEmit("audit:log", log, "Audit logged", "audit", "create");
};

/* -------------------------------------------------------
   🔹 TEAMS - LIST
------------------------------------------------------- */
/** Alias for fetchTeams with standardized naming */
export const listTeams = async () => {
  return await fetchTeams();
};
