// to manage nav items and role-based visibility
import { makeAutoObservable } from "mobx";
import { NavItem } from "../types";
import { RoleStore } from "./RoleStore";

export class SidebarStore {
  navItems: NavItem[] = []; // Load from config or backend
  collapsed = false;
  roleStore: RoleStore;

  constructor(roleStore: RoleStore) {
    makeAutoObservable(this);
    this.roleStore = roleStore;
  }

  setNavItems = (items: NavItem[]) => {
    this.navItems = items;
  };

  toggleCollapse = () => {
    this.collapsed = !this.collapsed;
  };

  setCollapsed = (val: boolean) => {
    this.collapsed = val;
  };

  get visibleMainItems() {
    return this.navItems.filter(
      // (i) => i.location === "main" && i.visible);
      (i) => i.location === "main" && this.roleStore.can(i.entity, "view")
    );
  }

  get visibleMoreItems() {
    return this.navItems.filter(
      // (i) => i.location === "more" && i.visible);
      (i) => i.location === "more" && this.roleStore.can(i.entity, "view")
    );
  }

  updateVisibilityByRole = (canView: (entity: string) => boolean) => {
    this.navItems = this.navItems.map((item) => ({
      ...item,
      visible: canView(item.entity),
    }));
  };
}
