import { makeAutoObservable, autorun, runInAction } from "mobx";
import { Workspace } from "../types";
import {
  fetchWorkspaces,
  createWorkspace as emitCreateWorkspace,
  updateWorkspace as emitUpdateWorkspace,
  deleteWorkspace as emitDeleteWorkspace,
  restoreWorkspace as emitRestoreWorkspace,
} from "@/emitter";

export class WorkspaceStore {
  workspaces: Workspace[] = [];
  activeWorkspaceId: string | null = null;

  constructor() {
    makeAutoObservable(this);

    // 🧠 Restore last active workspace from localStorage
    const savedWorkspace = localStorage.getItem("activeWorkspaceId");
    if (savedWorkspace) {
      this.activeWorkspaceId = savedWorkspace;
    }

    // 💾 Persist active workspace whenever it changes
    autorun(() => {
      if (this.activeWorkspaceId) {
        localStorage.setItem("activeWorkspaceId", this.activeWorkspaceId);
      }
    });
  }

  /** 🔹 Set entire workspace list */
  setWorkspaces = (list: Workspace[]) => {
    runInAction(() => {
      this.workspaces = list;

      // Handle stale or missing active workspace
      if (
        this.activeWorkspaceId &&
        !list.some((w) => w.id === this.activeWorkspaceId)
      ) {
        this.activeWorkspaceId = list[0]?.id || null;
      }

      // Auto-select first if none is active
      if (!this.activeWorkspaceId && list.length > 0) {
        this.activeWorkspaceId = list[0].id;
      }
    });
  };

  /** 🔹 Add one workspace */
  addWorkspace = (ws: Workspace) => {
    runInAction(() => {
      if (!this.workspaces.some((w) => w.id === ws.id)) {
        this.workspaces.push(ws);
      } else {
        this.updateWorkspace(ws);
      }

      // Auto-select if it's the first one
      if (!this.activeWorkspaceId) {
        this.activeWorkspaceId = ws.id;
      }
    });
  };

  /** 🔹 Update workspace in list */
  updateWorkspace = (updated: Workspace) => {
    runInAction(() => {
      this.workspaces = this.workspaces.map((w) =>
        w.id === updated.id ? updated : w
      );
    });
  };

  /** 🔹 Delete workspace */
  deleteWorkspace = (id: string) => {
    runInAction(() => {
      this.workspaces = this.workspaces.filter((w) => w.id !== id);
      if (this.activeWorkspaceId === id) {
        this.activeWorkspaceId = this.workspaces[0]?.id || null;
      }
    });
  };

  /** 🔹 Set active workspace manually (e.g. from UI) */
  setActiveWorkspace = (id: string) => {
    runInAction(() => {
      this.activeWorkspaceId = id;
    });
  };

  /** 🔹 Load from backend */
  loadWorkspaces = async () => {
    const res = await fetchWorkspaces();
    if (res?.ok && res.workspaces) {
      this.setWorkspaces(res.workspaces);
    }
  };

  /** 🔹 Create new workspace (via socket) */
  createWorkspace = async (data: Partial<Workspace>) => {
    const res = await emitCreateWorkspace(data);
    if (res?.ok && res.workspace) {
      this.addWorkspace(res.workspace);
    }
  };

  /** 🔹 Update existing workspace */
  updateExistingWorkspace = async (
    data: Partial<Workspace> & { id: string }
  ) => {
    const res = await emitUpdateWorkspace(data);
    if (res?.ok && res.workspace) {
      this.updateWorkspace(res.workspace);
    }
  };

  /** 🔹 Delete workspace */
  removeWorkspace = async (id: string) => {
    const res = await emitDeleteWorkspace(id);
    if (res?.ok) this.deleteWorkspace(id);
  };

  /** 🔹 Restore deleted workspace */
  restoreWorkspace = async (id: string) => {
    const res = await emitRestoreWorkspace(id);
    if (res?.ok && res.workspace) {
      this.addWorkspace(res.workspace);
    }
  };

  /** 🔹 Computed getter for UI */
  get activeWorkspace() {
    return this.workspaces.find((w) => w.id === this.activeWorkspaceId) || null;
  }
}
