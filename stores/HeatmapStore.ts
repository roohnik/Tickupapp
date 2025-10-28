// Live Monitoring & Visual Analytics
// Tracks activity across entities and time for visual dashboards.

import { makeAutoObservable } from "mobx";

export type HeatmapCell = {
  timestamp: number;
  entityType: string;
  entityId: string;
  action:
    | "created"
    | "updated"
    | "deleted"
    | "viewed"
    | "pinned"
    | "reordered"
    | "custom-field-added"
    | "restored"
    | "custom-field-updated"
    | "custom-field-deleted"
    | "synced"
    | "moved"
    | "approved"
    | "version_incremented"
    | "destroyed"
    | "status_updated"
    | "draft_saved"
    | "submitted"
    | "set"
    | "checked-in"
    | "read"
    | "login:success"
    | "logout"
    | "loaded"
    | "refreshed"
    | "archived"
    | "unarchived"
    | "swot-updated"
    | "owners-updated"
    | "status-changed";

  userId: string;
};

export class HeatmapStore {
  activity: HeatmapCell[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  logActivity = (cell: HeatmapCell) => {
    this.activity.push(cell);
  };
  setActivities = (list: HeatmapCell[]) => {
    this.activity = list;
  };

  getActivityByEntity = (entityId: string) =>
    this.activity.filter((a) => a.entityId === entityId);

  getActivityByUser = (userId: string) =>
    this.activity.filter((a) => a.userId === userId);

  getHeatmapMatrix = () => {
    // You can later visualize this with time buckets and entity types
    return this.activity.reduce((acc, cell) => {
      const key = `${cell.entityType}-${new Date(
        cell.timestamp
      ).toDateString()}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };
}
