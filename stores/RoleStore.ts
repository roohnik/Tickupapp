//Multi-Admin Permission Management
// Centralizes role-based access, moderation history, and team scopes.
//Use RoleStore for front-end permission checks and UI behavior.
import { makeAutoObservable } from "mobx";

type Role = "admin" | "lead" | "member" | "viewer";
type Permission = {
  entity: string;
  actions: ("view" | "edit" | "delete" | "moderate")[];
};

type RoleConfig = {
  role: Role;
  permissions: Permission[];
};

export class RoleStore {
  roles: RoleConfig[] = [
    {
      role: "admin",
      permissions: [
        { entity: "project", actions: ["view", "edit", "delete", "moderate"] },
        { entity: "user", actions: ["view", "edit", "moderate"] },
        // ...
      ],
    },
    {
      role: "member",
      permissions: [
        { entity: "project", actions: ["view", "edit"] },
        { entity: "user", actions: ["view"] },
      ],
    },
  ];

  currentRole: Role = "member";

  constructor() {
    makeAutoObservable(this);
  }

  setRole = (role: Role) => {
    this.currentRole = role;
  };

  can = (entity: string, action: string) => {
    const config = this.roles.find((r) => r.role === this.currentRole);
    return config?.permissions.some(
      (p) => p.entity === entity && p.actions.includes(action as any)
    );
  };
  setCurrentRole = (role: Role) => {
    this.currentRole = role;
  };
}


