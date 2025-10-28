// Even though it has no socket listener, it should still react to UserStore updates.
/*
When a user logs in (via the "login" socket event), your SocketManager updates UserStore.currentUser.
Then PermissionStore should update automatically.
*/
import { makeAutoObservable } from "mobx";
import { User } from "../types";
import { NavItem } from "../types";

export class PermissionStore {
  currentUser: User | null = null;
  visibleNavItems: NavItem[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentUser = (user: User | null) => {
    this.currentUser = user;
  };

  hasRole = (role: string) => {
    if (!this.currentUser) return false;
    if (this.currentUser.role === "admin") return true; // full access
    // return this.currentUser?.role?.includes(role);  //since User role type is not array
    return this.currentUser?.role === role;
  };

  canAccess = (navItemId: string, navItems: any[]) => {
    const item = navItems.find((i) => i.id === navItemId);
    // return item && item.roles.some((r) => this.hasRole(r));
        return item ? item.roles.some((r) => this.hasRole(r)) : false;

  };
  updatePermissions = (items: NavItem[]) => {
    this.visibleNavItems = items;
  };

  isVisible = (id: string) => {
    return this.visibleNavItems.some((item) => item.id === id);
  };
}

