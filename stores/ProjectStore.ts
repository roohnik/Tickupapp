import { makeAutoObservable } from "mobx";
import { Project } from "../types";
import { safeEmit } from "@/utils/socketActions";

export class ProjectStore {
  projects: Project[] = [];
  projectToEdit: Project | null = null;
  defaultProjectId: string | "all" = "all";

  constructor() {
    makeAutoObservable(this);
  }

  setProjects = (list: Project[]) => {
    this.projects = list;
  };

  // ✅ Add project safely (avoid duplicates)
  addProject = (project: Project) => {
    const exists = this.projects.some((p) => p.id === project.id);
    if (!exists) {
      this.projects.push(project);
    } else {
      this.updateProject(project);
    }
  };

  // ✅ Restore a previously deleted project
  restoreProject = (project: Project) => {
    this.addProject(project);
  };

  updateProject = (updated: Project) => {
    this.projects = this.projects.map((p) =>
      p.id === updated.id ? updated : p
    );
    if (this.projectToEdit?.id === updated.id) this.projectToEdit = updated;
  };

  deleteProject = (id: string) => {
    this.projects = this.projects.filter((p) => p.id !== id);
    if (this.projectToEdit?.id === id) this.projectToEdit = null;
  };

  archiveProject = (id: string) => {
    this.projects = this.projects.map((p) =>
      p.id === id ? { ...p, isArchived: true } : p
    );
  };

  unarchiveProject = (id: string) => {
    this.projects = this.projects.map((p) =>
      p.id === id ? { ...p, isArchived: false } : p
    );
  };

  // ✅ Custom field operations
  addCustomField = (projId: string, definition: any) => {
    this.projects = this.projects.map((p) =>
      p.id === projId
        ? { ...p, custom_fields: [...(p.custom_fields || []), definition] }
        : p
    );
  };

  updateCustomField = (projId: string, defId: string, updates: any) => {
    this.projects = this.projects.map((p) => {
      if (p.id !== projId) return p;
      const fields = (p.custom_fields || []).map((f) =>
        f.definitionId === defId ? { ...f, ...updates } : f
      );
      return { ...p, custom_fields: fields };
    });
  };

  deleteCustomField = (projId: string, defId: string) => {
    this.projects = this.projects.map((p) => {
      if (p.id !== projId) return p;
      const fields = (p.custom_fields || []).filter(
        (f) => f.definitionId !== defId
      );
      return { ...p, custom_fields: fields };
    });
  };
  submitProject = (data: Project) => {
    this.updateProject(data);
  };

  setProjectToEdit = (project: Project | null) => {
    this.projectToEdit = project;
  };

  fetchProjects = async (workspaceId: string) => {
    const res = await safeEmit("projects:list", { workspaceId });
    if (res.ok) this.setProjects(res.projects);
  };

  
}
