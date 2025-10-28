// Handles persistent UI and app settings.

import { makeAutoObservable, autorun } from "mobx";

export class SettingsStore {
  //   theme: "light" | "dark" = localStorage.getItem("theme") as Theme || "light";
  theme: "light" | "dark" = "light";
  isSidebarCollapsed = false;
  isListViewComfortable = true;
  activePage: string = "dashboard";
  activeWorkspaceId: string = "ws-hotel";
  activeBoardId: string = "";
  kanbanProjectFilter: string = "all";

  constructor() {
    //All mutations are properly defined as arrow functions (so this is bound).
    makeAutoObservable(this);

    //If you want consistency across reloads (like user’s last page, board, or filter), persist them too:
    // Load persisted values
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) this.theme = savedTheme;

    const savedBoard = localStorage.getItem("activeBoardId");
    if (savedBoard) this.activeBoardId = savedBoard;

    const savedWorkspace = localStorage.getItem("activeWorkspaceId");
    if (savedWorkspace) this.activeWorkspaceId = savedWorkspace;

    //autorun to persist theme → lightweight and correct.
    autorun(() => {
      localStorage.setItem("theme", this.theme);
      localStorage.setItem("activeBoardId", this.activeBoardId);
      localStorage.setItem("activeWorkspaceId", this.activeWorkspaceId);
    });
    //This allows you to restore app context after refresh — very user-friendly.
  }

  setTheme = (theme: "light" | "dark") => {
    this.theme = theme;
  };

  setActivePage = (page: string) => {
    this.activePage = page;
  };

  setSidebarCollapsed = (collapsed: boolean) => {
    this.isSidebarCollapsed = collapsed;
  };

  get themeClass() {
    return this.theme === "dark" ? "theme-dark" : "theme-light";
  }
  //usage: <div className={settingsStore.themeClass}>...</div>
  // ...add other setters as needed
}
