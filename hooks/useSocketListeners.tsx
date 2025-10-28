import { useEffect } from "react";
import { socket } from "../services/socketService";
import { useStore } from "../stores/StoreContext";
import { showToast } from "../utils/toast";

/**
 * Centralized socket listeners.
 * - Uses the MobX store via useStore() to update observable state
 * - Generic handlers for model created/updated/deleted events
 * - Custom handlers for notifications, feedback, and other non-CRUD events
 */

export const useSocketListeners = () => {
  const store = useStore();

  useEffect(() => {
    // 🧩 Map model names to MobX store actions
    const dataSetters: Record<string, (data: any) => void> = {
      users: store.setUsers,
      teams: store.setTeams,
      objectives: store.setObjectives,
      projects: store.setProjects,
      tasks: store.setTasks,
      columns: store.setColumns,
      boards: store.setBoards,
      strategies: store.setStrategies,
      indices: store.setIndices,
      companyVision: store.setCompanyVision,
      forms: store.setForms,
      formCategories: store.setFormCategories,
      submissions: store.setSubmissions,
      documents: store.setDocuments,
      documentStatuses: store.setDocumentStatuses,
      learningAssignments: store.setLearningAssignments,
      microLearnings: store.setMicroLearnings,
      youtubeVideos: store.setYouTubeVideos,
      books: store.setBooks,
      feedbackTags: store.setFeedbackTags,
      challengeTags: store.setChallengeTags,
      processes: store.setProcesses,
      workspaces: store.setWorkspaces,
      generalFeedbacks: store.setFeedbacks,
      customerNeeds: store.setCustomerNeeds,
      notifications: store.setNotifications,
    };

    // ✅ 1. Initial data load, bulk bootstrap
    //After login, server sends "initial-data", app stores populate (MobX).
    socket.on("initial-data", (data: Record<string, any>) => {
      console.log("✅ Received initial data from server");
      for (const key in data) {
        if (dataSetters[key]) {
          dataSetters[key](data[key] || (key === "companyVision" ? {} : []));
        } else {
          // If the server has new keys we don't know about, keep a console warning
          console.warn(`initial-data: no setter for key "${key}"`);
        }
      }
      // optional flag in store
      if ("isDataLoaded" in store) (store as any).isDataLoaded = true;
      // store.isDataLoaded = true;
    });

    // ✅ 2. Generic CRUD listeners for each model
    for (const model in dataSetters) {
      socket.on(`${model}:created`, (item: any) => {
        const setter = dataSetters[model];
        if (!setter) return;

        // MobX arrays can mutate directly
        const current = (store as any)[model] || [];
        // keep arrays stable if they are arrays
        (store as any)[model] = Array.isArray(current)
          ? [...current, item]
          : item;

        showToast(`➕ ${model} created`);
      });

      socket.on(`${model}:updated`, (item: any) => {
        const setter = dataSetters[model];
        if (!setter) return;

        const current = (store as any)[model] || [];
        (store as any)[model] = Array.isArray(current)
          ? current.map((i: any) => (i.id === item.id ? item : i))
          : item;

        showToast(`🔄 ${model} updated`);
      });

      socket.on(`${model}:deleted`, (id: string | string[]) => {
        const setter = dataSetters[model];
        if (!setter) return;

        const idsToDelete = Array.isArray(id) ? id : [id];
        const current = (store as any)[model] || [];
        if (Array.isArray(current)) {
          (store as any)[model] = current.filter(
            (item: any) => !idsToDelete.includes(item.id)
          );
          showToast(`🗑️ ${model} deleted`);
        }
      });
    }

    // ✅ 3. Custom (non-CRUD) real-time events
    //When server emits notifications:new, the toast should appear and store.notifications updated.
    socket.on("notifications:new", (notif: any) => {
      store.addNotification(notif);
      showToast(`🔔 ${notif.message}`);
    });

    socket.on("notifications:updated", (notifs: any[]) => {
      store.setNotifications(notifs)});
    socket.on("generalFeedbacks:created", (fb: any) => {
      store.addFeedback(fb);
      showToast(`💬 New feedback from ${fb.giver?.name ?? "someone"}`);
    });
    socket.on("feedbackTags:updated", (tags: any[]) => {
      store.setFeedbackTags(tags)});

    // Add other custom handlers (examples)
    socket.on("boards:reordered", (boards: any[]) => store.setBoards(boards));
    socket.on("columns:reordered", (cols: any[]) => store.setColumns(cols));
    socket.on("forms:moved", (payload: any) => {
      // payload = { formId, fromBoardId, toBoardId }
      // If you have a helper on store, call it, otherwise refresh forms list
      if ((store as any).refreshForms) (store as any).refreshForms();
      else store.setForms((store as any).forms || []);
    });

    // 🧹 4. Cleanup listeners on unmount
    return () => {
      socket.off("initial-data");
      for (const model in dataSetters) {
        socket.off(`${model}:created`);
        socket.off(`${model}:updated`);
        socket.off(`${model}:deleted`);
      }
      socket.off("notifications:new");
      socket.off("notifications:updated");
      socket.off("generalFeedbacks:created");
      socket.off("feedbackTags:updated");
      socket.off("boards:reordered");
      socket.off("columns:reordered");
      socket.off("forms:moved");
    };
  }, [store]);
};

/*
  useEffect(() => {
    // === Projects ===
    socket.on("projects:updated", store.setProjects);
    socket.on("projects:deleted", store.setProjects);

    // === Boards ===
    socket.on("boards:updated", store.setBoards);

    // === Columns ===
    socket.on("columns:updated", store.setColumns);

    // === Tasks ===
    socket.on("tasks:updated", store.setTasks);
    socket.on("tasks:deleted", store.setTasks);

    // === Forms ===
    socket.on("forms:updated", store.setForms);
    socket.on("formCategories:updated", store.setFormCategories);

    // === Objectives & Strategies ===
    socket.on("objectives:updated", store.setObjectives);
    socket.on("strategies:updated", store.setStrategies);

    // === Workspaces ===
    socket.on("workspaces:updated", store.setWorkspaces);

    // === Notifications ===
    socket.on("notifications:new", (notif) => {
      store.addNotification(notif);
      showToast(`🔔 ${notif.message}`);
    });
    socket.on("notifications:updated", store.setNotifications);

    // === Feedback ===
    socket.on("generalFeedbacks:created", store.addFeedback);
    socket.on("feedbackTags:updated", store.setFeedbackTags);

    return () => {
      [
        "projects:updated",
        "projects:deleted",
        "boards:updated",
        "columns:updated",
        "tasks:updated",
        "tasks:deleted",
        "forms:updated",
        "formCategories:updated",
        "objectives:updated",
        "strategies:updated",
        "workspaces:updated",
        "notifications:new",
        "notifications:updated",
        "generalFeedbacks:created",
        "feedbackTags:updated",
      ].forEach((ev) => socket.off(ev));
    };
  }, [store]);
};
*/

/*import { useEffect } from "react";
import { socket } from "../socket"; // your initialized socket instance
import { useAppStore } from "../store"; // or your context/state manager
import { showToast } from "../utils/toast"; // optional helper

export function useSocketListeners() {
  const {
    setProjects,
    setBoards,
    setColumns,
    setForms,
    setFormCategories,
    setObjectives,
    setStrategies,
    setWorkspaces,
    setTasks,
    setNotifications,
    addNotification,
    setFeedbackTags,
    addFeedback,
  } = useAppStore();

  useEffect(() => {
    // ✅ Project updates
    socket.on("projects:updated", (projects) => setProjects(projects));
    socket.on("projects:deleted", (projects) => setProjects(projects));

    // ✅ Board updates
    socket.on("boards:updated", (boards) => setBoards(boards));

    // ✅ Columns
    socket.on("columns:updated", (columns) => setColumns(columns));

    // ✅ Tasks
    socket.on("tasks:updated", (tasks) => setTasks(tasks));
    socket.on("tasks:deleted", (tasks) => setTasks(tasks));

    // ✅ Forms
    socket.on("forms:updated", (forms) => setForms(forms));
    socket.on("formCategories:updated", (cats) => setFormCategories(cats));

    // ✅ Objectives & Strategies
    socket.on("objectives:updated", (objs) => setObjectives(objs));
    socket.on("strategies:updated", (strats) => setStrategies(strats));

    // ✅ Workspaces
    socket.on("workspaces:updated", (workspaces) => setWorkspaces(workspaces));

    // ✅ Notifications
    socket.on("notifications:new", (notif) => {
      addNotification(notif);
      showToast(`🔔 ${notif.message}`);
    });
    socket.on("notifications:updated", (notifs) => setNotifications(notifs));

    // ✅ Feedback
    socket.on("generalFeedbacks:created", (feedback) => addFeedback(feedback));
    socket.on("feedbackTags:updated", (tags) => setFeedbackTags(tags));

    // Clean up on unmount
    return () => {
      socket.off("projects:updated");
      socket.off("projects:deleted");
      socket.off("boards:updated");
      socket.off("columns:updated");
      socket.off("tasks:updated");
      socket.off("tasks:deleted");
      socket.off("forms:updated");
      socket.off("formCategories:updated");
      socket.off("objectives:updated");
      socket.off("strategies:updated");
      socket.off("workspaces:updated");
      socket.off("notifications:new");
      socket.off("notifications:updated");
      socket.off("generalFeedbacks:created");
      socket.off("feedbackTags:updated");
    };
  }, [
    setProjects,
    setBoards,
    setColumns,
    setForms,
    setFormCategories,
    setObjectives,
    setStrategies,
    setWorkspaces,
    setTasks,
    setNotifications,
    addNotification,
    setFeedbackTags,
    addFeedback,
  ]);
}
*/

/*
return () => {
      [
        "projects:updated",
        "projects:deleted",
        "boards:updated",
        "columns:updated",
        "tasks:updated",
        "tasks:deleted",
        "forms:updated",
        "formCategories:updated",
        "objectives:updated",
        "strategies:updated",
        "workspaces:updated",
        "notifications:new",
        "notifications:updated",
        "generalFeedbacks:created",
        "feedbackTags:updated",
      ].forEach((ev) => socket.off(ev));
    };
  }, [store]);
  */
